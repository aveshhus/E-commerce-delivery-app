const router = require('express').Router();
const deliveryController = require('../controllers/deliveryController');
const { auth, authorize } = require('../middleware/auth');

// Admin routes
router.get('/', auth, authorize('admin', 'superadmin'), deliveryController.getAgents);
router.post('/', auth, authorize('admin', 'superadmin'), deliveryController.createAgent);
router.put('/:id', auth, authorize('admin', 'superadmin'), deliveryController.updateAgent);
router.get('/nearby', auth, authorize('admin', 'superadmin'), deliveryController.getNearbyAgents);

// Agent routes
router.get('/profile', auth, authorize('delivery'), deliveryController.getProfile);
router.put('/location', auth, authorize('delivery'), deliveryController.updateLocation);
router.put('/toggle-availability', auth, authorize('delivery'), deliveryController.toggleAvailability);
router.get('/current-delivery', auth, authorize('delivery'), deliveryController.getCurrentDelivery);
router.put('/status', auth, authorize('delivery'), deliveryController.updateStatus);
router.get('/history', auth, authorize('delivery'), deliveryController.getAgentHistory);
router.post('/complete-delivery', auth, authorize('delivery'), deliveryController.completeDelivery);

module.exports = router;
