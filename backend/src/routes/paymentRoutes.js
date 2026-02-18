const router = require('express').Router();
const paymentController = require('../controllers/paymentController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.post('/razorpay/create', paymentController.createRazorpayOrder);
router.post('/razorpay/verify', paymentController.verifyRazorpayPayment);
router.post('/stripe/create', paymentController.createStripePaymentIntent);
router.post('/stripe/confirm', paymentController.confirmStripePayment);
router.get('/history', paymentController.getPaymentHistory);

module.exports = router;
