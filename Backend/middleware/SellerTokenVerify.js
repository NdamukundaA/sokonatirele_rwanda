const jwt = require('jsonwebtoken');

const verifySellerToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.SECRETKEY, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: 'Token is not valid' });
            }

            if (!decoded.isAdmin) {
                return res.status(403).json({ message: 'Access denied. Admins only.' });
            }

            req.user = decoded;
            req.adminId = decoded.adminId;

            next();
        });
    } else {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
};

module.exports = { verifySellerToken };

