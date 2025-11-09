const prisma = require('../lib/prisma');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get admin dashboard
 * GET /api/admin/dashboard
 */
const getDashboard = async (req, res) => {
  try {
    // Get statistics
    const totalUsers = await prisma.user.count();
    const totalProducts = await prisma.product.count();
    const totalOrders = await prisma.order.count();
    const totalRevenue = await prisma.order.aggregate({
      _sum: { total: true },
      where: { status: 'delivered' }
    });

    const recentOrders = await prisma.order.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { name: true }
        },
        items: true
      }
    });

    const topProducts = await prisma.product.findMany({
      orderBy: { reviewCount: 'desc' },
      take: 5,
      select: {
        id: true,
        name: true,
        price: true,
        rating: true,
        reviewCount: true,
        stock: true,
        image: true
      }
    });

    return successResponse(res, {
      dashboard: {
        statistics: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: totalRevenue._sum.total || 0
        },
        recentOrders,
        topProducts
      }
    });

  } catch (error) {
    console.error('Get dashboard error:', error);
    return errorResponse(res, 'Failed to get dashboard', 500);
  }
};

/**
 * Get all users
 * GET /api/admin/users
 */
const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;

    const where = {};
    if (role) {
      where.role = role;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: {
          select: { orders: true, reviews: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.user.count({ where });

    return successResponse(res, {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    return errorResponse(res, 'Failed to get users', 500);
  }
};

/**
 * Get all orders
 * GET /api/admin/orders
 */
const getOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: { name: true, email: true }
        },
        items: true,
        timeline: true
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.order.count({ where });

    return successResponse(res, {
      orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    return errorResponse(res, 'Failed to get orders', 500);
  }
};

/**
 * Update order status
 * PUT /api/admin/orders/:orderId/status
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, description } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return errorResponse(res, 'Invalid status', 400, 'INVALID_STATUS');
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return errorResponse(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: {
        items: true,
        timeline: true
      }
    });

    // Add timeline entry
    await prisma.orderTimeline.create({
      data: {
        orderId,
        status,
        description: description || `Order status updated to ${status}`
      }
    });

    return successResponse(res, { order: updatedOrder }, 'Order status updated successfully');

  } catch (error) {
    console.error('Update order error:', error);
    return errorResponse(res, 'Failed to update order', 500);
  }
};

/**
 * Get products
 * GET /api/admin/products
 */
const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;

    const where = {};
    if (category) {
      where.categoryId = category;
    }
    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: { name: true }
        },
        _count: {
          select: { reviews: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: parseInt(limit)
    });

    const total = await prisma.product.count({ where });

    return successResponse(res, {
      products,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    return errorResponse(res, 'Failed to get products', 500);
  }
};

/**
 * Update product
 * PUT /api/admin/products/:productId
 */
const updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, description, price, originalPrice, stock, categoryId, subCategoryId } = req.body;

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return errorResponse(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: {
        name: name || product.name,
        description: description || product.description,
        price: price || product.price,
        originalPrice: originalPrice || product.originalPrice,
        stock: stock !== undefined ? stock : product.stock,
        categoryId: categoryId || product.categoryId,
        subCategoryId: subCategoryId || product.subCategoryId
      },
      include: {
        category: true,
        images: true
      }
    });

    return successResponse(res, { product: updatedProduct }, 'Product updated successfully');

  } catch (error) {
    console.error('Update product error:', error);
    return errorResponse(res, 'Failed to update product', 500);
  }
};

/**
 * Delete product
 * DELETE /api/admin/products/:productId
 */
const deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        _count: {
          select: { reviews: true, orderItems: true }
        }
      }
    });

    if (!product) {
      return errorResponse(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    if (product._count.orderItems > 0) {
      return errorResponse(res, 'Cannot delete product with orders', 400, 'PRODUCT_HAS_ORDERS');
    }

    // Delete associated images and reviews
    await prisma.productImage.deleteMany({
      where: { productId }
    });

    await prisma.review.deleteMany({
      where: { productId }
    });

    await prisma.product.delete({
      where: { id: productId }
    });

    return successResponse(res, null, 'Product deleted successfully');

  } catch (error) {
    console.error('Delete product error:', error);
    return errorResponse(res, 'Failed to delete product', 500);
  }
};

/**
 * Get sales analytics
 * GET /api/admin/analytics/sales
 */
const getSalesAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {
      status: 'delivered'
    };

    if (startDate) {
      where.createdAt = { gte: new Date(startDate) };
    }
    if (endDate) {
      if (!where.createdAt) {
        where.createdAt = {};
      }
      where.createdAt.lte = new Date(endDate);
    }

    const orders = await prisma.order.findMany({
      where,
      select: {
        total: true,
        createdAt: true,
        status: true
      }
    });

    const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return successResponse(res, {
      analytics: {
        totalSales,
        totalOrders,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100
      }
    });

  } catch (error) {
    console.error('Get sales analytics error:', error);
    return errorResponse(res, 'Failed to get analytics', 500);
  }
};

module.exports = {
  getDashboard,
  getUsers,
  getOrders,
  updateOrderStatus,
  getProducts,
  updateProduct,
  deleteProduct,
  getSalesAnalytics
};
