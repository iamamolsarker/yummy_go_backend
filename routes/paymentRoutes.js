const express = require('express');
const router = express.Router();
const paymentController = require('../Controllers/paymentController');

// Create payment intent
router.post('/create-payment-intent', paymentController.createPaymentIntent);

// Confirm payment
router.post('/confirm-payment', paymentController.confirmPayment);

// Create checkout session
router.post('/create-checkout-session', paymentController.createCheckoutSession);

// Get payment details
router.get('/:orderId/details', paymentController.getPaymentDetails);

// Refund payment
router.post('/refund', paymentController.refundPayment);

// Webhook endpoint (should be called by Stripe)
// Note: Raw body middleware is applied in index.js before JSON parser
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
