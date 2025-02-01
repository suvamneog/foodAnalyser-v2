const express = require("express");
const app = express();

app.get("/analyze", (req, res) => {
  res.send("hello");
});

app.post("/analyze", (req, res) => {
  const foodName = req.body.foodName;
  const mockData = {
    Suvam: { calories: 30, protein: 35, carbs: 400, fats: 30 },
    // Add more mock data here
  };

  if (mockData[foodName]) {
    res.json(mockData[foodName]);
  } else {
    res.status(404).json({ error: "Food not found" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
