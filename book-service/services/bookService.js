const Book = require('../models/book');
const redisClient = require('../config/redis');

const getAllBooks = async () => {
  const cacheKey = 'books:all';
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);
  const books = await Book.find();
  await redisClient.set(cacheKey, JSON.stringify(books), { EX: 60 });
  return books;
};

const getBookById = async (id) => {
  const cacheKey = `books:${id}`;
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);
  const book = await Book.findById(id);
  if (book) await redisClient.set(cacheKey, JSON.stringify(book), { EX: 60 });
  return book;
};

const createBook = async (data) => {
  const book = new Book(data);
  await book.save();
  await redisClient.del('books:all');
  return book;
};

const updateBook = async (id, data) => {
  const book = await Book.findByIdAndUpdate(id, data, { new: true });
  await redisClient.del('books:all');
  await redisClient.del(`books:${id}`);
  return book;
};

const deleteBook = async (id) => {
  await Book.findByIdAndDelete(id);
  await redisClient.del('books:all');
  await redisClient.del(`books:${id}`);
  return true;
};

const getFeaturedBooks = async () => {
  const cacheKey = 'books:featured';
  const cached = await redisClient.get(cacheKey);
  if (cached) return JSON.parse(cached);
  // If reviewCount exists, sort by it descending, else just limit 10
  const books = await Book.find({ featured: true })
    .sort({ reviewCount: -1 })
    .limit(10);
  await redisClient.set(cacheKey, JSON.stringify(books), { EX: 60 });
  return books;
};

module.exports = { getAllBooks, getBookById, createBook, updateBook, deleteBook, getFeaturedBooks }; 