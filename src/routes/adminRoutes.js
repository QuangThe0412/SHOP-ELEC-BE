const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getRecentOrders,
  getTopSellingProducts,
  getRecentUsers,
  getRevenueChart
} = require('../controllers/adminController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorizeAdmin);

router.get('/stats', getDashboardStats);
router.get('/orders/recent', getRecentOrders);
router.get('/products/top-selling', getTopSellingProducts);
router.get('/users/recent', getRecentUsers);
router.get('/revenue/chart', getRevenueChart);

module.exports = router;
