const express = require("express");
const auth = require("../middleware/auth");
const Order = require("../models/Order");
const User = require("../models/User");

const router = express.Router();

router.post("/", auth, async (req, res) => {
  try {
    const { customer, items, pricing, payment } = req.body;

    if (!customer || !items?.length || !pricing || !payment) {
      return res.status(400).json({ message: "Order data is incomplete." });
    }

    const order = await Order.create({
      user: req.user.id,
      customer,
      items,
      pricing,
      payment
    });

    await User.findByIdAndUpdate(req.user.id, { cart: [] });

    return res.status(201).json({
      message: "Order created successfully.",
      orderId: order._id
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create order." });
  }
});

router.get("/my-orders", auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).lean();
    return res.json(orders);
  } catch (error) {
    return res.status(500).json({ message: "Failed to load orders." });
  }
});

module.exports = router;
