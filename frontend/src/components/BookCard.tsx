
import { Star, Heart, BookOpen, Trash2, CheckCircle, Clock } from "lucide-react";
import Button from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useEffect, useState } from 'react';

interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  coverUrl?: string;
  rating: number;
  reviews?: number;
  genre: string;
  description: string;
  favourite?: boolean;
  price?: number;
}

interface BookCardProps {
  book: Book;
  onRemove?: () => void;
  onMarkRead?: () => void;
  onMarkWannaRead?: () => void;
  onToggleFavourite?: () => void;
  onWriteReview?: () => void; // Will be used only in modal
  onShowDetails?: () => void; // New prop for Details button
  hideDefaultSeeReviews?: boolean;
}

const BookCard = ({ book, onRemove, onMarkRead, onMarkWannaRead, onToggleFavourite, onShowDetails, onWriteReview, hideDefaultSeeReviews }: BookCardProps) => {
  const [reviewCount, setReviewCount] = useState<number>(book.reviews || 0);

  useEffect(() => {
    const id = (book as any)._id || book.id;
    if (!id) {
      setReviewCount(0);
      return;
    }
    fetch(`${import.meta.env.VITE_REVIEW_API_URL}/api/reviews/book/${id}`)
      .then(res => res.json())
      .then(data => setReviewCount(Array.isArray(data) ? data.length : 0));
  }, [(book as any)._id, book.id]);

  return (
    <TooltipProvider>
      <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200">
        <div className="relative overflow-hidden">
          <img
            src={book.coverUrl || book.cover || '/placeholder.svg'}
            alt={book.title}
            className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 left-3">
            <span className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-0.5 rounded-full text-xs font-medium">
              {book.genre}
            </span>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="font-bold text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-700 transition-colors duration-200">
            {book.title}
          </h3>
          <p className="text-gray-600 font-medium text-sm mb-2">by {book.author}</p>
          {typeof book.price === 'number' && (
            <p className="text-purple-700 font-semibold text-sm mb-2">${book.price.toFixed(2)}</p>
          )}
          
          <div className="flex items-center space-x-2 mb-3">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900 text-sm">{book.rating}</span>
            </div>
            <span className="text-gray-500 text-sm">{reviewCount} review{reviewCount === 1 ? '' : 's'}</span>
          </div>
          
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {book.description}
          </p>
          
          {/* Remove the Read Now and heart button row */}
          {/* <div className="flex space-x-2 mb-2">
            <Button className="flex-1 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg">
              <BookOpen className="h-4 w-4 mr-2" />
              Read Now
            </Button>
            <Button variant="outline" size="icon" className="border-purple-200 text-purple-600 hover:bg-purple-50">
              <Heart className="h-4 w-4" />
            </Button>
          </div> */}
          <div className="flex flex-row gap-2 justify-center mb-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-red-100" onClick={onRemove}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </TooltipTrigger>
              <TooltipContent>Remove from Library</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-green-100" onClick={onMarkRead}><CheckCircle className="h-4 w-4 text-green-600" /></Button>
              </TooltipTrigger>
              <TooltipContent>Mark as Read</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-blue-100" onClick={onMarkWannaRead}><Clock className="h-4 w-4 text-blue-600" /></Button>
              </TooltipTrigger>
              <TooltipContent>Mark as Wanna Read</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="icon" variant="secondary" className="bg-white/90 hover:bg-pink-100" onClick={onToggleFavourite}><Heart className={`h-4 w-4 ${book.favourite ? 'fill-pink-500 text-pink-500' : 'text-gray-600'}`} /></Button>
              </TooltipTrigger>
              <TooltipContent>{book.favourite ? "Unmark Favourite" : "Mark as Favourite"}</TooltipContent>
            </Tooltip>
          </div>
          {!hideDefaultSeeReviews && (onShowDetails || onWriteReview) && (
            <div className="flex justify-center mt-2 gap-2">
              {onShowDetails && (
                <Button variant="outline" size="sm" className="border-purple-200 text-purple-700 hover:bg-purple-50" onClick={onShowDetails}>
                  See Reviews
                </Button>
              )}
              {onWriteReview && (
                <Button variant="outline" size="sm" className="border-pink-200 text-pink-700 hover:bg-pink-50" onClick={onWriteReview}>
                  Write a Review
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default BookCard;
