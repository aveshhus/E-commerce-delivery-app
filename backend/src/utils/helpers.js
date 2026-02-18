const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    });
};

const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const toRad = (value) => (value * Math.PI) / 180;

const paginate = (query, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
};

const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(price);
};

const isWithinDeliveryRadius = (storeLat, storeLon, custLat, custLon) => {
    const maxRadius = parseFloat(process.env.DELIVERY_RADIUS_KM) || 4;
    const distance = calculateDistance(storeLat, storeLon, custLat, custLon);
    return { isWithin: distance <= maxRadius, distance };
};

const calculateLoyaltyPoints = (orderAmount) => {
    // 1 point per ₹10 spent
    return Math.floor(orderAmount / 10);
};

const pointsToRupees = (points) => {
    // 100 points = ₹10
    return points / 10;
};

class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = {
    generateToken,
    generateOTP,
    calculateDistance,
    paginate,
    formatPrice,
    isWithinDeliveryRadius,
    calculateLoyaltyPoints,
    pointsToRupees,
    AppError
};
