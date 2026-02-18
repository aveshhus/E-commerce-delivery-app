const router = require('express').Router();
const orderController = require('../controllers/orderController');
const { auth, authorize } = require('../middleware/auth');

// Customer routes
router.post('/', auth, orderController.createOrder);
router.get('/my-orders', auth, orderController.getUserOrders);
router.get('/my-orders/:id', auth, orderController.getOrder);
router.put('/:id/cancel', auth, orderController.cancelOrder);
router.post('/:id/reorder', auth, orderController.reorder);

// Admin routes
router.get('/admin/all', auth, authorize('admin', 'superadmin'), orderController.getAllOrders);
router.put('/admin/:id/status', auth, authorize('admin', 'superadmin'), orderController.updateOrderStatus);
router.put('/admin/:id/assign-agent', auth, authorize('admin', 'superadmin'), orderController.assignDeliveryAgent);

module.exports = router;
