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
  const [error, setError] = useState(null);

  // Consistent profile photo for all users
  const DEFAULT_USER_PHOTO = "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

  // API configuration for both environments
  const getApiBaseUrl = () => {
    // Use environment variable if set, otherwise detect automatically
    const apiUrl = "https://foodanalyser.onrender.com"
    
    if (apiUrl) {
      return apiUrl;
    }
    
    // Auto-detection based on current URL
    const isDevelopment = window.location.hostname === 'localhost' || 
                         window.location.hostname === '127.0.0.1';
    
    if (isDevelopment) {
      return 'http://localhost:3000'; // Development server
    } else {
      // Production - use same origin (relative URL)
      return '';
    }
  };

  // Test API connectivity
  const testApiConnection = async () => {
   
  };

  // Load reviews from database on component mount
  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const API_BASE = getApiBaseUrl();
      const url = `${API_BASE}/api/reviews`;
      
     
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
  
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
     
      setReviews(data.reviews || []);
      
      // Clear localStorage when we successfully get data from API
      localStorage.removeItem('foodAnalyzerReviews');
      
    } catch (error) {
      console.error('❌ Error fetching reviews from API:', error);
      setError(`Failed to load reviews: ${error.message}`);
      
      // Fallback to localStorage if API fails
      const savedReviews = localStorage.getItem('foodAnalyzerReviews');
      if (savedReviews) {
        try {
          const parsedReviews = JSON.parse(savedReviews);
          setReviews(parsedReviews);
         
        } catch (localError) {
          console.error('❌ Error parsing localStorage reviews:', localError);
          setReviews([]);
        }
      } else {
        setReviews([]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Test connection on component mount
    testApiConnection();
    fetchReviews();
  }, []);

  const addReview = async (review) => {
    try {
      setLoading(true);
      setError(null);
      
      const API_BASE = getApiBaseUrl();
      const url = `${API_BASE}/api/reviews`;
      
    
      
      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(review)
      });

     

      if (!response.ok) {
        let errorText;
        try {
          errorText = await response.text();
        } catch {
          errorText = 'Failed to read error response';
        }
        throw new Error(errorText || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
       
      // Add the new review to local state with proper formatting
      const newReview = {
        ...result.review,
        id: result.review._id || result.review.id || Date.now().toString(),
        date: result.review.createdAt || new Date().toISOString(),
        handle: `⭐ ${review.rating}/5`,
        image: DEFAULT_USER_PHOTO
      };
      
      setReviews(prev => [newReview, ...prev]);
      
      return { success: true, review: newReview };
      
    } catch (error) {
      console.error('❌ Error submitting review to API:', error);
      let errorMessage = 'Network error. Please try again.';
      
      try {
        // Try to parse error message if it's JSON
        const errorData = JSON.parse(error.message);
        errorMessage = errorData.error || errorMessage;
      } catch {
        // If not JSON, use the raw error message
        errorMessage = error.message || errorMessage;
      }
      
      // Fallback: Save to localStorage if API fails
      try {
        const newReview = {
          ...review,
          id: Date.now().toString(),
          date: new Date().toISOString(),
          handle: `⭐ ${review.rating}/5`,
          image: DEFAULT_USER_PHOTO
        };
        
        const updatedReviews = [newReview, ...reviews];
        setReviews(updatedReviews);
        localStorage.setItem('foodAnalyzerReviews', JSON.stringify(updatedReviews));
        
       
        return { success: true, review: newReview };
      } catch (fallbackError) {
        console.error('❌ Fallback also failed:', fallbackError);
        return { success: false, error: errorMessage };
      }
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
    
    const ratingDistribution = {
      5: reviews.filter(r => r.rating === 5).length,
      4: reviews.filter(r => r.rating === 4).length,
      3: reviews.filter(r => r.rating === 3).length,
      2: reviews.filter(r => r.rating === 2).length,
      1: reviews.filter(r => r.rating === 1).length
    };

    const happyUsers = totalReviews > 0 ? totalReviews * 150 : 0;

    return {
      totalReviews,
      averageRating,
      distribution: ratingDistribution,
      happyUsers
    };
  };

  const value = {
    reviews,
    addReview,
    stats: calculateStats(),
    loading,
    error,
    fetchReviews,
    fetchStats: () => {},
    refetchReviews: fetchReviews,
    testApiConnection, // Export for debugging
  };

  return (
    <ReviewsContext.Provider value={value}>
      {children}
    </ReviewsContext.Provider>
  );
};