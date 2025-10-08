require('dotenv').config({ silent: true });
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
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request timeout middleware for Vercel
app.use((req, res, next) => {
  res.setTimeout(25000, () => {
    console.log('Request timeout');
    res.status(408).json({
      success: false,
      message: 'Request timeout'
    });
  });
  next();
});

// Initialize Firebase
// initializeFirebase(); 

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

async function startServer() {
    try {
        // Connect to MongoDB with retry
        let retries = 3;
        while (retries > 0) {
            try {
                await database.connect();
                break;
            } catch (dbError) {
                console.error(`Database connection failed. Retries left: ${retries - 1}`, dbError.message);
                retries--;
                if (retries === 0) throw dbError;
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }

        // Mount all routes
        app.use('/api', routes);

        // 404 handler for API routes (must come after routes)
        app.use('/api', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'API endpoint not found',
                path: req.originalUrl
            });
        });

        // Global 404 handler for all other routes
        app.use((req, res) => {
            res.status(404).json({
                success: false,
                message: 'Route not found',
                path: req.originalUrl,
                suggestion: 'Check if the URL is correct or visit /api/status for API health'
            });
        });

        console.log("All routes are set up");
    } catch (error) {
        console.error("Failed to start server:", error);
        // Don't exit process in production (Vercel)
        if (process.env.NODE_ENV !== 'production') {
            process.exit(1);
        }
    }
}

// Root route
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Yummy Go Backend is running',
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Server is healthy',
        uptime: process.uptime()
    });
});

// API status check
app.get('/api/status', async (req, res) => {
    try {
        // Check database connection
        const db = require('./config/database');
        const usersCollection = db.getCollection('users');
        
        if (!usersCollection) {
            throw new Error('Database not connected');
        }
        
        // Test database query
        await usersCollection.findOne({}, { limit: 1 });
        
        res.json({
            success: true,
            message: 'API is working correctly',
            database: 'connected',
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'API status check failed',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
});

// Vercel specific setup
if (process.env.VERCEL) {
    // In Vercel, connect to database on module load
    startServer().catch((error) => {
        console.error('Failed to start server in Vercel:', error);
        // Don't throw in production to prevent function crash
    });
    module.exports = app;
} else {
    // Local development
    startServer();
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}