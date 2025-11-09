const prisma = require('../lib/prisma');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get all categories with subcategories
 * GET /api/categories
 */
const getAllCategories = async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        createdAt: true,
        updatedAt: true,
        subCategories: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    const formattedCategories = categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon,
      productCount: cat._count.products,
      subCategories: cat.subCategories,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt
    }));

    return successResponse(res, { 
      categories: formattedCategories,
      total: formattedCategories.length 
    });
  } catch (error) {
    console.error('Get categories error:', error);
    return errorResponse(res, 'Failed to get categories', 500);
  }
};

/**
 * Get category by ID or slug
 * GET /api/categories/:categoryId
 */
const getCategoryById = async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const category = await prisma.category.findFirst({
      where: {
        OR: [
          { id: categoryId },
          { slug: categoryId }
        ]
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        createdAt: true,
        updatedAt: true,
        subCategories: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            rating: true,
            reviewCount: true,
            images: {
              select: {
                url: true,
                isPrimary: true
              },
              where: { isPrimary: true },
              take: 1
            }
          }
        },
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return errorResponse(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    const formattedCategory = {
      id: category.id,
      name: category.name,
      slug: category.slug,
      icon: category.icon,
      productCount: category._count.products,
      subCategories: category.subCategories,
      products: category.products.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        stock: p.stock,
        rating: p.rating,
        reviewCount: p.reviewCount,
        image: p.images.length > 0 ? p.images[0].url : null
      })),
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };

    return successResponse(res, { category: formattedCategory });
  } catch (error) {
    console.error('Get category error:', error);
    return errorResponse(res, 'Failed to get category', 500);
  }
};

/**
 * Create new category (Admin only)
 * POST /api/categories
 */
const createCategory = async (req, res) => {
  try {
    const { name, slug, icon } = req.body;

    if (!name || !slug) {
      return errorResponse(res, 'Name and slug are required', 400, 'MISSING_FIELDS');
    }

    const existingCategory = await prisma.category.findUnique({
      where: { slug }
    });

    if (existingCategory) {
      return errorResponse(res, 'Category with this slug already exists', 400, 'DUPLICATE_SLUG');
    }

    const newCategory = await prisma.category.create({
      data: {
        name,
        slug,
        icon: icon || '📦'
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        subCategories: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        createdAt: true,
        updatedAt: true
      }
    });

    return successResponse(res, { category: newCategory }, 'Category created successfully', 201);
  } catch (error) {
    console.error('Create category error:', error);
    return errorResponse(res, 'Failed to create category', 500);
  }
};

/**
 * Update category (Admin only)
 * PUT /api/categories/:categoryId
 */
const updateCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, slug, icon } = req.body;

    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return errorResponse(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    if (slug && slug !== category.slug) {
      const existingCategory = await prisma.category.findUnique({
        where: { slug }
      });
      if (existingCategory) {
        return errorResponse(res, 'Category with this slug already exists', 400, 'DUPLICATE_SLUG');
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: {
        name: name || category.name,
        slug: slug || category.slug,
        icon: icon !== undefined ? icon : category.icon
      },
      select: {
        id: true,
        name: true,
        slug: true,
        icon: true,
        subCategories: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        },
        createdAt: true,
        updatedAt: true
      }
    });

    return successResponse(res, { category: updatedCategory }, 'Category updated successfully');
  } catch (error) {
    console.error('Update category error:', error);
    return errorResponse(res, 'Failed to update category', 500);
  }
};

/**
 * Delete category (Admin only)
 * DELETE /api/categories/:categoryId
 */
const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: { products: true }
        }
      }
    });

    if (!category) {
      return errorResponse(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    if (category._count.products > 0) {
      return errorResponse(res, 'Cannot delete category with products', 400, 'CATEGORY_HAS_PRODUCTS');
    }

    await prisma.category.delete({
      where: { id: categoryId }
    });

    return successResponse(res, null, 'Category deleted successfully');
  } catch (error) {
    console.error('Delete category error:', error);
    return errorResponse(res, 'Failed to delete category', 500);
  }
};

/**
 * Get subcategories by category
 * GET /api/categories/:categoryId/subcategories
 */
const getSubCategories = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: {
        id: true,
        name: true,
        slug: true,
        subCategories: {
          select: {
            id: true,
            name: true,
            slug: true,
            createdAt: true,
            updatedAt: true
          }
        }
      }
    });

    if (!category) {
      return errorResponse(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    return successResponse(res, { 
      category: category.name,
      subCategories: category.subCategories,
      total: category.subCategories.length
    });
  } catch (error) {
    console.error('Get subcategories error:', error);
    return errorResponse(res, 'Failed to get subcategories', 500);
  }
};

/**
 * Create subcategory (Admin only)
 * POST /api/categories/:categoryId/subcategories
 */
const createSubCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, slug } = req.body;

    if (!name || !slug) {
      return errorResponse(res, 'Name and slug are required', 400, 'MISSING_FIELDS');
    }

    const category = await prisma.category.findUnique({
      where: { id: categoryId }
    });

    if (!category) {
      return errorResponse(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    const newSubCategory = await prisma.subCategory.create({
      data: {
        name,
        slug,
        categoryId
      },
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return successResponse(res, { subCategory: newSubCategory }, 'Subcategory created successfully', 201);
  } catch (error) {
    console.error('Create subcategory error:', error);
    return errorResponse(res, 'Failed to create subcategory', 500);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  getSubCategories,
  createSubCategory
};
