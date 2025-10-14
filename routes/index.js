const express = require('express');
const router = express.Router();
const database = require('../config/database');

// Health check endpoint - MUST be first
router.get('/health', async (req, res) => {
    try {
        // Ensure database connection
        await database.connect();
        
        // Quick ping to verify connection
        const usersCollection = database.getCollection('users');
        await usersCollection.findOne({}, { limit: 1 });
        
        res.status(200).json({
            status: 'healthy',
            message: 'Server and database are running',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            connected: database.isConnected()
        });
    } catch (error) {
        console.error('Health check failed:', error);
        res.status(503).json({
            status: 'unhealthy',
            message: 'Server or database connection failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Warmup endpoint
router.get('/warmup', async (req, res) => {
    try {
        console.log('Warming up server...');
        
        // Connect to database
        await database.connect();
        
        // Pre-warm critical collections
        const collections = ['users', 'restaurants', 'orders', 'menus', 'carts'];
        const warmupPromises = collections.map(async (collectionName) => {
            try {
                const collection = database.getCollection(collectionName);
                await collection.findOne({}, { limit: 1 });
                return { collection: collectionName, status: 'warmed' };
            } catch (error) {
                return { collection: collectionName, status: 'failed', error: error.message };
            }
        });
        
        const results = await Promise.all(warmupPromises);
        
        res.status(200).json({
            status: 'success',
            message: 'Server warmed up successfully',
            timestamp: new Date().toISOString(),
            collections: results,
            uptime: process.uptime()
        });
    } catch (error) {
        console.error('Warmup failed:', error);
        res.status(500).json({
            status: 'error',
            message: 'Warmup failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Import all route modules
const userRoutes = require('./userRoutes');
const restaurantRoutes = require('./restaurantRoutes');
const riderRoutes = require('./riderRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const deliveryRoutes = require('./deliveryRoutes');

// Mount routes
router.use('/users', userRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/riders', riderRoutes);
router.use('/carts', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/deliveries', deliveryRoutes);

module.exports = router;