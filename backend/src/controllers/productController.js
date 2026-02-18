const Product = require('../models/Product');
const Category = require('../models/Category');

// Get all products with filters
exports.getProducts = async (req, res) => {
    try {
        const { page = 1, limit = 20, category, subcategory, brand, minPrice, maxPrice, search, sort, featured, popular } = req.query;

        const filter = { isActive: true };

        if (category) filter.category = category;
        if (subcategory) filter.subcategory = subcategory;
        if (brand) filter.brand = brand;
        if (featured === 'true') filter.isFeatured = true;
        if (popular === 'true') filter.isPopular = true;
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = parseFloat(minPrice);
            if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
        }
        if (search) {
            filter.$text = { $search: search };
        }

        let sortOption = { createdAt: -1 };
        if (sort === 'price_asc') sortOption = { price: 1 };
        else if (sort === 'price_desc') sortOption = { price: -1 };
        else if (sort === 'name') sortOption = { name: 1 };
        else if (sort === 'popular') sortOption = { totalSold: -1 };
        else if (sort === 'rating') sortOption = { 'rating.average': -1 };

        const skip = (parseInt(page) - 1) * parseInt(limit);
        const total = await Product.countDocuments(filter);

        const products = await Product.find(filter)
            .populate('category', 'name slug')
            .populate('subcategory', 'name slug')
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit))
            .lean();

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single product
exports.getProduct = async (req, res) => {
    try {
        const product = await Product.findOne({
            $or: [{ _id: req.params.id }, { slug: req.params.id }],
            isActive: true
        })
            .populate('category', 'name slug')
            .populate('subcategory', 'name slug');

        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        res.json({ success: true, data: { product } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create product (admin)
exports.createProduct = async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.status(201).json({ success: true, message: 'Product created', data: { product } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update product (admin)
exports.updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, message: 'Product updated', data: { product } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete product (admin)
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false });
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }
        res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Upload product images
exports.uploadImages = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ success: false, message: 'No images uploaded' });
        }

        const images = req.files.map((file, index) => ({
            url: `/uploads/${file.filename}`,
            alt: req.body.alt || '',
            isPrimary: index === 0
        }));

        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { $push: { images: { $each: images } } },
            { new: true }
        );

        res.json({ success: true, message: 'Images uploaded', data: { product } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get featured products
exports.getFeaturedProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true, isFeatured: true })
            .populate('category', 'name slug')
            .limit(12)
            .lean();
        res.json({ success: true, data: { products } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get popular products
exports.getPopularProducts = async (req, res) => {
    try {
        const products = await Product.find({ isActive: true, isPopular: true })
            .populate('category', 'name slug')
            .sort({ totalSold: -1 })
            .limit(12)
            .lean();
        res.json({ success: true, data: { products } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get low stock products (admin)
exports.getLowStockProducts = async (req, res) => {
    try {
        const products = await Product.find({
            isActive: true,
            $expr: { $lte: ['$stock', '$lowStockThreshold'] }
        }).sort({ stock: 1 }).lean();
        res.json({ success: true, data: { products } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// -- CATEGORY CONTROLLERS --

exports.getCategories = async (req, res) => {
    try {
        const categories = await Category.find({ parent: null, isActive: true })
            .populate({ path: 'subcategories', match: { isActive: true } })
            .sort({ sortOrder: 1 })
            .lean();
        res.json({ success: true, data: { categories } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getCategory = async (req, res) => {
    try {
        const category = await Category.findOne({
            $or: [{ _id: req.params.id }, { slug: req.params.id }]
        }).populate({ path: 'subcategories', match: { isActive: true } });

        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, data: { category } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createCategory = async (req, res) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json({ success: true, message: 'Category created', data: { category } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!category) {
            return res.status(404).json({ success: false, message: 'Category not found' });
        }
        res.json({ success: true, message: 'Category updated', data: { category } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        await Category.findByIdAndUpdate(req.params.id, { isActive: false });
        res.json({ success: true, message: 'Category deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
