const router = require('express').Router();
const deliveryController = require('../controllers/deliveryController');
const { auth, authorize } = require('../middleware/auth');

// Admin routes
router.get('/', auth, authorize('admin', 'superadmin'), deliveryController.getAgents);
router.post('/', auth, authorize('admin', 'superadmin'), deliveryController.createAgent);
router.put('/:id', auth, authorize('admin', 'superadmin'), deliveryController.updateAgent);
router.delete('/:id', auth, authorize('admin', 'superadmin'), deliveryController.deleteAgent);
router.put('/admin/application/:id/status', auth, authorize('admin', 'superadmin'), deliveryController.updateApplicationStatus);
router.get('/nearby', auth, authorize('admin', 'superadmin'), deliveryController.getNearbyAgents);

// General auth routes for applying
router.post('/apply', auth, deliveryController.applyForPartner);
router.get('/application-status', auth, deliveryController.getProfile);

// Agent routes
router.get('/profile', auth, authorize('delivery', 'admin', 'superadmin'), deliveryController.getProfile);
router.put('/location', auth, authorize('delivery', 'admin', 'superadmin'), deliveryController.updateLocation);
router.put('/toggle-availability', auth, authorize('delivery', 'admin', 'superadmin'), deliveryController.toggleAvailability);
router.get('/current-delivery', auth, authorize('delivery', 'admin', 'superadmin'), deliveryController.getCurrentDelivery);
router.put('/status', auth, authorize('delivery', 'admin', 'superadmin'), deliveryController.updateStatus);
router.get('/history', auth, authorize('delivery', 'admin', 'superadmin'), deliveryController.getAgentHistory);
router.post('/complete-delivery', auth, authorize('delivery', 'admin', 'superadmin'), deliveryController.completeDelivery);

module.exports = router;
