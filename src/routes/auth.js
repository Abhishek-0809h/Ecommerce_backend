const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

function signToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      name: user.name
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function serializeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    shippingAddress: user.shippingAddress,
    cityPostal: user.cityPostal
  };
}

router.post("/register", async (req, res) => {
  try {
    const { name, email, password, shippingAddress, cityPostal } = req.body;

    if (!name || !email || !password || !shippingAddress || !cityPostal) {
      return res.status(400).json({ message: "Name, email, password, shipping address, and city/postal code are required." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      shippingAddress,
      cityPostal
    });

    const token = signToken(user);
    return res.status(201).json({
      token,
      user: serializeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to register user." });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user);
    return res.json({
      token,
      user: serializeUser(user)
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to log in." });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("_id name email shippingAddress cityPostal cart");
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    return res.json({
      user: serializeUser(user),
      cart: user.cart
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load current user." });
  }
});

module.exports = router;
