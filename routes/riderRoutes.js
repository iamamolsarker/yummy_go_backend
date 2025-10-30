const express = require('express');
const router = express.Router();
const riderController = require('../Controllers/riderController');
const { verifyJWT } = require('../middleware/auth');
const { verifyAdmin, verifyRider, verifyRole } = require('../middleware/roleAuth');

// Public routes
// GET: Get rider by ID (public for customer to see rider info)
router.get('/:id', riderController.getRiderById);

// Admin or Restaurant owner routes (for assigning riders)
// GET: Get all riders
router.get('/', verifyJWT, verifyRole(['admin', 'restaurant_owner']), riderController.getAllRiders);

// GET: Get available riders
router.get('/available', verifyJWT, verifyRole(['admin', 'restaurant_owner']), riderController.getAvailableRiders);

// Rider routes (rider managing their own profile)
// POST: Add a new rider (admin or self-registration)
router.post('/', riderController.createRider);

// GET: Get rider by email (rider checking own profile or admin)
router.get('/email/:email', verifyJWT, verifyRole(['admin', 'rider']), riderController.getRiderByEmail);

// PUT: Update rider (rider updating own profile or admin)
router.put('/:id', verifyJWT, verifyRole(['admin', 'rider']), riderController.updateRider);

// PATCH: Update rider location (rider only - during delivery)
router.patch('/:id/location', verifyJWT, verifyRider, riderController.updateRiderLocation);

// PATCH: Update rider status (rider can change own status: available/busy/offline)
router.patch('/:id/status', verifyJWT, verifyRole(['admin', 'rider', 'restaurant_owner']), riderController.updateRiderStatus);

// PATCH: Update rider rating (customers or admin can rate)
router.patch('/:id/rating', verifyJWT, riderController.updateRiderRating);

// Admin-only routes
// DELETE: Delete rider
router.delete('/:id', verifyJWT, verifyAdmin, riderController.deleteRider);

module.exports = router;