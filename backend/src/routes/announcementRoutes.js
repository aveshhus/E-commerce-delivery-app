const router = require('express').Router();
const announcementController = require('../controllers/announcementController');
const { auth, authorize } = require('../middleware/auth');

router.get('/', auth, announcementController.getAnnouncements);
router.post('/', auth, authorize('admin', 'superadmin'), announcementController.createAnnouncement);
router.put('/:id', auth, authorize('admin', 'superadmin'), announcementController.updateAnnouncement);
router.delete('/:id', auth, authorize('admin', 'superadmin'), announcementController.deleteAnnouncement);

module.exports = router;
