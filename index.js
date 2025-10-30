require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import configurations
const database = require('./config/database');
const { initializeFirebase } = require('./config/firebase');

// Import routes
const routes = require('./routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());

// Stripe webhook needs raw body, so apply it before JSON parser
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

// JSON parser for all other routes
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize Firebase
try {
    initializeFirebase();
    console.log('Firebase initialized for authentication');
} catch (error) {
    console.error('Firebase initialization failed:', error.message);
    // Continue without Firebase - authentication middleware will handle errors
} 

// Root route - Should respond immediately
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Yummy Go Backend is running',
        timestamp: new Date().toISOString(),
        status: 'active'
    });
});

// Serverless optimization - lazy load database connection
app.use('/api', async (req, res, next) => {
    try {
        // Ensure database connection before processing any API request
        await database.connect();
        next();
    } catch (error) {
        console.error("Database connection failed:", error);
        res.status(503).json({
            status: 'error',
            message: 'Database connection failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Mount all routes after database middleware
app.use('/api', routes);

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error handler:', error);
    res.status(500).json({
        status: 'error',
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        status: 'error',
        message: 'Route not found',
        path: req.originalUrl,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Graceful shutdown handler
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully');
    try {
        await database.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
});

// For local development
if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

// Export for Vercel
module.exports = app;