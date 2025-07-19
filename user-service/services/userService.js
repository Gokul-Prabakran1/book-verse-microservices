const User = require('../models/user');
const bcrypt = require('bcrypt');
const logger = require('../middleware/logger');

exports.register = async (data) => {
  logger.info('Register data received:', { username: data.username, email: data.email });
  // Check if user already exists by email or username
  const existingUser = await User.findOne({ $or: [ { email: data.email }, { username: data.username } ] });
  if (existingUser) {
    throw new Error('User already exists');
  }
  const hashedPassword = await bcrypt.hash(data.password, 10);
  const userData = { ...data, password: hashedPassword };
  logger.info('Data to be saved to MongoDB:', { username: userData.username, email: userData.email });
  const user = new User(userData);
  return await user.save();
};

exports.login = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('User not found');
  const match = await bcrypt.compare(password, user.password);
  if (!match) throw new Error('Invalid password');
  return user;
};

exports.getProfile = async (id) => {
  return await User.findById(id).select('-password');
}; 