const jwt = require('jsonwebtoken');
const redis = require('../config/redis');

module.exports = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: 'No token provided' });
  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Invalid token format' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Redis session check (optional, for blacklisting/expiry)
    const exists = await redis.exists(`session:${token}`);
    if (!exists) return res.status(401).json({ message: 'Session expired or invalid' });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}; 