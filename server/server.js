const express = require("express");
const app = express();
const foodRoutes = require("./api/foodRoutes");
const connectDB = require("./db");
const User = require("./models/user")
const PORT = process.env.PORT || 3000;
app.use("/", foodRoutes); 

// app.get("/", (req, res) => {
//   res.send("hello");
// });

connectDB();


app.get("/test", async (req,res) => {
  let newUser = new User ({
    name : "suv"
  });
  await newUser.save();
  console.log(newUser);
  res.send("User saved!");
});



app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  