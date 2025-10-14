const express = require('express');
const router = express.Router();
const orderController = require('../Controllers/orderController');

// POST: Create a new order from cart
router.post('/', orderController.createOrder);

// GET: Get all orders (admin function)
router.get('/', orderController.getAllOrders);

// GET: Get order statistics (admin function)
router.get('/stats', orderController.getOrderStats);

// GET: Get orders by status
router.get('/status/:status', orderController.getOrdersByStatus);

// GET: Get orders by user email
router.get('/user/:userEmail', orderController.getOrdersByUserEmail);

// GET: Get orders by restaurant ID
router.get('/restaurant/:restaurantId', orderController.getOrdersByRestaurantId);

// GET: Get orders by rider ID
router.get('/rider/:riderId', orderController.getOrdersByRiderId);

// GET: Get order by order number (must come before /:orderId)
router.get('/number/:orderNumber', orderController.getOrderByNumber);

// GET: Get order by ID
router.get('/:orderId', orderController.getOrderById);

// PATCH: Update order status
router.patch('/:orderId/status', orderController.updateOrderStatus);

// PATCH: Update payment status
router.patch('/:orderId/payment', orderController.updatePaymentStatus);

// PATCH: Assign rider to order
router.patch('/:orderId/rider', orderController.assignRider);

// PATCH: Update delivery time
router.patch('/:orderId/delivery-time', orderController.updateDeliveryTime);

// PATCH: Cancel order
router.patch('/:orderId/cancel', orderController.cancelOrder);

// DELETE: Delete order (admin function)
router.delete('/:orderId', orderController.deleteOrder);

module.exports = router;