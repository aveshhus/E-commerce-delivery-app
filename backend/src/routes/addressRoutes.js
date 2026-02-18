const router = require('express').Router();
const addressController = require('../controllers/addressController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', addressController.getAddresses);
router.post('/', addressController.addAddress);
router.put('/:id', addressController.updateAddress);
router.delete('/:id', addressController.deleteAddress);
router.put('/:id/default', addressController.setDefaultAddress);

module.exports = router;
