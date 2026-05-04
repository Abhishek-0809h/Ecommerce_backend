# NovaCart Backend

This backend turns the existing frontend-only build into a full-stack ecommerce demo.

## Features

- MongoDB Atlas-ready connection
- JWT authentication with register, login, and current-user routes
- Product data stored in MongoDB and auto-seeded on first run
- User cart sync in the database while keeping lightweight cart references in `localStorage`
- Order creation and order history routes
- Demo Razorpay payment order creation and verification flow

## Run

1. Open a terminal inside `backend`.
2. Install dependencies with `npm install`.
3. Copy `.env.example` to `.env` and fill in:
   - `MONGODB_URI` from MongoDB Atlas
   - `JWT_SECRET`
   - Razorpay test keys
4. Start the server:

```bash
npm run dev
```

The API defaults to `http://localhost:5000/api`.

## Important project note

The frontend design is intentionally preserved. The browser still keeps:

- cart item references
- auth token
- user snapshot

The database now stores:

- users
- synced carts
- products
- orders
- payment records inside the order document

## Main API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/products`
- `GET /api/cart`
- `PUT /api/cart`
- `POST /api/payments/create-order`
- `POST /api/payments/verify`
- `POST /api/orders`
- `GET /api/orders/my-orders`
