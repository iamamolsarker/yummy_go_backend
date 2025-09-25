const express = require('express');
const router = express.Router();
const restaurantController = require('../Controllers/restaurantController');

// POST: Add a new restaurant
router.post('/', restaurantController.createRestaurant);

// GET: Get all restaurants
router.get('/', restaurantController.getAllRestaurants);

// GET: Search restaurants
router.get('/search', restaurantController.searchRestaurants);

// GET: Get nearby restaurants
router.get('/nearby', restaurantController.getNearbyRestaurants);

// GET: Get restaurant by ID
router.get('/:id', restaurantController.getRestaurantById);

// PUT: Update restaurant
router.put('/:id', restaurantController.updateRestaurant);

// DELETE: Delete restaurant
router.delete('/:id', restaurantController.deleteRestaurant);

// PUT: Update restaurant rating
router.put('/:id/rating', restaurantController.updateRestaurantRating);

module.exports = router;