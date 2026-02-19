const router = require('express').Router();
const authController = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/send-otp', authController.sendOTP);
router.post('/verify-otp', authController.verifyOTP);
router.post('/admin/login', authController.adminLogin);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
// Update FCM Token
router.put('/fcm-token', auth, authController.updateFCMToken);

// Change Password
router.post('/change-password', auth, authController.changePassword);

module.exports = router;
