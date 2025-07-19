const mongoose = require('mongoose');
require('./book');
const librarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  books: [{
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    category: { type: String, enum: ['Read', 'Currently Reading', 'WantToRead'], required: true },
    favourite: { type: Boolean, default: false }
  }]
}, { timestamps: true });
module.exports = mongoose.model('Library', librarySchema); 