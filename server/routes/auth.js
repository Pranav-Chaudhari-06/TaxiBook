const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

router.post('/register/passenger', authController.registerPassenger);
router.post('/register/driver', authController.registerDriver);
router.post('/verify-otp', authController.verifyOTP);
router.post('/resend-otp', authController.resendOTP);
router.post('/login', authController.login);
router.post('/logout', verifyToken, authController.logout);
router.post('/refresh-token', authController.refreshToken);

module.exports = router;
