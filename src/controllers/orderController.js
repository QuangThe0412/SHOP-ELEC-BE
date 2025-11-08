const { orders, orderCounter, products, carts } = require('../data/mockData');
const { successResponse, errorResponse } = require('../utils/response');
const { validateRequiredFields } = require('../utils/validation');

/**
 * Create new order
 * POST /api/orders
 */
const createOrder = (req, res) => {
  try {
    const userId = req.user.id;
    const { items, customerInfo, paymentMethod } = req.body;

    // Validate required fields
    const customerFields = ['name', 'email', 'phone', 'address', 'city'];
    const missing = validateRequiredFields(customerInfo || {}, customerFields);
    
    if (missing) {
      return errorResponse(res, `Missing customer info: ${missing.join(', ')}`, 400, 'MISSING_FIELDS');
    }

    if (!items || items.length === 0) {
      return errorResponse(res, 'Order must have at least one item', 400, 'EMPTY_ORDER');
    }

    if (!paymentMethod || !['cod', 'transfer', 'card'].includes(paymentMethod)) {
      return errorResponse(res, 'Invalid payment method', 400, 'INVALID_PAYMENT_METHOD');
    }

    // Validate items and calculate total
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = products.find(p => p.id === item.productId);
      
      if (!product) {
        return errorResponse(res, `Product ${item.productId} not found`, 404, 'PRODUCT_NOT_FOUND');
      }

      if (product.stock < item.quantity) {
        return errorResponse(res, `Insufficient stock for ${product.name}`, 400, 'INSUFFICIENT_STOCK');
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });

      // Update stock (in real app, use transactions)
      product.stock -= item.quantity;
    }

    const shippingFee = subtotal > 500000 ? 0 : 30000;
    const total = subtotal + shippingFee;

    // Generate order code
    const orderCode = `ORD${String(orderCounter).padStart(6, '0')}`;
    orderCounter++;

    // Create order
    const newOrder = {
      id: `order-${Date.now()}`,
      userId,
      orderCode,
      items: orderItems,
      subtotal,
      shippingFee,
      total,
      status: 'pending',
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
      customerInfo,
      timeline: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          description: 'Đơn hàng đã được tạo'
        }
      ],
      createdAt: new Date().toISOString()
    };

    orders.push(newOrder);

    // Clear user's cart
    if (carts[userId]) {
      carts[userId] = [];
    }

    return successResponse(res, { order: newOrder }, 'Order created successfully', 201);

  } catch (error) {
    console.error('Create order error:', error);
    return errorResponse(res, 'Failed to create order', 500);
  }
};

/**
 * Get user's orders
 * GET /api/orders
 */
const getUserOrders = (req, res) => {
  try {
    const userId = req.user.id;
    const userOrders = orders.filter(o => o.userId === userId);

    // Sort by creation date (newest first)
    userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return successResponse(res, { orders: userOrders });

  } catch (error) {
    console.error('Get orders error:', error);
    return errorResponse(res, 'Failed to get orders', 500);
  }
};

/**
 * Get order by ID
 * GET /api/orders/:orderId
 */
const getOrderById = (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const order = orders.find(o => o.id === orderId);

    if (!order) {
      return errorResponse(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
    }

    // Check authorization (user can only see their own orders, admin can see all)
    if (order.userId !== userId && userRole !== 'admin') {
      return errorResponse(res, 'Access denied', 403, 'FORBIDDEN');
    }

    return successResponse(res, { order });

  } catch (error) {
    console.error('Get order error:', error);
    return errorResponse(res, 'Failed to get order', 500);
  }
};

/**
 * Track order by order code (public)
 * GET /api/orders/track/:orderCode
 */
const trackOrder = (req, res) => {
  try {
    const { orderCode } = req.params;
    const order = orders.find(o => o.orderCode === orderCode);

    if (!order) {
      return errorResponse(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
    }

    // Return limited info for tracking
    const trackingInfo = {
      orderCode: order.orderCode,
      status: order.status,
      timeline: order.timeline,
      createdAt: order.createdAt
    };

    return successResponse(res, { tracking: trackingInfo });

  } catch (error) {
    console.error('Track order error:', error);
    return errorResponse(res, 'Failed to track order', 500);
  }
};

/**
 * Update order status (Admin only)
 * PUT /api/orders/:orderId/status
 */
const updateOrderStatus = (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, description } = req.body;

    const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return errorResponse(res, 'Invalid status', 400, 'INVALID_STATUS');
    }

    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) {
      return errorResponse(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
    }

    // Update status
    orders[orderIndex].status = status;
    
    // Add timeline entry
    orders[orderIndex].timeline.push({
      status,
      timestamp: new Date().toISOString(),
      description: description || `Đơn hàng ${status}`
    });

    // Update payment status if delivered
    if (status === 'delivered' && orders[orderIndex].paymentMethod === 'cod') {
      orders[orderIndex].paymentStatus = 'paid';
    }

    return successResponse(res, { order: orders[orderIndex] }, 'Order status updated successfully');

  } catch (error) {
    console.error('Update order status error:', error);
    return errorResponse(res, 'Failed to update order status', 500);
  }
};

/**
 * Get all orders (Admin only)
 * GET /api/orders/admin/all
 */
const getAllOrders = (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let filteredOrders = [...orders];

    // Filter by status
    if (status) {
      filteredOrders = filteredOrders.filter(o => o.status === status);
    }

    // Sort by creation date (newest first)
    filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const pageNum = Number(page);
    const limitNum = Number(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

    return successResponse(res, {
      orders: paginatedOrders,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(filteredOrders.length / limitNum),
        totalOrders: filteredOrders.length,
        hasMore: endIndex < filteredOrders.length
      }
    });

  } catch (error) {
    console.error('Get all orders error:', error);
    return errorResponse(res, 'Failed to get orders', 500);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  trackOrder,
  updateOrderStatus,
  getAllOrders
};
