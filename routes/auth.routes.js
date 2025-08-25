const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered." });
    }

    
    const hash = await bcrypt.hash(password, 10);

    
    const user = await User.create({ name, email, password: hash });

    console.log(" User registered:", email);

    return res.status(201).json({
      message: "Registered successfully",
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(" Register error:", err.message);
    return res.status(500).json({ message: "Server error during registration", error: err.message });
  }
});


router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

  
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

   
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d"
    });

    console.log(" User logged in:", email);

    return res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (err) {
    console.error(" Login error:", err.message);
    return res.status(500).json({ message: "Server error during login", error: err.message });
  }
});

module.exports = router;
