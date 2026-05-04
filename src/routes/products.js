const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

router.get("/", async (_req, res) => {
  try {
    const products = await Product.find().sort({ productId: 1 }).lean();
    return res.json(products);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load products." });
  }
});

module.exports = router;
