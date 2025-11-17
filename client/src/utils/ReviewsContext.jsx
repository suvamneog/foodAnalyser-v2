/* eslint-disable react/prop-types */
import { createContext, useContext, useState, useEffect } from 'react';

const ReviewsContext = createContext();

export const useReviews = () => {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
};

export const ReviewsProvider = ({ children }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  // Consistent profile photo for all users
  const DEFAULT_USER_PHOTO = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  // Load reviews from database on component mount
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/reviews');
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      } else {
        console.error('Failed to fetch reviews');
        setReviews([]);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const addReview = async (review) => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(review)
      });

      if (response.ok) {
        const result = await response.json();
        
        // Add the new review to local state with proper formatting
        const newReview = {
          ...result.review,
          id: result.review._id || Date.now().toString(),
          date: result.review.createdAt || new Date().toISOString(),
          handle: `⭐ ${review.rating}/5`,
          image: DEFAULT_USER_PHOTO
        };
        
        setReviews(prev => [newReview, ...prev]);
        return { success: true, review: newReview };
      } else {
        const errorData = await response.json();
        return { success: false, error: errorData.error || 'Failed to submit review' };
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  // Calculate stats for the About page
  const calculateStats = () => {
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0 
      ? (reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1)
      : "0.0";
    const happyUsers = totalReviews > 0 ? totalReviews * 150 : 0;

    return {
      totalReviews,
      averageRating,
      happyUsers
    };
  };

  const value = {
    reviews,
    addReview,
    stats: calculateStats(),
    loading,
    fetchReviews,
    fetchStats: () => {}, // For compatibility
  };

  return (
    <ReviewsContext.Provider value={value}>
      {children}
    </ReviewsContext.Provider>
  );
};