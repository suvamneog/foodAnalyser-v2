const express = require("express");
const app = express();
const foodRoutes = require("./api/foodRoutes");
const PORT = process.env.PORT || 3000;
app.use("/", foodRoutes); 

// app.get("/", (req, res) => {
//   res.send("hello");
// });


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
  