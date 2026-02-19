const express = require('express');
const router = express.Router();
const festivalController = require('../controllers/festivalController');
const { auth, authorize } = require('../middleware/auth');

// Public route to get active festival
router.get('/active', festivalController.getActiveFestival);

// Admin routes
router.get('/', auth, authorize('admin', 'superadmin'), festivalController.getAllFestivals);
router.post('/', auth, authorize('admin', 'superadmin'), festivalController.createFestival);
router.put('/:id', auth, authorize('admin', 'superadmin'), festivalController.updateFestival);
router.delete('/:id', auth, authorize('admin', 'superadmin'), festivalController.deleteFestival);
router.patch('/:id/toggle', auth, authorize('admin', 'superadmin'), festivalController.toggleFestivalStatus);

module.exports = router;
