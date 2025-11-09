const prisma = require('../lib/prisma');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get user's cart
 * GET /api/cart
 */
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            image: true,
            stock: true,
          }
        }
      }
    });

    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (item.product ? item.product.price * item.quantity : 0);
    }, 0);

    const shippingFee = subtotal > 500000 ? 0 : 30000;
    const total = subtotal + shippingFee;

    return successResponse(res, {
      items: cartItems,
      summary: {
        subtotal,
        shippingFee,
        total,
        itemCount: cartItems.length
      }
    });

  } catch (error) {
    console.error('Get cart error:', error);
    return errorResponse(res, 'Failed to get cart', 500);
  }
};

/**
 * Add item to cart
 * POST /api/cart/items
 */
const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return errorResponse(res, 'Product ID is required', 400, 'MISSING_PRODUCT_ID');
    }

    const product = await prisma.product.findUnique({
      where: { id: productId }
    });

    if (!product) {
      return errorResponse(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    if (product.stock < quantity) {
      return errorResponse(res, 'Insufficient stock', 400, 'INSUFFICIENT_STOCK');
    }

    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId,
          productId
        }
      }
    });

    let cartItem;
    if (existingCartItem) {
      const newQuantity = existingCartItem.quantity + quantity;
      
      if (newQuantity > product.stock) {
        return errorResponse(res, 'Insufficient stock', 400, 'INSUFFICIENT_STOCK');
      }

      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: newQuantity },
        include: { product: true }
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId,
          productId,
          quantity
        },
        include: { product: true }
      });
    }

    return successResponse(res, {
      item: cartItem
    }, 'Item added to cart successfully', 201);

  } catch (error) {
    console.error('Add to cart error:', error);
    return errorResponse(res, 'Failed to add to cart', 500);
  }
};

/**
 * Update cart item quantity
 * PUT /api/cart/items/:itemId
 */
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return errorResponse(res, 'Quantity must be at least 1', 400, 'INVALID_QUANTITY');
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { product: true }
    });

    if (!cartItem) {
      return errorResponse(res, 'Cart item not found', 404, 'ITEM_NOT_FOUND');
    }

    if (cartItem.userId !== userId) {
      return errorResponse(res, 'Unauthorized', 403, 'UNAUTHORIZED');
    }

    if (cartItem.product.stock < quantity) {
      return errorResponse(res, 'Insufficient stock', 400, 'INSUFFICIENT_STOCK');
    }

    const updatedItem = await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity },
      include: { product: true }
    });

    return successResponse(res, {
      item: updatedItem
    }, 'Cart item updated successfully');

  } catch (error) {
    console.error('Update cart item error:', error);
    return errorResponse(res, 'Failed to update cart item', 500);
  }
};

/**
 * Remove item from cart
 * DELETE /api/cart/items/:itemId
 */
const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId }
    });

    if (!cartItem) {
      return errorResponse(res, 'Cart item not found', 404, 'ITEM_NOT_FOUND');
    }

    if (cartItem.userId !== userId) {
      return errorResponse(res, 'Unauthorized', 403, 'UNAUTHORIZED');
    }

    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    return successResponse(res, null, 'Cart item removed successfully');

  } catch (error) {
    console.error('Remove cart item error:', error);
    return errorResponse(res, 'Failed to remove cart item', 500);
  }
};

/**
 * Clear entire cart
 * DELETE /api/cart
 */
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    await prisma.cartItem.deleteMany({
      where: { userId }
    });
    return successResponse(res, null, 'Cart cleared successfully');
  } catch (error) {
    console.error('Clear cart error:', error);
    return errorResponse(res, 'Failed to clear cart', 500);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
