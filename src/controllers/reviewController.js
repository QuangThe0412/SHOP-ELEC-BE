const prisma = require('../lib/prisma');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Create review
 * POST /api/reviews
 */
const createReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, rating, comment } = req.body;

    if (!productId) {
      return errorResponse(res, 'Product ID is required', 400, 'MISSING_PRODUCT_ID');
    }

    if (!rating || rating < 1 || rating > 5) {
      return errorResponse(res, 'Rating must be between 1 and 5', 400, 'INVALID_RATING');
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return errorResponse(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // Check if user already reviewed this product
    const existingReview = await prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId
        }
      }
    });

    if (existingReview) {
      return errorResponse(res, 'You have already reviewed this product', 400, 'DUPLICATE_REVIEW');
    }

    // Check if user has purchased this product
    const order = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: 'delivered'
        }
      }
    });

    const newReview = await prisma.review.create({
      data: {
        productId,
        userId,
        rating: parseInt(rating),
        comment: comment || null,
        verifiedPurchase: !!order
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Update product rating
    const reviews = await prisma.review.findMany({
      where: { productId }
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: reviews.length
      }
    });

    return successResponse(res, { review: newReview }, 'Review created successfully', 201);

  } catch (error) {
    console.error('Create review error:', error);
    return errorResponse(res, 'Failed to create review', 500);
  }
};

/**
 * Get product reviews
 * GET /api/reviews/product/:productId
 */
const getProductReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = 'recent' } = req.query;

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return errorResponse(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    let orderBy = { createdAt: 'desc' };
    if (sortBy === 'helpful') {
      orderBy = { id: 'desc' }; // In real app, implement helpful counter
    } else if (sortBy === 'rating-high') {
      orderBy = { rating: 'desc' };
    } else if (sortBy === 'rating-low') {
      orderBy = { rating: 'asc' };
    }

    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy,
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.review.count({
      where: { productId }
    });

    return successResponse(res, {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    return errorResponse(res, 'Failed to get reviews', 500);
  }
};

/**
 * Get user's reviews
 * GET /api/reviews/user
 */
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await prisma.review.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            image: true,
            price: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.review.count({
      where: { userId }
    });

    return successResponse(res, {
      reviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    return errorResponse(res, 'Failed to get user reviews', 500);
  }
};

/**
 * Update review
 * PUT /api/reviews/:reviewId
 */
const updateReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      return errorResponse(res, 'Review not found', 404, 'REVIEW_NOT_FOUND');
    }

    if (review.userId !== userId) {
      return errorResponse(res, 'Unauthorized', 403, 'UNAUTHORIZED');
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        rating: rating !== undefined ? parseInt(rating) : review.rating,
        comment: comment !== undefined ? comment : review.comment
      },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    // Update product rating
    const reviews = await prisma.review.findMany({
      where: { productId: review.productId }
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await prisma.product.update({
      where: { id: review.productId },
      data: {
        rating: Math.round(avgRating * 10) / 10
      }
    });

    return successResponse(res, { review: updatedReview }, 'Review updated successfully');

  } catch (error) {
    console.error('Update review error:', error);
    return errorResponse(res, 'Failed to update review', 500);
  }
};

/**
 * Delete review
 * DELETE /api/reviews/:reviewId
 */
const deleteReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { reviewId } = req.params;

    const review = await prisma.review.findUnique({
      where: { id: reviewId }
    });

    if (!review) {
      return errorResponse(res, 'Review not found', 404, 'REVIEW_NOT_FOUND');
    }

    if (review.userId !== userId) {
      return errorResponse(res, 'Unauthorized', 403, 'UNAUTHORIZED');
    }

    const productId = review.productId;

    await prisma.review.delete({
      where: { id: reviewId }
    });

    // Update product rating
    const reviews = await prisma.review.findMany({
      where: { productId }
    });

    let avgRating = 0;
    let reviewCount = 0;
    if (reviews.length > 0) {
      avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      reviewCount = reviews.length;
    }

    await prisma.product.update({
      where: { id: productId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount
      }
    });

    return successResponse(res, null, 'Review deleted successfully');

  } catch (error) {
    console.error('Delete review error:', error);
    return errorResponse(res, 'Failed to delete review', 500);
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getUserReviews,
  updateReview,
  deleteReview
};
