const searchService = require('../services/searchService');
const logger = require('../middleware/logger');

exports.search = async (req, res) => {
  try {
    const { q, genre, rating, language, author, priceMax } = req.query;
    const books = await searchService.searchBooks(q, { genre, rating, language, author, priceMax });
    res.json(books);
  } catch (err) {
    logger.error('Error searching books:', err.message);
    res.status(400).json({ error: err.message });
  }
}; 