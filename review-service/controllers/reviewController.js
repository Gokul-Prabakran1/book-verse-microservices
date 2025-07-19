const reviewService = require('../services/reviewService');
const logger = require('../middleware/logger');

exports.addReview = async (req, res) => {
  try {
    const review = await reviewService.createReview({ ...req.body, userId: req.user.id });
    logger.info(`Review created: ${review._id}`);
    res.status(201).json(review);
  } catch (err) {
    if (err.message === 'Rate limit exceeded') {
      return res.status(429).json({ message: 'Rate limit exceeded' });
    }
    logger.error('Error creating review:', err.message);
    res.status(400).json({ error: err.message });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const review = await reviewService.updateReview(req.params.id, req.user.id, req.body);
    if (!review) return res.status(404).json({ message: 'Review not found or not authorized' });
    logger.info(`Review updated: ${review._id}`);
    res.json(review);
  } catch (err) {
    logger.error('Error updating review:', err.message);
    res.status(400).json({ error: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await reviewService.deleteReview(req.params.id, req.user.id);
    if (!review) return res.status(404).json({ message: 'Review not found or not authorized' });
    logger.info(`Review deleted: ${review._id}`);
    res.json({ message: 'Review deleted' });
  } catch (err) {
    logger.error('Error deleting review:', err.message);
    res.status(400).json({ error: err.message });
  }
};

exports.getReviewsByBook = async (req, res) => {
  try {
    const reviews = await reviewService.getReviewsByBook(req.params.bookId);
    res.json(reviews);
  } catch (err) {
    logger.error('Error fetching reviews:', err.message);
    res.status(400).json({ error: err.message });
  }
}; 