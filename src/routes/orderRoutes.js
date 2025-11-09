const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

/**
 * @swagger
 * /api/orders:
 *   post:
 *     summary: Tạo đơn hàng mới
 *     tags: [Order Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - items
 *               - customerInfo
 *               - paymentMethod
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *               customerInfo:
 *                 type: object
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo đơn hàng thành công
 *       400:
 *         description: Lỗi validation
 */
router.post('/', authenticate, createOrder);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Lấy danh sách đơn hàng của người dùng
 *     tags: [Order Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 */
router.get('/', authenticate, getOrders);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Lấy chi tiết đơn hàng
 *     tags: [Order Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết đơn hàng
 *       404:
 *         description: Đơn hàng không tìm thấy
 */
router.get('/:orderId', authenticate, getOrderById);

/**
 * @swagger
 * /api/orders/{orderId}/status:
 *   put:
 *     summary: Cập nhật trạng thái đơn hàng
 *     tags: [Order Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
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
 *               status:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 */
router.put('/:orderId/status', authenticate, authorizeAdmin, updateOrderStatus);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   delete:
 *     summary: Hủy đơn hàng
 *     tags: [Order Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hủy đơn hàng thành công
 *       400:
 *         description: Không thể hủy đơn hàng
 */
router.delete('/:orderId', authenticate, cancelOrder);

module.exports = router;
