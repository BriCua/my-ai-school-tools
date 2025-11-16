/**
 * Utility functions for common operations
 */

export const formatResponse = (data, message = 'Success') => {
  return {
    status: 'success',
    message,
    data,
    timestamp: new Date().toISOString()
  };
};

export const formatError = (message, statusCode = 500) => {
  return {
    status: 'error',
    message,
    statusCode,
    timestamp: new Date().toISOString()
  };
};

export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
