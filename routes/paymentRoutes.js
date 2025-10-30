const express = require('express');
const router = express.Router();
const paymentController = require('../Controllers/paymentController');
const { verifyJWT } = require('../middleware/auth');
const { verifyAdmin, verifyActiveUser } = require('../middleware/roleAuth');

// User payment routes (authenticated and active users)
// Create payment intent (user creating payment for order)
router.post('/create-payment-intent', verifyJWT, verifyActiveUser, paymentController.createPaymentIntent);

// Confirm payment (user confirming payment after client-side processing)
router.post('/confirm-payment', verifyJWT, verifyActiveUser, paymentController.confirmPayment);

// Create checkout session (user initiating Stripe-hosted checkout)
router.post('/create-checkout-session', verifyJWT, verifyActiveUser, paymentController.createCheckoutSession);

// Get payment details (user can view their own payment details)
router.get('/:orderId/details', verifyJWT, paymentController.getPaymentDetails);

// Admin routes
// Refund payment (admin only)
router.post('/refund', verifyJWT, verifyAdmin, paymentController.refundPayment);

// Public webhook endpoint (called by Stripe - no auth required)
// Note: Raw body middleware is applied in index.js before JSON parser
router.post('/webhook', paymentController.handleWebhook);

module.exports = router;
