const prisma = require('../lib/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { validateRequiredFields } = require('../utils/validation');

/**
 * Create new order
 * POST /api/orders
 */
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, customerInfo, paymentMethod } = req.body;

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

    let subtotal = 0;
    const orderItemsData = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId }
      });
      
      if (!product) {
        return errorResponse(res, `Product ${item.productId} not found`, 404, 'PRODUCT_NOT_FOUND');
      }

      if (product.stock < item.quantity) {
        return errorResponse(res, `Insufficient stock for ${product.name}`, 400, 'INSUFFICIENT_STOCK');
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItemsData.push({
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.image
      });
    }

    const shippingFee = subtotal > 500000 ? 0 : 30000;
    const total = subtotal + shippingFee;

    // Create order with items and timeline
    const newOrder = await prisma.order.create({
      data: {
        userId,
        orderCode: `ORD-${Date.now()}`,
        subtotal,
        shippingFee,
        total,
        status: 'pending',
        paymentMethod,
        paymentStatus: 'pending',
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        address: customerInfo.address,
        city: customerInfo.city,
        district: customerInfo.district || null,
        items: {
          create: orderItemsData.map(item => ({
            ...item,
            subtotal: item.price * item.quantity
          }))
        },
        timeline: {
          create: [
            {
              status: 'pending',
              description: 'Đơn hàng đã được tạo'
            }
          ]
        }
      },
      include: {
        items: true,
        timeline: true
      }
    });

    // Clear user's cart
    await prisma.cartItem.deleteMany({
      where: { userId }
    });

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
const getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page = 1, limit = 10 } = req.query;

    const where = { userId };
    if (status) {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
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
 * Get order by ID
 * GET /api/orders/:orderId
 */
const getOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        timeline: true,
        user: {
          select: { id: true, email: true, name: true }
        }
      }
    });

    if (!order) {
      return errorResponse(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
    }

    if (order.userId !== userId) {
      return errorResponse(res, 'Unauthorized', 403, 'UNAUTHORIZED');
    }

    return successResponse(res, { order });

  } catch (error) {
    console.error('Get order error:', error);
    return errorResponse(res, 'Failed to get order', 500);
  }
};

/**
 * Update order status
 * PUT /api/orders/:orderId/status
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
 * Cancel order
 * DELETE /api/orders/:orderId
 */
const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return errorResponse(res, 'Order not found', 404, 'ORDER_NOT_FOUND');
    }

    if (order.userId !== userId) {
      return errorResponse(res, 'Unauthorized', 403, 'UNAUTHORIZED');
    }

    if (order.status !== 'pending') {
      return errorResponse(res, 'Can only cancel pending orders', 400, 'CANNOT_CANCEL_ORDER');
    }

    const cancelledOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: 'cancelled' },
      include: {
        items: true,
        timeline: true
      }
    });

    await prisma.orderTimeline.create({
      data: {
        orderId,
        status: 'cancelled',
        description: 'Order has been cancelled'
      }
    });

    return successResponse(res, { order: cancelledOrder }, 'Order cancelled successfully');

  } catch (error) {
    console.error('Cancel order error:', error);
    return errorResponse(res, 'Failed to cancel order', 500);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder
};
