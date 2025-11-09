const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');
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
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return errorResponse(res, 'Email already registered', 409, 'EMAIL_EXISTS');
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'user'
      }
    });

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
    const user = await prisma.user.findUnique({
      where: { email }
    });

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
 * Refresh access token
 * POST /api/auth/refresh
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return errorResponse(res, 'Refresh token is required', 400, 'MISSING_TOKEN');
    }

    if (!refreshTokens.has(token)) {
      return errorResponse(res, 'Invalid refresh token', 401, 'INVALID_TOKEN');
    }

    const decoded = verifyToken(token, 'refresh');
    if (!decoded) {
      return errorResponse(res, 'Invalid or expired token', 401, 'EXPIRED_TOKEN');
    }

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

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
    const { refreshToken: token } = req.body;
    if (token) {
      refreshTokens.delete(token);
    }
    return successResponse(res, null, 'Logout successful');
  } catch (error) {
    console.error('Logout error:', error);
    return errorResponse(res, 'Logout failed', 500);
  }
};

/**
 * Get current user profile
 * GET /api/auth/me
 */
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return errorResponse(res, 'User not found', 404, 'USER_NOT_FOUND');
    }

    return successResponse(res, { user });

  } catch (error) {
    console.error('Get profile error:', error);
    return errorResponse(res, 'Failed to get profile', 500);
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getProfile
};
