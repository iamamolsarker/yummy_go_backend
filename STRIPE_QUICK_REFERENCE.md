# Stripe Payment API - Quick Reference Card

## 🔗 Base URL
```
http://localhost:5000/api/payments  (Development)
https://your-domain.vercel.app/api/payments  (Production)
```

---

## 📡 Endpoints

### 1. Create Payment Intent
```http
POST /create-payment-intent
Content-Type: application/json

{
  "orderId": "507f1f77bcf86cd799439011",
  "amount": 25.50,
  "currency": "usd"
}
```
**Returns:** `clientSecret` for Stripe.js

---

### 2. Confirm Payment
```http
POST /confirm-payment
Content-Type: application/json

{
  "paymentIntentId": "pi_1234567890abcdef"
}
```
**Returns:** Payment status and order update confirmation

---

### 3. Create Checkout Session
```http
POST /create-checkout-session
Content-Type: application/json

{
  "orderId": "507f1f77bcf86cd799439011",
  "successUrl": "https://yourapp.com/success",
  "cancelUrl": "https://yourapp.com/cancel"
}
```
**Returns:** Stripe checkout URL

---

### 4. Get Payment Details
```http
GET /:orderId/details
```
**Returns:** Complete payment information

---

### 5. Refund Payment
```http
POST /refund
Content-Type: application/json

{
  "orderId": "507f1f77bcf86cd799439011",
  "amount": 10.00,  // Optional: partial refund
  "reason": "requested_by_customer"
}
```
**Returns:** Refund confirmation

---

### 6. Webhook (Stripe → Backend)
```http
POST /webhook
stripe-signature: t=xxx,v1=xxx
```
**Auto-updates order payment status**

---

## 🎴 Test Cards

| Card | Result |
|------|--------|
| `4242 4242 4242 4242` | ✅ Success |
| `4000 0025 0000 3155` | 🔐 Requires 3D Secure |
| `4000 0000 0000 9995` | ❌ Declined |

**Expiry:** Any future date • **CVC:** Any 3 digits

---

## 💻 Frontend Integration

### Payment Intent (Custom UI)
```javascript
const stripe = Stripe('pk_test_...');

// 1. Create payment intent
const res = await fetch('/api/payments/create-payment-intent', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ orderId, amount: 25.50 })
});
const { data } = await res.json();

// 2. Confirm with Stripe.js
const result = await stripe.confirmCardPayment(data.clientSecret, {
  payment_method: { card: cardElement }
});

// 3. Confirm with backend
if (result.paymentIntent.status === 'succeeded') {
  await fetch('/api/payments/confirm-payment', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ paymentIntentId: result.paymentIntent.id })
  });
}
```

### Checkout Session (Hosted Page)
```javascript
// 1. Create checkout session
const res = await fetch('/api/payments/create-checkout-session', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    orderId,
    successUrl: window.location.origin + '/success',
    cancelUrl: window.location.origin + '/cancel'
  })
});
const { data } = await res.json();

// 2. Redirect to Stripe
window.location.href = data.url;
```

---

## 🔐 Environment Variables

```env
# Required
STRIPE_SECRET_KEY="sk_test_..."

# Optional (for webhooks)
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## 🧪 Local Webhook Testing

```bash
# 1. Install Stripe CLI
stripe login

# 2. Forward webhooks
stripe listen --forward-to localhost:5000/api/payments/webhook

# 3. Copy webhook secret to .env
STRIPE_WEBHOOK_SECRET="whsec_..."

# 4. Test events
stripe trigger payment_intent.succeeded
```

---

## 📊 Payment Status Flow

```
Order Created
    ↓
payment_status: 'pending'
    ↓
Payment Intent Created
    ↓
Customer Pays
    ↓
Webhook: payment_intent.succeeded
    ↓
payment_status: 'paid' ✅
```

---

## 🚨 Error Codes

| Code | Meaning |
|------|---------|
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Order/Payment not found |
| 500 | Server Error - Stripe API error |

---

## 📝 Quick Commands

```bash
# Start server
npm run dev

# Test Stripe integration
node testPayment.js

# Check logs
# (Auto-logged in console)
```

---

## 🎯 Order Model Fields (Payment)

```javascript
{
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded',
  payment_method: 'stripe' | 'cash' | null,
  payment_intent_id: 'pi_xxx',  // Payment Intent ID
  checkout_session_id: 'cs_xxx'  // Checkout Session ID
}
```

---

## 📚 Documentation

- **Complete API Docs:** `PAYMENT_API_DOCUMENTATION.md`
- **Setup Guide:** `STRIPE_SETUP_GUIDE.md`
- **Implementation:** `STRIPE_IMPLEMENTATION_SUMMARY.md`

---

## ✅ Checklist

- [x] Stripe installed
- [x] Config created
- [x] Controllers implemented
- [x] Routes mounted
- [x] Order model updated
- [x] Webhook handler ready
- [x] Tests passing
- [ ] Frontend integrated
- [ ] Webhook configured (production)

---

**Need help?** Check the full documentation files above! 🚀
