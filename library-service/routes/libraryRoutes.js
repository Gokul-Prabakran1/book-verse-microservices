const express = require('express');
const router = express.Router();
const libraryController = require('../controllers/libraryController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /library/add:
 *   post:
 *     summary: Add a book to the user's library
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookId:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book added
 */
router.post('/library/add', auth, libraryController.addBook);

/**
 * @swagger
 * /library/remove:
 *   post:
 *     summary: Remove a book from the user's library
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book removed
 */
router.post('/library/remove', auth, libraryController.removeBook);

/**
 * @swagger
 * /library:
 *   get:
 *     summary: Get the user's library
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Library fetched
 */
router.get('/library', auth, libraryController.getLibrary);

/**
 * @swagger
 * /library/update-category:
 *   post:
 *     summary: Update a book's category in the user's library
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookId:
 *                 type: string
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Category updated
 */
router.post('/library/update-category', auth, libraryController.updateCategory);

/**
 * @swagger
 * /library/toggle-favourite:
 *   post:
 *     summary: Toggle favourite status for a book in the user's library
 *     tags: [Library]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bookId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Favourite toggled
 */
router.post('/library/toggle-favourite', auth, libraryController.toggleFavourite);

module.exports = router; 