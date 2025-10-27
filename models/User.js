const database = require('../config/database');

const create = async (userData) => {
    const collection = database.getCollection('users');
    const user = {
        name: userData.name,
        email: userData.email,
        phone: userData.phone || null,
        role: userData.role || 'user',
        status: userData.status || 'pending',
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

const findByRole = async (role) => {
    const collection = database.getCollection('users');
    const result = await collection.find({ role }).sort({ created_at: -1 }).toArray();
    
    return result;
};

const updateRole = async (email, newRole) => {
    const collection = database.getCollection('users');
    const result = await collection.updateOne(
        { email },
        { $set: { role: newRole, updated_at: new Date().toISOString() } }
    );
    
    return result;
};

const getUserRoleByEmail = async (email) => {
    const collection = database.getCollection('users');
    const user = await collection.findOne({ email }, { projection: { role: 1, _id: 0 } });
    return user ? user.role : null;
}

const findByStatus = async (status) => {
    const collection = database.getCollection('users');
    const result = await collection.find({ status }).sort({ created_at: -1 }).toArray();
    
    return result;
};

const updateStatus = async (email, newStatus) => {
    const collection = database.getCollection('users');
    const result = await collection.updateOne(
        { email },
        { $set: { status: newStatus, updated_at: new Date().toISOString() } }
    );
    
    return result;
};

const getUserStatusByEmail = async (email) => {
    const collection = database.getCollection('users');
    const user = await collection.findOne({ email }, { projection: { status: 1, _id: 0 } });
    return user ? user.status : null;
}

const updateProfile = async (email, profileData) => {
    const collection = database.getCollection('users');
    
    // Build update object - only include provided fields
    const updateFields = {
        updated_at: new Date().toISOString()
    };
    
    // Add fields to update if they are provided
    if (profileData.name !== undefined) updateFields.name = profileData.name;
    if (profileData.phone !== undefined) updateFields.phone = profileData.phone;
    if (profileData.address !== undefined) updateFields.address = profileData.address;
    if (profileData.city !== undefined) updateFields.city = profileData.city;
    if (profileData.area !== undefined) updateFields.area = profileData.area;
    if (profileData.profile_image !== undefined) updateFields.profile_image = profileData.profile_image;
    
    const result = await collection.updateOne(
        { email },
        { $set: updateFields }
    );
    
    return result;
};

module.exports = {
    create,
    findByEmail,
    updateLastLogin,
    findAll,
    findByRole,
    updateRole,
    getUserRoleByEmail,
    findByStatus,
    updateStatus,
    getUserStatusByEmail,
    updateProfile
};