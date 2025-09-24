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
app.use(express.json());

// Initialize Firebase
// initializeFirebase(); 

async function startServer() {
    try {
        // Connect to MongoDB
        await database.connect();

        // Mount all routes
        app.use('/api', routes);

        console.log("All routes are set up");
    } catch (error) {
        console.error("Failed to start server:", error);
        process.exit(1);
    }
}

// Start the server
startServer();

// Root route
app.get('/', (req, res) => {
    res.send('Yummy Go Backend is running');
});

// Start listening
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});