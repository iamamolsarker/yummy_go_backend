const Cart = require('../models/Cart');
const Menu = require('../models/Menu');
const Restaurant = require('../models/Restaurant');
const { sendSuccess, sendError, sendCreated, sendNotFound, sendBadRequest } = require('../utils/responseHelper');

// Create a new cart
const createCart = async (req, res) => {
  try {
    const { user_email, restaurant_id } = req.body;

    // Basic validation
    if (!user_email || !restaurant_id) {
      return sendBadRequest(res, 'User email and restaurant ID are required');
    }

    // Check if user already has an active cart
    const existingCart = await Cart.findByUserEmail(user_email);
    if (existingCart) {
      return sendBadRequest(res, 'User already has an active cart');
    }

    // Verify restaurant exists
    const restaurant = await Restaurant.findById(restaurant_id);
    if (!restaurant) {
      return sendNotFound(res, 'Restaurant not found');
    }

    // Create new cart
    const cartData = {
      user_email,
      restaurant_id
    };

    const result = await Cart.create(cartData);

    return sendCreated(res, {
      cartId: result.insertedId,
      cart: cartData
    }, 'Cart created successfully');

  } catch (error) {
    console.error('Error creating cart:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get cart by user email
const getCartByUserEmail = async (req, res) => {
  try {
    const { userEmail } = req.params;

    if (!userEmail) {
      return sendBadRequest(res, 'User email is required');
    }

    const cart = await Cart.findByUserEmail(userEmail);
    if (!cart) {
      return sendNotFound(res, 'Cart not found');
    }

    return sendSuccess(res, cart, 'Cart retrieved successfully');

  } catch (error) {
    console.error('Error retrieving cart:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get cart by ID
const getCartById = async (req, res) => {
  try {
    const { cartId } = req.params;

    if (!cartId) {
      return sendBadRequest(res, 'Cart ID is required');
    }

    const cart = await Cart.findById(cartId);
    if (!cart) {
      return sendNotFound(res, 'Cart not found');
    }

    return sendSuccess(res, cart, 'Cart retrieved successfully');

  } catch (error) {
    console.error('Error retrieving cart:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Add item to cart
const addItemToCart = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { menu_id, quantity, price, notes } = req.body;

    // Basic validation
    if (!cartId || !menu_id || !quantity || !price) {
      return sendBadRequest(res, 'Cart ID, menu ID, quantity, and price are required');
    }

    if (quantity <= 0) {
      return sendBadRequest(res, 'Quantity must be greater than 0');
    }

    // Check if cart exists
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return sendNotFound(res, 'Cart not found');
    }

    // Verify menu item exists
    const menuItem = await Menu.findById(menu_id);
    if (!menuItem) {
      return sendNotFound(res, 'Menu item not found');
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(item => 
      item.menu_id.toString() === menu_id
    );

    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      const newQuantity = cart.items[existingItemIndex].quantity + quantity;
      const result = await Cart.updateItemQuantity(cartId, menu_id, newQuantity);
      
      if (result.modifiedCount === 0) {
        return sendError(res, 'Failed to update item quantity', 400);
      }
    } else {
      // Add new item to cart
      const item = {
        menu_id: menuItem._id,
        name: menuItem.name,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        notes: notes || null,
        subtotal: parseFloat(price) * parseInt(quantity)
      };

      const result = await Cart.addItem(cartId, item);
      
      if (result.modifiedCount === 0) {
        return sendError(res, 'Failed to add item to cart', 400);
      }
    }

    // Calculate and update total amount
    const updatedCart = await Cart.findById(cartId);
    const totalAmount = updatedCart.items.reduce((total, item) => total + item.subtotal, 0);
    await Cart.updateTotalAmount(cartId, totalAmount);

    return sendSuccess(res, { 
      message: 'Item added to cart successfully',
      cartId: cartId 
    });

  } catch (error) {
    console.error('Error adding item to cart:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Update item quantity in cart
const updateItemQuantity = async (req, res) => {
  try {
    const { cartId, menuId } = req.params;
    const { quantity } = req.body;

    // Basic validation
    if (!cartId || !menuId || quantity === undefined) {
      return sendBadRequest(res, 'Cart ID, menu ID, and quantity are required');
    }

    if (quantity < 0) {
      return sendBadRequest(res, 'Quantity cannot be negative');
    }

    // Check if cart exists
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return sendNotFound(res, 'Cart not found');
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      const result = await Cart.removeItem(cartId, menuId);
      if (result.modifiedCount === 0) {
        return sendError(res, 'Failed to remove item from cart', 400);
      }
    } else {
      // Update quantity
      const result = await Cart.updateItemQuantity(cartId, menuId, parseInt(quantity));
      if (result.modifiedCount === 0) {
        return sendError(res, 'Failed to update item quantity or item not found in cart', 400);
      }
    }

    // Calculate and update total amount
    const updatedCart = await Cart.findById(cartId);
    const totalAmount = updatedCart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    await Cart.updateTotalAmount(cartId, totalAmount);

    return sendSuccess(res, { 
      message: 'Item quantity updated successfully',
      cartId: cartId 
    });

  } catch (error) {
    console.error('Error updating item quantity:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Remove item from cart
const removeItemFromCart = async (req, res) => {
  try {
    const { cartId, menuId } = req.params;

    if (!cartId || !menuId) {
      return sendBadRequest(res, 'Cart ID and menu ID are required');
    }

    // Check if cart exists
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return sendNotFound(res, 'Cart not found');
    }

    // Remove item from cart
    const result = await Cart.removeItem(cartId, menuId);
    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to remove item from cart or item not found', 400);
    }

    // Calculate and update total amount
    const updatedCart = await Cart.findById(cartId);
    const totalAmount = updatedCart.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    await Cart.updateTotalAmount(cartId, totalAmount);

    return sendSuccess(res, { 
      message: 'Item removed from cart successfully',
      cartId: cartId 
    });

  } catch (error) {
    console.error('Error removing item from cart:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Clear all items from cart
const clearCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    if (!cartId) {
      return sendBadRequest(res, 'Cart ID is required');
    }

    // Check if cart exists
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return sendNotFound(res, 'Cart not found');
    }

    // Clear all items from cart
    const result = await Cart.clearCart(cartId);
    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to clear cart', 400);
    }

    return sendSuccess(res, { 
      message: 'Cart cleared successfully',
      cartId: cartId 
    });

  } catch (error) {
    console.error('Error clearing cart:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Delete cart
const deleteCart = async (req, res) => {
  try {
    const { cartId } = req.params;

    if (!cartId) {
      return sendBadRequest(res, 'Cart ID is required');
    }

    // Check if cart exists
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return sendNotFound(res, 'Cart not found');
    }

    // Delete cart
    const result = await Cart.deleteCart(cartId);
    if (result.deletedCount === 0) {
      return sendError(res, 'Failed to delete cart', 400);
    }

    return sendSuccess(res, { 
      message: 'Cart deleted successfully',
      cartId: cartId 
    });

  } catch (error) {
    console.error('Error deleting cart:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get all carts (admin function)
const getAllCarts = async (req, res) => {
  try {
    const carts = await Cart.findAllCarts();
    
    return sendSuccess(res, carts, 'All carts retrieved successfully');
    
  } catch (error) {
    console.error('Error retrieving all carts:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Update cart status
const updateCartStatus = async (req, res) => {
  try {
    const { cartId } = req.params;
    const { status } = req.body;

    if (!cartId || !status) {
      return sendBadRequest(res, 'Cart ID and status are required');
    }

    // Validate status
    const validStatuses = ['active', 'checkout', 'ordered', 'cancelled'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return sendBadRequest(res, 'Invalid status. Valid statuses are: ' + validStatuses.join(', '));
    }

    // Check if cart exists
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return sendNotFound(res, 'Cart not found');
    }

    // Update cart status
    const result = await Cart.changeCartStatus(cartId, status.toLowerCase());
    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to update cart status', 400);
    }

    return sendSuccess(res, { 
      updated: true, 
      cartId: cartId, 
      newStatus: status.toLowerCase() 
    }, 'Cart status updated successfully');

  } catch (error) {
    console.error('Error updating cart status:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

module.exports = {
  createCart,
  getCartByUserEmail,
  getCartById,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  clearCart,
  deleteCart,
  getAllCarts,
  updateCartStatus
};