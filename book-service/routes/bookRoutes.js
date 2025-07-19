const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Get all books
 *     responses:
 *       200:
 *         description: List of books
 */
router.get('/', bookController.getAllBooks);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Get a book by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book object
 *       404:
 *         description: Book not found
 */
router.get('/:id', bookController.getBookById);

/**
 * @swagger
 * /api/books/featured:
 *   get:
 *     summary: Get featured books
 *     responses:
 *       200:
 *         description: List of featured books
 */
router.get('/featured', bookController.getFeaturedBooks);

// Protected routes (require JWT)
router.post('/', auth, bookController.createBook);
router.put('/:id', auth, bookController.updateBook);
router.delete('/:id', auth, bookController.deleteBook);

// Seed books (for demo/testing)
router.post('/seed', auth, bookController.seedBooks);

module.exports = router; 