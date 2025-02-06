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
// pros: {
//     type: String
// },
// cons: {
//     type: String
// },
user: {
    type: Schema.Types.ObjectId,
    ref : "User",
    required: true,
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