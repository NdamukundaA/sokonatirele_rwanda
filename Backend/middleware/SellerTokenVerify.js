const jwt = require('jsonwebtoken');

const verifySellerToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.SECRETKEY, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Token is not valid' });
            }

            // Check if the decoded token has isAdmin flag
            if (!decoded.isAdmin) {
                return res.status(403).json({ message: 'Access denied. Admins only.' });
            }

            // Set both user and admin properties
            req.user = decoded;
            req.admin = decoded;
            req.adminId = decoded.adminId;
            req.userId = decoded.adminId; // Ensure userId is also set for compatibility

            next();
        });
    } else {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
};

module.exports = { verifySellerToken };

