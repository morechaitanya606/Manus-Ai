const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../modules/users/constants/roles');

const profileSchema = new mongoose.Schema(
  {
    firstName: { type: String, trim: true, default: '' },
    lastName: { type: String, trim: true, default: '' },
    phone: { type: String, trim: true, default: '' }
  },
  { _id: false }
);

const refreshTokenSchema = new mongoose.Schema(
  {
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true, index: true },
    createdAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8 },
    role: { type: String, enum: [ROLES.USER, ROLES.ADMIN], default: ROLES.USER },
    profile: { type: profileSchema, default: () => ({}) },
    tokenVersion: { type: Number, default: 0, min: 0 },
    refreshTokens: { type: [refreshTokenSchema], default: [] },
    address: { type: String, default: '' },
    isActive: { type: Boolean, default: true, index: true },
    isDeleted: { type: Boolean, default: false, index: true },
    orderHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    cart: [
      new mongoose.Schema(
        {
          product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
          quantity: { type: Number, min: 1, default: 1 },
          selectedSize: { type: String, trim: true, default: '' },
          selectedColor: { type: String, trim: true, default: '' },
          customization: {
            customText: { type: String, trim: true, default: '' },
            customColor: { type: String, trim: true, default: '' },
            customImage: { type: String, default: '' }
          }
        },
        { _id: true }
      )
    ]
  },
  { timestamps: true }
);

userSchema.index({ role: 1, createdAt: -1 });

const syncProfileAndName = (doc) => {
  const first = String(doc.profile?.firstName || '').trim();
  const last = String(doc.profile?.lastName || '').trim();
  const profileName = `${first} ${last}`.trim();

  if (profileName && (!doc.name || !doc.name.trim())) {
    doc.name = profileName;
  }

  if ((!first && !last) && doc.name) {
    const parts = doc.name.trim().split(/\s+/);
    doc.profile = doc.profile || {};
    doc.profile.firstName = parts.shift() || '';
    doc.profile.lastName = parts.join(' ');
  }
};

userSchema.pre('save', function syncUserProfile(next) {
  syncProfileAndName(this);
  next();
});

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

userSchema.methods.matchPassword = function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
