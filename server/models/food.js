const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const foodSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  calories: {
    type: Number,
    required: true,
  },
  protein: {
    type: Number,
    default: 0,
  },
  carbs: {
    type: Number,
    default: 0,
  },
  fats: {
    type: Number,
    default: 0
  },
  pros: [{
    type: String
  }],
  cons: [{
    type: String
  }],
  date: {
    type: Date,
    default: Date.now
  },
  userID: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Food", foodSchema);