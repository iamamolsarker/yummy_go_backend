const express = require('express');
const router = express.Router();
const cartController = require('../Controllers/cartController');

// POST: Create a new cart
router.post('/', cartController.createCart);

// GET: Get all carts (admin function)
router.get('/', cartController.getAllCarts);

// GET: Get cart by user email
router.get('/user/:userEmail', cartController.getCartByUserEmail);

// GET: Get cart by ID
router.get('/:cartId', cartController.getCartById);

// POST: Add item to cart
router.post('/:cartId/items', cartController.addItemToCart);

// PATCH: Update item quantity in cart
router.patch('/:cartId/items/:menuId/quantity', cartController.updateItemQuantity);

// DELETE: Remove item from cart
router.delete('/:cartId/items/:menuId', cartController.removeItemFromCart);

// DELETE: Clear all items from cart
router.delete('/:cartId/clear', cartController.clearCart);

// DELETE: Delete cart
router.delete('/:cartId', cartController.deleteCart);

// PATCH: Update cart status
router.patch('/:cartId/status', cartController.updateCartStatus);

module.exports = router;