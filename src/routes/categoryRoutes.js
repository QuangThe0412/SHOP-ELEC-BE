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

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Lấy danh sách danh mục
 *     tags: [Category Management]
 *     responses:
 *       200:
 *         description: Danh sách danh mục
 */
router.get('/', getAllCategories);

/**
 * @swagger
 * /api/categories/{categoryId}:
 *   get:
 *     summary: Lấy chi tiết danh mục
 *     tags: [Category Management]
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết danh mục
 *       404:
 *         description: Danh mục không tìm thấy
 */
router.get('/:categoryId', getCategoryById);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Tạo danh mục mới
 *     tags: [Category Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               icon:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo danh mục thành công
 */
router.post('/', authenticate, authorizeAdmin, createCategory);

/**
 * @swagger
 * /api/categories/{categoryId}:
 *   put:
 *     summary: Cập nhật danh mục
 *     tags: [Category Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               slug:
 *                 type: string
 *               icon:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật danh mục thành công
 */
router.put('/:categoryId', authenticate, authorizeAdmin, updateCategory);

/**
 * @swagger
 * /api/categories/{categoryId}:
 *   delete:
 *     summary: Xóa danh mục
 *     tags: [Category Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa danh mục thành công
 *       400:
 *         description: Không thể xóa danh mục
 */
router.delete('/:categoryId', authenticate, authorizeAdmin, deleteCategory);

module.exports = router;
