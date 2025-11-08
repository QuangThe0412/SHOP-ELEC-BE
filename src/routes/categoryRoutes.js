const express = require('express');
const router = express.Router();
const {
  getAllCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getAllCategories);
router.get('/:categoryId', getCategoryById);

// Admin routes
router.post('/', authenticate, authorizeAdmin, createCategory);
router.put('/:categoryId', authenticate, authorizeAdmin, updateCategory);
router.delete('/:categoryId', authenticate, authorizeAdmin, deleteCategory);

module.exports = router;
