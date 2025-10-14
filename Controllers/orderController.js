const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const FoodRider = require('../models/FoodRider');
const { sendSuccess, sendError, sendCreated, sendNotFound, sendBadRequest } = require('../utils/responseHelper');

// Create a new order from cart
const createOrder = async (req, res) => {
  try {
    const { 
      cart_id, 
      user_email, 
      delivery_address, 
      payment_method, 
      special_instructions,
      delivery_fee,
      tax_amount,
      discount_amount 
    } = req.body;

    // Basic validation
    if (!cart_id || !user_email || !delivery_address || !payment_method) {
      return sendBadRequest(res, 'Cart ID, user email, delivery address, and payment method are required');
    }

    // Verify user exists
    const user = await User.findByEmail(user_email);
    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    // Get cart and verify it exists
    const cart = await Cart.findById(cart_id);
    if (!cart) {
      return sendNotFound(res, 'Cart not found');
    }

    if (cart.user_email !== user_email) {
      return sendBadRequest(res, 'Cart does not belong to this user');
    }

    if (cart.items.length === 0) {
      return sendBadRequest(res, 'Cart is empty');
    }

    // Get restaurant info
    const restaurant = await Restaurant.findById(cart.restaurant_id);
    if (!restaurant) {
      return sendNotFound(res, 'Restaurant not found');
    }

    // Generate unique order number
    const orderNumber = await Order.generateOrderNumber();

    // Calculate totals
    const subtotal = cart.total_amount;
    const deliveryFee = parseFloat(delivery_fee) || 0;
    const taxAmount = parseFloat(tax_amount) || 0;
    const discountAmount = parseFloat(discount_amount) || 0;
    const totalAmount = subtotal + deliveryFee + taxAmount - discountAmount;

    // Create order data
    const orderData = {
      order_number: orderNumber,
      user_email,
      restaurant_id: cart.restaurant_id,
      items: cart.items,
      subtotal,
      delivery_fee: deliveryFee,
      tax_amount: taxAmount,
      discount_amount: discountAmount,
      total_amount: totalAmount,
      payment_method,
      delivery_address,
      restaurant_address: {
        street: restaurant.location?.address,
        city: restaurant.location?.city,
        area: restaurant.location?.area,
        phone: restaurant.phone
      },
      special_instructions,
      estimated_delivery_time: new Date(Date.now() + 45 * 60000).toISOString() // 45 minutes from now
    };

    // Create the order
    const result = await Order.create(orderData);

    // Update cart status to 'ordered'
    await Cart.changeCartStatus(cart_id, 'ordered');

    return sendCreated(res, {
      orderId: result.insertedId,
      orderNumber: orderNumber,
      totalAmount: totalAmount
    }, 'Order created successfully');

  } catch (error) {
    console.error('Error creating order:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get all orders (admin function)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    
    return sendSuccess(res, orders, 'All orders retrieved successfully');
    
  } catch (error) {
    console.error('Error retrieving all orders:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return sendBadRequest(res, 'Order ID is required');
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    return sendSuccess(res, order, 'Order retrieved successfully');

  } catch (error) {
    console.error('Error retrieving order:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get order by order number
const getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;

    if (!orderNumber) {
      return sendBadRequest(res, 'Order number is required');
    }

    const order = await Order.findByOrderNumber(orderNumber);
    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    return sendSuccess(res, order, 'Order retrieved successfully');

  } catch (error) {
    console.error('Error retrieving order:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get orders by user email
const getOrdersByUserEmail = async (req, res) => {
  try {
    const { userEmail } = req.params;

    if (!userEmail) {
      return sendBadRequest(res, 'User email is required');
    }

    const orders = await Order.findByUserEmail(userEmail);
    
    return sendSuccess(res, orders, 'User orders retrieved successfully');

  } catch (error) {
    console.error('Error retrieving user orders:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get orders by restaurant ID
const getOrdersByRestaurantId = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return sendBadRequest(res, 'Restaurant ID is required');
    }

    const orders = await Order.findByRestaurantId(restaurantId);
    
    return sendSuccess(res, orders, 'Restaurant orders retrieved successfully');

  } catch (error) {
    console.error('Error retrieving restaurant orders:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get orders by rider ID
const getOrdersByRiderId = async (req, res) => {
  try {
    const { riderId } = req.params;

    if (!riderId) {
      return sendBadRequest(res, 'Rider ID is required');
    }

    const orders = await Order.findByRiderId(riderId);
    
    return sendSuccess(res, orders, 'Rider orders retrieved successfully');

  } catch (error) {
    console.error('Error retrieving rider orders:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get orders by status
const getOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    if (!status) {
      return sendBadRequest(res, 'Status is required');
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return sendBadRequest(res, 'Invalid status. Valid statuses are: ' + validStatuses.join(', '));
    }

    const orders = await Order.findByStatus(status.toLowerCase());
    
    return sendSuccess(res, orders, `Orders with status '${status}' retrieved successfully`);

  } catch (error) {
    console.error('Error retrieving orders by status:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId || !status) {
      return sendBadRequest(res, 'Order ID and status are required');
    }

    // Validate status
    const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return sendBadRequest(res, 'Invalid status. Valid statuses are: ' + validStatuses.join(', '));
    }

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    // Determine timestamp field based on status
    let timestampField = null;
    switch (status.toLowerCase()) {
      case 'confirmed':
        timestampField = 'confirmed_at';
        break;
      case 'ready':
        timestampField = 'prepared_at';
        break;
      case 'picked_up':
        timestampField = 'picked_up_at';
        break;
      case 'delivered':
        timestampField = 'delivered_at';
        break;
      case 'cancelled':
        timestampField = 'cancelled_at';
        break;
    }

    // Update order status
    const result = await Order.updateStatus(orderId, status.toLowerCase(), timestampField);
    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to update order status', 400);
    }

    return sendSuccess(res, { 
      updated: true, 
      orderId: orderId, 
      newStatus: status.toLowerCase() 
    }, 'Order status updated successfully');

  } catch (error) {
    console.error('Error updating order status:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Update payment status
const updatePaymentStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { payment_status } = req.body;

    if (!orderId || !payment_status) {
      return sendBadRequest(res, 'Order ID and payment status are required');
    }

    // Validate payment status
    const validPaymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validPaymentStatuses.includes(payment_status.toLowerCase())) {
      return sendBadRequest(res, 'Invalid payment status. Valid statuses are: ' + validPaymentStatuses.join(', '));
    }

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    // Update payment status
    const result = await Order.updatePaymentStatus(orderId, payment_status.toLowerCase());
    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to update payment status', 400);
    }

    return sendSuccess(res, { 
      updated: true, 
      orderId: orderId, 
      newPaymentStatus: payment_status.toLowerCase() 
    }, 'Payment status updated successfully');

  } catch (error) {
    console.error('Error updating payment status:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Assign rider to order
const assignRider = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { rider_id } = req.body;

    if (!orderId || !rider_id) {
      return sendBadRequest(res, 'Order ID and rider ID are required');
    }

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    // Verify rider exists
    const rider = await FoodRider.findById(rider_id);
    if (!rider) {
      return sendNotFound(res, 'Rider not found');
    }

    // Assign rider to order
    const result = await Order.assignRider(orderId, rider_id);
    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to assign rider to order', 400);
    }

    return sendSuccess(res, { 
      assigned: true, 
      orderId: orderId, 
      riderId: rider_id 
    }, 'Rider assigned to order successfully');

  } catch (error) {
    console.error('Error assigning rider:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Update delivery time
const updateDeliveryTime = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { estimated_time, actual_time } = req.body;

    if (!orderId) {
      return sendBadRequest(res, 'Order ID is required');
    }

    if (!estimated_time && !actual_time) {
      return sendBadRequest(res, 'Either estimated time or actual time is required');
    }

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    // Update delivery time
    const result = await Order.updateDeliveryTime(orderId, estimated_time, actual_time);
    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to update delivery time', 400);
    }

    return sendSuccess(res, { 
      updated: true, 
      orderId: orderId 
    }, 'Delivery time updated successfully');

  } catch (error) {
    console.error('Error updating delivery time:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Cancel order
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { cancellation_reason } = req.body;

    if (!orderId) {
      return sendBadRequest(res, 'Order ID is required');
    }

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    // Check if order can be cancelled
    const nonCancellableStatuses = ['delivered', 'cancelled'];
    if (nonCancellableStatuses.includes(order.status)) {
      return sendBadRequest(res, `Cannot cancel order with status: ${order.status}`);
    }

    // Update order to cancelled
    const updateData = {
      status: 'cancelled',
      cancelled_at: new Date().toISOString()
    };

    if (cancellation_reason) {
      updateData.cancellation_reason = cancellation_reason;
    }

    const result = await Order.updateOrder(orderId, updateData);
    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to cancel order', 400);
    }

    return sendSuccess(res, { 
      cancelled: true, 
      orderId: orderId 
    }, 'Order cancelled successfully');

  } catch (error) {
    console.error('Error cancelling order:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Delete order (admin function)
const deleteOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return sendBadRequest(res, 'Order ID is required');
    }

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    // Delete order
    const result = await Order.deleteOrder(orderId);
    if (result.deletedCount === 0) {
      return sendError(res, 'Failed to delete order', 400);
    }

    return sendSuccess(res, { 
      deleted: true, 
      orderId: orderId 
    }, 'Order deleted successfully');

  } catch (error) {
    console.error('Error deleting order:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get order statistics (admin function)
const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.getOrderStats();
    
    return sendSuccess(res, stats, 'Order statistics retrieved successfully');
    
  } catch (error) {
    console.error('Error retrieving order statistics:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrderByNumber,
  getOrdersByUserEmail,
  getOrdersByRestaurantId,
  getOrdersByRiderId,
  getOrdersByStatus,
  updateOrderStatus,
  updatePaymentStatus,
  assignRider,
  updateDeliveryTime,
  cancelOrder,
  deleteOrder,
  getOrderStats
};