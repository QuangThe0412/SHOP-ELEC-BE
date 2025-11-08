const { orders, products, users } = require('../data/mockData');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get admin dashboard statistics
 * GET /api/admin/stats
 */
const getDashboardStats = (req, res) => {
  try {
    // Calculate total revenue
    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((sum, o) => sum + o.total, 0);

    // Count orders by status
    const orderStats = {
      total: orders.length,
      pending: orders.filter(o => o.status === 'pending').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      shipping: orders.filter(o => o.status === 'shipping').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };

    // Product statistics
    const productStats = {
      total: products.length,
      inStock: products.filter(p => p.stock > 0).length,
      outOfStock: products.filter(p => p.stock === 0).length,
      lowStock: products.filter(p => p.stock > 0 && p.stock < 10).length
    };

    // User statistics
    const userStats = {
      total: users.length,
      customers: users.filter(u => u.role === 'customer').length,
      admins: users.filter(u => u.role === 'admin').length
    };

    return successResponse(res, {
      revenue: {
        total: totalRevenue,
        thisMonth: 0 // Calculate based on date filter
      },
      orders: orderStats,
      products: productStats,
      users: userStats
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return errorResponse(res, 'Failed to get dashboard statistics', 500);
  }
};

/**
 * Get recent orders
 * GET /api/admin/orders/recent
 */
const getRecentOrders = (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentOrders = [...orders]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, Number(limit));

    return successResponse(res, { orders: recentOrders });

  } catch (error) {
    console.error('Get recent orders error:', error);
    return errorResponse(res, 'Failed to get recent orders', 500);
  }
};

/**
 * Get top selling products
 * GET /api/admin/products/top-selling
 */
const getTopSellingProducts = (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Calculate product sales
    const productSales = {};
    
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            productId: item.productId,
            name: item.name,
            totalSold: 0,
            revenue: 0
          };
        }
        productSales[item.productId].totalSold += item.quantity;
        productSales[item.productId].revenue += item.price * item.quantity;
      });
    });

    // Convert to array and sort
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, Number(limit));

    return successResponse(res, { products: topProducts });

  } catch (error) {
    console.error('Get top selling products error:', error);
    return errorResponse(res, 'Failed to get top selling products', 500);
  }
};

/**
 * Get recent users
 * GET /api/admin/users/recent
 */
const getRecentUsers = (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const recentUsers = [...users]
      .filter(u => u.role === 'customer')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, Number(limit))
      .map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        createdAt: u.createdAt
      }));

    return successResponse(res, { users: recentUsers });

  } catch (error) {
    console.error('Get recent users error:', error);
    return errorResponse(res, 'Failed to get recent users', 500);
  }
};

/**
 * Get revenue chart data
 * GET /api/admin/revenue/chart
 */
const getRevenueChart = (req, res) => {
  try {
    const { period = 'week' } = req.query; // week, month, year

    // Generate mock revenue data for the chart
    const chartData = [];
    const now = new Date();

    if (period === 'week') {
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        
        const dayOrders = orders.filter(o => {
          const orderDate = new Date(o.createdAt);
          return orderDate.toDateString() === date.toDateString();
        });

        const revenue = dayOrders.reduce((sum, o) => sum + o.total, 0);

        chartData.push({
          date: date.toISOString().split('T')[0],
          revenue,
          orders: dayOrders.length
        });
      }
    }

    return successResponse(res, { chartData, period });

  } catch (error) {
    console.error('Get revenue chart error:', error);
    return errorResponse(res, 'Failed to get revenue chart', 500);
  }
};

module.exports = {
  getDashboardStats,
  getRecentOrders,
  getTopSellingProducts,
  getRecentUsers,
  getRevenueChart
};
