import { useEffect, useState } from 'react';
import axios from 'axios';
import BookCard from '@/components/BookCard';
import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import { toast } from '@/components/ui/use-toast';
import BookDetailsModal from '@/components/BookDetailsModal';

const Recommendations = () => {
  const [books, setBooks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBookId, setReviewBookId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsBook, setDetailsBook] = useState<any | null>(null);
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null);
  const [bookDetails, setBookDetails] = useState<any | null>(null);
  const [recommendationServiceError, setRecommendationServiceError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true);
      setRecommendationServiceError(null);
      const token = localStorage.getItem('token');
      if (!token) return setLoading(false);
      try {
        console.log('Fetching recommendations...');
        // Try to get recommended book IDs
        let recRes = await axios.get(
          `${import.meta.env.VITE_RECOMMENDATION_API_URL}/api/recommendations`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        let ids = recRes.data;
        if (!ids.length) {
          console.log('No recommendations found, generating now...');
          // If none, generate recommendations and fetch again
          await axios.post(
            `${import.meta.env.VITE_RECOMMENDATION_API_URL}/api/recommendations/generate`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );
          recRes = await axios.get(
            `${import.meta.env.VITE_RECOMMENDATION_API_URL}/api/recommendations`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          ids = recRes.data;
        }
        if (!ids.length) {
          console.log('Still no recommendations after generation.');
          setBooks([]);
          setLoading(false);
          return;
        }
        // Fetch book details for each ID
        console.log('Fetching book details for recommended IDs:', ids);
        const bookRes = await axios.get(
          `${import.meta.env.VITE_BOOK_API_URL}/api/books`,
        );
        // Filter only recommended books
        const recommendedBooks = bookRes.data.filter((b: any) => ids.includes(b._id));
        setBooks(recommendedBooks);
        setRecommendationServiceError(null);
      } catch (e) {
        console.log('Error fetching or generating recommendations:', e);
        setBooks([]);
        setRecommendationServiceError("Recommendation service is down. Please try again later.");
      }
      setLoading(false);
    };
    fetchRecommendations();
  }, []);

  useEffect(() => {
    if (!selectedBookId) return;
    axios.get(import.meta.env.VITE_BOOK_API_URL + `/api/books/${selectedBookId}`)
      .then(res => setBookDetails(res.data));
  }, [selectedBookId]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Recommended Books</h1>
          {/* Book List/Error */}
          {recommendationServiceError ? (
            <div className="text-center text-red-500 text-lg">{recommendationServiceError}</div>
          ) : loading ? (
            <div className="text-center text-lg text-gray-500">Loading recommendations...</div>
          ) : books.length === 0 ? (
            <div className="text-center text-lg text-gray-500">No recommendations found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {books.map(book => {
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

export default Recommendations; 