const stripe = require('../config/stripe');
const Order = require('../models/Order');
const { sendSuccess, sendError, sendCreated, sendNotFound, sendBadRequest } = require('../utils/responseHelper');

// Create payment intent for an order
const createPaymentIntent = async (req, res) => {
  try {
    const { orderId, amount, currency = 'usd', description } = req.body;

    console.log('Create payment intent request:', { orderId, amount, currency });

    // Validation
    if (!orderId || !amount) {
      console.log('Validation failed: Missing orderId or amount');
      return sendBadRequest(res, 'Order ID and amount are required');
    }

    // Verify order exists
    console.log('Looking for order with ID:', orderId);
    const order = await Order.findById(orderId);
    
    if (!order) {
      console.log('Order not found for ID:', orderId);
      return sendNotFound(res, 'Order not found');
    }

    console.log('Order found:', { order_number: order.order_number, payment_status: order.payment_status });

    // Check if payment is already completed
    if (order.payment_status === 'paid') {
      console.log('Order already paid');
      return sendBadRequest(res, 'Order is already paid');
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Stripe expects amount in cents
      currency: currency.toLowerCase(),
      description: description || `Payment for Order ${order.order_number}`,
      metadata: {
        orderId: orderId,
        orderNumber: order.order_number,
        userEmail: order.user_email
      }
    });

    // Update order with payment intent ID
    await Order.updateOrder(orderId, {
      payment_intent_id: paymentIntent.id,
      payment_method: 'stripe'
    });

    return sendCreated(res, {
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency
    }, 'Payment intent created successfully');

  } catch (error) {
    console.error('Error creating payment intent:', error);
    console.error('Error details:', error.message);
    
    // Handle MongoDB ObjectId validation errors
    if (error.name === 'BSONError' || error.message.includes('ObjectId')) {
      return sendBadRequest(res, 'Invalid Order ID format');
    }
    
    // Handle Stripe errors
    if (error.type === 'StripeInvalidRequestError') {
      return sendBadRequest(res, `Stripe error: ${error.message}`);
    }
    
    return sendError(res, 'Failed to create payment intent', 500, error);
  }
};

// Confirm payment (after client confirmation)
const confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    if (!paymentIntentId) {
      return sendBadRequest(res, 'Payment intent ID is required');
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (!paymentIntent) {
      return sendNotFound(res, 'Payment intent not found');
    }

    // Get order ID from metadata
    const orderId = paymentIntent.metadata.orderId;
    
    if (!orderId) {
      return sendError(res, 'Order ID not found in payment metadata', 400);
    }

    // Update order payment status based on payment intent status
    let paymentStatus = 'pending';
    if (paymentIntent.status === 'succeeded') {
      paymentStatus = 'paid';
    } else if (paymentIntent.status === 'canceled') {
      paymentStatus = 'failed';
    }

    const result = await Order.updatePaymentStatus(orderId, paymentStatus);
    
    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to update payment status', 400);
    }

    return sendSuccess(res, {
      orderId,
      paymentStatus,
      paymentIntentStatus: paymentIntent.status,
      amount: paymentIntent.amount / 100
    }, 'Payment confirmed successfully');

  } catch (error) {
    console.error('Error confirming payment:', error);
    return sendError(res, 'Failed to confirm payment', 500, error);
  }
};

// Handle Stripe webhook events
const handleWebhook = async (req, res) => {
  try {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('Stripe webhook secret not configured');
      return sendBadRequest(res, 'Webhook secret not configured');
    }

    let event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return sendBadRequest(res, `Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;
        
        if (orderId) {
          await Order.updatePaymentStatus(orderId, 'paid');
          console.log(`Payment succeeded for order ${orderId}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;
        
        if (orderId) {
          await Order.updatePaymentStatus(orderId, 'failed');
          console.log(`Payment failed for order ${orderId}`);
        }
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object;
        const orderId = paymentIntent.metadata.orderId;
        
        if (orderId) {
          await Order.updatePaymentStatus(orderId, 'failed');
          console.log(`Payment canceled for order ${orderId}`);
        }
        break;
      }

      case 'charge.refunded': {
        const charge = event.data.object;
        const paymentIntentId = charge.payment_intent;
        
        if (paymentIntentId) {
          const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
          const orderId = paymentIntent.metadata.orderId;
          
          if (orderId) {
            await Order.updatePaymentStatus(orderId, 'refunded');
            console.log(`Refund processed for order ${orderId}`);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return sendSuccess(res, { received: true }, 'Webhook processed successfully');

  } catch (error) {
    console.error('Error handling webhook:', error);
    return sendError(res, 'Webhook handler failed', 500, error);
  }
};

// Refund payment
const refundPayment = async (req, res) => {
  try {
    const { orderId, amount, reason } = req.body;

    if (!orderId) {
      return sendBadRequest(res, 'Order ID is required');
    }

    // Get order
    const order = await Order.findById(orderId);
    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    // Check if order has payment intent
    if (!order.payment_intent_id) {
      return sendBadRequest(res, 'No payment intent found for this order');
    }

    // Check if payment is already refunded
    if (order.payment_status === 'refunded') {
      return sendBadRequest(res, 'Payment is already refunded');
    }

    // Create refund
    const refundData = {
      payment_intent: order.payment_intent_id
    };

    if (amount) {
      refundData.amount = Math.round(amount * 100); // Partial refund
    }

    if (reason) {
      refundData.reason = reason;
    }

    const refund = await stripe.refunds.create(refundData);

    // Update order payment status
    await Order.updatePaymentStatus(orderId, 'refunded');

    return sendSuccess(res, {
      refundId: refund.id,
      amount: refund.amount / 100,
      status: refund.status,
      orderId
    }, 'Refund processed successfully');

  } catch (error) {
    console.error('Error processing refund:', error);
    return sendError(res, 'Failed to process refund', 500, error);
  }
};

// Get payment details
const getPaymentDetails = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return sendBadRequest(res, 'Order ID is required');
    }

    // Get order
    const order = await Order.findById(orderId);
    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    if (!order.payment_intent_id) {
      return sendNotFound(res, 'No payment intent found for this order');
    }

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(order.payment_intent_id);

    return sendSuccess(res, {
      paymentIntentId: paymentIntent.id,
      amount: paymentIntent.amount / 100,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      paymentMethod: paymentIntent.payment_method,
      created: new Date(paymentIntent.created * 1000).toISOString(),
      orderId,
      orderNumber: order.order_number
    }, 'Payment details retrieved successfully');

  } catch (error) {
    console.error('Error retrieving payment details:', error);
    return sendError(res, 'Failed to retrieve payment details', 500, error);
  }
};

// Create checkout session (alternative to payment intent)
const createCheckoutSession = async (req, res) => {
  try {
    const { orderId, successUrl, cancelUrl } = req.body;

    if (!orderId || !successUrl || !cancelUrl) {
      return sendBadRequest(res, 'Order ID, success URL, and cancel URL are required');
    }

    // Get order
    const order = await Order.findById(orderId);
    if (!order) {
      return sendNotFound(res, 'Order not found');
    }

    // Check if payment is already completed
    if (order.payment_status === 'paid') {
      return sendBadRequest(res, 'Order is already paid');
    }

    // Create line items from order items
    const lineItems = order.items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
          description: item.description || '',
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add delivery fee if exists
    if (order.delivery_fee > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Delivery Fee',
          },
          unit_amount: Math.round(order.delivery_fee * 100),
        },
        quantity: 1,
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: orderId,
      metadata: {
        orderId,
        orderNumber: order.order_number,
        userEmail: order.user_email
      }
    });

    // Update order with session ID
    await Order.updateOrder(orderId, {
      checkout_session_id: session.id,
      payment_method: 'stripe'
    });

    return sendCreated(res, {
      sessionId: session.id,
      url: session.url
    }, 'Checkout session created successfully');

  } catch (error) {
    console.error('Error creating checkout session:', error);
    return sendError(res, 'Failed to create checkout session', 500, error);
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  handleWebhook,
  refundPayment,
  getPaymentDetails,
  createCheckoutSession
};
