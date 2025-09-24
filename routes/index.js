const express = require('express');
const router = express.Router();

// Import all route modules
const userRoutes = require('./userRoutes');


// Mount routes
router.use('/users', userRoutes);

module.exports = router;