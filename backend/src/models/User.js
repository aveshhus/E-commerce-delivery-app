const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        maxlength: 100
    },
    email: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Invalid email']
    },
    phone: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    password: {
        type: String,
        minlength: 6,
        select: false
    },
    avatar: {
        type: String,
        default: ''
    },
    role: {
        type: String,
        enum: ['customer', 'admin', 'superadmin', 'delivery'],
        default: 'customer'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    otp: {
        code: String,
        expiresAt: Date
    },
    fcmToken: {
        type: String,
        default: ''
    },
    // New Profile Fields
    dob: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', ''] },
    walletBalance: { type: Number, default: 0 },
    referralCode: { type: String, unique: true, sparse: true },
    referralEarnings: { type: Number, default: 0 },

    notificationSettings: {
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        email: { type: Boolean, default: true },
        promo: { type: Boolean, default: true }
    },

    favorites: {
        products: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        stores: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Store' }] // Future proofing
    },

    loyaltyPoints: {
        type: Number,
        default: 0
    },
    defaultAddress: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    },
    lastLogin: Date,
    resetPasswordToken: String,
    resetPasswordExpires: Date
}, {
    timestamps: true
});

userSchema.index({ role: 1 });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toJSON = function () {
    const obj = this.toObject();
    delete obj.password;
    delete obj.otp;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;
    return obj;
};

module.exports = mongoose.model('User', userSchema);
