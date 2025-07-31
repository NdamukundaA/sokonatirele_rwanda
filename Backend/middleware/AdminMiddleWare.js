const jwt = require('jsonwebtoken');
const Seller = require('../models/Sellers');

const adminMiddleware = async (req, res, next) => {
    try {
        // Check if authorization header exists
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        // Get token from header
        const token = authHeader.split(' ')[1];

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find admin user
        const admin = await Seller.findById(decoded.userId);

        // Check if user exists and is admin
        if (!admin || !admin.isAdmin) {
            return res.status(403).json({ message: 'Not authorized to access this route' });
        }

        // Attach admin user to request object
        req.admin = admin;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = adminMiddleware;