const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /recommendations/generate:
 *   post:
 *     summary: Generate recommendations for the user
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recommendations generated
 */
router.post('/recommendations/generate', auth, recommendationController.generate);

/**
 * @swagger
 * /recommendations:
 *   get:
 *     summary: Get recommendations for the user
 *     tags: [Recommendations]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Recommendations found
 */
router.get('/recommendations', auth, recommendationController.get);

module.exports = router; 