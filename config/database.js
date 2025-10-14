const { MongoClient, ServerApiVersion } = require('mongodb');

// Database state
let client = null;
let db = null;
let collections = {};

// Database functions
const connect = async () => {
    try {
        const uri = process.env.MONGODB_URI;
        
        client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
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