
import { useState, useEffect } from "react";
import axios from "axios";
import { Search, Filter, Grid, List, SlidersHorizontal } from "lucide-react";
import Button from '@/components/ui/button';
import Input from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Navigation from "@/components/Navigation";
import BookCard from "@/components/BookCard";
import Footer from "@/components/Footer";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { toast } from '@/components/ui/use-toast';
import BookDetailsModal from '@/components/BookDetailsModal';

// Remove sampleBooks, use real data
const genres = ["All Genres"];
const authors = ["All Authors"];

const sortOptions = ["Newest", "Oldest", "Price Low-High", "Price High-Low", "Title A-Z", "Title Z-A"];

const Catalog = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const redirect = params.get('redirect');
  const redirectTab = params.get('tab');

  // Read params from URL
  const initialQuery = params.get('query') || "";
  const initialGenre = params.get('genre') || "All Genres";
  const initialAuthor = params.get('author') || "All Authors";
  const initialSort = params.get('sort') || "Newest";
  const initialPriceMax = params.get('priceMax');

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedGenre, setSelectedGenre] = useState(initialGenre);
  const [selectedAuthor, setSelectedAuthor] = useState(initialAuthor);
  const [sortBy, setSortBy] = useState(initialSort);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [books, setBooks] = useState<any[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [allGenres, setAllGenres] = useState<string[]>(["All Genres"]);
  const [allAuthors, setAllAuthors] = useState<string[]>(["All Authors"]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [maxPrice, setMaxPrice] = useState(100);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBookId, setReviewBookId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsBook, setDetailsBook] = useState<any | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [bookDetails, setBookDetails] = useState<any | null>(null);
  const [searchServiceError, setSearchServiceError] = useState<string | null>(null);

  useEffect(() => {
    axios.get(import.meta.env.VITE_BOOK_API_URL + "/api/books")
      .then(res => {
        // Extract genres and authors only
        const genresSet = new Set(res.data.map((b: any) => b.genre).filter(Boolean));
        setAllGenres(["All Genres", ...Array.from(genresSet).map(String)]);
        const authorsSet = new Set(res.data.map((b: any) => b.author).filter(Boolean));
        setAllAuthors(["All Authors", ...Array.from(authorsSet).map(String)]);
        // Find max price
        const maxP = Math.max(...res.data.map((b: any) => b.price || 0));
        setMaxPrice(maxP);
        // Set price range from URL or default
        if (initialPriceMax) {
          setPriceRange([0, Number(initialPriceMax)]);
        } else {
          setPriceRange([0, maxP]);
        }
      });
    // eslint-disable-next-line
  }, []);

  // If the URL changes (user navigates with new params), update state
  useEffect(() => {
    setSearchQuery(initialQuery);
    setSelectedGenre(initialGenre);
    setSelectedAuthor(initialAuthor);
    setSortBy(initialSort);
    if (initialPriceMax) setPriceRange([0, Number(initialPriceMax)]);
    // eslint-disable-next-line
  }, [location.search]);

  useEffect(() => {
    setSearchServiceError(null); // Reset error before new search
    axios.get(import.meta.env.VITE_SEARCH_API_URL + "/api/search", {
      params: {
        q: searchQuery,
        genre: selectedGenre !== "All Genres" ? selectedGenre : undefined,
        author: selectedAuthor !== "All Authors" ? selectedAuthor : undefined,
        priceMax: priceRange[1] < maxPrice ? priceRange[1] : undefined,
        // Add other filters as needed
      }
    })
      .then(res => {
        setBooks(res.data);
        setFilteredBooks(res.data);
        setSearchServiceError(null);
        // Optionally extract genres/authors from res.data
      })
      .catch(() => {
        setBooks([]);
        setFilteredBooks([]);
        setSearchServiceError("Search service is down. Please try again later.");
      });
  }, [searchQuery, selectedGenre, selectedAuthor, priceRange]);

  // Fetch full book details when selectedBookId changes
  useEffect(() => {
    if (!selectedBookId) return;
    axios.get(import.meta.env.VITE_BOOK_API_URL + `/api/books/${selectedBookId}`)
      .then(res => setBookDetails(res.data));
  }, [selectedBookId]);

  // Helper to get userId from JWT
  function getUserIdFromToken() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const decoded = jwtDecode<{ id?: string } & JwtPayload>(token);
      return decoded.id || null;
    } catch {
      return null;
    }
  }

  // Handler to add book to library
  async function handleAddToLibrary(bookId: string) {
    const token = localStorage.getItem("token");
    if (!token) {
      toast({ title: "Please log in", description: "You must be logged in to add to your library.", });
      return;
    }
    try {
      await axios.post(
        `${import.meta.env.VITE_LIBRARY_API_URL}/api/library/add`,
        { bookId, category: "Currently Reading" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Refresh recommendations after adding a book
      await axios.post(
        `${import.meta.env.VITE_RECOMMENDATION_API_URL}/api/recommendations/generate`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Success", description: "Book added to your library!", variant: "success" });
      if (redirect === 'library') {
        navigate(`/library${redirectTab ? `#${redirectTab}` : ''}`);
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || err?.message || '';
      if (errorMsg.includes('already in library')) {
        toast({ title: "Already Added", description: "This book is already in your library.", variant: "info" });
      } else {
        toast({ title: "Error", description: "Failed to add book to library.", variant: "destructive" });
      }
    }
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    console.log('handleSubmitReview called', reviewBookId, reviewRating, reviewComment);
    if (!reviewBookId) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast({ title: "Please log in", description: "You must be logged in to write a review." });
      return;
    }
    setIsSubmittingReview(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_REVIEW_API_URL}/api/reviews`,
        { bookId: reviewBookId, rating: reviewRating, comment: reviewComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Review submitted!", description: "Thank you for your feedback.", variant: "success" });
      setShowReviewModal(false);
      setReviewRating(5);
      setReviewComment("");
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || err?.message || '';
      toast({ title: "Error", description: errorMsg || "Failed to submit review.", variant: "destructive" });
    } finally {
      setIsSubmittingReview(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="pt-20 pb-8 bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Discover Books
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Explore our vast collection of books across all genres
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search for books, authors, or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-2 text-base rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-0 bg-white"
              />
            </div>
            {/* Filter Options: decent space below search bar */}
            <div className="mt-8 flex flex-wrap gap-4 items-center">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="border-purple-200 text-purple-700 hover:bg-purple-50"
              >
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filters
              </Button>
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-48 border-gray-200 rounded-lg">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {allGenres.map((genre) => (
                    <SelectItem key={genre} value={String(genre)}>
                      {genre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
                <SelectTrigger className="w-48 border-gray-200 rounded-lg">
                  <SelectValue placeholder="Select author" />
                </SelectTrigger>
                <SelectContent>
                  {allAuthors.map((author) => (
                    <SelectItem key={author} value={String(author)}>
                      {author}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40 border-gray-200 rounded-lg">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2 ml-4">
                <label className="text-sm text-gray-700">Price:</label>
                <input
                  type="range"
                  min={0}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={e => setPriceRange([0, Number(e.target.value)])}
                  className="w-32"
                />
                <span className="text-sm text-gray-700">Up to ${priceRange[1]}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating
                </label>
                <Select>
                  <SelectTrigger className="border-gray-200 rounded-lg">
                    <SelectValue placeholder="Any rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any rating</SelectItem>
                    <SelectItem value="4+">4+ stars</SelectItem>
                    <SelectItem value="3+">3+ stars</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Publication Year
                </label>
                <Select>
                  <SelectTrigger className="border-gray-200 rounded-lg">
                    <SelectValue placeholder="Any year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any year</SelectItem>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2023">2023</SelectItem>
                    <SelectItem value="2022">2022</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <Select>
                  <SelectTrigger className="border-gray-200 rounded-lg">
                    <SelectValue placeholder="Any language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any language</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Book List */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {searchServiceError ? (
          <div className="text-center text-red-500 text-base">{searchServiceError}</div>
        ) : filteredBooks.length === 0 ? (
          <div className="text-center text-gray-500 text-base">No books found.</div>
        ) : (
          <div className={viewMode === "grid" ? "grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8" : "space-y-6"}>
            {filteredBooks.map((book) => {
              const bookId = book._id !== undefined ? String(book._id) : book.id !== undefined ? String(book.id) : '';
              return (
                <BookCard
                  key={bookId}
                  book={book}
                  onShowDetails={() => { setSelectedBookId(book._id || book.id); setShowDetailsModal(true); }}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Review Modal Placeholder */}
      {showReviewModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Write a Review</h2>
            <form onSubmit={handleSubmitReview}>
              <label className="block mb-2 font-medium">Rating</label>
              <select
                className="w-full border rounded px-3 py-2 mb-4"
                value={reviewRating}
                onChange={e => setReviewRating(Number(e.target.value))}
                required
              >
                <option value={5}>★★★★★</option>
                <option value={4}>★★★★☆</option>
                <option value={3}>★★★☆☆</option>
                <option value={2}>★★☆☆☆</option>
                <option value={1}>★☆☆☆☆</option>
              </select>
              <label className="block mb-2 font-medium">Comment</label>
              <textarea
                className="w-full border rounded px-3 py-2 mb-4"
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                rows={4}
                placeholder="Share your thoughts..."
                required
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowReviewModal(false)} className="px-4 py-2 rounded text-purple-600">Cancel</button>
                <button type="submit" disabled={isSubmittingReview} className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700">
                  {isSubmittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && bookDetails && (
        <BookDetailsModal book={bookDetails} onClose={() => setShowDetailsModal(false)} />
      )}

      {/* Load More */}
      <div className="text-center mt-12">
        <Button 
          variant="outline" 
          size="lg" 
          className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-6 py-2 rounded-xl text-base font-semibold"
        >
          Load More Books
        </Button>
      </div>

      <Footer />
    </div>
  );
};

export default Catalog;
