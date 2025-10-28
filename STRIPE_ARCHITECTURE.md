# Stripe Payment Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         YUMMY GO PAYMENT SYSTEM                             │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────┐        ┌──────────────┐        ┌─────────────┐        ┌──────────┐
│   Client    │        │   Backend    │        │   MongoDB   │        │  Stripe  │
│  (Frontend) │        │   (Express)  │        │  Database   │        │   API    │
└──────┬──────┘        └──────┬───────┘        └──────┬──────┘        └────┬─────┘
       │                      │                       │                     │
       │                      │                       │                     │
       │  1. Create Order     │                       │                     │
       │─────────────────────>│                       │                     │
       │                      │  Save Order           │                     │
       │                      │──────────────────────>│                     │
       │                      │  Order Created        │                     │
       │                      │<──────────────────────│                     │
       │  Order Confirmed     │                       │                     │
       │<─────────────────────│                       │                     │
       │                      │                       │                     │
       │                      │                       │                     │
       │  2. Request Payment  │                       │                     │
       │─────────────────────>│                       │                     │
       │                      │  Create Payment Intent                      │
       │                      │────────────────────────────────────────────>│
       │                      │  Payment Intent (clientSecret)              │
       │                      │<────────────────────────────────────────────│
       │  clientSecret        │                       │                     │
       │<─────────────────────│                       │                     │
       │                      │                       │                     │
       │                      │                       │                     │
       │  3. Submit Payment   │                       │                     │
       │  (Stripe.js)         │                       │                     │
       │────────────────────────────────────────────────────────────────────>│
       │                      │                       │  Process Payment    │
       │  Payment Success     │                       │                     │
       │<────────────────────────────────────────────────────────────────────│
       │                      │                       │                     │
       │                      │  Webhook: payment_intent.succeeded          │
       │                      │<────────────────────────────────────────────│
       │                      │  Update Order                               │
       │                      │──────────────────────>│                     │
       │                      │  payment_status='paid'│                     │
       │                      │                       │                     │
       │  4. Confirm Payment  │                       │                     │
       │─────────────────────>│                       │                     │
       │                      │  Get Order            │                     │
       │                      │──────────────────────>│                     │
       │                      │  Order Details        │                     │
       │                      │<──────────────────────│                     │
       │  Payment Confirmed   │                       │                     │
       │<─────────────────────│                       │                     │
       │                      │                       │                     │
```

---

## Payment Flow Options

### Option A: Payment Intent (Custom Checkout)

```
┌──────────┐
│  START   │
└────┬─────┘
     │
     ▼
┌─────────────────────┐
│ Create Order        │
│ POST /api/orders    │
└────┬────────────────┘
     │
     ▼
┌────────────────────────────────┐
│ Create Payment Intent          │
│ POST /payments/                │
│      create-payment-intent     │
│                                │
│ Returns: clientSecret          │
└────┬───────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│ Client: Stripe.js              │
│ confirmCardPayment()           │
│                                │
│ User enters card details       │
└────┬───────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│ Stripe: Process Payment        │
│ → Success/Failure              │
└────┬───────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│ Webhook: Auto-update order     │
│ payment_status = 'paid'        │
└────┬───────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│ Confirm Payment                │
│ POST /payments/confirm-payment │
└────┬───────────────────────────┘
     │
     ▼
┌──────────┐
│   DONE   │
└──────────┘
```

### Option B: Checkout Session (Stripe-Hosted)

```
┌──────────┐
│  START   │
└────┬─────┘
     │
     ▼
┌─────────────────────┐
│ Create Order        │
│ POST /api/orders    │
└────┬────────────────┘
     │
     ▼
┌────────────────────────────────┐
│ Create Checkout Session        │
│ POST /payments/                │
│      create-checkout-session   │
│                                │
│ Returns: Stripe URL            │
└────┬───────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│ Redirect to Stripe             │
│ User pays on Stripe's page     │
└────┬───────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│ Stripe: Process Payment        │
│ Redirect to success/cancel URL │
└────┬───────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│ Webhook: Auto-update order     │
│ payment_status = 'paid'        │
└────┬───────────────────────────┘
     │
     ▼
┌────────────────────────────────┐
│ Show Success Page              │
└────┬───────────────────────────┘
     │
     ▼
┌──────────┐
│   DONE   │
└──────────┘
```

---

## System Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        API LAYER                               │
│  /api/payments/*                                               │
│                                                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │   Payment    │  │   Payment    │  │   Payment    │        │
│  │   Intent     │  │  Checkout    │  │   Webhook    │        │
│  │   Routes     │  │   Routes     │  │   Routes     │        │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                 │                  │                 │
└─────────┼─────────────────┼──────────────────┼─────────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
┌────────────────────────────────────────────────────────────────┐
│                    CONTROLLER LAYER                            │
│  paymentController.js                                          │
│                                                                │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │ Payment Logic    │  │ Webhook Handler  │                   │
│  │ - Create         │  │ - Verify Sig     │                   │
│  │ - Confirm        │  │ - Update Order   │                   │
│  │ - Refund         │  │ - Event Process  │                   │
│  └────────┬─────────┘  └────────┬─────────┘                   │
│           │                     │                             │
└───────────┼─────────────────────┼─────────────────────────────┘
            │                     │
            ▼                     ▼
┌────────────────────────────────────────────────────────────────┐
│                     MODEL LAYER                                │
│  Order.js                                                      │
│                                                                │
│  Fields:                                                       │
│  - payment_status: 'pending' | 'paid' | 'failed' | 'refunded' │
│  - payment_method: 'stripe' | 'cash'                          │
│  - payment_intent_id: String                                  │
│  - checkout_session_id: String                                │
│                                                                │
│  Methods:                                                      │
│  - updatePaymentStatus()                                      │
│  - updateOrder()                                              │
└────────────┬───────────────────────────────────────────────────┘
             │
             ▼
┌────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                              │
│  MongoDB                                                       │
│                                                                │
│  Collections:                                                  │
│  - orders (payment data stored here)                          │
└────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                            │
│                                                                │
│  ┌──────────────────────────────────────────────────┐         │
│  │              Stripe API                          │         │
│  │  - Payment Intent API                            │         │
│  │  - Checkout Session API                          │         │
│  │  - Refunds API                                   │         │
│  │  - Webhooks                                      │         │
│  └──────────────────────────────────────────────────┘         │
└────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
yummy_go_backend/
│
├── config/
│   ├── database.js
│   ├── firebase.js
│   └── stripe.js ✨ NEW
│
├── Controllers/
│   ├── cartController.js
│   ├── deliveryController.js
│   ├── menuController.js
│   ├── orderController.js
│   ├── paymentController.js ✨ NEW
│   ├── restaurantController.js
│   ├── riderController.js
│   └── userController.js
│
├── models/
│   ├── Cart.js
│   ├── Delivery.js
│   ├── FoodRider.js
│   ├── Menu.js
│   ├── Order.js ⭐ UPDATED (payment fields)
│   ├── Restaurant.js
│   └── User.js
│
├── routes/
│   ├── cartRoutes.js
│   ├── deliveryRoutes.js
│   ├── index.js ⭐ UPDATED (payment routes)
│   ├── menuRoutes.js
│   ├── orderRoutes.js
│   ├── paymentRoutes.js ✨ NEW
│   ├── restaurantRoutes.js
│   ├── riderRoutes.js
│   └── userRoutes.js
│
├── utils/
│   ├── apiUtils.js
│   └── responseHelper.js
│
├── .env ⭐ UPDATED (Stripe keys)
├── index.js ⭐ UPDATED (webhook middleware)
├── package.json ⭐ UPDATED (stripe dependency)
│
├── PAYMENT_API_DOCUMENTATION.md ✨ NEW
├── STRIPE_SETUP_GUIDE.md ✨ NEW
├── STRIPE_IMPLEMENTATION_SUMMARY.md ✨ NEW
├── STRIPE_QUICK_REFERENCE.md ✨ NEW
├── STRIPE_ARCHITECTURE.md ✨ NEW (this file)
└── testPayment.js ✨ NEW
```

---

## Data Flow

### 1. Payment Creation

```
┌─────────────┐
│   Client    │ 
└──────┬──────┘
       │ POST { orderId, amount }
       ▼
┌────────────────────────┐
│  paymentController     │
│  createPaymentIntent() │
└──────┬─────────────────┘
       │ 1. Validate order exists
       │ 2. Check payment status
       ▼
┌────────────────────────┐
│    Stripe API          │
│  paymentIntents.create │
└──────┬─────────────────┘
       │ Return paymentIntent
       ▼
┌────────────────────────┐
│    Order Model         │
│  updateOrder()         │
│  + payment_intent_id   │
└──────┬─────────────────┘
       │ Return clientSecret
       ▼
┌────────────────────────┐
│   Response Helper      │
│   sendCreated()        │
└──────┬─────────────────┘
       │ { clientSecret, ... }
       ▼
┌─────────────┐
│   Client    │
└─────────────┘
```

### 2. Webhook Processing

```
┌─────────────┐
│   Stripe    │
└──────┬──────┘
       │ POST webhook event
       │ + stripe-signature header
       ▼
┌────────────────────────┐
│  Webhook Middleware    │
│  (Raw body parser)     │
└──────┬─────────────────┘
       │ Raw request body
       ▼
┌────────────────────────┐
│  paymentController     │
│  handleWebhook()       │
└──────┬─────────────────┘
       │ 1. Verify signature
       │ 2. Parse event type
       ▼
┌────────────────────────┐
│  Event Handler         │
│  switch(event.type)    │
└──────┬─────────────────┘
       │ Extract orderId
       ▼
┌────────────────────────┐
│    Order Model         │
│  updatePaymentStatus() │
│  payment_status='paid' │
└──────┬─────────────────┘
       │ Confirm update
       ▼
┌────────────────────────┐
│   Response Helper      │
│   sendSuccess()        │
└──────┬─────────────────┘
       │ { received: true }
       ▼
┌─────────────┐
│   Stripe    │
└─────────────┘
```

---

## Security Layers

```
┌────────────────────────────────────────────────────────────┐
│                     SECURITY LAYERS                        │
└────────────────────────────────────────────────────────────┘

Layer 1: Environment Variables
├── STRIPE_SECRET_KEY (never exposed to client)
└── STRIPE_WEBHOOK_SECRET (webhook signature verification)

Layer 2: Request Validation
├── Required field checks (orderId, amount, etc.)
├── Resource existence verification
└── Payment status validation (no double-payment)

Layer 3: Stripe API Security
├── API key authentication
├── HTTPS required
└── PCI compliance (Stripe handles card data)

Layer 4: Webhook Verification
├── Signature verification (stripe-signature header)
├── Timestamp validation
└── Event type filtering

Layer 5: Error Handling
├── Generic errors in production
├── Detailed errors in development only
└── All errors logged for monitoring

Layer 6: Database Security
├── MongoDB ObjectId validation
└── User authorization checks
```

---

## Integration Points

### Frontend ↔ Backend
```
Frontend                 Backend
   │                        │
   ├─ Create Order ────────>│
   │<─ Order Created ────────┤
   │                        │
   ├─ Request Payment ─────>│
   │<─ clientSecret ─────────┤
   │                        │
   ├─ (via Stripe.js) ─────> Stripe API
   │<─ Payment Result ────────┤
   │                        │
   ├─ Confirm Payment ─────>│
   │<─ Confirmed ────────────┤
```

### Backend ↔ Stripe
```
Backend                  Stripe
   │                        │
   ├─ Create Payment ─────>│
   │<─ Payment Intent ───────┤
   │                        │
   ├─ Retrieve Payment ────>│
   │<─ Payment Details ──────┤
   │                        │
   ├─ Refund ──────────────>│
   │<─ Refund Confirmed ─────┤
   │                        │
   │<─ Webhook Events ───────┤
   ├─ Acknowledge ─────────>│
```

### Backend ↔ Database
```
Backend                 MongoDB
   │                        │
   ├─ Create Order ───────>│
   │<─ Order Saved ──────────┤
   │                        │
   ├─ Update Payment ─────>│
   │  Status               │
   │<─ Updated ──────────────┤
   │                        │
   ├─ Get Payment ────────>│
   │  Details              │
   │<─ Order Data ───────────┤
```

---

**End of Architecture Documentation**
