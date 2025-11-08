/**
 * Standard API response format
 */
const successResponse = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Standard error response format
 */
const errorResponse = (res, message = 'Error', statusCode = 500, code = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    code: code || `ERROR_${statusCode}`
  });
};

module.exports = {
  successResponse,
  errorResponse
};
