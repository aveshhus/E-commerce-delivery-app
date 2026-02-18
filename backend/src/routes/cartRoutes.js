const router = require('express').Router();
const cartController = require('../controllers/cartController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', cartController.getCart);
router.post('/add', cartController.addToCart);
router.put('/item/:itemId', cartController.updateCartItem);
router.delete('/item/:itemId', cartController.removeFromCart);
router.delete('/clear', cartController.clearCart);
router.post('/coupon/apply', cartController.applyCoupon);
router.delete('/coupon/remove', cartController.removeCoupon);

module.exports = router;
