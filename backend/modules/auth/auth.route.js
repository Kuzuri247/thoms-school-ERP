const router = require('express').Router();
const ctrl = require('./auth.controller');
const { verifyToken } = require('../../middleware/auth');
const { loginLimiter } = require('../../middleware/rateLimiter');

router.post('/login', loginLimiter, ctrl.login);
router.post('/refresh', ctrl.refresh);
router.post('/logout', verifyToken, ctrl.logout);
router.get('/me', verifyToken, ctrl.me);

module.exports = router;