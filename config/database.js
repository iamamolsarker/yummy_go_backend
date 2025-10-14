const { MongoClient, ServerApiVersion } = require('mongodb');

// Database state
let client = null;
let db = null;
let collections = {};
let isConnected = false;
let connectionPromise = null;

// Database functions
const connect = async () => {
    // Return existing connection if already connected
    if (isConnected && client && db) {
        return db;
    }

    // Return ongoing connection attempt
    if (connectionPromise) {
        return connectionPromise;
    }

    connectionPromise = establishConnection();
    return connectionPromise;
};

const establishConnection = async () => {
    try {
        console.log('Establishing MongoDB connection...');
        const uri = process.env.MONGODB_URI;
        
        client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000
        });

        await client.connect();
        db = client.db('Yummy_Go');

        // Initialize collections
        collections = {
            users: db.collection('users'),
            restaurants: db.collection('restaurants'),
            riders: db.collection('riders'),
            menus: db.collection('menus'),
            carts: db.collection('carts'),
            orders: db.collection('orders'),
            deliveries: db.collection('deliveries'),
        };

        isConnected = true;
        connectionPromise = null;
        
        console.log("Successfully connected to MongoDB!");
        
        // Warm up collections with a lightweight query
        try {
            await collections.users.findOne({}, { limit: 1 });
        } catch (warmupError) {
            console.log('Collection warmup completed');
        }
        
        return db;
    } catch (error) {
        isConnected = false;
        connectionPromise = null;
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

const getCollection = (name) => {
    if (!isConnected || !collections[name]) {
        throw new Error(`Database not connected or collection '${name}' not found. Call connect() first.`);
    }
    return collections[name];
};

// Graceful shutdown
const disconnect = async () => {
    if (client) {
        await client.close();
        isConnected = false;
        client = null;
        db = null;
        collections = {};
        console.log('MongoDB disconnected');
    }
};

// Export as Simple Object
module.exports = {
    connect,
    getCollection,
    disconnect,
    isConnected: () => isConnected
};