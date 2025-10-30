const express = require('express');
const router = express.Router();
const deliveryController = require('../Controllers/deliveryController');
const { verifyJWT } = require('../middleware/auth');
const { verifyAdmin, verifyRider, verifyRole } = require('../middleware/roleAuth');

// Admin routes
// POST: Create a new delivery from order (admin or restaurant owner)
router.post('/', verifyJWT, verifyRole(['admin', 'restaurant_owner']), deliveryController.createDelivery);

// GET: Get all deliveries (admin function)
router.get('/', verifyJWT, verifyAdmin, deliveryController.getAllDeliveries);

// GET: Get delivery statistics (admin function)
router.get('/stats', verifyJWT, verifyAdmin, deliveryController.getDeliveryStats);

// GET: Get active deliveries (admin or restaurant owner)
router.get('/active', verifyJWT, verifyRole(['admin', 'restaurant_owner']), deliveryController.getActiveDeliveries);

// GET: Get deliveries by status (admin only)
router.get('/status/:status', verifyJWT, verifyAdmin, deliveryController.getDeliveriesByStatus);

// DELETE: Delete delivery (admin function)
router.delete('/:deliveryId', verifyJWT, verifyAdmin, deliveryController.deleteDelivery);

// User routes (customer tracking their delivery)
// GET: Get deliveries by user email (user can track their own deliveries)
router.get('/user/:userEmail', verifyJWT, deliveryController.getDeliveriesByUserEmail);

// GET: Get delivery by order ID (user can track by order ID)
router.get('/order/:orderId', verifyJWT, deliveryController.getDeliveryByOrderId);

// GET: Get delivery by ID (user can track by delivery ID)
router.get('/:deliveryId', verifyJWT, deliveryController.getDeliveryById);

// PATCH: Add customer rating (customer can rate after delivery)
router.patch('/:deliveryId/rating', verifyJWT, deliveryController.addCustomerRating);

// Rider routes
// GET: Get deliveries by rider ID (rider can see their assigned deliveries)
router.get('/rider/:riderId', verifyJWT, verifyRider, deliveryController.getDeliveriesByRiderId);

// GET: Get rider delivery statistics (rider can see their own stats)
router.get('/rider/:riderId/stats', verifyJWT, verifyRider, deliveryController.getRiderDeliveryStats);

// PATCH: Update delivery status (rider updates status during delivery)
router.patch('/:deliveryId/status', verifyJWT, verifyRider, deliveryController.updateDeliveryStatus);

// PATCH: Update rider location (rider updates location in real-time)
router.patch('/:deliveryId/location', verifyJWT, verifyRider, deliveryController.updateRiderLocation);

// PATCH: Update estimated times (rider or restaurant owner can update)
router.patch('/:deliveryId/times', verifyJWT, verifyRole(['admin', 'restaurant_owner', 'rider']), deliveryController.updateEstimatedTimes);

// PATCH: Update delivery proof (rider uploads proof upon delivery)
router.patch('/:deliveryId/proof', verifyJWT, verifyRider, deliveryController.updateDeliveryProof);

// PATCH: Cancel delivery (admin, restaurant owner, or rider can cancel)
router.patch('/:deliveryId/cancel', verifyJWT, verifyRole(['admin', 'restaurant_owner', 'rider']), deliveryController.cancelDelivery);

// POST: Add delivery issue (rider reports issues)
router.post('/:deliveryId/issues', verifyJWT, verifyRider, deliveryController.addDeliveryIssue);

module.exports = router;