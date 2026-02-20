const { z } = require('./common');

const signupSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email(),
  password: z.string().min(8).max(128),
  phone: z.string().trim().max(30).optional(),
  address: z.string().trim().max(300).optional().default('')
});

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(8).max(128)
});

const refreshSchema = z.object({
  refreshToken: z.string().trim().min(20)
});

module.exports = {
  signupSchema,
  loginSchema,
  refreshSchema
};
