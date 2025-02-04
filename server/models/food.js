const mongoose = require("mongoose");
const foodSchema = new mongoose.Schema({
name: {
    type: String
},
calories: {
    type: Number
},
protein: {
    type: Number
},
carbs: {
    type: Number
},
fats: {
    type: Number
},
pros: {
    type: String
},
cons: {
    type: String
}
});
module.exports=mongoose.model("Food", foodSchema);
// •	name (String) → Food name (e.g., “orange”)
// •	calories (Number) → Total calories
// •	protein (Number) → Protein content
// •	carbs (Number) → Carbohydrate content
// •	fats (Number) → Fat content
// •	customEntry (Boolean) → Indicates if the food is user-added
// •	createdBy (ObjectId, ref: “User”) → Links custom foods to the user who added them