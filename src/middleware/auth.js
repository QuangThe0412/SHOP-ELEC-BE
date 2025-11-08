const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');
const { users } = require('../data/mockData');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided', 401, 'NO_TOKEN');
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);

    if (!decoded) {
      return errorResponse(res, 'Invalid or expired token', 401, 'INVALID_TOKEN');
    }

    // Find user
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    return errorResponse(res, 'Authentication failed', 401, 'AUTH_FAILED');
  }
};

/**
 * Admin authorization middleware
 * Must be used after authenticate middleware
 */
const authorizeAdmin = (req, res, next) => {
  if (!req.user) {
    return errorResponse(res, 'Authentication required', 401, 'AUTH_REQUIRED');
  }

  if (req.user.role !== 'admin') {
    return errorResponse(res, 'Admin access required', 403, 'FORBIDDEN');
  }

  next();
};

module.exports = {
  authenticate,
  authorizeAdmin
};
