const asyncHandler = require('express-async-handler');
const {
  signup: signupService,
  login: loginService,
  invalidateSession: invalidateSessionService,
  refreshAccessToken: refreshAccessTokenService
} = require('../services/authService');
const { getAuthenticatedProfile } = require('../../users/services/userService');
const { logAuditEvent } = require('../../audit/services/auditService');

const mapServiceErrorToResponse = (res, error) => {
  if (error?.statusCode) {
    res.status(error.statusCode);
  }
};

const signup = asyncHandler(async (req, res) => {
  try {
    const result = await signupService(req.body);
    await logAuditEvent({
      req,
      action: 'auth.signup',
      resourceType: 'user',
      resourceId: result.user?._id,
      metadata: { email: result.user?.email }
    });
    res.status(201).json(result);
  } catch (error) {
    await logAuditEvent({
      req,
      action: 'auth.signup',
      resourceType: 'user',
      resourceId: '',
      status: 'failure',
      metadata: { email: req.body?.email, error: error.message }
    });
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const login = asyncHandler(async (req, res) => {
  try {
    const result = await loginService(req.body);
    await logAuditEvent({
      req,
      action: 'auth.login',
      resourceType: 'user',
      resourceId: result.user?._id,
      metadata: { email: result.user?.email }
    });
    res.json(result);
  } catch (error) {
    await logAuditEvent({
      req,
      action: 'auth.login',
      resourceType: 'user',
      resourceId: '',
      status: 'failure',
      metadata: { email: req.body?.email, error: error.message }
    });
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const getMe = asyncHandler(async (req, res) => {
  try {
    const user = await getAuthenticatedProfile(req.user._id);
    res.json(user);
  } catch (error) {
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const logout = asyncHandler(async (req, res) => {
  try {
    const result = await invalidateSessionService(req.user._id);
    await logAuditEvent({
      req,
      action: 'auth.logout',
      resourceType: 'user',
      resourceId: req.user?._id,
      metadata: {}
    });
    res.json(result);
  } catch (error) {
    await logAuditEvent({
      req,
      action: 'auth.logout',
      resourceType: 'user',
      resourceId: req.user?._id || '',
      status: 'failure',
      metadata: { error: error.message }
    });
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

const refresh = asyncHandler(async (req, res) => {
  try {
    const result = await refreshAccessTokenService(req.body);
    await logAuditEvent({
      req,
      action: 'auth.refresh',
      resourceType: 'user',
      resourceId: result.user?._id || '',
      metadata: {}
    });
    res.json(result);
  } catch (error) {
    await logAuditEvent({
      req,
      action: 'auth.refresh',
      resourceType: 'user',
      resourceId: '',
      status: 'failure',
      metadata: { error: error.message }
    });
    mapServiceErrorToResponse(res, error);
    throw error;
  }
});

module.exports = {
  signup,
  login,
  getMe,
  logout,
  refresh
};
