# StockSense backend

Express REST API for the StockSense inventory management system using PostgreSQL through the `pg` driver and handwritten SQL migrations.

## Setup

1. Copy `.env.example` to `.env` and set `DATABASE_URL` and `JWT_SECRET`.
2. Install dependencies with `npm install`.
3. Apply the versioned SQL migrations with `npm run migrate`.
4. Start the API with `npm run dev`.

## Verification

With demo records available in the database, run `npm run verify:scenario` to exercise receipt, transfer, delivery, adjustment, and ledger behavior. Run `npm run verify:invariants` to check repeated validation and insufficient-stock rollback.

The API listens on `PORT` (default `4000`).
