const Delivery = require('../models/Delivery');
const Order = require('../models/Order');
const FoodRider = require('../models/FoodRider');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const { sendSuccess, sendError, sendCreated, sendNotFound, sendBadRequest } = require('../utils/responseHelper');

// Create a new delivery from order
const createDelivery = async (req, res) => {
  try {
    const { 
      order_id, 
      rider_id, 
      pickup_address, 
      delivery_address, 
      estimated_pickup_time, 
      estimated_delivery_time,
      delivery_instructions,
      priority 
    } = req.body;

    // Basic validation
    if (!order_id || !rider_id) {
      return sendBadRequest(res, 'Order ID and rider ID are required');
    }

    // Verify order exists
    const order = await Order.findById(order_id);
    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    // Verify rider exists
    const rider = await FoodRider.findById(rider_id);
    if (!rider) {
      return sendNotFound(res, 'Rider not found');
    }

    // Check if delivery already exists for this order
    const existingDelivery = await Delivery.findByOrderId(order_id);
    if (existingDelivery) {
      return sendBadRequest(res, 'Delivery already exists for this order');
    }

    // Get restaurant info
    const restaurant = await Restaurant.findById(order.restaurant_id);
    if (!restaurant) {
      return sendNotFound(res, 'Restaurant not found');
    }

    // Create delivery data
    const deliveryData = {
      order_id,
      order_number: order.order_number,
      rider_id,
      user_email: order.user_email,
      restaurant_id: order.restaurant_id,
      pickup_address: pickup_address || {
        street: restaurant.location?.address,
        city: restaurant.location?.city,
        area: restaurant.location?.area,
        contact_phone: restaurant.phone
      },
      delivery_address: delivery_address || order.delivery_address,
      delivery_fee: order.delivery_fee || 0,
      estimated_pickup_time,
      estimated_delivery_time: estimated_delivery_time || order.estimated_delivery_time,
      delivery_instructions: delivery_instructions || order.special_instructions,
      priority: priority || 'normal'
    };

    // Create the delivery
    const result = await Delivery.create(deliveryData);

    return sendCreated(res, {
      deliveryId: result.insertedId,
      orderId: order_id,
      riderId: rider_id
    }, 'Delivery created successfully');

  } catch (error) {
    console.error('Error creating delivery:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get all deliveries (admin function)
const getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.findAll();
    
    return sendSuccess(res, deliveries, 'All deliveries retrieved successfully');
    
  } catch (error) {
    console.error('Error retrieving all deliveries:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get delivery by ID
const getDeliveryById = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    if (!deliveryId) {
      return sendBadRequest(res, 'Delivery ID is required');
    }

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return sendNotFound(res, 'Delivery not found');
    }

    return sendSuccess(res, delivery, 'Delivery retrieved successfully');

  } catch (error) {
    console.error('Error retrieving delivery:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get delivery by order ID
const getDeliveryByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return sendBadRequest(res, 'Order ID is required');
    }

    const delivery = await Delivery.findByOrderId(orderId);
    if (!delivery) {
      return sendNotFound(res, 'Delivery not found for this order');
    }

    return sendSuccess(res, delivery, 'Delivery retrieved successfully');

  } catch (error) {
    console.error('Error retrieving delivery:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get deliveries by rider ID
const getDeliveriesByRiderId = async (req, res) => {
  try {
    const { riderId } = req.params;

    if (!riderId) {
      return sendBadRequest(res, 'Rider ID is required');
    }

    const deliveries = await Delivery.findByRiderId(riderId);
    
    return sendSuccess(res, deliveries, 'Rider deliveries retrieved successfully');

  } catch (error) {
    console.error('Error retrieving rider deliveries:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get deliveries by user email
const getDeliveriesByUserEmail = async (req, res) => {
  try {
    const { userEmail } = req.params;

    if (!userEmail) {
      return sendBadRequest(res, 'User email is required');
    }

    const deliveries = await Delivery.findByUserEmail(userEmail);
    
    return sendSuccess(res, deliveries, 'User deliveries retrieved successfully');

  } catch (error) {
    console.error('Error retrieving user deliveries:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get deliveries by status
const getDeliveriesByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    if (!status) {
      return sendBadRequest(res, 'Status is required');
    }

    // Validate status
    const validStatuses = ['assigned', 'accepted', 'picked_up', 'on_the_way', 'arrived', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return sendBadRequest(res, 'Invalid status. Valid statuses are: ' + validStatuses.join(', '));
    }

    const deliveries = await Delivery.findByStatus(status.toLowerCase());
    
    return sendSuccess(res, deliveries, `Deliveries with status '${status}' retrieved successfully`);

  } catch (error) {
    console.error('Error retrieving deliveries by status:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get active deliveries
const getActiveDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.findActiveDeliveries();
    
    return sendSuccess(res, deliveries, 'Active deliveries retrieved successfully');

  } catch (error) {
    console.error('Error retrieving active deliveries:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Update delivery status
const updateDeliveryStatus = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { status } = req.body;

    if (!deliveryId || !status) {
      return sendBadRequest(res, 'Delivery ID and status are required');
    }

    // Validate status
    const validStatuses = ['assigned', 'accepted', 'picked_up', 'on_the_way', 'arrived', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return sendBadRequest(res, 'Invalid status. Valid statuses are: ' + validStatuses.join(', '));
    }

    // Check if delivery exists
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return sendNotFound(res, 'Delivery not found');
    }

    // Determine timestamp field based on status
    let timestampField = null;
    switch (status.toLowerCase()) {
      case 'accepted':
        timestampField = 'accepted_at';
        break;
      case 'picked_up':
        timestampField = 'picked_up_at';
        break;
      case 'arrived':
        timestampField = 'arrived_at_customer_at';
        break;
      case 'delivered':
        timestampField = 'delivered_at';
        break;
      case 'cancelled':
        timestampField = 'cancelled_at';
        break;
    }

    // Update delivery status
    const result = await Delivery.updateStatus(deliveryId, status.toLowerCase(), timestampField);
    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to update delivery status', 400);
    }

    return sendSuccess(res, { 
      updated: true, 
      deliveryId: deliveryId, 
      newStatus: status.toLowerCase() 
    }, 'Delivery status updated successfully');

  } catch (error) {
    console.error('Error updating delivery status:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Update rider location
const updateRiderLocation = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { latitude, longitude } = req.body;

    if (!deliveryId || latitude === undefined || longitude === undefined) {
      return sendBadRequest(res, 'Delivery ID, latitude, and longitude are required');
    }

    // Check if delivery exists
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return sendNotFound(res, 'Delivery not found');
    }

    // Update location
    const result = await Delivery.updateLocation(deliveryId, latitude, longitude);
    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to update location', 400);
    }

    return sendSuccess(res, { 
      updated: true, 
      deliveryId: deliveryId,
      location: { latitude, longitude } 
    }, 'Location updated successfully');

  } catch (error) {
    console.error('Error updating location:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Add delivery issue
const addDeliveryIssue = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { issue_type, description, severity } = req.body;

    if (!deliveryId || !issue_type || !description) {
      return sendBadRequest(res, 'Delivery ID, issue type, and description are required');
    }

    // Check if delivery exists
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return sendNotFound(res, 'Delivery not found');
    }

    const issue = {
      issue_type,
      description,
      severity: severity || 'medium'
    };

    // Add issue
    const result = await Delivery.addIssue(deliveryId, issue);
    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to add issue', 400);
    }

    return sendSuccess(res, { 
      added: true, 
      deliveryId: deliveryId,
      issue: issue
    }, 'Issue added successfully');

  } catch (error) {
    console.error('Error adding issue:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Update delivery proof
const updateDeliveryProof = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { photo_url, signature, notes, verification_code } = req.body;

    if (!deliveryId) {
      return sendBadRequest(res, 'Delivery ID is required');
    }

    // Check if delivery exists
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return sendNotFound(res, 'Delivery not found');
    }

    const proofData = {
      photo_url: photo_url || null,
      signature: signature || null,
      notes: notes || null,
      verification_code: verification_code || null
    };

    // Update delivery proof
    const result = await Delivery.updateDeliveryProof(deliveryId, proofData);
    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to update delivery proof', 400);
    }

    return sendSuccess(res, { 
      updated: true, 
      deliveryId: deliveryId 
    }, 'Delivery proof updated successfully');

  } catch (error) {
    console.error('Error updating delivery proof:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Add customer rating
const addCustomerRating = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { rating, feedback } = req.body;

    if (!deliveryId || rating === undefined) {
      return sendBadRequest(res, 'Delivery ID and rating are required');
    }

    if (rating < 1 || rating > 5) {
      return sendBadRequest(res, 'Rating must be between 1 and 5');
    }

    // Check if delivery exists
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return sendNotFound(res, 'Delivery not found');
    }

    // Add customer rating
    const result = await Delivery.addCustomerRating(deliveryId, rating, feedback);
    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to add rating', 400);
    }

    return sendSuccess(res, { 
      added: true, 
      deliveryId: deliveryId,
      rating: rating 
    }, 'Rating added successfully');

  } catch (error) {
    console.error('Error adding rating:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Update estimated times
const updateEstimatedTimes = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { estimated_pickup_time, estimated_delivery_time } = req.body;

    if (!deliveryId) {
      return sendBadRequest(res, 'Delivery ID is required');
    }

    if (!estimated_pickup_time && !estimated_delivery_time) {
      return sendBadRequest(res, 'Either pickup time or delivery time is required');
    }

    // Check if delivery exists
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return sendNotFound(res, 'Delivery not found');
    }

    // Update estimated times
    const result = await Delivery.updateEstimatedTimes(deliveryId, estimated_pickup_time, estimated_delivery_time);
    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to update estimated times', 400);
    }

    return sendSuccess(res, { 
      updated: true, 
      deliveryId: deliveryId 
    }, 'Estimated times updated successfully');

  } catch (error) {
    console.error('Error updating estimated times:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Cancel delivery
const cancelDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;
    const { cancellation_reason } = req.body;

    if (!deliveryId) {
      return sendBadRequest(res, 'Delivery ID is required');
    }

    // Check if delivery exists
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return sendNotFound(res, 'Delivery not found');
    }

    // Check if delivery can be cancelled
    const nonCancellableStatuses = ['delivered', 'cancelled'];
    if (nonCancellableStatuses.includes(delivery.status)) {
      return sendBadRequest(res, `Cannot cancel delivery with status: ${delivery.status}`);
    }

    // Update delivery to cancelled
    const updateData = {
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    };

    if (cancellation_reason) {
      updateData.cancellation_reason = cancellation_reason;
    }

    const result = await Delivery.updateDelivery(deliveryId, updateData);
    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to cancel delivery', 400);
    }

    return sendSuccess(res, { 
      cancelled: true, 
      deliveryId: deliveryId 
    }, 'Delivery cancelled successfully');

  } catch (error) {
    console.error('Error cancelling delivery:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Delete delivery (admin function)
const deleteDelivery = async (req, res) => {
  try {
    const { deliveryId } = req.params;

    if (!deliveryId) {
      return sendBadRequest(res, 'Delivery ID is required');
    }

    // Check if delivery exists
    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return sendNotFound(res, 'Delivery not found');
    }

    // Delete delivery
    const result = await Delivery.deleteDelivery(deliveryId);
    if (result.deletedCount === 0) {
      return sendError(res, 'Failed to delete delivery', 400);
    }

    return sendSuccess(res, { 
      deleted: true, 
      deliveryId: deliveryId 
    }, 'Delivery deleted successfully');

  } catch (error) {
    console.error('Error deleting delivery:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get delivery statistics (admin function)
const getDeliveryStats = async (req, res) => {
  try {
    const stats = await Delivery.getDeliveryStats();
    
    return sendSuccess(res, stats, 'Delivery statistics retrieved successfully');
    
  } catch (error) {
    console.error('Error retrieving delivery statistics:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get rider delivery statistics
const getRiderDeliveryStats = async (req, res) => {
  try {
    const { riderId } = req.params;

    if (!riderId) {
      return sendBadRequest(res, 'Rider ID is required');
    }

    const stats = await Delivery.getRiderDeliveryStats(riderId);
    
    return sendSuccess(res, stats, 'Rider delivery statistics retrieved successfully');
    
  } catch (error) {
    console.error('Error retrieving rider delivery statistics:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

module.exports = {
  createDelivery,
  getAllDeliveries,
  getDeliveryById,
  getDeliveryByOrderId,
  getDeliveriesByRiderId,
  getDeliveriesByUserEmail,
  getDeliveriesByStatus,
  getActiveDeliveries,
  updateDeliveryStatus,
  updateRiderLocation,
  addDeliveryIssue,
  updateDeliveryProof,
  addCustomerRating,
  updateEstimatedTimes,
  cancelDelivery,
  deleteDelivery,
  getDeliveryStats,
  getRiderDeliveryStats
};