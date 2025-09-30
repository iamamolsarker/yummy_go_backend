const express = require('express');
const router = express.Router();

// Import all route modules
const userRoutes = require('./userRoutes');
const restaurantRoutes = require('./restaurantRoutes');
const riderRoutes = require('./riderRoutes');

// Mount routes
router.use('/users', userRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/riders', riderRoutes);

module.exports = router;