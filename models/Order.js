const database = require('../config/database');
const { ObjectId } = require('mongodb');

const create = async (orderData) => {
    const collection = database.getCollection('orders');
    const order = {
        order_number: orderData.order_number,
        user_email: orderData.user_email,
        restaurant_id: new ObjectId(orderData.restaurant_id),
        rider_id: orderData.rider_id ? new ObjectId(orderData.rider_id) : null,
        
        items: orderData.items || [],
        
        // Pricing
        subtotal: orderData.subtotal || 0,
        delivery_fee: orderData.delivery_fee || 0,
        tax_amount: orderData.tax_amount || 0,
        discount_amount: orderData.discount_amount || 0,
        total_amount: orderData.total_amount || 0,
        
        // Order details
        status: orderData.status || 'pending',
        payment_status: orderData.payment_status || 'pending',
        payment_method: orderData.payment_method || null,
        
        // Addresses
        delivery_address: {
            street: orderData.delivery_address?.street || null,
            city: orderData.delivery_address?.city || null,
            area: orderData.delivery_address?.area || null,
            postal_code: orderData.delivery_address?.postal_code || null,
            phone: orderData.delivery_address?.phone || null,
            instructions: orderData.delivery_address?.instructions || null
        },
        
        restaurant_address: {
            street: orderData.restaurant_address?.street || null,
            city: orderData.restaurant_address?.city || null,
            area: orderData.restaurant_address?.area || null,
            phone: orderData.restaurant_address?.phone || null
        },
        
        // Timing
        estimated_delivery_time: orderData.estimated_delivery_time || null,
        actual_delivery_time: orderData.actual_delivery_time || null,
        preparation_time: orderData.preparation_time || null,
        
        // Special instructions
        special_instructions: orderData.special_instructions || null,
        
        // Timestamps for order lifecycle
        placed_at: new Date().toISOString(),
        confirmed_at: orderData.confirmed_at || null,
        prepared_at: orderData.prepared_at || null,
        picked_up_at: orderData.picked_up_at || null,
        delivered_at: orderData.delivered_at || null,
        cancelled_at: orderData.cancelled_at || null,
        
        // General timestamps
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    };

    const result = await collection.insertOne(order);
    return result;
};

const findById = async (id) => {
    const collection = database.getCollection('orders');
    const order = await collection.findOne({ _id: new ObjectId(id) });
    return order;
};

const findByOrderNumber = async (orderNumber) => {
    const collection = database.getCollection('orders');
    const order = await collection.findOne({ order_number: orderNumber });
    return order;
};

const findByUserEmail = async (userEmail) => {
    const collection = database.getCollection('orders');
    const orders = await collection.find({ user_email: userEmail }).sort({ created_at: -1 }).toArray();
    return orders;
};

const findByRestaurantId = async (restaurantId) => {
    const collection = database.getCollection('orders');
    const orders = await collection.find({ 
        restaurant_id: new ObjectId(restaurantId) 
    }).sort({ created_at: -1 }).toArray();
    return orders;
};

const findByRiderId = async (riderId) => {
    const collection = database.getCollection('orders');
    const orders = await collection.find({ 
        rider_id: new ObjectId(riderId) 
    }).sort({ created_at: -1 }).toArray();
    return orders;
};

const findByStatus = async (status) => {
    const collection = database.getCollection('orders');
    const orders = await collection.find({ status }).sort({ created_at: -1 }).toArray();
    return orders;
};

const findByPaymentStatus = async (paymentStatus) => {
    const collection = database.getCollection('orders');
    const orders = await collection.find({ payment_status: paymentStatus }).sort({ created_at: -1 }).toArray();
    return orders;
};

const updateOrder = async (orderId, updateData) => {
    const collection = database.getCollection('orders');
    const result = await collection.updateOne(
        { _id: new ObjectId(orderId) },
        { 
            $set: { 
                ...updateData,
                updated_at: new Date().toISOString()
            }
        }
    );
    return result;
};

const updateStatus = async (orderId, status, timestampField = null) => {
    const collection = database.getCollection('orders');
    const updateData = { 
        status: status,
        updated_at: new Date().toISOString()
    };
    
    // Add timestamp for specific status changes
    if (timestampField) {
        updateData[timestampField] = new Date().toISOString();
    }
    
    const result = await collection.updateOne(
        { _id: new ObjectId(orderId) },
        { $set: updateData }
    );
    return result;
};

const updatePaymentStatus = async (orderId, paymentStatus) => {
    const collection = database.getCollection('orders');
    const result = await collection.updateOne(
        { _id: new ObjectId(orderId) },
        { 
            $set: { 
                payment_status: paymentStatus,
                updated_at: new Date().toISOString()
            }
        }
    );
    return result;
};

const assignRider = async (orderId, riderId) => {
    const collection = database.getCollection('orders');
    const result = await collection.updateOne(
        { _id: new ObjectId(orderId) },
        { 
            $set: { 
                rider_id: new ObjectId(riderId),
                updated_at: new Date().toISOString()
            }
        }
    );
    return result;
};

const updateDeliveryTime = async (orderId, estimatedTime, actualTime = null) => {
    const collection = database.getCollection('orders');
    const updateData = {
        updated_at: new Date().toISOString()
    };
    
    if (estimatedTime) {
        updateData.estimated_delivery_time = estimatedTime;
    }
    
    if (actualTime) {
        updateData.actual_delivery_time = actualTime;
    }
    
    const result = await collection.updateOne(
        { _id: new ObjectId(orderId) },
        { $set: updateData }
    );
    return result;
};

const deleteOrder = async (orderId) => {
    const collection = database.getCollection('orders');
    const result = await collection.deleteOne({ _id: new ObjectId(orderId) });
    return result;
};

const findAll = async () => {
    const collection = database.getCollection('orders');
    const orders = await collection.find({}).sort({ created_at: -1 }).toArray();
    return orders;
};

const findOrdersInDateRange = async (startDate, endDate) => {
    const collection = database.getCollection('orders');
    const orders = await collection.find({
        created_at: {
            $gte: startDate,
            $lte: endDate
        }
    }).sort({ created_at: -1 }).toArray();
    return orders;
};

const getOrderStats = async () => {
    const collection = database.getCollection('orders');
    const stats = await collection.aggregate([
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalAmount: { $sum: '$total_amount' }
            }
        }
    ]).toArray();
    return stats;
};

// Generate unique order number
const generateOrderNumber = async () => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `YG${timestamp}${random}`;
};

module.exports = {
    create,
    findById,
    findByOrderNumber,
    findByUserEmail,
    findByRestaurantId,
    findByRiderId,
    findByStatus,
    findByPaymentStatus,
    updateOrder,
    updateStatus,
    updatePaymentStatus,
    assignRider,
    updateDeliveryTime,
    deleteOrder,
    findAll,
    findOrdersInDateRange,
    getOrderStats,
    generateOrderNumber
};