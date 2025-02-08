const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const foodSearchSchema = new Schema({
  userID: { type: Schema.Types.ObjectId, ref: "User", required: true },
  query: { type: String, required: true },
  result: { type: Array, default: [] },
  searchedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("FoodSearch", foodSearchSchema);