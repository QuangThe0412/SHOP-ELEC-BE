const { reviews, products } = require('../data/mockData');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get reviews for a product
 * GET /api/products/:productId/reviews
 */
const getProductReviews = (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const productReviews = reviews.filter(r => r.productId === productId);
    
    // Sort by date (newest first)
    productReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedReviews = productReviews.slice(startIndex, endIndex);

    return successResponse(res, {
      reviews: paginatedReviews,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(productReviews.length / limitNum),
        totalReviews: productReviews.length,
        hasMore: endIndex < productReviews.length
      }
    });

  } catch (error) {
    console.error('Get reviews error:', error);
    return errorResponse(res, 'Failed to get reviews', 500);
  }
};

/**
 * Create new review
 * POST /api/reviews
 */
const createReview = (req, res) => {
  try {
    const { productId, rating, comment, images = [] } = req.body;
    const userId = req.user.id;
    const userName = req.user.name;

    if (!productId || !rating || !comment) {
      return errorResponse(res, 'Product ID, rating, and comment are required', 400, 'MISSING_FIELDS');
    }

    if (rating < 1 || rating > 5) {
      return errorResponse(res, 'Rating must be between 1 and 5', 400, 'INVALID_RATING');
    }

    // Check if product exists
    const product = products.find(p => p.id === productId);
    if (!product) {
      return errorResponse(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // Check if user already reviewed this product
    const existingReview = reviews.find(r => r.productId === productId && r.userId === userId);
    if (existingReview) {
      return errorResponse(res, 'You have already reviewed this product', 400, 'REVIEW_EXISTS');
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      productId,
      userId,
      userName,
      rating,
      comment,
      images,
      verifiedPurchase: true, // In real app, check order history
      createdAt: new Date().toISOString()
    };

    reviews.push(newReview);

    // Update product rating (simple average)
    const productReviews = reviews.filter(r => r.productId === productId);
    const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
    product.rating = Math.round(avgRating * 10) / 10;
    product.reviewCount = productReviews.length;

    return successResponse(res, { review: newReview }, 'Review created successfully', 201);

  } catch (error) {
    console.error('Create review error:', error);
    return errorResponse(res, 'Failed to create review', 500);
  }
};

/**
 * Update review
 * PUT /api/reviews/:reviewId
 */
const updateReview = (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment, images } = req.body;
    const userId = req.user.id;

    const reviewIndex = reviews.findIndex(r => r.id === reviewId);
    if (reviewIndex === -1) {
      return errorResponse(res, 'Review not found', 404, 'REVIEW_NOT_FOUND');
    }

    // Check authorization
    if (reviews[reviewIndex].userId !== userId) {
      return errorResponse(res, 'You can only edit your own reviews', 403, 'FORBIDDEN');
    }

    // Update review
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return errorResponse(res, 'Rating must be between 1 and 5', 400, 'INVALID_RATING');
      }
      reviews[reviewIndex].rating = rating;
    }

    if (comment !== undefined) reviews[reviewIndex].comment = comment;
    if (images !== undefined) reviews[reviewIndex].images = images;

    // Update product rating
    const productId = reviews[reviewIndex].productId;
    const product = products.find(p => p.id === productId);
    if (product) {
      const productReviews = reviews.filter(r => r.productId === productId);
      const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
      product.rating = Math.round(avgRating * 10) / 10;
    }

    return successResponse(res, { review: reviews[reviewIndex] }, 'Review updated successfully');

  } catch (error) {
    console.error('Update review error:', error);
    return errorResponse(res, 'Failed to update review', 500);
  }
};

/**
 * Delete review
 * DELETE /api/reviews/:reviewId
 */
const deleteReview = (req, res) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const reviewIndex = reviews.findIndex(r => r.id === reviewId);
    if (reviewIndex === -1) {
      return errorResponse(res, 'Review not found', 404, 'REVIEW_NOT_FOUND');
    }

    // Check authorization (owner or admin)
    if (reviews[reviewIndex].userId !== userId && userRole !== 'admin') {
      return errorResponse(res, 'Access denied', 403, 'FORBIDDEN');
    }

    const productId = reviews[reviewIndex].productId;
    reviews.splice(reviewIndex, 1);

    // Update product rating
    const product = products.find(p => p.id === productId);
    if (product) {
      const productReviews = reviews.filter(r => r.productId === productId);
      if (productReviews.length > 0) {
        const avgRating = productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
        product.rating = Math.round(avgRating * 10) / 10;
      } else {
        product.rating = 0;
      }
      product.reviewCount = productReviews.length;
    }

    return successResponse(res, null, 'Review deleted successfully');

  } catch (error) {
    console.error('Delete review error:', error);
    return errorResponse(res, 'Failed to delete review', 500);
  }
};

module.exports = {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview
};
