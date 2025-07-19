const bookService = require('../services/bookService');

exports.getAllBooks = async (req, res) => {
  try {
    const books = await bookService.getAllBooks();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await bookService.getBookById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createBook = async (req, res) => {
  try {
    const book = await bookService.createBook(req.body);
    res.status(201).json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateBook = async (req, res) => {
  try {
    const book = await bookService.updateBook(req.params.id, req.body);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.json(book);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    await bookService.deleteBook(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.seedBooks = async (req, res) => {
  try {
    const genres = [
      'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Sci-Fi', 'Fantasy', 'Biography', 'Self-Help', 'History', 'Thriller', 'Children', 'Young Adult', 'Horror', 'Classic', 'Adventure', 'Philosophy', 'Science', 'Business', 'Comics', 'Poetry'
    ];
    const authors = [
      'Matt Haig', 'James Clear', 'Frank Herbert', 'Taylor Jenkins Reid', 'Tara Westover', 'Delia Owens', 'Paulo Coelho', 'Michelle Obama', 'Alex Michaelides', 'Sally Rooney',
      'Stephen King', 'J.K. Rowling', 'George R.R. Martin', 'Agatha Christie', 'Haruki Murakami', 'Malcolm Gladwell', 'Yuval Noah Harari', 'Jane Austen', 'Mark Twain', 'Oscar Wilde'
    ];
    const covers = [
      'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop',
      'https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=400&fit=crop',
      'https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=300&h=400&fit=crop',
      'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=300&h=400&fit=crop',
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
      'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=300&h=400&fit=crop',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&h=400&fit=crop',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=300&h=400&fit=crop',
      'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?w=300&h=400&fit=crop',
      'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=300&h=400&fit=crop'
    ];
    const bookTitleAuthorPairs = [
      { title: 'The Midnight Library', author: 'Matt Haig' },
      { title: 'Atomic Habits', author: 'James Clear' },
      { title: 'Dune', author: 'Frank Herbert' },
      { title: 'The Seven Husbands of Evelyn Hugo', author: 'Taylor Jenkins Reid' },
      { title: 'Educated', author: 'Tara Westover' },
      { title: 'Where the Crawdads Sing', author: 'Delia Owens' },
      { title: 'The Alchemist', author: 'Paulo Coelho' },
      { title: 'Becoming', author: 'Michelle Obama' },
      { title: 'The Silent Patient', author: 'Alex Michaelides' },
      { title: 'Normal People', author: 'Sally Rooney' },
      { title: 'The Shining', author: 'Stephen King' },
      { title: 'Harry Potter and the Sorcerer\'s Stone', author: 'J.K. Rowling' },
      { title: 'A Game of Thrones', author: 'George R.R. Martin' },
      { title: 'Murder on the Orient Express', author: 'Agatha Christie' },
      { title: 'Kafka on the Shore', author: 'Haruki Murakami' },
      { title: 'Outliers', author: 'Malcolm Gladwell' },
      { title: 'Sapiens', author: 'Yuval Noah Harari' },
      { title: 'Pride and Prejudice', author: 'Jane Austen' },
      { title: 'Adventures of Huckleberry Finn', author: 'Mark Twain' },
      { title: 'The Picture of Dorian Gray', author: 'Oscar Wilde' }
    ];
    const books = [];
    for (let i = 1; i <= 100; i++) {
      const genre = genres[Math.floor(Math.random() * genres.length)];
      const pair = bookTitleAuthorPairs[Math.floor(Math.random() * bookTitleAuthorPairs.length)];
      const coverUrl = covers[Math.floor(Math.random() * covers.length)];
      const price = (Math.random() * 40 + 5).toFixed(2); // $5 - $45
      books.push({
        title: pair.title,
        author: pair.author,
        genre,
        description: `This is a sample description for ${pair.title}, a ${genre} book by ${pair.author}.`,
        coverUrl,
        publishedDate: new Date(2010 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1),
        price: Number(price)
      });
    }
    const inserted = await Promise.all(books.map(book => bookService.createBook(book)));
    res.status(201).json({ message: 'Books seeded', count: inserted.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFeaturedBooks = async (req, res) => {
  try {
    const books = await bookService.getFeaturedBooks();
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}; 