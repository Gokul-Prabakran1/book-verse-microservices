
import { useState, useEffect } from "react";
import { Search, Filter, Star, Heart, BookOpen } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import BookCard from "@/components/BookCard";
import Footer from "@/components/Footer";
import { toast } from '@/components/ui/use-toast';
import axios from "axios";
import BookDetailsModal from '@/components/BookDetailsModal';

const genres = [
  "all", "fiction", "mystery", "romance", "sci-fi", "fantasy", "non-fiction", "biography"
];

const Discover = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [books, setBooks] = useState<any[]>([]);
  const [searchServiceError, setSearchServiceError] = useState<string | null>(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBookId, setReviewBookId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsBook, setDetailsBook] = useState<any | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [bookDetails, setBookDetails] = useState<any | null>(null);

  useEffect(() => {
    setSearchServiceError(null);
    axios.get(import.meta.env.VITE_SEARCH_API_URL + "/api/search", {
      params: {
        q: searchQuery,
        genre: selectedGenre !== "all" ? selectedGenre : undefined,
      }
    })
      .then(res => {
        setBooks(res.data);
        setSearchServiceError(null);
      })
      .catch(() => {
        setBooks([]);
        setSearchServiceError("Search service is down. Please try again later.");
      });
  }, [searchQuery, selectedGenre]);

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
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

  function isValidObjectId(id: any) {
    return typeof id === 'string' && id.length === 24 && /^[a-fA-F0-9]+$/.test(id);
  }

  useEffect(() => {
    if (!selectedBookId) return;
    axios.get(import.meta.env.VITE_BOOK_API_URL + `/api/books/${selectedBookId}`)
      .then(res => setBookDetails(res.data));
  }, [selectedBookId]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Discover Your Next Favorite Book
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our vast collection of books across all genres and find your perfect read
            </p>
          </div>

          {/* Search and Filter */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search books or authors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-0"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:ring-0 bg-white"
                >
                  {genres.map(genre => (
                    <option key={genre} value={genre}>
                      {genre.charAt(0).toUpperCase() + genre.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {searchQuery ? `Search Results (${books.length})` : 'Featured Books'}
            </h2>
            <p className="text-gray-600">
              {selectedGenre !== "all" && `Filtered by: ${selectedGenre}`}
            </p>
          </div>

          {/* Books Grid or Error */}
          {searchServiceError ? (
            <div className="text-center text-red-500 text-lg">{searchServiceError}</div>
          ) : books.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No books found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => {
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
      </main>

      {/* Review Modal */}
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

      <Footer />
    </div>
  );
};

export default Discover;
