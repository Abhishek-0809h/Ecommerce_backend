const express = require("express");
const User = require("../models/User");
const auth = require("../middleware/auth");

const router = express.Router();

router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("cart");
    return res.json({ cart: user?.cart || [] });
  } catch (error) {
    return res.status(500).json({ message: "Failed to load cart." });
  }
});

router.put("/", auth, async (req, res) => {
  try {
    const { cart } = req.body;

    if (!Array.isArray(cart)) {
      return res.status(400).json({ message: "Cart must be an array." });
    }

    const normalizedCart = cart
      .filter((item) => Number.isInteger(item.productId) && Number(item.qty) > 0)
      .map((item) => ({
        productId: item.productId,
        qty: Number(item.qty)
      }));

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { cart: normalizedCart },
      { new: true }
    ).select("cart");

    return res.json({ cart: user.cart });
  } catch (error) {
    return res.status(500).json({ message: "Failed to update cart." });
  }
});

module.exports = router;
