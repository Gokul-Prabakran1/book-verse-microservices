const Library = require('../models/library');
const redis = require('../config/redis');

exports.addBook = async (userId, bookId, category) => {
  let lib = await Library.findOne({ userId });
  if (!lib) lib = new Library({ userId, books: [] });
  if (lib.books.some(b => b.bookId.equals(bookId))) throw new Error('Book already in library');
  lib.books.push({ bookId, category });
  await lib.save();
  await redis.del(`library:${userId}`);
  return lib;
};

exports.removeBook = async (userId, bookId) => {
  let lib = await Library.findOne({ userId });
  if (!lib) throw new Error('Library not found');
  lib.books = lib.books.filter(b => !b.bookId.equals(bookId));
  await lib.save();
  await redis.del(`library:${userId}`);
  return lib;
};

exports.updateCategory = async (userId, bookId, category) => {
  let lib = await Library.findOne({ userId });
  if (!lib) throw new Error('Library not found');
  const bookEntry = lib.books.find(b => b.bookId.equals(bookId));
  if (!bookEntry) throw new Error('Book not found in library');
  bookEntry.category = category;
  await lib.save();
  await redis.del(`library:${userId}`);
  return lib;
};

exports.toggleFavourite = async (userId, bookId) => {
  let lib = await Library.findOne({ userId });
  if (!lib) throw new Error('Library not found');
  const bookEntry = lib.books.find(b => b.bookId.equals(bookId));
  if (!bookEntry) throw new Error('Book not found in library');
  bookEntry.favourite = !bookEntry.favourite;
  await lib.save();
  await redis.del(`library:${userId}`);
  return lib;
};

exports.getLibrary = async (userId) => {
  const cacheKey = `library:${userId}`;
  let lib = await redis.get(cacheKey);
  if (lib) return JSON.parse(lib);
  lib = await Library.findOne({ userId }).populate('books.bookId');
  await redis.set(cacheKey, JSON.stringify(lib), 'EX', 300);
  return lib;
}; 