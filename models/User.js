const database = require('../config/database');

const create = async (userData) => {
    const collection = database.getCollection('users');
    const user = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone || null,
        role: userData.role || 'user',
        created_at: userData.created_at || new Date().toISOString(),
        last_log_in: userData.last_log_in || new Date().toISOString(),
    };
    const result = await collection.insertOne(user);

    return result;
};

const findByEmail = async (email) => {
    const collection = database.getCollection('users');
    const result = await collection.findOne({ email });

    return result;
};

const updateLastLogin = async (email) => {
    const collection = database.getCollection('users');
    const result = await collection.updateOne(
        { email },
        { $set: { last_log_in: new Date().toISOString() } }
    );

    return result;
};

const findAll = async () => {
    const collection = database.getCollection('users');
    const result = await collection.find({}).sort({ created_at: -1 }).toArray();
    
    return result;
};

module.exports = {
    create,
    findByEmail,
    updateLastLogin,
    findAll
};