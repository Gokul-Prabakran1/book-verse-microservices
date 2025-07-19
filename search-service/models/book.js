const mongoose = require('mongoose');
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true, text: true },
  author: { type: String, required: true, text: true },
  genre: { type: String, required: true, index: true },
  summary: { type: String },
  ISBN: { type: String, unique: true, required: true },
  language: { type: String },
  rating: { type: Number }
}, { timestamps: true });
module.exports = mongoose.model('Book', bookSchema); 