const { MongoClient, ServerApiVersion } = require('mongodb');

// Database state
let client = null;
let db = null;
let collections = {};

// Database functions
const connect = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        
        if (!uri) {
            throw new Error('MongoDB URI not found in environment variables');
        }
        
        client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            },
            // Vercel optimizations
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            maxIdleTimeMS: 30000,
            retryWrites: true,
            retryReads: true
        });

        await client.connect();
        await client.db('admin').command({ ping: 1 });
        db = client.db('Yummy_Go');

        // Initialize collections
        collections = {
            users: db.collection('users'),
            restaurants: db.collection('restaurants'),
            riders: db.collection('riders'),
            menus: db.collection('menus'),
        };

        console.log("Successfully connected to MongoDB!");
        return db;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};

const getCollection = (name) => {
    return collections[name];
};


// Export as Simple Object
module.exports = {
    connect,
    getCollection
};