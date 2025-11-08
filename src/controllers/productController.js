const { products } = require('../data/mockData');
const { successResponse, errorResponse } = require('../utils/response');
const { validateRequiredFields } = require('../utils/validation');

/**
 * Get all products with filters
 * GET /api/products
 */
const getAllProducts = (req, res) => {
  try {
    const {
      category,
      subCategory,
      minPrice,
      maxPrice,
      rating,
      search,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    let filteredProducts = [...products];

    // Filter by category
    if (category) {
      filteredProducts = filteredProducts.filter(p => p.category === category);
    }

    // Filter by subcategory
    if (subCategory) {
      filteredProducts = filteredProducts.filter(p => p.subCategory === subCategory);
    }

    // Filter by price range
    if (minPrice) {
      filteredProducts = filteredProducts.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(p => p.price <= Number(maxPrice));
    }

    // Filter by rating
    if (rating) {
      filteredProducts = filteredProducts.filter(p => p.rating >= Number(rating));
    }

    // Search by name or description
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(p =>
        p.name.toLowerCase().includes(searchLower) ||
        p.description.toLowerCase().includes(searchLower)
      );
    }

    // Sort products
    if (sort) {
      switch (sort) {
        case 'price-asc':
          filteredProducts.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          filteredProducts.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          filteredProducts.sort((a, b) => b.rating - a.rating);
          break;
        case 'newest':
          filteredProducts.sort((a, b) => b.id.localeCompare(a.id));
          break;
        case 'best-seller':
          filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount);
          break;
      }
    }

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    return successResponse(res, {
      products: paginatedProducts,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(filteredProducts.length / limitNum),
        totalProducts: filteredProducts.length,
        hasMore: endIndex < filteredProducts.length
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    return errorResponse(res, 'Failed to get products', 500);
  }
};

/**
 * Get product by ID
 * GET /api/products/:id
 */
const getProductById = (req, res) => {
  try {
    const { id } = req.params;
    const product = products.find(p => p.id === id);

    if (!product) {
      return errorResponse(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    return successResponse(res, { product });
  } catch (error) {
    console.error('Get product error:', error);
    return errorResponse(res, 'Failed to get product', 500);
  }
};

/**
 * Create new product (Admin only)
 * POST /api/products
 */
const createProduct = (req, res) => {
  try {
    const requiredFields = ['name', 'description', 'price', 'category', 'subCategory', 'stock'];
    const missing = validateRequiredFields(req.body, requiredFields);

    if (missing) {
      return errorResponse(res, `Missing required fields: ${missing.join(', ')}`, 400, 'MISSING_FIELDS');
    }

    const newProduct = {
      id: `prod-${Date.now()}`,
      ...req.body,
      rating: req.body.rating || 0,
      reviewCount: 0,
      isBestSeller: false,
      isNewArrival: true,
      images: req.body.images || [],
      tags: req.body.tags || []
    };

    products.push(newProduct);

    return successResponse(res, { product: newProduct }, 'Product created successfully', 201);
  } catch (error) {
    console.error('Create product error:', error);
    return errorResponse(res, 'Failed to create product', 500);
  }
};

/**
 * Update product (Admin only)
 * PUT /api/products/:id
 */
const updateProduct = (req, res) => {
  try {
    const { id } = req.params;
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return errorResponse(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    products[productIndex] = {
      ...products[productIndex],
      ...req.body,
      id // Prevent ID change
    };

    return successResponse(res, { product: products[productIndex] }, 'Product updated successfully');
  } catch (error) {
    console.error('Update product error:', error);
    return errorResponse(res, 'Failed to update product', 500);
  }
};

/**
 * Delete product (Admin only)
 * DELETE /api/products/:id
 */
const deleteProduct = (req, res) => {
  try {
    const { id } = req.params;
    const productIndex = products.findIndex(p => p.id === id);

    if (productIndex === -1) {
      return errorResponse(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    products.splice(productIndex, 1);

    return successResponse(res, null, 'Product deleted successfully');
  } catch (error) {
    console.error('Delete product error:', error);
    return errorResponse(res, 'Failed to delete product', 500);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
