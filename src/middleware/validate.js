const validate = (schema) => async (req, res, next) => {
    try {
        const validated = await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params,
        })

        req.body = validated.body || req.body
        // Note: req.query is read-only in Express 5, skip it
        req.params = validated.params || req.params

        next()
    } catch (error) {
        const issues = error.issues || error.errors || []
        if (issues.length > 0) {
            const formattedErrors = issues.map((err) => ({
                field: err.path.join("."),
                message: err.message,
                code: err.code,
            }))

            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: formattedErrors,
            })
        }

        return res.status(400).json({
            success: false,
            message: "Validation error",
            error: error.message,
        })
    }
}

module.exports = validate