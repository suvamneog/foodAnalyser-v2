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

  // Consistent profile photo for all users
  const DEFAULT_USER_PHOTO = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  // Load reviews from localStorage on component mount
  useEffect(() => {
    const savedReviews = localStorage.getItem('foodAnalyzerReviews');
    if (savedReviews) {
      try {
        const parsedReviews = JSON.parse(savedReviews);
        setReviews(parsedReviews);
      } catch (error) {
        console.error('Error loading reviews from localStorage:', error);
        setReviews([]);
      }
    }
  }, []);

  // Save reviews to localStorage whenever reviews change
  useEffect(() => {
    try {
      localStorage.setItem('foodAnalyzerReviews', JSON.stringify(reviews));
    } catch (error) {
      console.error('Error saving reviews to localStorage:', error);
    }
  }, [reviews]);

  const addReview = (review) => {
    const newReview = {
      ...review,
      id: Date.now().toString(),
      date: new Date().toISOString(),
      handle: `⭐ ${review.rating}/5`,
      image: DEFAULT_USER_PHOTO // Always use the same photo
    };
    setReviews(prev => [newReview, ...prev]);
  };

  const value = {
    reviews,
    addReview,
  };

  return (
    <ReviewsContext.Provider value={value}>
      {children}
    </ReviewsContext.Provider>
  );
};