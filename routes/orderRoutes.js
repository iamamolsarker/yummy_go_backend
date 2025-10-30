const express = require('express');
const router = express.Router();
const orderController = require('../Controllers/orderController');

const { verifyJWT } = require('../middleware/auth');
const { verifyAdmin, verifyActiveUser, verifyRole } = require('../middleware/roleAuth');

// User routes (authenticated and active users)
// POST: Create a new order from cart
router.post('/', verifyJWT, verifyActiveUser, orderController.createOrder);

// GET: Get orders by user email (user can see their own orders)
router.get('/user/:userEmail', verifyJWT, verifyActiveUser, orderController.getOrdersByUserEmail);

// GET: Get order by order number (user can track their own orders)
router.get('/number/:orderNumber', verifyJWT, orderController.getOrderByNumber);

// GET: Get order by ID (user can see their own orders)
router.get('/:orderId', verifyJWT, orderController.getOrderById);

// PATCH: Cancel order (user can cancel their own pending orders)
router.patch('/:orderId/cancel', verifyJWT, verifyActiveUser, orderController.cancelOrder);

// Restaurant owner routes
// GET: Get orders by restaurant ID (restaurant owner can see their restaurant's orders)
router.get('/restaurant/:restaurantId', verifyJWT, verifyRole(['admin', 'restaurant_owner']), orderController.getOrdersByRestaurantId);

// PATCH: Update order status (restaurant owner can update order status)
router.patch('/:orderId/status', verifyJWT, verifyRole(['admin', 'restaurant_owner']), orderController.updateOrderStatus);

// PATCH: Assign rider to order (restaurant owner or admin)
router.patch('/:orderId/rider', verifyJWT, verifyRole(['admin', 'restaurant_owner']), orderController.assignRider);

// PATCH: Update delivery time (restaurant owner can update estimated time)
router.patch('/:orderId/delivery-time', verifyJWT, verifyRole(['admin', 'restaurant_owner']), orderController.updateDeliveryTime);

// Rider routes
// GET: Get orders by rider ID (rider can see their assigned orders)
router.get('/rider/:riderId', verifyJWT, verifyRole(['admin', 'rider']), orderController.getOrdersByRiderId);

// Admin routes
// GET: Get all orders (admin function)
router.get('/', verifyJWT, verifyAdmin, orderController.getAllOrders);

// GET: Get order statistics (admin function)
router.get('/stats', verifyJWT, verifyAdmin, orderController.getOrderStats);

// GET: Get orders by status (admin can filter by any status)
router.get('/status/:status', verifyJWT, verifyAdmin, orderController.getOrdersByStatus);

// PATCH: Update payment status (admin or automated webhook)
router.patch('/:orderId/payment', verifyJWT, verifyAdmin, orderController.updatePaymentStatus);

// DELETE: Delete order (admin function)
router.delete('/:orderId', verifyJWT, verifyAdmin, orderController.deleteOrder);

module.exports = router;