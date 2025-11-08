const { categories } = require('../data/mockData');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get all categories
 * GET /api/categories
 */
const getAllCategories = (req, res) => {
  try {
    return successResponse(res, { categories });
  } catch (error) {
    console.error('Get categories error:', error);
    return errorResponse(res, 'Failed to get categories', 500);
  }
};

/**
 * Get category by ID
 * GET /api/categories/:categoryId
 */
const getCategoryById = (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = categories.find(c => c.id === categoryId || c.slug === categoryId);

    if (!category) {
      return errorResponse(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    return successResponse(res, { category });
  } catch (error) {
    console.error('Get category error:', error);
    return errorResponse(res, 'Failed to get category', 500);
  }
};

/**
 * Create new category (Admin only)
 * POST /api/categories
 */
const createCategory = (req, res) => {
  try {
    const { name, slug, icon, subCategories = [] } = req.body;

    if (!name || !slug) {
      return errorResponse(res, 'Name and slug are required', 400, 'MISSING_FIELDS');
    }

    const newCategory = {
      id: `cat-${Date.now()}`,
      name,
      slug,
      icon: icon || '📦',
      subCategories,
      itemCount: 0
    };

    categories.push(newCategory);

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
const updateCategory = (req, res) => {
  try {
    const { categoryId } = req.params;
    const categoryIndex = categories.findIndex(c => c.id === categoryId);

    if (categoryIndex === -1) {
      return errorResponse(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    categories[categoryIndex] = {
      ...categories[categoryIndex],
      ...req.body,
      id: categoryId // Prevent ID change
    };

    return successResponse(res, { category: categories[categoryIndex] }, 'Category updated successfully');
  } catch (error) {
    console.error('Update category error:', error);
    return errorResponse(res, 'Failed to update category', 500);
  }
};

/**
 * Delete category (Admin only)
 * DELETE /api/categories/:categoryId
 */
const deleteCategory = (req, res) => {
  try {
    const { categoryId } = req.params;
    const categoryIndex = categories.findIndex(c => c.id === categoryId);

    if (categoryIndex === -1) {
      return errorResponse(res, 'Category not found', 404, 'CATEGORY_NOT_FOUND');
    }

    categories.splice(categoryIndex, 1);

    return successResponse(res, null, 'Category deleted successfully');
  } catch (error) {
    console.error('Delete category error:', error);
    return errorResponse(res, 'Failed to delete category', 500);
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
};
