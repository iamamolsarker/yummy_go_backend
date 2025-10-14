const express = require('express');
const router = express.Router();

// Import all route modules
const userRoutes = require('./userRoutes');
const restaurantRoutes = require('./restaurantRoutes');
const riderRoutes = require('./riderRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');

// Mount routes
router.use('/users', userRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/riders', riderRoutes);
router.use('/carts', cartRoutes);
router.use('/orders', orderRoutes);

module.exports = router;