
import { useState, useEffect } from "react";
import { BookOpen, Heart, Clock, CheckCircle, Plus, Trash2 } from "lucide-react";
import Button from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import BookCard from "@/components/BookCard";
import Footer from "@/components/Footer";
import axios from "axios";
import { jwtDecode, JwtPayload } from "jwt-decode";
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import BookDetailsModal from '@/components/BookDetailsModal';

const Library = () => {
  const [activeTab, setActiveTab] = useState("library-books");
  const [currentlyReading, setCurrentlyReading] = useState<any[]>([]);
  const [readBooks, setReadBooks] = useState<any[]>([]);
  const [wantToRead, setWantToRead] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [allBooks, setAllBooks] = useState<any[]>([]);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBookId, setReviewBookId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsBook, setDetailsBook] = useState<any | null>(null);
  const [detailsShowReviewForm, setDetailsShowReviewForm] = useState(false);
  const [libraryServiceError, setLibraryServiceError] = useState<string | null>(null);

  const navigate = useNavigate();

  // Add action handlers
  const fetchLibrary = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_LIBRARY_API_URL}/api/library`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const lib = res.data;
      if (!lib || !lib.books) return;
      const cr: any[] = [];
      const rd: any[] = [];
      const fav: any[] = [];
      const all: any[] = [];
      const wtr: any[] = [];
      lib.books.forEach((b: any) => {
        if (!b.bookId) return;
        const book = {
          ...b.bookId,
          category: b.category,
          favourite: b.favourite,
          _libEntryId: b._id
        };
        all.push(book);
        if (b.category === "Currently Reading") cr.push(book);
        else if (b.category === "Read") rd.push(book);
        else if (b.category === "WantToRead") wtr.push(book);
        if (b.favourite) fav.push(book);
      });
      setAllBooks(all);
      setCurrentlyReading(cr);
      setReadBooks(rd);
      setFavorites(fav);
      setWantToRead(wtr);
      setLibraryServiceError(null);
    } catch (err) {
      setAllBooks([]);
      setCurrentlyReading([]);
      setReadBooks([]);
      setFavorites([]);
      setWantToRead([]);
      setLibraryServiceError("Library service is down. Please try again later.");
    }
  };

  useEffect(() => { fetchLibrary(); }, []);

  const handleRemove = async (bookId: string) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${import.meta.env.VITE_LIBRARY_API_URL}/api/library/remove`,
        { bookId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Removed", description: "Book removed from your library.", variant: "success" });
      fetchLibrary();
    } catch {
      toast({ title: "Error", description: "Failed to remove book.", variant: "destructive" });
    }
  };

  const handleUpdateCategory = async (bookId: string, category: string) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${import.meta.env.VITE_LIBRARY_API_URL}/api/library/update-category`,
        { bookId, category },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Updated", description: `Book marked as ${category}.`, variant: "success" });
      fetchLibrary();
    } catch {
      toast({ title: "Error", description: "Failed to update category.", variant: "destructive" });
    }
  };

  const handleToggleFavourite = async (bookId: string) => {
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${import.meta.env.VITE_LIBRARY_API_URL}/api/library/toggle-favourite`,
        { bookId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast({ title: "Favourite", description: "Favourite status updated.", variant: "success" });
      fetchLibrary();
    } catch {
      toast({ title: "Error", description: "Failed to update favourite.", variant: "destructive" });
    }
  };

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

  const tabs = [
    { id: "library-books", label: "Library Books", icon: BookOpen },
    { id: "read", label: "Read", icon: CheckCircle },
    { id: "want-to-read", label: "Want to Read", icon: Clock },
    { id: "favorites", label: "Favorites", icon: Heart },
  ];

  const getActiveBooks = () => {
    switch (activeTab) {
      case "library-books":
        return allBooks;
      case "read":
        return readBooks;
      case "want-to-read":
        return wantToRead;
      case "favorites":
        return favorites;
      default:
        return [];
    }
  };

  const getEmptyMessage = () => {
    switch (activeTab) {
      case "currently-reading":
        return "You're not currently reading any books. Start your reading journey!";
      case "read":
        return "You haven't finished any books yet. Complete your first read!";
      case "want-to-read":
        return "Your reading list is empty. Add some books you'd like to read!";
      case "favorites":
        return "You haven't marked any books as favorites yet.";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              My Library
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Organize and track your reading journey
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center cursor-pointer hover:shadow-xl transition" onClick={() => setActiveTab("library-books")}> 
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {allBooks.length}
              </div>
              <div className="text-gray-600">Library Books</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center cursor-pointer hover:shadow-xl transition" onClick={() => setActiveTab("read")}> 
              <div className="text-3xl font-bold text-green-600 mb-2">
                {readBooks.length}
              </div>
              <div className="text-gray-600">Books Read</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center cursor-pointer hover:shadow-xl transition" onClick={() => setActiveTab("want-to-read")}> 
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {wantToRead.length}
              </div>
              <div className="text-gray-600">Want to Read</div>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6 text-center cursor-pointer hover:shadow-xl transition" onClick={() => setActiveTab("favorites")}> 
              <div className="text-3xl font-bold text-pink-600 mb-2">
                {favorites.length}
              </div>
              <div className="text-gray-600">Favorites</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
            <div className="flex flex-wrap gap-2 mb-6">
              {tabs.map((tab) => (
                <Button
                  key={tab.id}
                  variant={activeTab === tab.id ? "default" : "ghost"}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 ${
                    activeTab === tab.id
                      ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white"
                      : "text-gray-600 hover:text-purple-600"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </Button>
              ))}
            </div>

            {/* Book List/Error */}
            {libraryServiceError ? (
              <div className="text-center text-red-500 text-lg">{libraryServiceError}</div>
            ) : getActiveBooks().length === 0 ? (
              <div className="text-center text-gray-500 text-lg">{getEmptyMessage()}</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {getActiveBooks().map((book) => {
                  const bookId = book._id !== undefined ? String(book._id) : book.id !== undefined ? String(book.id) : '';
                  const isReadTab = activeTab === "read";
                  const isLibraryBooksTab = activeTab === "library-books";
                  return (
                    <BookCard
                      key={bookId}
                      book={book}
                      onRemove={() => handleRemove(book._id || book.id)}
                      onMarkRead={() => handleUpdateCategory(book._id || book.id, "Read")}
                      onToggleFavourite={() => handleToggleFavourite(book._id || book.id)}
                      onMarkWannaRead={() => handleUpdateCategory(book._id || book.id, "WantToRead")}
                      onShowDetails={() => { setDetailsBook(book); setShowDetailsModal(true); setDetailsShowReviewForm(false); }}
                      onWriteReview={isReadTab ? () => { setDetailsBook(book); setDetailsShowReviewForm(true); setShowDetailsModal(true); } : undefined}
                      hideDefaultSeeReviews={!(isReadTab || isLibraryBooksTab)}
                    />
                  );
                })}
              </div>
            )}

            {getActiveBooks().length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  No books here yet
                </h3>
                <p className="text-gray-600 mb-4">{getEmptyMessage()}</p>
                <Button className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white"
                  onClick={() => {
                    if (activeTab === 'want-to-read') {
                      setActiveTab('library-books');
                    } else {
                      navigate(`/catalog?redirect=library&tab=${activeTab}`);
                    }
                  }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Books
                </Button>
              </div>
            )}
          </div>
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

      {showDetailsModal && detailsBook && (
        <BookDetailsModal
          book={detailsBook}
          onClose={() => setShowDetailsModal(false)}
          canWriteReview={activeTab === 'read'}
          showReviewFormDefault={detailsShowReviewForm}
          onReviewSubmitted={fetchLibrary}
        />
      )}

      <Footer />
    </div>
  );
};

export default Library;
