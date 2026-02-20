const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const generateToken = require('../../../utils/generateToken');
const { userRepository } = require('../../users/repositories/userRepository');
const { addressRepository } = require('../../users/repositories/addressRepository');
const { mapUserNameToProfile } = require('../../users/services/userService');

const REFRESH_TOKEN_TYPE = 'refresh';

const sanitizeUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  profile: user.profile || mapUserNameToProfile(user.name),
  address: user.address,
  isActive: user.isActive !== false,
  isDeleted: user.isDeleted === true,
  createdAt: user.createdAt
});

const isRefreshEnabled = () => process.env.ENABLE_REFRESH_TOKENS === 'true';

const getRefreshSecret = () => process.env.REFRESH_TOKEN_SECRET || process.env.JWT_SECRET;

const getRefreshExpiry = () => process.env.REFRESH_TOKEN_EXPIRE || '7d';

const getMaxRefreshTokens = () => Math.max(1, Number(process.env.MAX_REFRESH_TOKENS_PER_USER || 5));

const hashToken = (token) =>
  crypto.createHash('sha256').update(String(token || ''), 'utf8').digest('hex');

const buildTokenPayload = (user) => ({
  id: user._id,
  role: user.role,
  tokenVersion: Number(user.tokenVersion || 0)
});

const assertAuthUserIsActive = (user) => {
  if (!user || user.isDeleted || user.isActive === false) {
    const error = new Error('User account is inactive');
    error.statusCode = 401;
    throw error;
  }
};

const persistRefreshToken = async (user, refreshToken, options = {}) => {
  const now = Date.now();
  const replaceTokenHash = options.replaceTokenHash || '';
  const decoded = jwt.decode(refreshToken);

  if (!decoded?.exp) {
    const error = new Error('Failed to generate refresh token');
    error.statusCode = 500;
    throw error;
  }

  const nextTokens = (user.refreshTokens || []).filter((item) => {
    const expiresAt = item?.expiresAt ? new Date(item.expiresAt).getTime() : 0;
    const stillValid = expiresAt > now;
    const sameToken = replaceTokenHash && item?.tokenHash === replaceTokenHash;
    return stillValid && !sameToken;
  });

  nextTokens.push({
    tokenHash: hashToken(refreshToken),
    expiresAt: new Date(decoded.exp * 1000),
    createdAt: new Date()
  });

  const maxTokens = getMaxRefreshTokens();
  user.refreshTokens = nextTokens.slice(-maxTokens);
  await userRepository.save(user);
};

const issueTokenSet = async (user, options = {}) => {
  const token = generateToken(buildTokenPayload(user));

  if (!isRefreshEnabled()) {
    return { token };
  }

  const refreshToken = generateToken(
    {
      ...buildTokenPayload(user),
      type: REFRESH_TOKEN_TYPE
    },
    {
      secret: getRefreshSecret(),
      expiresIn: getRefreshExpiry()
    }
  );

  await persistRefreshToken(user, refreshToken, {
    replaceTokenHash: options.rotateFromToken ? hashToken(options.rotateFromToken) : ''
  });

  return { token, refreshToken };
};

const signup = async ({ name, email, password, phone, address }) => {
  const existingUser = await userRepository.findByEmail(email);
  if (existingUser) {
    const error = new Error('Email already in use');
    error.statusCode = 409;
    throw error;
  }

  const profile = mapUserNameToProfile(name);
  let user;

  try {
    user = await userRepository.create({
      name,
      email,
      password,
      profile: {
        ...profile,
        phone: String(phone || '').trim()
      },
      address,
      isActive: true,
      isDeleted: false
    });
  } catch (error) {
    if (error?.code === 11000) {
      const duplicateError = new Error('Email already in use');
      duplicateError.statusCode = 409;
      throw duplicateError;
    }
    throw error;
  }

  if (address && String(address).trim()) {
    await addressRepository.upsertDefaultFromString(user._id, address, {
      name: user.name
    });
  }

  const tokenSet = await issueTokenSet(user);

  return {
    ...tokenSet,
    user: sanitizeUser(user)
  };
};

const login = async ({ email, password }) => {
  const user = await userRepository.findByEmail(email);
  if (!user || !(await user.matchPassword(password))) {
    const error = new Error('Invalid credentials');
    error.statusCode = 401;
    throw error;
  }

  assertAuthUserIsActive(user);

  const tokenSet = await issueTokenSet(user);

  return {
    ...tokenSet,
    user: sanitizeUser(user)
  };
};

const invalidateSession = async (userId) => {
  const user = await userRepository.findById(userId);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  user.tokenVersion = Number(user.tokenVersion || 0) + 1;
  user.refreshTokens = [];
  await userRepository.save(user);

  return {
    message: 'Session invalidated successfully',
    invalidatedAt: new Date().toISOString()
  };
};

const refreshAccessToken = async ({ refreshToken }) => {
  if (!isRefreshEnabled()) {
    const error = new Error('Refresh token flow is disabled for this environment');
    error.statusCode = 501;
    throw error;
  }

  let decoded;
  try {
    decoded = jwt.verify(refreshToken, getRefreshSecret());
  } catch (error) {
    const tokenError = new Error('Refresh token invalid or expired');
    tokenError.statusCode = 401;
    throw tokenError;
  }

  if (decoded?.type !== REFRESH_TOKEN_TYPE) {
    const tokenTypeError = new Error('Invalid token type for refresh endpoint');
    tokenTypeError.statusCode = 401;
    throw tokenTypeError;
  }

  const user = await userRepository.findById(decoded.id);
  assertAuthUserIsActive(user);

  const decodedTokenVersion = Number(decoded.tokenVersion || 0);
  const userTokenVersion = Number(user.tokenVersion || 0);

  if (decodedTokenVersion !== userTokenVersion) {
    const versionError = new Error('Session invalidated. Please login again.');
    versionError.statusCode = 401;
    throw versionError;
  }

  const now = Date.now();
  const incomingTokenHash = hashToken(refreshToken);
  const validRefreshTokens = (user.refreshTokens || []).filter((item) => {
    const expiresAt = item?.expiresAt ? new Date(item.expiresAt).getTime() : 0;
    return expiresAt > now;
  });

  const tokenExists = validRefreshTokens.some((item) => item.tokenHash === incomingTokenHash);

  if (!tokenExists) {
    user.tokenVersion = Number(user.tokenVersion || 0) + 1;
    user.refreshTokens = [];
    await userRepository.save(user);

    const reuseError = new Error('Refresh token invalidated. Please login again.');
    reuseError.statusCode = 401;
    throw reuseError;
  }

  user.refreshTokens = validRefreshTokens;
  const tokenSet = await issueTokenSet(user, { rotateFromToken: refreshToken });

  return {
    ...tokenSet,
    user: sanitizeUser(user)
  };
};

module.exports = {
  sanitizeUser,
  signup,
  login,
  invalidateSession,
  refreshAccessToken
};
