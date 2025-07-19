const Redis = require('ioredis');
const logger = require('../middleware/logger');

const redis = new Redis(process.env.REDIS_URI);

redis.on('connect', () => logger.info('Redis connected'));
redis.on('error', (err) => logger.error('Redis error:', err));

module.exports = redis; 