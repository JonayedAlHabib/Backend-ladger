/**
 * Generic Validation Middleware using Zod
 * This middleware validates request body, query, and params against a Zod schema
 * 
 * Usage:
 * router.post('/register', validate(registerSchema), controller)
 */

const validate = (schema) => async (req, res, next) => {
  try {
    // Parse and validate the request data
    const validated = await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    // Replace request data with validated data
    req.body = validated.body || req.body;
    req.query = validated.query || req.query;
    req.params = validated.params || req.params;

    // Continue to next middleware/controller
    next();
  } catch (error) {
    // Zod validation error
    if (error.errors && Array.isArray(error.errors)) {
      // Format errors properly
      const formattedErrors = error.errors.map((err) => ({
        field: err.path.join("."), 
        message: err.message,
        code: err.code,
      }));

      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formattedErrors,
      });
    }

    // Fallback for other errors
    return res.status(400).json({
      success: false,
      message: "Validation error",
      error: error.message,
    });
  }
};

module.exports = validate;
