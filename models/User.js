const database = require('../config/database');

const create = async (userData) => {
    const collection = database.getCollection('users');
    const user = {
        name: userData.name,
        email: userData.email,
        role: userData.role || 'user',
        created_at: userData.created_at || new Date().toISOString(),
        last_log_in: userData.last_log_in || new Date().toISOString(),
    };
    return await collection.insertOne(user);
};

const findByEmail = async (email) => {
    const collection = database.getCollection('users');
    return await collection.findOne({ email });
};

const updateLastLogin = async (email) => {
    const collection = database.getCollection('users');
    return await collection.updateOne(
        { email },
        { $set: { last_log_in: new Date().toISOString() } }
    );
};

module.exports = {
    create,
    findByEmail,
    updateLastLogin
};