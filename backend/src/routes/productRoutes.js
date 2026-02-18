const router = require('express').Router();
const productController = require('../controllers/productController');
const { auth, authorize, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', optionalAuth, productController.getProducts);
router.get('/featured', productController.getFeaturedProducts);
router.get('/popular', productController.getPopularProducts);
router.get('/categories', productController.getCategories);
router.get('/categories/:id', productController.getCategory);
router.get('/:id', optionalAuth, productController.getProduct);

// Admin routes
router.post('/', auth, authorize('admin', 'superadmin'), productController.createProduct);
router.put('/:id', auth, authorize('admin', 'superadmin'), productController.updateProduct);
router.delete('/:id', auth, authorize('admin', 'superadmin'), productController.deleteProduct);
router.post('/:id/images', auth, authorize('admin', 'superadmin'), upload.array('images', 5), productController.uploadImages);
router.get('/admin/low-stock', auth, authorize('admin', 'superadmin'), productController.getLowStockProducts);

// Category admin routes
router.post('/categories/create', auth, authorize('admin', 'superadmin'), productController.createCategory);
router.put('/categories/:id', auth, authorize('admin', 'superadmin'), productController.updateCategory);
router.delete('/categories/:id', auth, authorize('admin', 'superadmin'), productController.deleteCategory);

module.exports = router;
