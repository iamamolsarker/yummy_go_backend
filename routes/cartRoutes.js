const express = require('express');
const router = express.Router();
const cartController = require('../Controllers/cartController');
const { verifyJWT } = require('../middleware/auth');
const { verifyAdmin } = require('../middleware/roleAuth');

// Admin-only routes
// GET: Get all carts (admin function)
router.get('/', verifyJWT, verifyAdmin, cartController.getAllCarts);

// User cart routes (authenticated users only)
// POST: Create a new cart
router.post('/', verifyJWT, cartController.createCart);

// GET: Get cart by user email (user can only access their own cart)
router.get('/user/:userEmail', verifyJWT, cartController.getCartByUserEmail);

// GET: Get cart by ID (user can only access their own cart)
router.get('/:cartId', verifyJWT, cartController.getCartById);

// POST: Add item to cart
router.post('/:cartId/items', verifyJWT, cartController.addItemToCart);

// PATCH: Update item quantity in cart
router.patch('/:cartId/items/:menuId/quantity', verifyJWT, cartController.updateItemQuantity);

// DELETE: Remove item from cart
router.delete('/:cartId/items/:menuId', verifyJWT, cartController.removeItemFromCart);

// DELETE: Clear all items from cart
router.delete('/:cartId/clear', verifyJWT, cartController.clearCart);

// DELETE: Delete cart
router.delete('/:cartId', verifyJWT, cartController.deleteCart);

// PATCH: Update cart status
router.patch('/:cartId/status', verifyJWT, cartController.updateCartStatus);

module.exports = router;