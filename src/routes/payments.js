const crypto = require("crypto");
const express = require("express");
const Razorpay = require("razorpay");
const auth = require("../middleware/auth");

const router = express.Router();

function getRazorpayClient() {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;

  if (!key_id || !key_secret || process.env.DEMO_RAZORPAY === "true") {
    return null;
  }

  return new Razorpay({ key_id, key_secret });
}

router.post("/create-order", auth, async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "A valid amount is required." });
    }

    const razorpay = getRazorpayClient();
    if (!razorpay) {
      return res.json({
        demoMode: true,
        key: process.env.RAZORPAY_KEY_ID || "rzp_test_demo",
        order: {
          id: `order_demo_${Date.now()}`,
          amount: Math.round(amount * 100),
          currency: "INR"
        }
      });
    }

    const order = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt: `novacart_${Date.now()}`
    });

    return res.json({
      demoMode: false,
      key: process.env.RAZORPAY_KEY_ID,
      order
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to create payment order." });
  }
});

router.post("/verify", auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, demoMode } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Payment verification fields are missing." });
    }

    if (demoMode) {
      return res.json({ verified: true });
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid Razorpay signature." });
    }

    return res.json({ verified: true });
  } catch (error) {
    return res.status(500).json({ message: "Payment verification failed." });
  }
});

module.exports = router;
