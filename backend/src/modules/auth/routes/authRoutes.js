const express = require('express');
const { signup, login, getMe, logout, refresh } = require('../controllers/authController');
const { protect } = require('../../../middleware/authMiddleware');
const { validate } = require('../../../middleware/validateMiddleware');
const { authLimiter, loginLimiter } = require('../../../middleware/rateLimitMiddleware');
const { signupSchema, loginSchema, refreshSchema } = require('../validation/authValidation');

const router = express.Router();

router.post('/signup', authLimiter, validate(signupSchema), signup);
router.post('/login', authLimiter, loginLimiter, validate(loginSchema), login);
router.post('/refresh', authLimiter, validate(refreshSchema), refresh);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

module.exports = router;
