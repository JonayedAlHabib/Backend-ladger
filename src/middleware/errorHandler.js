const { ZodError } = require("zod");

function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  // Zod validation error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((error) => ({
      field: error.path.join("."),
      message: error.message,
      code: error.code,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: formattedErrors,
    });
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Database validation failed",
      errors,
    });
  }

  const statusCode = err.statusCode || 500;
  const responseBody = {
    success: false,
    message: err.message || "Internal server error",
  };

  if (process.env.NODE_ENV !== "production") {
    responseBody.stack = err.stack;
  }

  return res.status(statusCode).json(responseBody);
}

module.exports = errorHandler;
