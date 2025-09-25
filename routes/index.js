const express = require('express');
const router = express.Router();

// Import all route modules
const userRoutes = require('./userRoutes');
const restaurantRoutes = require('./restaurantRoutes');

// Mount routes
router.use('/users', userRoutes);
router.use('/restaurants', restaurantRoutes);

module.exports = router;