import { useState } from "react";
import { useReviews } from "../utils/ReviewsContext";
import { motion } from "framer-motion";
import { Star, Send, CheckCircle, ArrowLeft, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";

export default function ReviewPage() {
  const { addReview } = useReviews();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    rating: 0,
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
    // Clear error when user selects rating
    if (error) setError("");
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.name || !formData.description || formData.rating === 0) {
    setError("Please fill in all required fields and provide a rating.");
    return;
  }

  setIsSubmitting(true);
  setError("");

  try {
    const result = await addReview({
      name: formData.name.trim(),
      description: formData.description.trim(),
      rating: formData.rating,
    });

    

    // ✅ FIX: Handle both old and new context responses
    if (result?.success === true || result === undefined) {
      // If success is true OR result is undefined (old context), consider it successful
      setIsSubmitted(true);
      setFormData({ name: "", description: "", rating: 0 });
      setTimeout(() => setIsSubmitted(false), 3000);
    } else {
      setError(result?.error || "Failed to submit review.");
    }
  } catch (err) {
    console.error("Review submission error:", err);
    setError(err.message || "An unexpected error occurred.");
  } finally {
    setIsSubmitting(false);
  }
};
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-black flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center bg-neutral-800/50 backdrop-blur-sm rounded-3xl p-8 border border-green-500/30 max-w-md w-full"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
          <p className="text-neutral-400 mb-6">Your review has been submitted successfully.</p>
          <Link
            to="/about"
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 inline-flex items-center gap-2"
          >
            View All Reviews
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-black py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <Link
          to="/about"
          className="inline-flex items-center gap-2 text-neutral-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to About
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-4">
            Share Your Experience
          </h1>
          <p className="text-neutral-400 text-lg">
            Help us improve by sharing your thoughts about Food Analyzer x fit
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-neutral-800/50 backdrop-blur-sm rounded-3xl p-8 border border-neutral-700"
        >
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-200 text-sm">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Rating Section */}
            <div>
              <label className="block text-white text-lg font-semibold mb-4 text-center">
                How would you rate your experience? *
              </label>
              <div className="flex gap-2 justify-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-800 rounded-full"
                  >
                    <Star
                      className={`w-12 h-12 transition-colors duration-200 ${
                        star <= (hoverRating || formData.rating)
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-neutral-500"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="text-center text-neutral-400 text-sm">
                {formData.rating === 0 ? "Select your rating" : `You rated: ${formData.rating} star${formData.rating > 1 ? 's' : ''}`}
              </p>
            </div>

            {/* Name Input */}
            <div>
              <label className="block text-white text-sm font-medium mb-3">
                Your Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-4 py-4 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-lg"
                placeholder="Enter your name"
                required
                maxLength={50}
              />
            </div>

            {/* Review Text */}
            <div>
              <label className="block text-white text-sm font-medium mb-3">
                Your Review *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="6"
                className="w-full px-4 py-4 bg-neutral-900 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none text-lg"
                placeholder="Tell us about your experience with Food Analyzer x fit... What did you like? What could be improved?"
                required
                maxLength={500}
              />
              <div className="text-right text-neutral-500 text-sm mt-2">
                {formData.description.length}/500 characters
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-neutral-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-6 h-6" />
                  Submit Review
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 text-center text-neutral-400 bg-neutral-800/30 rounded-2xl p-6 border border-neutral-700/50"
        >
          <h3 className="text-white font-semibold mb-3">Why Your Review Matters</h3>
          <p className="mb-4">Your feedback helps us improve the web app and helps other users discover how Food Analyzer x fit can benefit them.</p>
          <p className="text-sm">Thank you for contributing to our community! 💫</p>
        </motion.div>
      </div>
    </div>
  );
}