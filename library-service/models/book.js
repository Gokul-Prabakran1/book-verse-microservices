const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: String,
  author: String,
  coverUrl: String,
  // Add more fields as needed for population
}, { collection: 'books' }); // Ensure this matches your actual collection name

module.exports = mongoose.model('Book', bookSchema); 