const express = require('express');
const router = express.Router();

console.log("Initializing route modules...");

// Import all route modules
const userRoutes = require('./userRoutes');
console.log("User routes loaded");

const restaurantRoutes = require('./restaurantRoutes');
console.log("Restaurant routes loaded");

const riderRoutes = require('./riderRoutes');
console.log("Rider routes loaded");

// Mount routes
router.use('/users', userRoutes);
console.log("User routes mounted at /users");

router.use('/restaurants', restaurantRoutes);
console.log("Restaurant routes mounted at /restaurants");

router.use('/riders', riderRoutes);
console.log("Rider routes mounted at /riders");

console.log("All route modules initialized successfully");

module.exports = router;