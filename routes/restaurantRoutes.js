const express = require('express');
const router = express.Router();
const restaurantController = require('../Controllers/restaurantController');
const menuRoutes = require('./menuRoutes');
const { verifyJWT } = require('../middleware/auth');
const { verifyAdmin, verifyRestaurantOwner, verifyAdminOrRestaurantOwner } = require('../middleware/roleAuth');

// Public routes
// GET: Get all restaurants
router.get('/', restaurantController.getAllRestaurants);

// GET: Search restaurants
router.get('/search', restaurantController.searchRestaurants);

// GET: Get nearby restaurants
router.get('/nearby', restaurantController.getNearbyRestaurants);

// GET: Get restaurant by ID
router.get('/:id', restaurantController.getRestaurantById);

// Restaurant owner routes
// POST: Add a new restaurant (restaurant owner or admin)
router.post('/', verifyJWT, verifyAdminOrRestaurantOwner, restaurantController.createRestaurant);

// PUT: Update restaurant (restaurant owner or admin)
router.put('/:id', verifyJWT, verifyAdminOrRestaurantOwner, restaurantController.updateRestaurant);

// PATCH: Update restaurant rating (any authenticated user can rate)
router.patch('/:id/rating', verifyJWT, restaurantController.updateRestaurantRating);

// Admin-only routes
// GET: Get restaurants by status (admin only)
router.get('/status/:status', verifyJWT, verifyAdmin, restaurantController.getRestaurantsByStatus);

// GET: Get restaurant by email (admin only)
router.get('/email/:email', verifyJWT, verifyAdmin, restaurantController.getRestaurantByEmail);

// GET: Get restaurant status by ID (admin only)
router.get('/:id/status', verifyJWT, verifyAdmin, restaurantController.getRestaurantStatusById);

// PATCH: Update restaurant status (admin only - approve/reject/suspend)
router.patch('/:id/status', verifyJWT, verifyAdmin, restaurantController.updateRestaurantStatus);

// DELETE: Delete restaurant (admin only)
router.delete('/:id', verifyJWT, verifyAdmin, restaurantController.deleteRestaurant);

// Nested Menu Routes - /restaurants/:restaurantId/menus
router.use('/:restaurantId/menus', (req, res, next) => {
  req.params.restaurantId = req.params.restaurantId;
  next();
}, menuRoutes);

module.exports = router;