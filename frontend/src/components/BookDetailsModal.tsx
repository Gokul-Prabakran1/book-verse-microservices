import { useEffect, useState } from 'react';
import Button from './ui/button';
import axios from 'axios';
import { toast } from './ui/use-toast';

interface BookDetailsModalProps {
  book: any;
  onClose: () => void;
  canWriteReview?: boolean;
  showReviewFormDefault?: boolean;
  onReviewSubmitted?: () => void;
}

export default function BookDetailsModal({ book, onClose, canWriteReview, showReviewFormDefault, onReviewSubmitted }: BookDetailsModalProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(!!showReviewFormDefault);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewServiceError, setReviewServiceError] = useState<string | null>(null);

  function fetchReviews() {
    if (!book || !book._id) return;
    axios.get(`${import.meta.env.VITE_REVIEW_API_URL}/api/reviews/book/${book._id}`)
      .then(res => setReviews(res.data));
  }

  useEffect(() => {
    const id = book._id || book.id;
    if (!id) {
      setReviews([]);
      setReviewServiceError(null);
      return;
    }
    setReviewServiceError(null);
    axios.get(`${import.meta.env.VITE_REVIEW_API_URL}/api/reviews/book/${id}`)
      .then(res => {
        setReviews(res.data);
        setReviewServiceError(null);
      })
      .catch(() => {
        setReviews([]);
        setReviewServiceError("Review service is down. Please try again later.");
      });
  }, [book]);

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      toast({ title: "Please log in", description: "You must be logged in to write a review." });
      return;
    }
    setIsSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_REVIEW_API_URL}/api/reviews`,
        { bookId: book._id, rating: reviewRating, comment: reviewComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Review submitted!", description: "Thank you for your feedback.", variant: "success" });
      setShowReviewForm(false);
      setReviewRating(5);
      setReviewComment("");
      fetchReviews();
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.error || err?.message || '';
      toast({ title: "Error", description: errorMsg || "Failed to submit review.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-500 hover:text-purple-600">✕</button>
        <div className="flex flex-col md:flex-row gap-6">
          <img src={book.coverUrl || book.cover || '/placeholder.svg'} alt={book.title} className="w-40 h-60 object-cover rounded-lg" />
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2">{book.title}</h2>
            <div className="text-lg text-gray-700 mb-1">by {book.author}</div>
            <div className="text-sm text-purple-700 font-semibold mb-2">{book.genre}</div>
            <div className="text-gray-600 mb-4">{book.description}</div>
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-yellow-500">★ {book.rating}</span>
              <span className="text-gray-500">{reviews.length} review{reviews.length === 1 ? '' : 's'}</span>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-bold mb-2">Reviews</h3>
          {!book._id && !book.id ? (
            <div className="text-gray-500 text-sm mb-4">No reviews available for this book.</div>
          ) : reviewServiceError ? (
            <div className="text-red-500 text-sm mb-4">{reviewServiceError}</div>
          ) : reviews.length === 0 ? (
            <div className="text-gray-500 text-sm mb-4">No reviews found.</div>
          ) : (
            reviews.map(r => (
              <div key={r._id} className="border-b py-2">
                <div className="font-medium">{r.rating}★</div>
                <div className="text-gray-700">{r.comment}</div>
              </div>
            ))
          )}
        </div>
        {canWriteReview && (reviews.length > 0 || showReviewForm) && (
          <div className="mt-6">
            {!showReviewForm ? (
              <Button variant="outline" onClick={() => setShowReviewForm(true)}>
                Write a Review
              </Button>
            ) : (
              <form onSubmit={handleSubmitReview} className="mt-4">
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
                  <button type="button" onClick={() => setShowReviewForm(false)} className="px-4 py-2 rounded text-purple-600">Cancel</button>
                  <button type="submit" disabled={isSubmitting} className="px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700">
                    {isSubmitting ? "Submitting..." : "Submit Review"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 