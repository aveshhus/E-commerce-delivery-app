const Announcement = require('../models/Announcement');

exports.getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find().sort({ createdAt: -1 });
        res.json({ success: true, data: { announcements } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.createAnnouncement = async (req, res) => {
    try {
        const { title, content, targetAudience } = req.body;
        const announcement = await Announcement.create({
            title,
            content,
            targetAudience,
            createdBy: req.user._id
        });
        res.status(201).json({ success: true, data: { announcement } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
        res.json({ success: true, data: { announcement } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndDelete(req.params.id);
        if (!announcement) return res.status(404).json({ success: false, message: 'Announcement not found' });
        res.json({ success: true, message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
