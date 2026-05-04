const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: Number, required: true },
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    qty: { type: Number, required: true },
    img: { type: String, required: true }
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    customer: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      address: { type: String, required: true },
      cityPostal: { type: String, required: true }
    },
    items: { type: [orderItemSchema], required: true },
    pricing: {
      itemCount: { type: Number, required: true },
      subtotal: { type: Number, required: true },
      shipping: { type: Number, required: true },
      tax: { type: Number, required: true },
      total: { type: Number, required: true }
    },
    payment: {
      provider: { type: String, required: true, default: "Razorpay" },
      status: { type: String, required: true, default: "paid" },
      razorpayOrderId: { type: String, default: "" },
      razorpayPaymentId: { type: String, default: "" },
      razorpaySignature: { type: String, default: "" },
      demoMode: { type: Boolean, default: true }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
