# Hishab-AI - Financial Transaction Management Backend

A robust Node.js/Express backend for managing user accounts, balances, and financial transactions with double-entry bookkeeping and ACID transaction safety.

## 📋 Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Setup](#environment-setup)
- [Running the Project](#running-the-project)
- [API Documentation](#api-documentation)
- [Testing Guide](#testing-guide)
- [Security Features](#security-features)
- [Project Structure](#project-structure)
- [Roadmap](#-upcoming-features-roadmap)
- [Contributing](#contributing)

---

## ✨ Current Features

- **User Authentication** - Register, login, logout with JWT tokens
- **Account Management** - Create and manage multiple accounts per user
- **Financial Transactions** - Transfer money between accounts with idempotency
- **Double-Entry Bookkeeping** - Immutable ledger system with DEBIT/CREDIT entries
- **ACID Transactions** - MongoDB sessions ensure race-safe balance checks
- **Rate Limiting** - Protection against brute force and abuse
- **Email Notifications** - Welcome emails and transaction confirmations
- **Token Blacklist** - Secure logout with token invalidation
- **Input Validation** - Zod schema validation on all endpoints
- **Security Headers** - Helmet middleware + CORS protection

## 🗺️ Upcoming Features (Roadmap)

- 🎨 **React Frontend** - Modern UI for account and transaction management
- 📊 **GraphQL API** - Advanced transaction filtering and querying
- 🔐 **Gmail OAuth Login** - Passwordless authentication via Google
- 🤖 **AI Chatbot** - Intelligent assistant for financial queries and support
- 📈 **Analytics Dashboard** - Transaction history, balance trends, reports
- 💳 **Advanced Filtering** - Sort/filter transactions by date, amount, status
- 🔔 **Real-time Notifications** - WebSocket integration for live updates

---

## 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| **Runtime** | Node.js |
| **Framework** | Express.js 5.2 |
| **Database** | MongoDB + Mongoose 9.2 |
| **Authentication** | JWT + Cookie-based sessions |
| **Password Hashing** | bcryptjs |
| **Input Validation** | Zod |
| **Email Service** | Nodemailer + Gmail |
| **Security** | Helmet, CORS, Rate Limiting |
| **Logging** | Morgan |
| **Testing** | Jest + Supertest |
| **Dev Tools** | Nodemon |

---

## 📦 Prerequisites

- **Node.js** v18+ (LTS recommended)
- **npm** or **yarn**
- **MongoDB** (local or Atlas cloud)
- **Gmail Account** with 2FA enabled (for email service)
- **Postman** (for API testing)

---

## 🚀 Installation

1. **Clone or navigate to project directory:**
```bash
cd Hishab-AI
```

2. **Install dependencies:**
```bash
npm install
```

---

## ⚙️ Environment Setup

Create a `.env` file in the root directory with these variables:

```env
# Server
NODE_ENV=development
PORT=3000

# Database
MONGO_URI=mongodb://localhost:27017/hishab-ai
# OR for MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/hishab-ai

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_chars_long

# Frontend (CORS)
FRONTEND_URL=http://localhost:5173

# Email Service (Gmail)
EMAIL_USER=your-email@gmail.com
EMAIL_APP_PASSWORD=your_app_specific_password
```

### 📧 Gmail App Password Setup:
1. Enable 2FA on Gmail account
2. Go to [Google Account Security](https://myaccount.google.com/security)
3. Generate App Password for "Mail" and "Windows Computer"
4. Use this password in `.env` as `EMAIL_APP_PASSWORD`

---

## ▶️ Running the Project

**Development (with auto-reload):**
```bash
npm run dev
```

**Production:**
```bash
npm start
```

**Run Tests:**
```bash
npm test
```

Server will start on `http://localhost:3000`

---

## 📡 API Documentation

### Authentication Endpoints

#### 1. Register New User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "name": "John Doe"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 3. Logout
```http
POST /api/auth/logout
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Account Endpoints

#### 1. Create Account
```http
POST /api/accounts
Authorization: Bearer {token}
Content-Type: application/json

{
  "currency": "BDT"
}
```

**Response (201):**
```json
{
  "success": true,
  "account": {
    "_id": "507f1f77bcf86cd799439012",
    "user": "507f1f77bcf86cd799439011",
    "status": "ACTIVE",
    "currency": "BDT",
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

#### 2. Get All User Accounts
```http
GET /api/accounts
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "accounts": [
    {
      "_id": "507f1f77bcf86cd799439012",
      "user": "507f1f77bcf86cd799439011",
      "status": "ACTIVE",
      "currency": "BDT"
    }
  ]
}
```

#### 3. Get Account Balance
```http
GET /api/accounts/{accountId}/balance
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "accountId": "507f1f77bcf86cd799439012",
  "balance": 5000,
  "currency": "BDT"
}
```

---

### Transaction Endpoints

#### 1. Transfer Money
```http
POST /api/transactions
Authorization: Bearer {token}
Content-Type: application/json

{
  "fromAccount": "507f1f77bcf86cd799439012",
  "toAccount": "507f1f77bcf86cd799439013",
  "amount": 500,
  "description": "Payment for services",
  "idempotencyKey": "unique-key-12345"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Transaction completed successfully",
  "transaction": {
    "_id": "507f1f77bcf86cd799439014",
    "fromAccount": "507f1f77bcf86cd799439012",
    "toAccount": "507f1f77bcf86cd799439013",
    "amount": 500,
    "status": "COMPLETED",
    "idempotencyKey": "unique-key-12345",
    "createdAt": "2024-01-15T10:15:00Z"
  }
}
```

---

## 🧪 Testing Guide

**For detailed Postman testing instructions, see** [POSTMAN_TESTING.md](POSTMAN_TESTING.md)

**Quick Start:**
```bash
# 1. Start the server
npm run dev

# 2. Open Postman and import environment
# 3. Follow the step-by-step guide in POSTMAN_TESTING.md
# 4. Run requests in order
```

**Testing locally:**
- Server: `http://localhost:3000`
- MongoDB should be running
- Gmail credentials configured in `.env`

---

## 🔒 Security Features

✅ **Password Security:**
- bcryptjs hashing (10 salt rounds)
- 8+ character minimum
- Never returned in API responses

✅ **Token Security:**
- JWT tokens with 3-day expiry
- HttpOnly, Secure, SameSite cookies
- Blacklist on logout
- Verified on every protected request

✅ **Rate Limiting:**
- Auth endpoints: 10 req/15 min per IP
- Other endpoints: 100 req/15 min per IP

✅ **Input Validation:**
- Zod schema validation
- MongoDB ID format verification
- Amount bounds (0 - 1,000,000)
- Email format validation

✅ **Database Safety:**
- MongoDB sessions for ACID transactions
- Immutable ledger entries
- Duplicate transaction prevention via idempotency keys

---

## 📁 Project Structure

```
Hishab-AI/
├── server.js                 # Entry point
├── package.json             # Dependencies
├── .env                      # Environment variables (create this)
├── README.md                # This file
├── src/
│   ├── app.js               # Express app setup
│   ├── config/
│   │   └── db.js            # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── account.controller.js
│   │   └── transaction.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── errorHandler.js
│   │   └── validate.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── account.model.js
│   │   ├── transaction.model.js
│   │   ├── ledger.model.js
│   │   └── blacklist.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── account.routes.js
│   │   └── transaction.routes.js
│   ├── schemas/
│   │   ├── auth.schemas.js
│   │   ├── account.schemas.js
│   │   └── transaction.schemas.js
│   └── services/
│       └── email.service.js
```

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **"Cannot connect to MongoDB"** | Verify `MONGO_URI` in .env and MongoDB is running |
| **"Email service not working"** | Check EMAIL_USER and EMAIL_APP_PASSWORD; verify 2FA enabled |
| **"Token invalid after logout"** | Token is blacklisted; login again to get new token |
| **"Insufficient balance error"** | Ensure account has enough funds; check balance first |
| **"Too many requests"** | Wait 15 minutes or use different IP |

---

## 📝 Notes

- All timestamps are in UTC
- Balance is calculated dynamically from ledger entries
- Ledger entries are immutable (cannot be modified)
- Transactions are ACID-safe within MongoDB sessions
- Email notifications are fire-and-forget (don't block responses)

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Submit a pull request

---

## 📄 License

ISC

---

**Last Updated:** April 26, 2026

---

## 👤 Author

Backend Learning Project

