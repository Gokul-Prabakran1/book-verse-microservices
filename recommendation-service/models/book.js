const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  coverUrl: String,
  genre: String,
  description: String,
  rating: Number,
  // Add more fields as needed
}, { collection: 'books' });

module.exports = mongoose.model('Book', bookSchema); 