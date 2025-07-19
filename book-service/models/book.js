const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  coverUrl: { type: String },
  publishedDate: { type: Date },
  genre: { type: String },
  price: { type: Number },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Book', bookSchema); 