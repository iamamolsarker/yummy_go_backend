const express = require('express');
const router = express.Router();
const riderController = require('../Controllers/riderController');

// POST: Add a new rider
router.post('/', riderController.createRider);

// GET: Get all riders
router.get('/', riderController.getAllRiders);

// GET: Get available riders
router.get('/available', riderController.getAvailableRiders);

// GET: Get rider by ID
router.get('/:id', riderController.getRiderById);

// GET: Get rider by email
router.get('/email/:email', riderController.getRiderByEmail);

// PUT: Update rider (complete replacement)
router.put('/:id', riderController.updateRider);

// PATCH: Update rider status
router.patch('/:id/status', riderController.updateRiderStatus);

// PATCH: Update rider location
router.patch('/:id/location', riderController.updateRiderLocation);

// PATCH: Update rider rating
router.patch('/:id/rating', riderController.updateRiderRating);

// DELETE: Delete rider
router.delete('/:id', riderController.deleteRider);

module.exports = router;