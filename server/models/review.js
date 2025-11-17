const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  image: {
    type: String,
    default: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=2080&auto=format&fit=crop&ixlib=rb-4.0.3"
  },
  handle: {
    type: String,
    default: function() {
      return `⭐ ${this.rating}/5`;
    }
  }
}, {
  timestamps: true
});

// Index for faster queries
reviewSchema.index({ userID: 1, createdAt: -1 });
reviewSchema.index({ rating: -1 });

module.exports = mongoose.model('Review', reviewSchema);