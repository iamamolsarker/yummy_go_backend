# Stripe Payment Gateway - Quick Start Guide

## ✅ Implementation Complete!

Stripe payment gateway has been successfully integrated into your Yummy Go Backend.

## 🎯 What's Been Implemented

### 1. **Configuration**
- ✅ Stripe SDK initialized (`config/stripe.js`)
- ✅ Environment variables configured (`.env`)
- ✅ Webhook signature verification ready

### 2. **Payment Controller** (`Controllers/paymentController.js`)
- ✅ Create Payment Intent
- ✅ Confirm Payment
- ✅ Create Checkout Session
- ✅ Get Payment Details
- ✅ Process Refunds
- ✅ Handle Webhooks (auto-update order status)

### 3. **Payment Routes** (`routes/paymentRoutes.js`)
All endpoints available at `/api/payments`:
- `POST /create-payment-intent` - For custom checkout
- `POST /confirm-payment` - Confirm payment status
- `POST /create-checkout-session` - For Stripe-hosted checkout
- `GET /:orderId/details` - Get payment info
- `POST /refund` - Process refunds
- `POST /webhook` - Stripe webhook handler

### 4. **Order Model Updates**
- ✅ Added `payment_intent_id` field
- ✅ Added `checkout_session_id` field
- ✅ Payment status tracking

### 5. **Documentation**
- ✅ Complete API documentation (`PAYMENT_API_DOCUMENTATION.md`)
- ✅ Integration examples
- ✅ Testing guide

---

## 🚀 Quick Test

### Test Payment Intent (Custom Checkout)

```bash
# 1. Create a payment intent
curl -X POST http://localhost:5000/api/payments/create-payment-intent \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "YOUR_ORDER_ID",
    "amount": 25.50,
    "currency": "usd"
  }'

# Expected Response:
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

### Test Checkout Session (Stripe-Hosted)

```bash
curl -X POST http://localhost:5000/api/payments/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "YOUR_ORDER_ID",
    "successUrl": "http://localhost:3000/success",
    "cancelUrl": "http://localhost:3000/cancel"
  }'

# Expected Response:
{
  "status": "success",
  "message": "Checkout session created successfully",
  "data": {
    "sessionId": "cs_test_xxx",
    "url": "https://checkout.stripe.com/c/pay/cs_test_xxx"
  }
}
```

---

## 📱 Frontend Integration Examples

### Option 1: Payment Intent (Custom UI with Stripe Elements)

```javascript
// 1. Create payment intent from your order
const createPayment = async (orderId, amount) => {
  const response = await fetch('http://localhost:5000/api/payments/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ orderId, amount })
  });
  
  const { data } = await response.json();
  return data.clientSecret;
};

// 2. Use Stripe.js to confirm payment
const stripe = Stripe('pk_test_YOUR_PUBLISHABLE_KEY');

const confirmPayment = async (clientSecret, cardElement) => {
  const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
    payment_method: {
      card: cardElement,
      billing_details: { name: 'Customer Name' }
    }
  });
  
  if (error) {
    console.error('Payment failed:', error);
    return;
  }
  
  if (paymentIntent.status === 'succeeded') {
    // 3. Confirm with backend
    await fetch('http://localhost:5000/api/payments/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentIntentId: paymentIntent.id })
    });
    
    console.log('Payment successful!');
  }
};
```

### Option 2: Checkout Session (Stripe-Hosted Page)

```javascript
// Simply redirect to Stripe Checkout
const redirectToCheckout = async (orderId) => {
  const response = await fetch('http://localhost:5000/api/payments/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      orderId,
      successUrl: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancelUrl: `${window.location.origin}/cancel`
    })
  });
  
  const { data } = await response.json();
  
  // Redirect to Stripe
  window.location.href = data.url;
};
```

---

## 🧪 Test Cards (Use in Stripe Test Mode)

| Card Number | Scenario |
|------------|----------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0025 0000 3155` | 🔐 Requires 3D Secure |
| `4000 0000 0000 9995` | ❌ Fails |

- **Expiry**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **Postal Code**: Any valid code

---

## 🔐 Webhook Setup

### For Local Development

1. **Install Stripe CLI**
   ```bash
   # Download from https://stripe.com/docs/stripe-cli
   stripe login
   ```

2. **Forward webhooks to local**
   ```bash
   stripe listen --forward-to localhost:5000/api/payments/webhook
   ```

3. **Copy webhook secret to .env**
   ```env
   STRIPE_WEBHOOK_SECRET="whsec_xxxxx"
   ```

### For Production (Vercel)

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. URL: `https://your-vercel-domain.vercel.app/api/payments/webhook`
4. Events to listen:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
   - `charge.refunded`
5. Copy webhook secret to Vercel environment variables

---

## 📊 Payment Flow Diagram

```
Customer → Places Order → Frontend
                            ↓
              Create Payment Intent (Backend)
                            ↓
              Return clientSecret (Backend → Frontend)
                            ↓
              Stripe.js confirms payment (Frontend)
                            ↓
              Payment succeeds (Stripe)
                            ↓
              Webhook updates order (Stripe → Backend)
                            ↓
              Confirm payment (Frontend → Backend)
                            ↓
              Order status = 'paid' ✅
```

---

## 🛠️ Additional Features Available

1. **Refunds**
   ```bash
   POST /api/payments/refund
   {
     "orderId": "xxx",
     "amount": 10.00,  # Optional: partial refund
     "reason": "requested_by_customer"
   }
   ```

2. **Payment Details**
   ```bash
   GET /api/payments/:orderId/details
   ```

3. **Automatic Webhook Updates**
   - Payment succeeded → `payment_status: 'paid'`
   - Payment failed → `payment_status: 'failed'`
   - Payment refunded → `payment_status: 'refunded'`

---

## 📝 Next Steps

1. ✅ **Get Stripe Publishable Key**
   - Login to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Copy your publishable key (`pk_test_...`)

2. ✅ **Integrate Frontend**
   - Install Stripe.js: `npm install @stripe/stripe-js`
   - Or use Stripe Elements in React: `npm install @stripe/react-stripe-js`

3. ✅ **Setup Webhooks**
   - Use Stripe CLI for local testing
   - Configure production webhook in Stripe Dashboard

4. ✅ **Test Complete Flow**
   - Create order
   - Create payment
   - Process payment
   - Verify order status updated

5. ✅ **Deploy to Production**
   - Update `STRIPE_SECRET_KEY` in Vercel env
   - Add `STRIPE_WEBHOOK_SECRET` in Vercel env
   - Configure webhook endpoint URL

---

## 📚 Resources

- [Complete API Docs](./PAYMENT_API_DOCUMENTATION.md)
- [Stripe Dashboard](https://dashboard.stripe.com/)
- [Stripe Docs](https://stripe.com/docs)
- [Stripe Testing Guide](https://stripe.com/docs/testing)

---

## ✨ Features

- ✅ Payment Intent API (custom checkout)
- ✅ Checkout Session API (Stripe-hosted)
- ✅ Automatic webhook handling
- ✅ Full/partial refund support
- ✅ Payment status tracking
- ✅ Test mode ready
- ✅ Production ready
- ✅ Error handling
- ✅ Response helpers integration
- ✅ MongoDB integration

---

**All set! Your Stripe payment gateway is ready to use! 🎉**

For detailed documentation, see `PAYMENT_API_DOCUMENTATION.md`
