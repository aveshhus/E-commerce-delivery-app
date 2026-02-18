const mongoose = require('mongoose');

const loyaltyPointsSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['earned', 'redeemed', 'expired', 'bonus', 'refunded'],
        required: true
    },
    points: {
        type: Number,
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    description: {
        type: String,
        trim: true
    },
    expiresAt: {
        type: Date
    }
}, {
    timestamps: true
});

loyaltyPointsSchema.index({ user: 1, createdAt: -1 });
loyaltyPointsSchema.index({ type: 1 });

module.exports = mongoose.model('LoyaltyPoints', loyaltyPointsSchema);
