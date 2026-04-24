const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const tokenBlackListModel = require("../models/blacklist.model")

async function authMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: token missing"
        })
    }

    const isBlacklisted = await tokenBlackListModel.findOne({ token })
    if (isBlacklisted) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: token invalid"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId)

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: user no longer exists"
            })
        }

        req.user = user
        return next()
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: token invalid or expired"
        })
    }
}

async function authSystemUserMiddleware(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1]

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: token missing"
        })
    }

    const isBlacklisted = await tokenBlackListModel.findOne({ token })
    if (isBlacklisted) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: token invalid"
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await userModel.findById(decoded.userId).select("+systemUser")

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: user no longer exists"
            })
        }

        if (!user.systemUser) {
            return res.status(403).json({
                success: false,
                message: "Forbidden: system user access required"
            })
        }

        req.user = user
        return next()
    } catch (err) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized: token invalid"
        })
    }
}

module.exports = {
    authMiddleware,
    authSystemUserMiddleware
}