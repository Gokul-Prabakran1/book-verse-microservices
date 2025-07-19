const Book = require('../models/book');
const redis = require('../config/redis');

exports.searchBooks = async (query, filters) => {
  const cacheKey = `search:${JSON.stringify({ query, filters })}`;
  let results = await redis.get(cacheKey);
  if (results) return JSON.parse(results);

  let mongoQuery = {};
  if (query) mongoQuery.$text = { $search: query };
  if (filters.genre) mongoQuery.genre = filters.genre;
  if (filters.language) mongoQuery.language = filters.language;
  if (filters.rating) mongoQuery.rating = { $gte: filters.rating };
  if (filters.author) mongoQuery.author = filters.author;
  if (filters.priceMax) mongoQuery.price = { $lte: Number(filters.priceMax) };

  results = await Book.find(mongoQuery);
  await redis.set(cacheKey, JSON.stringify(results), 'EX', 600);
  return results;
}; 