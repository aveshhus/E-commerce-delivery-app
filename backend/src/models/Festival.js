const mongoose = require('mongoose');

const festivalSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Festival name is required'],
        trim: true
    },
    date: {
        type: Date,
        required: [true, 'Festival date is required']
    },
    message: {
        type: String,
        required: [true, 'Festival message is required'],
        trim: true
    },
    themeColor: {
        type: String,
        default: '#ff9933' // Default saffron/orange color
    },
    imageUrl: {
        type: String,
        default: ''
    },
    isActive: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Ensure only one festival is active at a time? 
// Or allow multiple and let frontend pick? 
// Let's keep it simple: allow multiple active but usually admin should toggle one.
// Or we can add a pre-save hook to deactivate others if this one is set to active.

festivalSchema.pre('save', async function () {
    if (this.isModified('isActive') && this.isActive) {
        // If setting this festival to active, deactivate all others
        await this.constructor.updateMany(
            { _id: { $ne: this._id } },
            { isActive: false }
        );
    }
});

module.exports = mongoose.model('Festival', festivalSchema);
