/**
 * Error handler middleware for Express
 * Logs errors and sends appropriate JSON responses
 */
export const errorHandler = (err, req, res, next) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error(`[${status}] ${message}`);

  res.status(status).json({
    error: {
      status,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
};

/**
 * Request validation middleware
 * Validates required fields in request body
 */
export const validateRequest = (requiredFields) => {
  return (req, res, next) => {
    const missing = requiredFields.filter(field => !(field in req.body));

    if (missing.length > 0) {
      return res.status(400).json({
        error: `Missing required fields: ${missing.join(', ')}`
      });
    }

    next();
  };
};
