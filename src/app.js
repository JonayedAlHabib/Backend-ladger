const express = require("express")
const cookieParser = require("cookie-parser")
const helmet = require("helmet")
const cors = require("cors")
const rateLimit = require("express-rate-limit")
const morgan = require("morgan")
const errorHandler = require("./middleware/errorHandler")

const app = express()

// Security middleware
app.use(helmet())
app.use(cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true
}))

// Logging
if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"))
}

// Body + cookie parsing
app.use(express.json({ limit: "10kb" }))
app.use(cookieParser())

// Rate limiting — stricter on auth
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 10, // 10 requests per IP
    message: { success: false, message: "Too many attempts, try again later" }
})

const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
})

// Routes
const authRouter = require("./routes/auth.routes")
const accountRouter = require("./routes/account.routes")
const transactionRoutes = require("./routes/transaction.routes")

app.use("/api/auth", authLimiter, authRouter)
app.use("/api/accounts", generalLimiter, accountRouter)
app.use("/api/transactions", generalLimiter, transactionRoutes)

// Health check
app.get("/health", (req, res) => {
    res.json({ success: true, status: "ok", timestamp: new Date().toISOString() })
})

// Centralized error handler (MUST be last)
app.use(errorHandler)

module.exports = app