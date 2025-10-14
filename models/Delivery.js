const database = require('../config/database');
const { ObjectId } = require('mongodb');

const create = async (deliveryData) => {
    const collection = database.getCollection('deliveries');
    const delivery = {
        order_id: new ObjectId(deliveryData.order_id),
        order_number: deliveryData.order_number,
        rider_id: new ObjectId(deliveryData.rider_id),
        user_email: deliveryData.user_email,
        restaurant_id: new ObjectId(deliveryData.restaurant_id),
        
        // Delivery status
        status: deliveryData.status || 'assigned',
        
        // Addresses
        pickup_address: {
            street: deliveryData.pickup_address?.street || null,
            city: deliveryData.pickup_address?.city || null,
            area: deliveryData.pickup_address?.area || null,
            latitude: deliveryData.pickup_address?.latitude || null,
            longitude: deliveryData.pickup_address?.longitude || null,
            contact_phone: deliveryData.pickup_address?.contact_phone || null
        },
        
        delivery_address: {
            street: deliveryData.delivery_address?.street || null,
            city: deliveryData.delivery_address?.city || null,
            area: deliveryData.delivery_address?.area || null,
            postal_code: deliveryData.delivery_address?.postal_code || null,
            latitude: deliveryData.delivery_address?.latitude || null,
            longitude: deliveryData.delivery_address?.longitude || null,
            contact_phone: deliveryData.delivery_address?.contact_phone || null,
            instructions: deliveryData.delivery_address?.instructions || null
        },
        
        // Real-time location tracking
        current_location: {
            latitude: deliveryData.current_location?.latitude || null,
            longitude: deliveryData.current_location?.longitude || null,
            last_updated: deliveryData.current_location?.last_updated || new Date().toISOString()
        },
        
        // Distance and routing
        estimated_distance: deliveryData.estimated_distance || null,
        actual_distance: deliveryData.actual_distance || null,
        estimated_duration: deliveryData.estimated_duration || null,
        actual_duration: deliveryData.actual_duration || null,
        
        // Delivery details
        delivery_fee: deliveryData.delivery_fee || 0,
        delivery_instructions: deliveryData.delivery_instructions || null,
        priority: deliveryData.priority || 'normal', // normal, high, urgent
        
        // Timing
        assigned_at: new Date().toISOString(),
        accepted_at: deliveryData.accepted_at || null,
        picked_up_at: deliveryData.picked_up_at || null,
        arrived_at_customer_at: deliveryData.arrived_at_customer_at || null,
        delivered_at: deliveryData.delivered_at || null,
        cancelled_at: deliveryData.cancelled_at || null,
        
        // Estimated times
        estimated_pickup_time: deliveryData.estimated_pickup_time || null,
        estimated_delivery_time: deliveryData.estimated_delivery_time || null,
        
        // Delivery verification
        delivery_proof: {
            photo_url: deliveryData.delivery_proof?.photo_url || null,
            signature: deliveryData.delivery_proof?.signature || null,
            notes: deliveryData.delivery_proof?.notes || null,
            verification_code: deliveryData.delivery_proof?.verification_code || null
        },
        
        // Issues and notes
        issues: deliveryData.issues || [],
        rider_notes: deliveryData.rider_notes || null,
        customer_rating: deliveryData.customer_rating || null,
        customer_feedback: deliveryData.customer_feedback || null,
        
        // Tracking
        location_history: deliveryData.location_history || [],
        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const result = await collection.insertOne(delivery);
    return result;
};

const findById = async (id) => {
    const collection = database.getCollection('deliveries');
    const delivery = await collection.findOne({ _id: new ObjectId(id) });
    return delivery;
};

const findByOrderId = async (orderId) => {
    const collection = database.getCollection('deliveries');
    const delivery = await collection.findOne({ order_id: new ObjectId(orderId) });
    return delivery;
};

const findByOrderNumber = async (orderNumber) => {
    const collection = database.getCollection('deliveries');
    const delivery = await collection.findOne({ order_number: orderNumber });
    return delivery;
};

const findByRiderId = async (riderId) => {
    const collection = database.getCollection('deliveries');
    const deliveries = await collection.find({ 
        rider_id: new ObjectId(riderId) 
    }).sort({ created_at: -1 }).toArray();
    return deliveries;
};

const findByUserEmail = async (userEmail) => {
    const collection = database.getCollection('deliveries');
    const deliveries = await collection.find({ 
        user_email: userEmail 
    }).sort({ created_at: -1 }).toArray();
    return deliveries;
};

const findByStatus = async (status) => {
    const collection = database.getCollection('deliveries');
    const deliveries = await collection.find({ status }).sort({ created_at: -1 }).toArray();
    return deliveries;
};

const findActiveDeliveries = async () => {
    const collection = database.getCollection('deliveries');
    const deliveries = await collection.find({ 
        status: { $in: ['assigned', 'accepted', 'picked_up', 'on_the_way'] }
    }).sort({ created_at: -1 }).toArray();
    return deliveries;
};

const findByRiderIdAndStatus = async (riderId, status) => {
    const collection = database.getCollection('deliveries');
    const deliveries = await collection.find({ 
        rider_id: new ObjectId(riderId),
        status: status
    }).sort({ created_at: -1 }).toArray();
    return deliveries;
};

const updateDelivery = async (deliveryId, updateData) => {
    const collection = database.getCollection('deliveries');
    const result = await collection.updateOne(
        { _id: new ObjectId(deliveryId) },
        { 
            $set: { 
                ...updateData,
                updated_at: new Date().toISOString()
            }
        }
    );
    return result;
};

const updateStatus = async (deliveryId, status, timestampField = null) => {
    const collection = database.getCollection('deliveries');
    const updateData = { 
        status: status,
        updated_at: new Date().toISOString()
    };
    
    // Add timestamp for specific status changes
    if (timestampField) {
        updateData[timestampField] = new Date().toISOString();
    }
    
    const result = await collection.updateOne(
        { _id: new ObjectId(deliveryId) },
        { $set: updateData }
    );
    return result;
};

const updateLocation = async (deliveryId, latitude, longitude) => {
    const collection = database.getCollection('deliveries');
    const currentTime = new Date().toISOString();
    
    const result = await collection.updateOne(
        { _id: new ObjectId(deliveryId) },
        { 
            $set: {
                'current_location.latitude': latitude,
                'current_location.longitude': longitude,
                'current_location.last_updated': currentTime,
                updated_at: currentTime
            },
            $push: {
                location_history: {
                    latitude: latitude,
                    longitude: longitude,
                    timestamp: currentTime
                }
            }
        }
    );
    return result;
};

const addIssue = async (deliveryId, issue) => {
    const collection = database.getCollection('deliveries');
    const result = await collection.updateOne(
        { _id: new ObjectId(deliveryId) },
        { 
            $push: { 
                issues: {
                    ...issue,
                    reported_at: new Date().toISOString()
                }
            },
            $set: { updated_at: new Date().toISOString() }
        }
    );
    return result;
};

const updateDeliveryProof = async (deliveryId, proofData) => {
    const collection = database.getCollection('deliveries');
    const result = await collection.updateOne(
        { _id: new ObjectId(deliveryId) },
        { 
            $set: { 
                delivery_proof: proofData,
                updated_at: new Date().toISOString()
            }
        }
    );
    return result;
};

const addCustomerRating = async (deliveryId, rating, feedback = null) => {
    const collection = database.getCollection('deliveries');
    const result = await collection.updateOne(
        { _id: new ObjectId(deliveryId) },
        { 
            $set: { 
                customer_rating: rating,
                customer_feedback: feedback,
                updated_at: new Date().toISOString()
            }
        }
    );
    return result;
};

const updateEstimatedTimes = async (deliveryId, pickupTime, deliveryTime) => {
    const collection = database.getCollection('deliveries');
    const updateData = {
        updated_at: new Date().toISOString()
    };
    
    if (pickupTime) {
        updateData.estimated_pickup_time = pickupTime;
    }
    
    if (deliveryTime) {
        updateData.estimated_delivery_time = deliveryTime;
    }
    
    const result = await collection.updateOne(
        { _id: new ObjectId(deliveryId) },
        { $set: updateData }
    );
    return result;
};

const deleteDelivery = async (deliveryId) => {
    const collection = database.getCollection('deliveries');
    const result = await collection.deleteOne({ _id: new ObjectId(deliveryId) });
    return result;
};

const findAll = async () => {
    const collection = database.getCollection('deliveries');
    const deliveries = await collection.find({}).sort({ created_at: -1 }).toArray();
    return deliveries;
};

const findInDateRange = async (startDate, endDate) => {
    const collection = database.getCollection('deliveries');
    const deliveries = await collection.find({
        created_at: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ created_at: -1 }).toArray();
    return deliveries;
};

const getDeliveryStats = async () => {
    const collection = database.getCollection('deliveries');
    const stats = await collection.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalFee: { $sum: '$delivery_fee' },
                avgRating: { $avg: '$customer_rating' }
            }
        }
    ]).toArray();
    return stats;
};

const getRiderDeliveryStats = async (riderId) => {
    const collection = database.getCollection('deliveries');
    const stats = await collection.aggregate([
        {
            $match: { rider_id: new ObjectId(riderId) }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalFee: { $sum: '$delivery_fee' },
                avgRating: { $avg: '$customer_rating' }
            }
        }
    ]).toArray();
    return stats;
};

module.exports = {
    create,
    findById,
    findByOrderId,
    findByOrderNumber,
    findByRiderId,
    findByUserEmail,
    findByStatus,
    findActiveDeliveries,
    findByRiderIdAndStatus,
    updateDelivery,
    updateStatus,
    updateLocation,
    addIssue,
    updateDeliveryProof,
    addCustomerRating,
    updateEstimatedTimes,
    deleteDelivery,
    findAll,
    findInDateRange,
    getDeliveryStats,
    getRiderDeliveryStats
};