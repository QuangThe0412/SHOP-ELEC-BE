const prisma = require('../lib/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { validateRequiredFields } = require('../utils/validation');

/**
 * Get all products with filters
 * GET /api/products
 */
const getAllProducts = async (req, res) => {
  try {
    const {
      categoryId,
      subCategoryId,
      minPrice,
      maxPrice,
      rating,
      search,
      sort,
      page = 1,
      limit = 20
    } = req.query;

    // Build where clause
    const where = {};

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (subCategoryId) {
      where.subCategoryId = subCategoryId;
    }

    if (minPrice) {
      where.price = { ...where.price, gte: Number(minPrice) };
    }

    if (maxPrice) {
      where.price = { ...where.price, lte: Number(maxPrice) };
    }

    if (rating) {
      where.rating = { gte: Number(rating) };
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } }
      ];
    }

    // Build orderBy clause
    let orderBy = { createdAt: 'desc' };
    if (sort) {
      switch (sort) {
        case 'price-asc':
          orderBy = { price: 'asc' };
          break;
        case 'price-desc':
          orderBy = { price: 'desc' };
          break;
        case 'rating':
          orderBy = { rating: 'desc' };
          break;
        case 'newest':
          orderBy = { createdAt: 'desc' };
          break;
        case 'best-seller':
          orderBy = { reviewCount: 'desc' };
          break;
      }
    }

    // Get pagination values
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Fetch products
    const [products, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          category: true,
          subCategory: true,
          images: {
            where: { isPrimary: true },
            take: 1
          }
        }
      }),
      prisma.product.count({ where })
    ]);

    return successResponse(res, {
      products,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalProducts: totalCount,
        hasMore: skip + limitNum < totalCount
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
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        subCategory: true,
        images: true
      }
    });

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
const createProduct = async (req, res) => {
  try {
    const requiredFields = ['name', 'description', 'price', 'categoryId', 'stock'];
    const missing = validateRequiredFields(req.body, requiredFields);

    if (missing) {
      return errorResponse(res, `Missing required fields: ${missing.join(', ')}`, 400, 'MISSING_FIELDS');
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: req.body.categoryId }
    });

    if (!category) {
      return errorResponse(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    // Verify subCategory if provided
    if (req.body.subCategoryId) {
      const subCategory = await prisma.subCategory.findUnique({
        where: { id: req.body.subCategoryId }
      });

      if (!subCategory) {
        return errorResponse(res, 'SubCategory not found', 404, 'SUBCATEGORY_NOT_FOUND');
      }
    }

    const newProduct = await prisma.product.create({
      data: {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        originalPrice: req.body.originalPrice || req.body.price,
        categoryId: req.body.categoryId,
        subCategoryId: req.body.subCategoryId,
        stock: req.body.stock,
        image: req.body.image,
        tags: req.body.tags || [],
        specs: req.body.specs || {},
        isBestSeller: req.body.isBestSeller || false,
        isNewArrival: req.body.isNewArrival !== false
      },
      include: {
        category: true,
        subCategory: true
      }
    });

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
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id }
    });

    if (!product) {
      return errorResponse(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // Verify category if being updated
    if (req.body.categoryId) {
      const category = await prisma.category.findUnique({
        where: { id: req.body.categoryId }
      });

      if (!category) {
        return errorResponse(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
      }
    }

    // Verify subCategory if being updated
    if (req.body.subCategoryId) {
      const subCategory = await prisma.subCategory.findUnique({
        where: { id: req.body.subCategoryId }
      });

      if (!subCategory) {
        return errorResponse(res, 'SubCategory not found', 404, 'SUBCATEGORY_NOT_FOUND');
      }
    }

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        originalPrice: req.body.originalPrice,
        categoryId: req.body.categoryId,
        subCategoryId: req.body.subCategoryId,
        stock: req.body.stock,
        image: req.body.image,
        tags: req.body.tags,
        specs: req.body.specs,
        isBestSeller: req.body.isBestSeller,
        isNewArrival: req.body.isNewArrival
      },
      include: {
        category: true,
        subCategory: true,
        images: true
      }
    });

    return successResponse(res, { product: updatedProduct }, 'Product updated successfully');

  } catch (error) {
    console.error('Update product error:', error);
    return errorResponse(res, 'Failed to update product', 500);
  }
};

/**
 * Delete product (Admin only)
 * DELETE /api/products/:id
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify product exists
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        _count: {
          select: { OrderItem: true, Review: true }
        }
      }
    });

    if (!product) {
      return errorResponse(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // Check if product has orders
    if (product._count.OrderItem > 0) {
      return errorResponse(res, 'Cannot delete product with existing orders', 400, 'PRODUCT_HAS_ORDERS');
    }

    // Delete related images and reviews first (cascade might not work for all)
    await prisma.productImage.deleteMany({
      where: { productId: id }
    });

    await prisma.review.deleteMany({
      where: { productId: id }
    });

    // Delete the product
    await prisma.product.delete({
      where: { id }
    });

    return successResponse(res, null, 'Product deleted successfully');

  } catch (error) {
    console.error('Delete product error:', error);
    return errorResponse(res, 'Failed to delete product', 500);
  }
};

/**
 * Search products
 * GET /api/products/search
 */
const searchProducts = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return errorResponse(res, 'Search query must be at least 2 characters', 400, 'INVALID_SEARCH');
    }

    const results = await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { tags: { hasSome: [q] } }
        ]
      },
      take: Math.min(Number(limit), 50),
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
        rating: true
      }
    });

    return successResponse(res, { results });

  } catch (error) {
    console.error('Search products error:', error);
    return errorResponse(res, 'Failed to search products', 500);
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  searchProducts
};
