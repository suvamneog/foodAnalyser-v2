const express = require("express");
const router = express.Router();
const User = require("../models/user");
const user = require("../models/user");

//routes
router.get("/", (req, res) => {
  res.send("hello");
});

router.post("/signup", async (req, res, next) => {
  let { name, email, password } = req.body;
  let newUser = new User({
   name, email, password
  });
  await newUser.save();
  console.log(newUser);
  res.send("user signed");
})

router.post("/login", async (req,res,next) => {
  let { email, password } = req.body;
  let user = await User.findOne({email});
  const isMatch = await bcrypt.compare(password, user.password);
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
  res.json({ message: "Login successful", token });
})


module.exports = router;