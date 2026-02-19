const Festival = require('../models/Festival');

// Get active festival (Public)
exports.getActiveFestival = async (req, res) => {
    try {
        const festival = await Festival.findOne({ isActive: true });
        res.json({ success: true, data: { festival } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all festivals (Admin)
exports.getAllFestivals = async (req, res) => {
    try {
        const festivals = await Festival.find().sort({ date: 1 });
        res.json({ success: true, data: { festivals } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Create festival (Admin)
exports.createFestival = async (req, res) => {
    try {
        const festival = await Festival.create(req.body);
        res.status(201).json({ success: true, message: 'Festival created', data: { festival } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update festival (Admin)
exports.updateFestival = async (req, res) => {
    try {
        const festival = await Festival.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!festival) {
            return res.status(404).json({ success: false, message: 'Festival not found' });
        }
        res.json({ success: true, message: 'Festival updated', data: { festival } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete festival (Admin)
exports.deleteFestival = async (req, res) => {
    try {
        const festival = await Festival.findByIdAndDelete(req.params.id);
        if (!festival) {
            return res.status(404).json({ success: false, message: 'Festival not found' });
        }
        res.json({ success: true, message: 'Festival deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle active status (Admin)
exports.toggleFestivalStatus = async (req, res) => {
    try {
        const festival = await Festival.findById(req.params.id);
        if (!festival) {
            return res.status(404).json({ success: false, message: 'Festival not found' });
        }

        // If we represent creating a new active one, the pre-save hook handles deactivating others.
        // But if we are just updating this one field:
        festival.isActive = !festival.isActive;
        await festival.save(); // This triggers the pre-save hook if isActive becomes true

        res.json({ success: true, message: 'Festival status updated', data: { festival } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
