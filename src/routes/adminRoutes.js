const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getUsers,
  getOrders,
  updateOrderStatus,
  getProducts,
  updateProduct,
  deleteProduct,
  getSalesAnalytics
} = require('../controllers/adminController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorizeAdmin);

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     summary: Lấy thống kê dashboard
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thống kê dashboard
 */
router.get('/dashboard', getDashboard);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Lấy danh sách người dùng
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách người dùng
 */
router.get('/users', getUsers);

/**
 * @swagger
 * /api/admin/orders:
 *   get:
 *     summary: Lấy danh sách tất cả đơn hàng
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách đơn hàng
 */
router.get('/orders', getOrders);

/**
 * @swagger
 * /api/admin/orders/{orderId}/status:
 *   put:
 *     summary: Cập nhật trạng thái đơn hàng
 *     tags: [Admin Dashboard]
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
 *     responses:
 *       200:
 *         description: Cập nhật trạng thái thành công
 */
router.put('/orders/:orderId/status', updateOrderStatus);

/**
 * @swagger
 * /api/admin/products:
 *   get:
 *     summary: Lấy danh sách sản phẩm
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách sản phẩm
 */
router.get('/products', getProducts);

/**
 * @swagger
 * /api/admin/products/{productId}:
 *   put:
 *     summary: Cập nhật sản phẩm
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Cập nhật sản phẩm thành công
 */
router.put('/products/:productId', updateProduct);

/**
 * @swagger
 * /api/admin/products/{productId}:
 *   delete:
 *     summary: Xóa sản phẩm
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa sản phẩm thành công
 */
router.delete('/products/:productId', deleteProduct);

/**
 * @swagger
 * /api/admin/analytics/sales:
 *   get:
 *     summary: Lấy thống kê bán hàng
 *     tags: [Admin Dashboard]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thống kê bán hàng
 */
router.get('/analytics/sales', getSalesAnalytics);

module.exports = router;
