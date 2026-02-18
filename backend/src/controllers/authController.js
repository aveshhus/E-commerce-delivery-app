const User = require('../models/User');
const { generateToken, generateOTP } = require('../utils/helpers');

// Register with email & password
exports.register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'Email or phone already registered' });
        }

        const user = await User.create({ name, email, phone, password, isVerified: true });
        const token = generateToken(user._id);

        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: { user, token }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Login with email & password
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Please provide email and password' });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Account deactivated' });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Login successful',
            data: { user, token }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Send OTP
exports.sendOTP = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({ success: false, message: 'Phone number required' });
        }

        let user = await User.findOne({ phone });
        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        if (user) {
            user.otp = { code: otp, expiresAt: otpExpires };
            await user.save();
        } else {
            user = await User.create({
                phone,
                name: 'User',
                otp: { code: otp, expiresAt: otpExpires }
            });
        }

        // In production, send OTP via SMS gateway
        console.log(`OTP for ${phone}: ${otp}`);

        res.json({
            success: true,
            message: 'OTP sent successfully',
            data: { phone, otp: process.env.NODE_ENV === 'development' ? otp : undefined }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        const user = await User.findOne({ phone });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (!user.otp || !user.otp.code) {
            return res.status(400).json({ success: false, message: 'No OTP request found' });
        }

        if (new Date() > user.otp.expiresAt) {
            return res.status(400).json({ success: false, message: 'OTP expired' });
        }

        if (user.otp.code !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        user.isVerified = true;
        user.otp = undefined;
        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'OTP verified successfully',
            data: { user, token }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Admin login
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email, role: { $in: ['admin', 'superadmin'] } }).select('+password');
        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
        }

        user.lastLogin = new Date();
        await user.save();

        const token = generateToken(user._id);

        res.json({
            success: true,
            message: 'Admin login successful',
            data: { user, token }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('defaultAddress');
        res.json({ success: true, data: { user } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update profile
exports.updateProfile = async (req, res) => {
    try {
        const { name, email, avatar } = req.body;
        const user = await User.findByIdAndUpdate(
            req.user._id,
            { name, email, avatar },
            { new: true, runValidators: true }
        );
        res.json({ success: true, message: 'Profile updated', data: { user } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update FCM Token
exports.updateFCMToken = async (req, res) => {
    try {
        const { fcmToken } = req.body;
        await User.findByIdAndUpdate(req.user._id, { fcmToken });
        res.json({ success: true, message: 'FCM token updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
