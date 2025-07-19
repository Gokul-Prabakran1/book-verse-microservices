
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Star, BookOpen, TrendingUp, Users, Heart, SlidersHorizontal } from "lucide-react";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Navigation from "@/components/Navigation";
import BookCard from "@/components/BookCard";
import FeatureCard from "@/components/FeatureCard";
import Footer from "@/components/Footer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";
import CountUp from 'react-countup';
import { toast } from '@/components/ui/use-toast';
import BookDetailsModal from '@/components/BookDetailsModal';

const featuredBooks = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=300&h=400&fit=crop",
    rating: 4.8,
    reviews: 1234,
    genre: "Fiction",
    description: "A dazzling novel about all the choices that go into a life well lived."
  },
  {
    id: 2,
    title: "Atomic Habits",
    author: "James Clear",
    cover: "https://images.unsplash.com/photo-1589998059171-988d887df646?w=300&h=400&fit=crop",
    rating: 4.9,
    reviews: 2156,
    genre: "Self-Help",
    description: "An easy & proven way to build good habits & break bad ones."
  },
  {
    id: 3,
    title: "Dune",
    author: "Frank Herbert",
    cover: "https://images.unsplash.com/photo-1621351183012-e2f9972dd9bf?w=300&h=400&fit=crop",
    rating: 4.7,
    reviews: 987,
    genre: "Sci-Fi",
    description: "A stunning blend of adventure and mysticism, environmentalism and politics."
  },
  {
    id: 4,
    title: "The Seven Husbands of Evelyn Hugo",
    author: "Taylor Jenkins Reid",
    cover: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=300&h=400&fit=crop",
    rating: 4.6,
    reviews: 1876,
    genre: "Romance",
    description: "A captivating novel about the price of fame and the power of love."
  }
];

const genres = ["All Genres", "Fiction", "Self-Help", "Sci-Fi", "Romance"];
const authors = ["All Authors", "Matt Haig", "James Clear", "Frank Herbert", "Taylor Jenkins Reid"];
const sortOptions = ["Newest", "Oldest", "Price Low-High", "Price High-Low", "Title A-Z", "Title Z-A"];

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("All Genres");
  const [selectedAuthor, setSelectedAuthor] = useState("All Authors");
  const [sortBy, setSortBy] = useState("Newest");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100]);
  const [maxPrice, setMaxPrice] = useState(100);
  const [showFilters, setShowFilters] = useState(false);
  const [allGenres, setAllGenres] = useState<string[]>(["All Genres"]);
  const [allAuthors, setAllAuthors] = useState<string[]>(["All Authors"]);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
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
  const [books, setBooks] = useState<any[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<any[]>([]);
  const [featuredBooks, setFeaturedBooks] = useState<any[]>([]);

  const handleTrackProgress = () => {
    if (isAuthenticated) {
      navigate("/profile");
    } else {
      navigate("/login", { state: { from: "/profile" } });
    }
  };

  const features = [
    {
      icon: BookOpen,
      title: "Discover Books",
      description: "Find your next favorite read from our curated collection",
      gradient: "from-pink-500 to-purple-600"
    },
    {
      icon: Users,
      title: "Join Community",
      description: "Connect with fellow readers and share recommendations",
      gradient: "from-purple-500 to-blue-600",
      link: "https://www.linkedin.com/in/gokul-prabakaran12/"
    },
    {
      icon: TrendingUp,
      title: "Track Progress",
      description: "Monitor your reading goals and celebrate achievements",
      gradient: "from-blue-500 to-indigo-600",
      onClick: handleTrackProgress
    }
  ];

  // Fetch genres and authors dynamically from backend
  useEffect(() => {
    axios.get(import.meta.env.VITE_BOOK_API_URL + "/api/books")
      .then(res => {
        // Extract genres and authors
        const genresSet = new Set(res.data.map((b: any) => b.genre).filter(Boolean));
        setAllGenres(["All Genres", ...Array.from(genresSet).map(String)]);
        const authorsSet = new Set(res.data.map((b: any) => b.author).filter(Boolean));
        setAllAuthors(["All Authors", ...Array.from(authorsSet).map(String)]);
        // Find max price
        const maxP = Math.max(...res.data.map((b: any) => b.price || 0));
        setMaxPrice(maxP);
        setPriceRange([0, maxP]);
      });
  }, []);

  useEffect(() => {
    if (!selectedBookId) return;
    axios.get(import.meta.env.VITE_BOOK_API_URL + `/api/books/${selectedBookId}`)
      .then(res => setBookDetails(res.data));
  }, [selectedBookId]);

  useEffect(() => {
    setSearchServiceError(null); // Reset error before new search
    axios.get(import.meta.env.VITE_SEARCH_API_URL + "/api/search", {
      params: {
        q: searchQuery,
        genre: selectedGenre !== "All Genres" ? selectedGenre : undefined,
        author: selectedAuthor !== "All Authors" ? selectedAuthor : undefined,
        // Add other filters as needed
      }
    })
      .then(res => {
        setBooks(res.data);
        setFilteredBooks(res.data);
        setSearchServiceError(null);
      })
      .catch(() => {
        setBooks([]);
        setFilteredBooks([]);
        setSearchServiceError("Search service is down. Please try again later.");
      });
  }, [searchQuery, selectedGenre, selectedAuthor]);

  useEffect(() => {
    axios.get(import.meta.env.VITE_BOOK_API_URL + "/api/books/featured")
      .then(res => setFeaturedBooks(res.data))
      .catch(() => setFeaturedBooks([]));
  }, []);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('query', searchQuery);
    if (selectedGenre && selectedGenre !== 'All Genres') params.append('genre', selectedGenre);
    if (selectedAuthor && selectedAuthor !== 'All Authors') params.append('author', selectedAuthor);
    if (sortBy && sortBy !== 'Newest') params.append('sort', sortBy);
    if (priceRange[1] !== maxPrice) params.append('priceMax', priceRange[1].toString());
    navigate(`/catalog?${params.toString()}`);
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

  function isValidObjectId(id: any) {
    return typeof id === 'string' && id.length === 24 && /^[a-fA-F0-9]+$/.test(id);
  }

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 pt-20 pb-16">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-blue-500/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8">
              Discover Your Next
              <span className="block bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent text-4xl md:text-6xl">
                Great Read
              </span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
              Join millions of readers in discovering, tracking, and sharing the books that matter most to you.
            </p>
            
            {/* Search Bar */}
            <form className="max-w-2xl mx-auto mb-8 w-full" onSubmit={handleSearch}>
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  type="text"
                  placeholder="Search for books, authors, or genres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 pr-4 py-4 text-base rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:ring-0 w-full placeholder:text-base"
                />
              </div>
              {/* Filter Options: decent space below search bar */}
              <div className="mt-8 flex flex-wrap gap-4 items-center justify-center">
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                  <SelectTrigger className="w-56 border-gray-200 rounded-lg">
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
                  <SelectTrigger className="w-56 border-gray-200 rounded-lg">
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
                <Button
                  type="submit"
                  className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg px-8 py-3 text-base font-semibold"
                >
                  Search
                </Button>
              </div>
            </form>
            
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose BookVerse?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need to enhance your reading journey in one beautiful platform.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                gradient={feature.gradient}
                link={feature.link}
                onClick={feature.onClick}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Books Section */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Books
            </h2>
            <p className="text-lg text-gray-600">
              Handpicked selections from our community of readers
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredBooks.map((book) => (
              <BookCard
                key={book._id || book.id}
                book={book}
                onShowDetails={() => {
                  setBookDetails(book);
                  setSelectedBookId(book._id || book.id);
                  setShowDetailsModal(true);
                }}
              />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="sm" 
              className="border-2 border-purple-300 text-purple-700 hover:bg-purple-50 px-8 py-3 rounded-xl text-base font-semibold"
              onClick={() => navigate('/catalog')}
            >
              View All Books
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-8">
              <div className="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-2">
                <CountUp
                  end={2000000}
                  duration={4}
                  formattingFn={n =>
                    (n / 1000000) >= 1
                      ? (n / 1000000).toFixed(1) + "M"
                      : (n / 1000) >= 1
                      ? (n / 1000).toFixed(1) + "K"
                      : n.toString()
                  }
                />
                <span>+</span>
              </div>
              <div className="text-gray-600 text-base">Books Available</div>
            </div>
            <div className="p-8">
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                <CountUp
                  end={500000}
                  duration={4}
                  formattingFn={n =>
                    (n / 1000000) >= 1
                      ? (n / 1000000).toFixed(1) + "M"
                      : (n / 1000) >= 1
                      ? (n % 1000 === 0)
                        ? (n / 1000).toFixed(0) + "K"
                        : (n / 1000).toFixed(1) + "K"
                      : n.toString()
                  }
                />
                <span>+</span>
              </div>
              <div className="text-gray-600 text-base">Active Readers</div>
            </div>
            <div className="p-8">
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                <CountUp
                  end={1000000}
                  duration={4}
                  formattingFn={n =>
                    (n / 1000000) >= 1
                      ? (n / 1000000).toFixed(1) + "M"
                      : (n / 1000) >= 1
                      ? (n / 1000).toFixed(1) + "K"
                      : n.toString()
                  }
                />
                <span>+</span>
              </div>
              <div className="text-gray-600 text-base">Reviews & Ratings</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-10 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
            Ready to Start Your Reading Journey?
          </h2>
          <p className="text-base text-pink-100 mb-6">
            Join thousands of readers who've discovered their new favorite books on BookVerse.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Button size="sm" className="bg-white text-purple-700 hover:bg-gray-100 px-8 py-3 rounded-xl text-base font-semibold shadow-lg">
              Get Started Free
            </Button>
            <Button variant="outline" size="sm" className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 rounded-xl text-base font-semibold">
              Learn More
            </Button>
          </div>
        </div>
      </section>

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

export default Index;
