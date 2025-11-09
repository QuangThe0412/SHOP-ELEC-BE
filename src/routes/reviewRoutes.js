const express = require('express');
const router = express.Router();
const {
  getProductReviews,
  createReview,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { authenticate } = require('../middleware/auth');

/**
 * @swagger
 * /api/reviews/products/{productId}:
 *   get:
 *     summary: Lấy danh sách đánh giá của sản phẩm
 *     tags: [Product Reviews]
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách đánh giá
 */
router.get('/products/:productId/reviews', getProductReviews);

/**
 * @swagger
 * /api/reviews:
 *   post:
 *     summary: Tạo đánh giá mới
 *     tags: [Product Reviews]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productId
 *               - rating
 *               - comment
 *             properties:
 *               productId:
 *                 type: string
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo đánh giá thành công
 *       400:
 *         description: Lỗi validation
 */
router.post('/', authenticate, createReview);

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   put:
 *     summary: Cập nhật đánh giá
 *     tags: [Product Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
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
 *               rating:
 *                 type: number
 *               comment:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật đánh giá thành công
 */
router.put('/:reviewId', authenticate, updateReview);

/**
 * @swagger
 * /api/reviews/{reviewId}:
 *   delete:
 *     summary: Xóa đánh giá
 *     tags: [Product Reviews]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: reviewId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa đánh giá thành công
 */
router.delete('/:reviewId', authenticate, deleteReview);

module.exports = router;
