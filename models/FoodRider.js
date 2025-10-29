const database = require('../config/database');
const { ObjectId } = require('mongodb');

const create = async (riderData) => {
    await database.connect(); // Ensure database connection
    const collection = database.getCollection('riders');
    const rider = {
        name: riderData.name,
        email: riderData.email,
        phone: riderData.phone,
        vehicle: {
            type: riderData.vehicle?.type || 'motorcycle', // motorcycle, bicycle, car
            model: riderData.vehicle?.model || null,
            license_plate: riderData.vehicle?.license_plate || null
        },
        location: {
            current_address: riderData.location?.current_address || null,
            city: riderData.location?.city || null,
            coordinates: riderData.location?.coordinates || null // {lat, lng}
        },
        status: riderData.status || 'pending',
        rating: riderData.rating || 0,
        total_deliveries: riderData.total_deliveries || 0,
        documents: {
            nid: riderData.documents?.nid || null,
            driving_license: riderData.documents?.driving_license || null,
            profile_image: riderData.documents?.profile_image || null
        },
        is_active: riderData.is_active !== undefined ? riderData.is_active : true,
        is_verified: riderData.is_verified || false,
        created_at: new Date(),
        updated_at: new Date()
    };
    
    const result = await collection.insertOne(rider);
    return result;
};

const findById = async (id) => {
    await database.connect(); // Ensure database connection
    const collection = database.getCollection('riders');
    const rider = await collection.findOne({ _id: new ObjectId(id) });
    return rider;
};

const findByEmail = async (email) => {
    await database.connect(); // Ensure database connection
    const collection = database.getCollection('riders');
    const rider = await collection.findOne({ email });
    return rider;
};

const findByPhone = async (phone) => {
    await database.connect(); // Ensure database connection
    const collection = database.getCollection('riders');
    const rider = await collection.findOne({ phone });
    return rider;
};

const findAll = async (filters = {}) => {
    await database.connect(); // Ensure database connection
    const collection = database.getCollection('riders');
    let query = { is_active: true };
    
    // Add filters
    if (filters.status) {
        query.status = filters.status;
    }
    if (filters.city) {
        query['location.city'] = { $regex: new RegExp(filters.city, 'i') };
    }
    if (filters.vehicle_type) {
        query['vehicle.type'] = filters.vehicle_type;
    }
    if (filters.is_verified !== undefined) {
        query.is_verified = filters.is_verified;
    }
    
    const riders = await collection.find(query)
        .sort({ rating: -1, created_at: -1 })
        .toArray();
    return riders;
};

const updateById = async (id, updateData) => {
    await database.connect(); // Ensure database connection
    const collection = database.getCollection('riders');
    updateData.updated_at = new Date();
    const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
    );
    return result;
};

const updateStatus = async (id, status) => {
    await database.connect(); // Ensure database connection
    const collection = database.getCollection('riders');
    const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { 
            $set: { 
                status: status,
                updated_at: new Date()
            }
        }
    );
    return result;
};

const updateLocation = async (id, location) => {
    await database.connect(); // Ensure database connection
    const collection = database.getCollection('riders');
    const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { 
            $set: { 
                location: location,
                updated_at: new Date()
            }
        }
    );
    return result;
};

const deleteById = async (id) => {
    await database.connect(); // Ensure database connection
    const collection = database.getCollection('riders');
    const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { is_active: false, updated_at: new Date() } }
    );
    return result;
};

const updateRating = async (id, newRating, totalDeliveries) => {
    await database.connect(); // Ensure database connection
    const collection = database.getCollection('riders');
    const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { 
            $set: { 
                rating: newRating,
                total_deliveries: totalDeliveries,
                updated_at: new Date()
            }
        }
    );
    return result;
};

const findAvailableRiders = async (city = null) => {
    await database.connect(); // Ensure database connection
    const collection = database.getCollection('riders');
    let query = { 
        is_active: true, 
        status: 'available'
    };
    
    if (city) {
        query['location.city'] = { $regex: new RegExp(city, 'i') };
    }
    
    const riders = await collection.find(query)
        .sort({ rating: -1 })
        .toArray();
    return riders;
};

module.exports = {
    create,
    findById,
    findByEmail,
    findByPhone,
    findAll,
    updateById,
    updateStatus,
    updateLocation,
    deleteById,
    updateRating,
    findAvailableRiders
};