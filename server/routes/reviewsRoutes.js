const express = require("express");
const router = express.Router();
const Review = require("../models/review");
const auth = require("../middleware/authMiddleware");

// 📝 Submit a review (auth optional for guest reviews)
router.post("/", async (req, res) => {
  try {
    const { name, description, rating } = req.body;

    // Validate input
    if (!name || !description || !rating) {
      return res.status(400).json({ 
        error: "Name, description, and rating are required" 
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ 
        error: "Rating must be between 1 and 5" 
      });
    }

    // Create new review
    const review = new Review({
      userID: req.user?.id || null, // Optional user ID for guest reviews
      name: name.trim(),
      description: description.trim(),
      rating: parseInt(rating)
    });

    await review.save();

    // Emit real-time update to all connected clients
    if (req.app.get('io')) {
      req.app.get('io').emit('new-review', review);
    }

    res.status(201).json({
      message: "Review submitted successfully",
      review: {
        ...review._doc,
        id: review._id.toString(),
        date: review.createdAt,
        handle: `⭐ ${rating}/5`,
        image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3"
      }
    });

  } catch (error) {
    console.error("❌ Error submitting review:", error);
    res.status(500).json({ 
      error: "Failed to submit review",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 📖 Get all reviews (public endpoint)
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v')
      .lean();

    // Format reviews for frontend
    const formattedReviews = reviews.map(review => ({
      ...review,
      id: review._id.toString(),
      date: review.createdAt,
      handle: `⭐ ${review.rating}/5`,
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3"
    }));

    const totalReviews = await Review.countDocuments();

    res.json({
      reviews: formattedReviews,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalReviews / limit),
        totalReviews,
        hasNext: page < Math.ceil(totalReviews / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error("❌ Error fetching reviews:", error);
    res.status(500).json({ 
      error: "Failed to fetch reviews",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 📊 Get review statistics
router.get("/stats", async (req, res) => {
  try {
    const stats = await Review.aggregate([
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$rating" },
          ratingDistribution: {
            $push: "$rating"
          }
        }
      }
    ]);

    const result = stats[0] || { 
      totalReviews: 0, 
      averageRating: 0, 
      ratingDistribution: [] 
    };

    // Calculate rating distribution
    const distribution = {
      5: result.ratingDistribution.filter(r => r === 5).length,
      4: result.ratingDistribution.filter(r => r === 4).length,
      3: result.ratingDistribution.filter(r => r === 3).length,
      2: result.ratingDistribution.filter(r => r === 2).length,
      1: result.ratingDistribution.filter(r => r === 1).length
    };

    res.json({
      totalReviews: result.totalReviews,
      averageRating: result.averageRating ? result.averageRating.toFixed(1) : "0.0",
      distribution,
      happyUsers: result.totalReviews * 150 // Realistic multiplier
    });

  } catch (error) {
    console.error("❌ Error fetching review stats:", error);
    res.status(500).json({ 
      error: "Failed to fetch review statistics",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 👤 Get user's reviews (authenticated)
router.get("/my-reviews", auth, async (req, res) => {
  try {
    const reviews = await Review.find({ userID: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Format reviews for frontend
    const formattedReviews = reviews.map(review => ({
      ...review,
      id: review._id.toString(),
      date: review.createdAt,
      handle: `⭐ ${review.rating}/5`,
      image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3"
    }));

    res.json({ reviews: formattedReviews });

  } catch (error) {
    console.error("❌ Error fetching user reviews:", error);
    res.status(500).json({ 
      error: "Failed to fetch your reviews",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// 🗑️ Delete user's review (authenticated)
router.delete("/:id", auth, async (req, res) => {
  try {
    const review = await Review.findOne({
      _id: req.params.id,
      userID: req.user.id
    });

    if (!review) {
      return res.status(404).json({ 
        error: "Review not found or you don't have permission to delete it" 
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    // Emit real-time update
    if (req.app.get('io')) {
      req.app.get('io').emit('review-deleted', { id: req.params.id });
    }

    res.json({ 
      message: "Review deleted successfully" 
    });

  } catch (error) {
    console.error("❌ Error deleting review:", error);
    res.status(500).json({ 
      error: "Failed to delete review",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;