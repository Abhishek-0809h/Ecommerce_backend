const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const connectDb = require("./config/connectDb");
const Product = require("./models/Product");
const productSeed = require("./data/products");
const authRoutes = require("./routes/auth");
const productRoutes = require("./routes/products");
const cartRoutes = require("./routes/cart");
const orderRoutes = require("./routes/orders");
const paymentRoutes = require("./routes/payments");

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const defaultOrigins = [
  "https://abhishek-0809h.github.io",
  "http://localhost:5500",
  "http://127.0.0.1:5500"
];

function normalizeOrigin(origin) {
  if (!origin) {
    return "";
  }

  try {
    return new URL(origin).origin;
  } catch (error) {
    return origin.trim().replace(/\/+$/, "");
  }
}

const configuredOrigins = [
  ...new Set(
    [...defaultOrigins, ...(process.env.CLIENT_URL || "").split(",")]
      .map((origin) => normalizeOrigin(origin.trim()))
      .filter(Boolean)
  )
];

function isAllowedOrigin(origin) {
  if (!origin) {
    return true;
  }

  const normalizedOrigin = normalizeOrigin(origin);

  if (configuredOrigins.includes(normalizedOrigin)) {
    return true;
  }

  try {
    const { hostname } = new URL(normalizedOrigin);
    return hostname === "localhost" || hostname === "127.0.0.1";
  } catch (error) {
    return false;
  }
}

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      return callback(null, true);
    }

    return callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);

async function seedProductsIfNeeded() {
  const count = await Product.countDocuments();
  if (count === 0) {
    await Product.insertMany(productSeed);
    console.log("Seeded initial products");
    return;
  }

  const ceramicBrewMug = productSeed.find((product) => product.productId === 11);
  if (!ceramicBrewMug) {
    return;
  }

  await Product.updateOne(
    { productId: ceramicBrewMug.productId },
    { $set: { img: ceramicBrewMug.img } }
  );
}

async function startServer() {
  try {
    await connectDb();
    await seedProductsIfNeeded();

    const port = process.env.PORT || 5000;
    app.listen(port, () => {
      console.log(`NovaCart backend running on port ${port}`);
    });
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}

startServer();
