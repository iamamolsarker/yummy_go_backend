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

// PUT: Update rider
router.put('/:id', riderController.updateRider);

// PUT: Update rider status
router.put('/:id/status', riderController.updateRiderStatus);

// PUT: Update rider location
router.put('/:id/location', riderController.updateRiderLocation);

// PUT: Update rider rating
router.put('/:id/rating', riderController.updateRiderRating);

// DELETE: Delete rider
router.delete('/:id', riderController.deleteRider);

module.exports = router;