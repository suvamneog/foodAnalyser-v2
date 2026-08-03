import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Star, Send, CheckCircle, AlertCircle, MessageSquareHeart } from "lucide-react";
import { useReviews } from "../utils/ReviewsContext";
import ToolPageShell from "../components/ToolPageShell";
import TestimonialsSection from "../components/ui/testimonials-6";

export default function ReviewPage() {
  const { addReview, reviews } = useReviews();
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
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleRatingChange = (rating) => {
    setFormData((prev) => ({ ...prev, rating }));
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

      if (result?.success === true) {
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
      <ToolPageShell
        eyebrow="Feedback"
        title="Thank you"
        subtitle="Your review was submitted. It helps other people decide whether FoodAnalyser fits them."
        icon={CheckCircle}
        backTo="/about"
        backLabel="About"
        maxWidth="max-w-xl"
      >
        <div className="fa-card p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-leaf-400/30 bg-leaf-500/15">
            <CheckCircle className="h-7 w-7 text-leaf-300" />
          </div>
          <p className="font-display text-xl font-bold text-white">Review received</p>
          <p className="mt-2 text-sm text-white/50">
            Thanks for taking a moment to share how the app worked for you.
          </p>
          <Link to="/about" className="fa-btn fa-btn-primary mt-6 inline-flex">
            View reviews
          </Link>
        </div>
      </ToolPageShell>
    );
  }

  return (
    <ToolPageShell
      eyebrow="Feedback"
      title="Reviews"
      subtitle="See what others say, then leave your own note. Honest feedback shapes the next fixes."
      icon={MessageSquareHeart}
      backTo="/about"
      backLabel="About"
      maxWidth="max-w-5xl"
    >
      <TestimonialsSection
        reviews={reviews}
        showHeader={false}
        compact
        className="py-0"
      />

      <div className="mx-auto mt-10 max-w-2xl">
        <div className="mb-6 text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-saffron-300/90">
            Leave yours
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold text-white">
            Share your experience
          </h2>
        </div>

        <div className="fa-card p-6 sm:p-8">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-950/40 px-4 py-3"
            >
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
              <p className="text-sm text-red-200">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-7">
            <div>
              <label className="block text-center text-sm font-medium text-white/80">
                How was your experience?
              </label>
              <div className="mt-4 flex justify-center gap-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="rounded-xl p-2 transition hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-saffron-400/50"
                    aria-label={`${star} star${star > 1 ? "s" : ""}`}
                  >
                    <Star
                      className={`h-10 w-10 transition-colors ${
                        star <= (hoverRating || formData.rating)
                          ? "fill-saffron-400 text-saffron-400"
                          : "text-white/20"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <p className="mt-2 text-center text-xs text-white/40">
                {formData.rating === 0
                  ? "Tap a star to rate"
                  : `${formData.rating} of 5`}
              </p>
            </div>

            <div>
              <label htmlFor="review-name" className="mb-2 block text-sm font-medium text-white/70">
                Your name
              </label>
              <input
                id="review-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white placeholder:text-white/30 focus:border-saffron-400/40 focus:outline-none focus:ring-1 focus:ring-saffron-400/30"
                placeholder="How should we credit you?"
                required
                maxLength={50}
              />
            </div>

            <div>
              <label htmlFor="review-body" className="mb-2 block text-sm font-medium text-white/70">
                Your review
              </label>
              <textarea
                id="review-body"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={5}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3.5 text-white placeholder:text-white/30 focus:border-saffron-400/40 focus:outline-none focus:ring-1 focus:ring-saffron-400/30"
                placeholder="What did you try? What felt useful? What should improve?"
                required
                maxLength={500}
              />
              <div className="mt-2 text-right text-xs text-white/35">
                {formData.description.length}/500
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="fa-btn fa-btn-primary w-full disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-950 border-t-transparent" />
                  Submitting…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit review
                </>
              )}
            </button>
          </form>
        </div>

        <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.02] px-5 py-5 text-sm text-white/45">
          <p className="font-medium text-white/70">Why this helps</p>
          <p className="mt-2 leading-relaxed">
            Reviews surface real usage patterns — search accuracy, portion tools, regional coverage —
            so we know what to fix next.
          </p>
        </div>
      </div>
    </ToolPageShell>
  );
}
