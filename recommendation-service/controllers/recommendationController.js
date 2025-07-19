const recommendationService = require('../services/recommendationService');
const logger = require('../middleware/logger');

exports.generate = async (req, res) => {
  try {
    const recs = await recommendationService.generateRecommendations(req.user.id);
    logger.info(`Recommendations generated for user: ${req.user.id}`);
    res.json(recs);
  } catch (err) {
    logger.error('Error generating recommendations:', err.message);
    res.status(400).json({ error: err.message });
  }
};

exports.get = async (req, res) => {
  try {
    const recs = await recommendationService.getRecommendations(req.user.id);
    res.json(recs);
  } catch (err) {
    logger.error('Error fetching recommendations:', err.message);
    res.status(400).json({ error: err.message });
  }
}; 