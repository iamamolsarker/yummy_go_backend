const express = require('express');
const router = express.Router();
const restaurantController = require('../Controllers/restaurantController');
const menuRoutes = require('./menuRoutes');

// POST: Add a new restaurant
router.post('/', restaurantController.createRestaurant);

// GET: Get all restaurants
router.get('/', restaurantController.getAllRestaurants);

// GET: Search restaurants
router.get('/search', restaurantController.searchRestaurants);

// GET: Get nearby restaurants
router.get('/nearby', restaurantController.getNearbyRestaurants);

// GET: Get restaurants by status
router.get('/status/:status', restaurantController.getRestaurantsByStatus);

// GET: Get restaurant status by ID (must come before /:id)
router.get('/:id/status', restaurantController.getRestaurantStatusById);

// GET: Get restaurant by ID
router.get('/:id', restaurantController.getRestaurantById);

// PUT: Update restaurant (complete replacement)
router.put('/:id', restaurantController.updateRestaurant);

// DELETE: Delete restaurant
router.delete('/:id', restaurantController.deleteRestaurant);

// PATCH: Update restaurant rating
router.patch('/:id/rating', restaurantController.updateRestaurantRating);

// PATCH: Update restaurant status
router.patch('/:id/status', restaurantController.updateRestaurantStatus);

// Nested Menu Routes - /restaurants/:restaurantId/menus
router.use('/:restaurantId/menus', (req, res, next) => {
  req.params.restaurantId = req.params.restaurantId;
  next();
}, menuRoutes);

module.exports = router;