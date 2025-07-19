const userService = require('../services/userService');
const jwt = require('jsonwebtoken');
const logger = require('../middleware/logger');
const redis = require('../config/redis');

exports.register = async (req, res) => {
  try {
    const user = await userService.register(req.body);
    logger.info(`User registered: ${user._id}`);
    res.status(201).json({ message: 'User registered' });
  } catch (err) {
    logger.error('Error registering user:', err.message);
    if (err.message === 'User already exists') {
      return res.status(409).json({ error: 'User already exists' });
    }
    res.status(400).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const user = await userService.login(req.body.email, req.body.password);
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '1h' });
    await redis.set(`session:${token}`, user._id.toString(), 'EX', 3600);
    logger.info(`User logged in: ${user._id}`);
    res.json({ token });
  } catch (err) {
    logger.error('Error logging in:', err.message);
    if (err.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    if (err.message === 'Invalid password') {
      return res.status(401).json({ error: 'Invalid password' });
    }
    res.status(400).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (token) await redis.del(`session:${token}`);
  res.json({ message: 'Logged out' });
};

exports.profile = async (req, res) => {
  try {
    const user = await userService.getProfile(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    logger.error('Error fetching profile:', err.message);
    res.status(400).json({ error: err.message });
  }
}; 