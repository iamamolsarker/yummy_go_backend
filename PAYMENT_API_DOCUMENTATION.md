# Payment API Documentation (Stripe Integration)

## Overview
This document provides comprehensive documentation for the Stripe payment gateway integration in the Yummy Go Backend API. All payment endpoints are prefixed with `/api/payments`.

## Table of Contents
1. [Setup Requirements](#setup-requirements)
2. [Payment Intent Flow](#payment-intent-flow)
3. [Checkout Session Flow](#checkout-session-flow)
4. [API Endpoints](#api-endpoints)
5. [Webhook Integration](#webhook-integration)
6. [Error Handling](#error-handling)
7. [Testing](#testing)

---

## Setup Requirements

### Environment Variables
Add the following to your `.env` file:

```env
STRIPE_SECRET_KEY="your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="your_webhook_secret_from_stripe_dashboard"
```

### Get Stripe Keys
1. Sign up/Login to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Get your **Secret Key** from API Keys section
3. Create a webhook endpoint and get **Webhook Secret**

---

## Payment Intent Flow

**Recommended for custom checkout UI**

### Flow Steps:
1. Client creates an order
2. Client requests payment intent from backend
3. Backend creates Stripe PaymentIntent and returns `clientSecret`
4. Client uses Stripe.js to confirm payment with `clientSecret`
5. Client confirms payment with backend
6. Backend updates order payment status

---

## Checkout Session Flow

**Recommended for Stripe-hosted checkout page**

### Flow Steps:
1. Client creates an order
2. Client requests checkout session from backend
3. Backend creates Stripe Checkout Session and returns session URL
4. Client redirects user to Stripe checkout page
5. User completes payment on Stripe
6. Stripe redirects to success/cancel URL
7. Webhook updates order payment status automatically

---

## API Endpoints

### 1. Create Payment Intent

**POST** `/api/payments/create-payment-intent`

Creates a payment intent for processing card payments.

#### Request Body
```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "amount": 25.50,
  "currency": "usd",
  "description": "Payment for Order YG170123456789123"
}
```

#### Parameters
- `orderId` (required): MongoDB ObjectId of the order
- `amount` (required): Payment amount in dollars (will be converted to cents)
- `currency` (optional): Currency code (default: "usd")
- `description` (optional): Payment description

#### Success Response (201 Created)
```json
{
  "status": "success",
  "message": "Payment intent created successfully",
  "data": {
    "clientSecret": "pi_xxx_secret_xxx",
    "paymentIntentId": "pi_xxx",
    "amount": 2550,
    "currency": "usd"
  }
}
```

#### Error Responses
- **400 Bad Request**: Missing orderId or amount
- **404 Not Found**: Order not found
- **400 Bad Request**: Order already paid
- **500 Internal Server Error**: Stripe API error

#### Client-Side Integration Example
```javascript
// After receiving clientSecret
const stripe = Stripe('your_publishable_key');

const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
  payment_method: {
    card: cardElement,
    billing_details: {
      name: 'Customer Name'
    }
  }
});

if (error) {
  // Handle error
} else if (paymentIntent.status === 'succeeded') {
  // Call confirm payment endpoint
  await fetch('/api/payments/confirm-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentIntentId: paymentIntent.id })
  });
}
```

---

### 2. Confirm Payment

**POST** `/api/payments/confirm-payment`

Confirms a payment and updates the order status after client-side payment confirmation.

#### Request Body
```json
{
  "paymentIntentId": "pi_1234567890abcdef"
}
```

#### Parameters
- `paymentIntentId` (required): Stripe payment intent ID

#### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "Payment confirmed successfully",
  "data": {
    "orderId": "507f1f77bcf86cd799439011",
    "paymentStatus": "paid",
    "paymentIntentStatus": "succeeded",
    "amount": 25.50
  }
}
```

#### Error Responses
- **400 Bad Request**: Missing paymentIntentId
- **404 Not Found**: Payment intent not found
- **400 Bad Request**: Order ID not found in payment metadata
- **500 Internal Server Error**: Update failed

---

### 3. Create Checkout Session

**POST** `/api/payments/create-checkout-session`

Creates a Stripe Checkout Session for hosted payment page.

#### Request Body
```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "successUrl": "https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}",
  "cancelUrl": "https://yourapp.com/cancel"
}
```

#### Parameters
- `orderId` (required): MongoDB ObjectId of the order
- `successUrl` (required): URL to redirect after successful payment
- `cancelUrl` (required): URL to redirect if payment is cancelled

#### Success Response (201 Created)
```json
{
  "status": "success",
  "message": "Checkout session created successfully",
  "data": {
    "sessionId": "cs_test_xxx",
    "url": "https://checkout.stripe.com/c/pay/cs_test_xxx"
  }
}
```

#### Client-Side Integration Example
```javascript
// Redirect user to Stripe Checkout
const response = await fetch('/api/payments/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId: '507f1f77bcf86cd799439011',
    successUrl: 'https://yourapp.com/success',
    cancelUrl: 'https://yourapp.com/cancel'
  })
});

const { data } = await response.json();
window.location.href = data.url; // Redirect to Stripe
```

---

### 4. Get Payment Details

**GET** `/api/payments/:orderId/details`

Retrieves payment details for a specific order.

#### URL Parameters
- `orderId`: MongoDB ObjectId of the order

#### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "Payment details retrieved successfully",
  "data": {
    "paymentIntentId": "pi_1234567890abcdef",
    "amount": 25.50,
    "currency": "usd",
    "status": "succeeded",
    "paymentMethod": "pm_1234567890abcdef",
    "created": "2025-10-28T10:30:00.000Z",
    "orderId": "507f1f77bcf86cd799439011",
    "orderNumber": "YG170123456789123"
  }
}
```

#### Error Responses
- **400 Bad Request**: Missing orderId
- **404 Not Found**: Order not found or no payment intent found
- **500 Internal Server Error**: Stripe API error

---

### 5. Refund Payment

**POST** `/api/payments/refund`

Processes a full or partial refund for an order.

#### Request Body
```json
{
  "orderId": "507f1f77bcf86cd799439011",
  "amount": 10.00,
  "reason": "requested_by_customer"
}
```

#### Parameters
- `orderId` (required): MongoDB ObjectId of the order
- `amount` (optional): Refund amount (omit for full refund)
- `reason` (optional): Refund reason ("duplicate", "fraudulent", "requested_by_customer")

#### Success Response (200 OK)
```json
{
  "status": "success",
  "message": "Refund processed successfully",
  "data": {
    "refundId": "re_1234567890abcdef",
    "amount": 10.00,
    "status": "succeeded",
    "orderId": "507f1f77bcf86cd799439011"
  }
}
```

#### Error Responses
- **400 Bad Request**: Missing orderId or already refunded
- **404 Not Found**: Order not found or no payment intent
- **500 Internal Server Error**: Stripe API error

---

### 6. Stripe Webhook

**POST** `/api/payments/webhook`

Handles Stripe webhook events (automatic payment status updates).

#### Supported Events
- `payment_intent.succeeded` - Payment successful
- `payment_intent.payment_failed` - Payment failed
- `payment_intent.canceled` - Payment cancelled
- `charge.refunded` - Payment refunded

#### Headers Required
- `stripe-signature`: Stripe webhook signature

#### Response (200 OK)
```json
{
  "status": "success",
  "message": "Webhook processed successfully",
  "data": {
    "received": true
  }
}
```

#### Setup Webhook in Stripe Dashboard
1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your endpoint URL: `https://your-domain.com/api/payments/webhook`
4. Select events to listen to
5. Copy the webhook secret to `.env` as `STRIPE_WEBHOOK_SECRET`

---

## Webhook Integration

### Local Testing with Stripe CLI

1. **Install Stripe CLI**
   ```bash
   # Windows (using Scoop)
   scoop install stripe
   
   # Or download from https://stripe.com/docs/stripe-cli
   ```

2. **Login to Stripe**
   ```bash
   stripe login
   ```

3. **Forward webhooks to local server**
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/webhook
   ```

4. **Get webhook signing secret**
   The CLI will display a webhook secret like `whsec_xxxxx`. Add it to `.env`:
   ```env
   STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
   ```

5. **Trigger test events**
   ```bash
   stripe trigger payment_intent.succeeded
   ```

---

## Error Handling

All payment endpoints follow the standard response format:

### Success Response
```json
{
  "status": "success",
  "message": "Operation successful",
  "data": { }
}
```

### Error Response
```json
{
  "status": "error",
  "message": "Error description",
  "error": "Detailed error (only in development)"
}
```

### Common Error Codes
- **400**: Bad Request - Invalid parameters
- **401**: Unauthorized - Authentication required
- **404**: Not Found - Resource not found
- **500**: Internal Server Error - Server/Stripe error

---

## Testing

### Test Card Numbers

Stripe provides test cards for testing:

| Card Number | Description |
|------------|-------------|
| `4242 4242 4242 4242` | Successful payment |
| `4000 0025 0000 3155` | Requires authentication (3D Secure) |
| `4000 0000 0000 9995` | Always fails |
| `4000 0000 0000 0341` | Attaches and charges successfully |

### Test Data
- Any future expiry date (e.g., 12/34)
- Any 3-digit CVC
- Any postal code

### Testing Payment Intent Flow

```bash
# 1. Create an order first
curl -X POST http://localhost:5000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "cart_id": "507f1f77bcf86cd799439011",
    "user_email": "test@example.com",
    "delivery_address": {
      "street": "123 Main St",
      "city": "New York",
      "area": "Manhattan",
      "postal_code": "10001",
      "phone": "1234567890"
    },
    "payment_method": "stripe",
    "delivery_fee": 5.00
  }'

# 2. Create payment intent
curl -X POST http://localhost:5000/api/payments/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "507f1f77bcf86cd799439011",
    "amount": 25.50
  }'

# 3. Get payment details
curl http://localhost:5000/api/payments/507f1f77bcf86cd799439011/details
```

### Testing Checkout Session Flow

```bash
curl -X POST http://localhost:5000/api/payments/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "507f1f77bcf86cd799439011",
    "successUrl": "http://localhost:3000/success",
    "cancelUrl": "http://localhost:3000/cancel"
  }'
```

### Testing Refund

```bash
curl -X POST http://localhost:5000/api/payments/refund \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "507f1f77bcf86cd799439011",
    "amount": 10.00,
    "reason": "requested_by_customer"
  }'
```

---

## Integration Checklist

- [ ] Add Stripe secret key to `.env`
- [ ] Add webhook secret to `.env` (for production)
- [ ] Configure webhook endpoint in Stripe Dashboard
- [ ] Test payment intent flow with test card
- [ ] Test checkout session flow
- [ ] Test webhook events with Stripe CLI
- [ ] Test refund functionality
- [ ] Handle payment errors on frontend
- [ ] Display payment status to users
- [ ] Set up proper success/cancel URLs

---

## Security Best Practices

1. **Never expose secret key** - Keep it in `.env` and never commit
2. **Validate webhook signatures** - Always verify Stripe signature
3. **Use HTTPS in production** - Required for PCI compliance
4. **Store minimal payment data** - Let Stripe handle sensitive data
5. **Implement idempotency** - Use idempotency keys for payment requests
6. **Log payment events** - Monitor for fraud and errors
7. **Handle failures gracefully** - Show user-friendly error messages

---

## Next Steps

1. Integrate payment UI with Stripe Elements or Checkout
2. Set up webhook endpoint in production
3. Configure payment confirmation emails
4. Add payment analytics and reporting
5. Implement subscription/recurring payments (if needed)
6. Add support for multiple currencies
7. Implement Apple Pay / Google Pay

---

## Support & Resources

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe API Reference](https://stripe.com/docs/api)
- [Stripe Testing](https://stripe.com/docs/testing)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Stripe Elements](https://stripe.com/docs/stripe-js)
