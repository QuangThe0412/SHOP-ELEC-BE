const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  trackOrder,
  updateOrderStatus,
  getAllOrders
} = require('../controllers/orderController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Public route
router.get('/track/:orderCode', trackOrder);

// Protected routes
router.post('/', authenticate, createOrder);
router.get('/', authenticate, getUserOrders);
router.get('/:orderId', authenticate, getOrderById);

// Admin routes
router.get('/admin/all', authenticate, authorizeAdmin, getAllOrders);
router.put('/:orderId/status', authenticate, authorizeAdmin, updateOrderStatus);

module.exports = router;
