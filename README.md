# Hishab-AI — Financial Transaction System

A full-stack financial transaction management platform built with MERN (MongoDB, Express, React, Node.js). Implements double-entry ledger accounting with ACID-safe transactions, idempotency keys for exactly-once semantics, and race-safe balance validation.

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Backend** | Node.js + Express | 5.2.1 |
| **Database** | MongoDB + Mongoose | 9.2.1 |
| **Frontend** | React + Vite | 19.2.5 + 8.0.10 |
| **UI Framework** | Tailwind CSS | 4.2.4 |
| **Routing** | React Router DOM | 7.14.2 |
| **Auth** | JWT (HttpOnly cookies) | 9.0.3 |
| **Validation** | Zod | 4.3.6 |
| **Security** | Helmet, CORS, Rate Limiting | Latest |

## Architecture Highlights

### Double-Entry Ledger
Every transaction creates a matched pair of ledger entries (DEBIT and CREDIT) within a single MongoDB session. This ensures:
- Immutable audit trail (ledger entries cannot be modified or deleted)
- Financial integrity via balanced accounts
- Accurate balance computation via aggregation pipeline

### Idempotency Keys
Each transfer is tagged with a unique UUID-based `idempotencyKey`. This ensures:
- Retries don't create duplicate transactions
- Exactly-once semantics even if the network fails mid-request
- Server-side deduplication via MongoDB unique index

### Race-Safe Balance Checks
Balance validation happens **inside** the MongoDB transaction session, not before:
1. Start session
2. Acquire lock on accounts
3. Recompute balance from ledger entries (guarantees latest state)
4. Validate sufficient funds
5. Create DEBIT/CREDIT entries
6. Commit atomically

This prevents race conditions where concurrent transfers could overdraw an account.

### Cookie-Based JWT Authentication
- JWT tokens stored in **HttpOnly** cookies (immune to XSS)
- Frontend sends credentials automatically via `withCredentials: true`
- Token blacklist on logout prevents token reuse
- 3-day expiration window

## Local Setup

### Prerequisites
- Node.js v20+ (LTS recommended)
- MongoDB (local or Atlas URI)
- Gmail account (for email notifications, optional)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env          # Fill in your MongoDB URI, JWT_SECRET, etc.
npm run dev                    # Starts on http://localhost:3000
```

### Frontend Setup

```bash
cd frontend
npm install
touch .env.local               # Create if needed
# Add: VITE_API_URL=http://localhost:3000/api
npm run dev                    # Starts on http://localhost:5173
# Hard refresh: Ctrl+Shift+R
```

### Environment Variables

See `.env.example` files in `backend/` and `frontend/` for required keys:
- `MONGO_URI` — MongoDB connection string (required)
- `JWT_SECRET` — Secret for signing tokens (generate with `openssl rand -hex 32`)
- `EMAIL_USER`, `EMAIL_APP_PASSWORD` — Gmail credentials (optional, for notifications)
- `VITE_API_URL` — Backend API URL (frontend only)

## API Endpoints

| Method | Endpoint | Auth | Payload |
|--------|----------|------|---------|
| `POST` | `/api/auth/register` | — | `{ name, email, password }` |
| `POST` | `/api/auth/login` | — | `{ email, password }` |
| `POST` | `/api/auth/logout` | ✓ | — |
| `POST` | `/api/accounts/` | ✓ | `{ currency }` |
| `GET` | `/api/accounts/` | ✓ | — |
| `GET` | `/api/accounts/balance/:accountId` | ✓ | — |
| `POST` | `/api/transactions/` | ✓ | `{ fromAccount, toAccount, amount, idempotencyKey, description? }` |
| `GET` | `/api/transactions/:transactionId` | ✓ | — |

**Note:** ✓ = Requires authenticated user via JWT cookie.

## Lessons Learned

1. **MongoDB Sessions Are Essential** — Distributed transactions prevent race conditions that naive balance checks cannot catch. Always validate state inside the session.

2. **Idempotency Keys Prevent Duplicates** — Network failures are inevitable. Client-side UUID + server-side unique index makes retries safe and deterministic.

3. **Immutable Audit Logs Scale** — Preventing ledger modifications (via pre-hooks) costs minimal overhead but dramatically simplifies auditing, reconciliation, and debugging.

4. **HttpOnly Cookies Beat localStorage** — Storing JWT in localStorage exposes tokens to XSS. HttpOnly cookies force the browser to exclude JavaScript access, raising the attack surface significantly.

## Future Work

- **GraphQL API** — Replace REST with GraphQL for flexible filtering and aggregation
- **OAuth2 (Google Login)** — Passwordless authentication via Google Sign-In
- **Analytics Dashboard** — Charts for transaction trends, balance history, category breakdown
- **Real-Time Notifications** — WebSocket integration for live transaction updates
- **Advanced Filtering** — Sort/filter by date range, status, category, recipient
- **Password Change & 2FA** — Self-service security features

## Running in Production

1. Set `NODE_ENV=production`
2. Use managed MongoDB (Atlas) with connection pooling
3. Enable HTTPS and set secure cookie flags in `.env`
4. Use a reverse proxy (Nginx) to serve React build and proxy API
5. Monitor logs and set up alerts for failed transactions

---

**Built with attention to financial accuracy, security, and developer experience.**
