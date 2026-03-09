const mongoose = require('mongoose');

const issueReportSchema = new mongoose.Schema({
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DeliveryAgent',
        required: true
    },
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    type: {
        type: String,
        enum: ['vehicle', 'customer', 'health', 'accidental', 'payment', 'other'],
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
    },
    description: {
        type: String,
        required: true
    },
    location: {
        latitude: Number,
        longitude: Number,
        address: String
    },
    status: {
        type: String,
        enum: ['open', 'in-progress', 'resolved', 'closed'],
        default: 'open'
    },
    adminNotes: String,
    resolvedAt: Date
}, {
    timestamps: true
});

module.exports = mongoose.model('IssueReport', issueReportSchema);
