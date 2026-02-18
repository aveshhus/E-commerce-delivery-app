const Address = require('../models/Address');
const User = require('../models/User');

exports.getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id, isActive: true });
        res.json({ success: true, data: { addresses } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.addAddress = async (req, res) => {
    try {
        const address = await Address.create({ ...req.body, user: req.user._id });

        // If first address or marked default, set as default
        const addressCount = await Address.countDocuments({ user: req.user._id, isActive: true });
        if (addressCount === 1 || req.body.isDefault) {
            await Address.updateMany(
                { user: req.user._id, _id: { $ne: address._id } },
                { isDefault: false }
            );
            address.isDefault = true;
            await address.save();
            await User.findByIdAndUpdate(req.user._id, { defaultAddress: address._id });
        }

        res.status(201).json({ success: true, message: 'Address added', data: { address } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.updateAddress = async (req, res) => {
    try {
        const address = await Address.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            req.body,
            { new: true, runValidators: true }
        );
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        if (req.body.isDefault) {
            await Address.updateMany(
                { user: req.user._id, _id: { $ne: address._id } },
                { isDefault: false }
            );
            await User.findByIdAndUpdate(req.user._id, { defaultAddress: address._id });
        }

        res.json({ success: true, message: 'Address updated', data: { address } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.deleteAddress = async (req, res) => {
    try {
        await Address.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isActive: false }
        );
        res.json({ success: true, message: 'Address deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.setDefaultAddress = async (req, res) => {
    try {
        await Address.updateMany({ user: req.user._id }, { isDefault: false });
        const address = await Address.findOneAndUpdate(
            { _id: req.params.id, user: req.user._id },
            { isDefault: true },
            { new: true }
        );
        await User.findByIdAndUpdate(req.user._id, { defaultAddress: address._id });
        res.json({ success: true, message: 'Default address updated', data: { address } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
