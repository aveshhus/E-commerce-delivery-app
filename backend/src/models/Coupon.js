const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['percentage', 'flat'],
        required: true
    },
    value: {
        type: Number,
        required: true,
        min: 0
    },
    minOrderAmount: {
        type: Number,
        default: 0
    },
    maxDiscount: {
        type: Number
    },
    maxUsage: {
        type: Number,
        default: -1
    },
    usageCount: {
        type: Number,
        default: 0
    },
    maxUsagePerUser: {
        type: Number,
        default: 1
    },
    usedBy: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        usedAt: { type: Date, default: Date.now },
        orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' }
    }],
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    applicableCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }]
}, {
    timestamps: true
});


couponSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

couponSchema.methods.isValid = function (userId, orderAmount) {
    const now = new Date();
    if (!this.isActive) return { valid: false, message: 'Coupon is not active' };
    if (now < this.startDate) return { valid: false, message: 'Coupon not yet active' };
    if (now > this.endDate) return { valid: false, message: 'Coupon has expired' };
    if (this.maxUsage > 0 && this.usageCount >= this.maxUsage) return { valid: false, message: 'Coupon usage limit reached' };
    if (orderAmount < this.minOrderAmount) return { valid: false, message: `Minimum order amount is ₹${this.minOrderAmount}` };

    if (userId) {
        const userUsage = this.usedBy.filter(u => u.user.toString() === userId.toString()).length;
        if (userUsage >= this.maxUsagePerUser) return { valid: false, message: 'You have already used this coupon' };
    }

    return { valid: true, message: 'Coupon is valid' };
};

couponSchema.methods.calculateDiscount = function (orderAmount) {
    let discount = 0;
    if (this.type === 'percentage') {
        discount = (orderAmount * this.value) / 100;
        if (this.maxDiscount && discount > this.maxDiscount) {
            discount = this.maxDiscount;
        }
    } else {
        discount = this.value;
    }
    return Math.min(discount, orderAmount);
};

module.exports = mongoose.model('Coupon', couponSchema);
