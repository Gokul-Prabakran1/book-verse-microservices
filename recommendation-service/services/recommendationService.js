const Recommendation = require('../models/recommendation');
const redis = require('../config/redis');
const Book = require('../models/book');

// Dummy function to simulate recommendation generation
async function generateRecommendations(userId) {
  // Recommend 5 random books
  const count = await Book.countDocuments();
  if (count === 0) return [];
  const random = Math.max(0, Math.floor(Math.random() * (count - 5)));
  const books = await Book.find().skip(random).limit(5);
  return books.map(b => b._id);
}

exports.generateRecommendations = async (userId) => {
  // Generate and cache recommendations
  const recs = await generateRecommendations(userId);
  let rec = await Recommendation.findOneAndUpdate(
    { userId },
    { recommendations: recs },
    { upsert: true, new: true }
  );
  await redis.set(`recommend:${userId}`, JSON.stringify(recs), 'EX', 1800);
  return rec.recommendations;
};

exports.getRecommendations = async (userId) => {
  const cacheKey = `recommend:${userId}`;
  let recs = await redis.get(cacheKey);
  if (recs) return JSON.parse(recs);
  const rec = await Recommendation.findOne({ userId });
  if (rec) {
    await redis.set(cacheKey, JSON.stringify(rec.recommendations), 'EX', 1800);
    return rec.recommendations;
  }
  return [];
}; 