const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const emailService = require("../services/email.service")
const tokenBlackListModel = require("../models/blacklist.model")

const COOKIE_OPTIONS = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 3 * 24 * 60 * 60 * 1000 // 3 days (match JWT expiry)
}

/**
 * POST /api/auth/register
 */
async function userRegisterController(req, res) {
    try {
        const { email, password, name } = req.body

        const isExists = await userModel.findOne({ email })
        if (isExists) {
            return res.status(409).json({
                success: false,
                message: "User already exists with this email"
            })
        }

        const user = await userModel.create({ email, password, name })

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        )

        res.cookie("token", token, COOKIE_OPTIONS)

        // Fire-and-forget email — don't block response
        emailService.sendRegistrationEmail(user.email, user.name)
            .catch(err => console.error("Welcome email failed:", err))

        res.status(201).json({
            success: true,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        })
    } catch (error) {
        console.error("Registration error:", error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

/**
 * POST /api/auth/login
 */
async function userLoginController(req, res) {
    try {
        const { email, password } = req.body

        const user = await userModel.findOne({ email }).select("+password")
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Email or password is invalid"
            })
        }

        const isValidPassword = await user.comparePassword(password)
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: "Email or password is invalid"
            })
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "3d" }
        )

        res.cookie("token", token, COOKIE_OPTIONS)

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                email: user.email,
                name: user.name
            },
            token
        })
    } catch (error) {
        console.error("Login error:", error)
        res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
}

/**
 * POST /api/auth/logout
 */
async function userLogoutController(req, res) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(200).json({
            success: true,
            message: "Already logged out"
        })
    }

    try {
        // Verify BEFORE blacklisting — prevent garbage in DB
        jwt.verify(token, process.env.JWT_SECRET)

        await tokenBlackListModel.create({ token }).catch(err => {
            // Ignore duplicate key errors — already blacklisted
            if (err.code !== 11000) throw err
        })
    } catch (error) {
        // Invalid token — just clear cookie, no DB write
    }

    res.clearCookie("token", COOKIE_OPTIONS)
    res.status(200).json({
        success: true,
        message: "Logged out successfully"
    })
}

module.exports = {
    userRegisterController,
    userLoginController,
    userLogoutController
}