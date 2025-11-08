const { carts, products } = require('../data/mockData');
const { successResponse, errorResponse } = require('../utils/response');

/**
 * Get user's cart
 * GET /api/cart
 */
const getCart = (req, res) => {
  try {
    const userId = req.user.id;
    const userCart = carts[userId] || [];

    // Populate product details
    const cartWithDetails = userCart.map(item => {
      const product = products.find(p => p.id === item.productId);
      return {
        ...item,
        product: product ? {
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          stock: product.stock
        } : null
      };
    });

    // Calculate totals
    const subtotal = cartWithDetails.reduce((sum, item) => {
      return sum + (item.product ? item.product.price * item.quantity : 0);
    }, 0);

    const shippingFee = subtotal > 500000 ? 0 : 30000; // Free shipping over 500k
    const total = subtotal + shippingFee;

    return successResponse(res, {
      items: cartWithDetails,
      summary: {
        subtotal,
        shippingFee,
        total,
        itemCount: cartWithDetails.length
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
const addToCart = (req, res) => {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return errorResponse(res, 'Product ID is required', 400, 'MISSING_PRODUCT_ID');
    }

    // Check if product exists
    const product = products.find(p => p.id === productId);
    if (!product) {
      return errorResponse(res, 'Product not found', 404, 'PRODUCT_NOT_FOUND');
    }

    // Check stock
    if (product.stock < quantity) {
      return errorResponse(res, 'Insufficient stock', 400, 'INSUFFICIENT_STOCK');
    }

    // Initialize cart if not exists
    if (!carts[userId]) {
      carts[userId] = [];
    }

    // Check if item already in cart
    const existingItemIndex = carts[userId].findIndex(item => item.productId === productId);

    if (existingItemIndex !== -1) {
      // Update quantity
      const newQuantity = carts[userId][existingItemIndex].quantity + quantity;
      
      if (newQuantity > product.stock) {
        return errorResponse(res, 'Insufficient stock', 400, 'INSUFFICIENT_STOCK');
      }

      carts[userId][existingItemIndex].quantity = newQuantity;
    } else {
      // Add new item
      carts[userId].push({
        id: `cart-item-${Date.now()}`,
        productId,
        userId,
        quantity,
        addedAt: new Date().toISOString()
      });
    }

    return successResponse(res, {
      cart: carts[userId]
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
const updateCartItem = (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return errorResponse(res, 'Quantity must be at least 1', 400, 'INVALID_QUANTITY');
    }

    if (!carts[userId]) {
      return errorResponse(res, 'Cart is empty', 404, 'CART_EMPTY');
    }

    const itemIndex = carts[userId].findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return errorResponse(res, 'Cart item not found', 404, 'ITEM_NOT_FOUND');
    }

    // Check stock
    const product = products.find(p => p.id === carts[userId][itemIndex].productId);
    if (product && product.stock < quantity) {
      return errorResponse(res, 'Insufficient stock', 400, 'INSUFFICIENT_STOCK');
    }

    carts[userId][itemIndex].quantity = quantity;

    return successResponse(res, {
      item: carts[userId][itemIndex]
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
const removeCartItem = (req, res) => {
  try {
    const userId = req.user.id;
    const { itemId } = req.params;

    if (!carts[userId]) {
      return errorResponse(res, 'Cart is empty', 404, 'CART_EMPTY');
    }

    const itemIndex = carts[userId].findIndex(item => item.id === itemId);
    if (itemIndex === -1) {
      return errorResponse(res, 'Cart item not found', 404, 'ITEM_NOT_FOUND');
    }

    carts[userId].splice(itemIndex, 1);

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
const clearCart = (req, res) => {
  try {
    const userId = req.user.id;
    carts[userId] = [];

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
