const { ZodError } = require("zod")

function errorHandler(err, req, res, next) {
    if (res.headersSent) {
        return next(err)
    }

    // Zod validation error (v4 uses .issues)
    if (err instanceof ZodError) {
        const issues = err.issues || err.errors || []
        const formattedErrors = issues.map((issue) => ({
            field: issue.path.join("."),
            message: issue.message,
            code: issue.code,
        }))

        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: formattedErrors,
        })
    }

    // Mongoose validation
    if (err.name === "ValidationError") {
        const errors = Object.values(err.errors).map((error) => ({
            field: error.path,
            message: error.message,
        }))

        return res.status(400).json({
            success: false,
            message: "Database validation failed",
            errors,
        })
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: `Duplicate value for field: ${Object.keys(err.keyValue || {}).join(", ")}`
        })
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === "CastError") {
        return res.status(400).json({
            success: false,
            message: `Invalid ${err.path}: ${err.value}`
        })
    }

    const statusCode = err.statusCode || 500
    const responseBody = {
        success: false,
        message: err.message || "Internal server error",
    }

    if (process.env.NODE_ENV !== "production") {
        responseBody.stack = err.stack
    }

    return res.status(statusCode).json(responseBody)
}

module.exports = errorHandler