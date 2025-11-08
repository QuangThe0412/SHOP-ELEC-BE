const bcrypt = require('bcryptjs');
const { users } = require('../data/mockData');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/response');
const { isValidEmail, isValidPassword, validateRequiredFields } = require('../utils/validation');

// Store refresh tokens (in production, use Redis or database)
const refreshTokens = new Set();

/**
 * Register new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate required fields
    const missing = validateRequiredFields(req.body, ['email', 'password', 'name']);
    if (missing) {
      return errorResponse(res, `Missing required fields: ${missing.join(', ')}`, 400, 'MISSING_FIELDS');
    }

    // Validate email
    if (!isValidEmail(email)) {
      return errorResponse(res, 'Invalid email format', 400, 'INVALID_EMAIL');
    }

    // Validate password
    if (!isValidPassword(password)) {
      return errorResponse(res, 'Password must be at least 6 characters', 400, 'WEAK_PASSWORD');
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return errorResponse(res, 'Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password: hashedPassword,
      name,
      role: 'customer',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);

    // Generate tokens
    const accessToken = generateAccessToken(newUser.id, newUser.role);
    const refreshToken = generateRefreshToken(newUser.id);
    refreshTokens.add(refreshToken);

    return successResponse(res, {
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      },
      accessToken,
      refreshToken
    }, 'User registered successfully', 201);

  } catch (error) {
    console.error('Register error:', error);
    return errorResponse(res, 'Registration failed', 500);
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    const missing = validateRequiredFields(req.body, ['email', 'password']);
    if (missing) {
      return errorResponse(res, `Missing required fields: ${missing.join(', ')}`, 400, 'MISSING_FIELDS');
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return errorResponse(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 'Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);
    refreshTokens.add(refreshToken);

    return successResponse(res, {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      accessToken,
      refreshToken
    }, 'Login successful');

  } catch (error) {
    console.error('Login error:', error);
    return errorResponse(res, 'Login failed', 500);
  }
};

/**
 * Get current user
 * GET /api/auth/me
 */
const getCurrentUser = (req, res) => {
  try {
    return successResponse(res, {
      user: req.user
    }, 'User retrieved successfully');
  } catch (error) {
    console.error('Get current user error:', error);
    return errorResponse(res, 'Failed to get user', 500);
  }
};

/**
 * Refresh access token
 * POST /api/auth/refresh-token
 */
const refreshAccessToken = (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return errorResponse(res, 'Refresh token required', 400, 'MISSING_TOKEN');
    }

    // Check if refresh token exists
    if (!refreshTokens.has(refreshToken)) {
      return errorResponse(res, 'Invalid refresh token', 401, 'INVALID_TOKEN');
    }

    // Verify refresh token
    const decoded = verifyToken(refreshToken, true);
    if (!decoded) {
      refreshTokens.delete(refreshToken);
      return errorResponse(res, 'Invalid or expired refresh token', 401, 'INVALID_TOKEN');
    }

    // Find user
    const user = users.find(u => u.id === decoded.userId);
    if (!user) {
      return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user.id, user.role);

    return successResponse(res, {
      accessToken: newAccessToken
    }, 'Token refreshed successfully');

  } catch (error) {
    console.error('Refresh token error:', error);
    return errorResponse(res, 'Token refresh failed', 500);
  }
};

/**
 * Logout user
 * POST /api/auth/logout
 */
const logout = (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      refreshTokens.delete(refreshToken);
    }

    return successResponse(res, null, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 'Logout failed', 500);
  }
};

module.exports = {
  register,
  login,
  getCurrentUser,
  refreshAccessToken,
  logout
};
