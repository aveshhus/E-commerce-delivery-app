const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    value: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    mrp: { type: Number, required: true, min: 0 },
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String }
});

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: 200
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true
    },
    productUrl: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    shortDescription: {
        type: String,
        trim: true,
        maxlength: 300
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    subcategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    brand: {
        type: String,
        trim: true
    },
    images: [{
        url: String,
        alt: String,
        isPrimary: { type: Boolean, default: false }
    }],
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: 0
    },
    mrp: {
        type: Number,
        required: [true, 'MRP is required'],
        min: 0
    },
    discount: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    variants: [variantSchema],
    unit: {
        type: String,
        default: 'piece',
        enum: ['piece', 'kg', 'g', 'l', 'ml', 'pack', 'dozen']
    },
    unitValue: {
        type: String,
        default: '1'
    },
    stock: {
        type: Number,
        default: 0,
        min: 0
    },
    lowStockThreshold: {
        type: Number,
        default: 10
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    isPopular: {
        type: Boolean,
        default: false
    },
    tags: [String],
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 }
    },
    totalSold: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isPopular: 1 });
productSchema.index({ isActive: 1 });

productSchema.pre('save', async function () {
    if (this.isModified('name')) {
        this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    if (this.mrp > 0 && this.price < this.mrp) {
        this.discount = Math.round(((this.mrp - this.price) / this.mrp) * 100);
    }
});

productSchema.virtual('isLowStock').get(function () {
    return this.stock <= this.lowStockThreshold;
});

productSchema.virtual('isOutOfStock').get(function () {
    return this.stock <= 0;
});

module.exports = mongoose.model('Product', productSchema);
