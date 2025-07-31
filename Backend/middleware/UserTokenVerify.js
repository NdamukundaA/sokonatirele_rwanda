const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.SECRETKEY);
    console.log('Decoded JWT payload:', decoded);
    req.user = decoded;
    if (!req.user._id) {
      console.error('No _id found in decoded payload');
      return res.status(403).json({ message: 'Invalid token payload' });
    }
    next();
  } catch (err) {
    console.error('Token verification error:', err.message);
    return res.status(403).json({ message: 'Token is not valid' });
  }
};

module.exports = { verifyToken };

