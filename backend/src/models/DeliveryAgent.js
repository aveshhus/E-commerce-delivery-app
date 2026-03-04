const mongoose = require('mongoose');

const deliveryAgentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        trim: true
    },
    avatar: String,
    vehicleType: {
        type: String,
        enum: ['bike', 'scooter', 'bicycle', 'car'],
        default: 'bike'
    },
    vehicleNumber: String,
    licenseNumber: String,
    isAvailable: {
        type: Boolean,
        default: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    isOnBreak: {
        type: Boolean,
        default: false
    },
    employeeId: {
        type: String,
        trim: true
    },
    hubName: {
        type: String,
        default: 'Main Hub'
    },
    shiftTime: {
        type: String,
        default: '9:00 AM - 6:00 PM'
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },
    currentOrder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    totalDeliveries: {
        type: Number,
        default: 0
    },
    rating: {
        average: { type: Number, default: 5.0 },
        count: { type: Number, default: 0 }
    },
    performance: {
        onTimePercentage: { type: Number, default: 100 },
        failedDeliveriesPercentage: { type: Number, default: 0 },
        complaintsCount: { type: Number, default: 0 },
        returnedCount: { type: Number, default: 0 },
        grade: { type: String, enum: ['A', 'B', 'C', 'D'], default: 'A' },
        badges: [{ type: String }] // e.g., 'Fastest Rider', '5 Star Hero'
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    aadhaarNumber: { type: String, trim: true },
    panNumber: { type: String, trim: true },
    bankDetails: {
        accountNumber: { type: String, trim: true },
        ifscCode: { type: String, trim: true },
        bankName: { type: String, trim: true }
    },
    earnings: {
        today: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    dailyTarget: {
        type: Number,
        default: 20
    },
    kmDriven: {
        today: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    attendance: [{
        date: String, // e.g. YYYY-MM-DD
        status: { type: String, enum: ['present', 'absent', 'half-day'], default: 'present' },
        hours: { type: Number, default: 0 } // Hours worked on this specific date
    }],
    onlineHours: {
        today: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    },
    lastOnlineAt: { type: Date },
    lastOfflineAt: { type: Date }
}, {
    timestamps: true
});

deliveryAgentSchema.index({ currentLocation: '2dsphere' });
deliveryAgentSchema.index({ isAvailable: 1, isActive: 1, isOnline: 1 });

module.exports = mongoose.model('DeliveryAgent', deliveryAgentSchema);
