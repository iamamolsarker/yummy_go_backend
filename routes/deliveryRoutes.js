const express = require('express');
const router = express.Router();
const deliveryController = require('../Controllers/deliveryController');

// POST: Create a new delivery from order
router.post('/', deliveryController.createDelivery);

// GET: Get all deliveries (admin function)
router.get('/', deliveryController.getAllDeliveries);

// GET: Get delivery statistics (admin function)
router.get('/stats', deliveryController.getDeliveryStats);

// GET: Get active deliveries
router.get('/active', deliveryController.getActiveDeliveries);

// GET: Get deliveries by status
router.get('/status/:status', deliveryController.getDeliveriesByStatus);

// GET: Get deliveries by user email
router.get('/user/:userEmail', deliveryController.getDeliveriesByUserEmail);

// GET: Get deliveries by rider ID
router.get('/rider/:riderId', deliveryController.getDeliveriesByRiderId);

// GET: Get rider delivery statistics
router.get('/rider/:riderId/stats', deliveryController.getRiderDeliveryStats);

// GET: Get delivery by order ID (must come before /:deliveryId)
router.get('/order/:orderId', deliveryController.getDeliveryByOrderId);

// GET: Get delivery by ID
router.get('/:deliveryId', deliveryController.getDeliveryById);

// PATCH: Update delivery status
router.patch('/:deliveryId/status', deliveryController.updateDeliveryStatus);

// PATCH: Update rider location
router.patch('/:deliveryId/location', deliveryController.updateRiderLocation);

// PATCH: Update estimated times
router.patch('/:deliveryId/times', deliveryController.updateEstimatedTimes);

// PATCH: Update delivery proof
router.patch('/:deliveryId/proof', deliveryController.updateDeliveryProof);

// PATCH: Add customer rating
router.patch('/:deliveryId/rating', deliveryController.addCustomerRating);

// PATCH: Cancel delivery
router.patch('/:deliveryId/cancel', deliveryController.cancelDelivery);

// POST: Add delivery issue
router.post('/:deliveryId/issues', deliveryController.addDeliveryIssue);

// DELETE: Delete delivery (admin function)
router.delete('/:deliveryId', deliveryController.deleteDelivery);

module.exports = router;