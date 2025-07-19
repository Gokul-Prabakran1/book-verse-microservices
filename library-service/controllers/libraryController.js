const libraryService = require('../services/libraryService');
const logger = require('../middleware/logger');

exports.addBook = async (req, res) => {
  try {
    const lib = await libraryService.addBook(req.user.id, req.body.bookId, req.body.category);
    logger.info(`Book added to library: ${req.body.bookId}`);
    res.json(lib);
  } catch (err) {
    logger.error('Error adding book:', err.message);
    res.status(400).json({ error: err.message });
  }
};

exports.removeBook = async (req, res) => {
  try {
    const lib = await libraryService.removeBook(req.user.id, req.body.bookId);
    logger.info(`Book removed from library: ${req.body.bookId}`);
    res.json(lib);
  } catch (err) {
    logger.error('Error removing book:', err.message);
    res.status(400).json({ error: err.message });
  }
};

exports.getLibrary = async (req, res) => {
  try {
    const lib = await libraryService.getLibrary(req.user.id);
    res.json(lib);
  } catch (err) {
    logger.error('Error fetching library:', err.message);
    res.status(400).json({ error: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const lib = await libraryService.updateCategory(req.user.id, req.body.bookId, req.body.category);
    logger.info(`Book category updated: ${req.body.bookId} -> ${req.body.category}`);
    res.json(lib);
  } catch (err) {
    logger.error('Error updating category:', err.message);
    res.status(400).json({ error: err.message });
  }
};

exports.toggleFavourite = async (req, res) => {
  try {
    const lib = await libraryService.toggleFavourite(req.user.id, req.body.bookId);
    logger.info(`Book favourite toggled: ${req.body.bookId}`);
    res.json(lib);
  } catch (err) {
    logger.error('Error toggling favourite:', err.message);
    res.status(400).json({ error: err.message });
  }
}; 