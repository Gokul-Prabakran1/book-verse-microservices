const Review = require('../models/review');
const redis = require('../config/redis');

exports.createReview = async (data) => {
  const key = `review:limit:${data.userId}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 600); // 10 minutes
  if (count > 3) throw new Error('Rate limit exceeded');
  const review = new Review(data);
  return await review.save();
};

exports.updateReview = async (id, userId, data) => {
  return await Review.findOneAndUpdate({ _id: id, userId }, data, { new: true });
};

exports.deleteReview = async (id, userId) => {
  return await Review.findOneAndDelete({ _id: id, userId });
};

exports.getReviewsByBook = async (bookId) => {
  return await Review.find({ bookId });
}; 