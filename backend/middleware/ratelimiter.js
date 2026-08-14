const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { success: false, message: 'Too many login attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

const paymentOrderLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many payment requests. Slow down.' },
  keyGenerator: (req) => req.user?.id?.toString() || req.ip,
});

const changePasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many password change attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many password reset attempts. Try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetLimiter = forgotPasswordLimiter;

module.exports = { loginLimiter, paymentOrderLimiter, passwordResetLimiter, changePasswordLimiter, forgotPasswordLimiter };