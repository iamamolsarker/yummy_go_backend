# 🍔 Yummy Go Backend API

A comprehensive food delivery backend API built with Node.js, Express, and MongoDB. Features Firebase authentication, Stripe payment integration, real-time delivery tracking, and role-based access control.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Features

- **🔐 Authentication & Authorization**
  - Firebase JWT authentication
  - Role-based access control (Admin, Restaurant Owner, Rider, User)
  - Account status verification (active/approved/suspended)

- **🏪 Restaurant Management**
  - Restaurant registration and approval workflow
  - Menu management with categories
  - Search and filter functionality
  - Rating and review system

- **🛒 Shopping Cart**
  - User-specific cart management
  - Real-time cart updates
  - Multiple item support with quantities

- **📦 Order Management**
  - Order creation from cart
  - Auto-generated unique order numbers
  - Order status tracking (pending → confirmed → preparing → ready → delivered)
  - Order cancellation

- **🏍️ Delivery System**
  - Rider assignment and management
  - Real-time location tracking
  - Delivery status updates
  - Delivery proof (photo/signature)
  - Issue reporting system

- **💳 Payment Integration**
  - Stripe payment intent support
  - Stripe hosted checkout
  - Payment confirmation
  - Refund processing
  - Webhook handling for automatic status updates

- **👥 User Management**
  - User registration and profile management
  - Role management (admin only)
  - Status management (approval/rejection)

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js 5.1.0
- **Database:** MongoDB (Native Driver 6.20.0)
- **Authentication:** Firebase Admin SDK 13.5.0
- **Payment:** Stripe 19.1.0
- **Deployment:** Vercel (Serverless Functions)

## 📁 Project Structure

```
yummy_go_backend/
├── config/
│   ├── database.js          # MongoDB connection with pooling
│   ├── firebase.js          # Firebase Admin initialization
│   └── stripe.js            # Stripe configuration
├── Controllers/
│   ├── cartController.js
│   ├── deliveryController.js
│   ├── menuController.js
│   ├── orderController.js
│   ├── paymentController.js
│   ├── restaurantController.js
│   ├── riderController.js
│   └── userController.js
├── middleware/
│   ├── auth.js              # JWT verification middleware
│   └── roleAuth.js          # Role-based authorization
├── models/
│   ├── Cart.js
│   ├── Delivery.js
│   ├── FoodRider.js
│   ├── Menu.js
│   ├── Order.js
│   ├── Restaurant.js
│   └── User.js
├── routes/
│   ├── index.js             # Main router
│   ├── cartRoutes.js
│   ├── deliveryRoutes.js
│   ├── menuRoutes.js
│   ├── orderRoutes.js
│   ├── paymentRoutes.js
│   ├── restaurantRoutes.js
│   ├── riderRoutes.js
│   └── userRoutes.js
├── utils/
│   ├── apiUtils.js
│   └── responseHelper.js    # Standardized API responses
├── .env                      # Environment variables
├── index.js                  # App entry point
├── package.json
└── vercel.json              # Vercel deployment config
```

## 🛠️ Installation & Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB Atlas account or local MongoDB
- Firebase project
- Stripe account (for payments)

### 1. Clone Repository

```bash
git clone https://github.com/iamamolsarker/yummy_go_backend.git
cd yummy_go_backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority

# Firebase Admin SDK (Base64 encoded service account key)
FB_SERVICE_KEY=your_base64_encoded_firebase_service_account_key

# Stripe Payment
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Server Configuration (optional)
PORT=5000
NODE_ENV=development
```

### 4. Run Development Server

```bash
npm run dev
```

Server will start at `http://localhost:5000`

### 5. Run Production Server

```bash
npm start
```

## 🔑 API Endpoints

### Base URL
- **Production:** `https://yummy-go-server.vercel.app/api`
- **Local:** `http://localhost:5000/api`

### Authentication

All protected endpoints require Firebase JWT token in the Authorization header:

```
Authorization: Bearer <firebase_jwt_token>
```

### Main Routes

| Route | Description | Auth Required |
|-------|-------------|---------------|
| `/users` | User management | Mixed |
| `/restaurants` | Restaurant operations | Mixed |
| `/riders` | Rider management | Mixed |
| `/carts` | Shopping cart | ✅ Yes |
| `/orders` | Order management | ✅ Yes |
| `/deliveries` | Delivery tracking | ✅ Yes |
| `/payments` | Payment processing | ✅ Yes |

### Quick Examples

#### Create User (Registration)
```bash
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```

#### Get Restaurants (Public)
```bash
GET /api/restaurants
```

#### Create Order (Authenticated)
```bash
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "cart_id": "60f7b1b9e5b6c8b9a0b1c1d3",
  "user_email": "john@example.com",
  "delivery_address": {
    "street": "123 Main St",
    "city": "Dhaka",
    "area": "Dhanmondi",
    "postal_code": "1205",
    "phone": "+8801234567890"
  },
  "payment_method": "card"
}
```

#### Create Payment Intent
```bash
POST /api/create-payment-intent
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "60f7b1b9e5b6c8b9a0b1c1d5",
  "amount": 25.50,
  "currency": "usd"
}
```

## 📚 Documentation

- **[API Documentation](./API_DOCUMENTATION.md)** - Complete API reference
- **[Middleware Usage](./MIDDLEWARE_USAGE.md)** - Authentication & authorization guide
- **[API Overview](./API_OVERVIEW.md)** - Quick start guide

## 🔐 Role-Based Access Control

### Roles

- **Admin** - Full system access
- **Restaurant Owner** - Manage restaurants, menus, and orders
- **Rider** - Manage deliveries and location updates
- **User** - Create orders, manage cart, track deliveries

### Middleware

- `verifyJWT` - Verifies Firebase authentication token
- `verifyAdmin` - Restricts access to admins only
- `verifyRestaurantOwner` - Restricts access to restaurant owners
- `verifyRider` - Restricts access to riders
- `verifyActiveUser` - Ensures user account is active/approved
- `verifyRole([roles])` - Flexible role verification

## 💳 Payment Integration

### Stripe Setup

1. Get your Stripe secret key from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Add to `.env` file
3. Test with test card: `4242 4242 4242 4242`

### Payment Flow

1. User creates order
2. Frontend calls `/api/create-payment-intent`
3. Backend creates Stripe payment intent
4. User completes payment on client side
5. Webhook updates order payment status automatically

## 🚀 Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

4. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `FB_SERVICE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`

### Vercel Configuration

The `vercel.json` file is pre-configured for serverless deployment with:
- Cold start optimization
- Raw body parsing for Stripe webhooks
- Route proxying to main handler

## 🧪 Testing

### With Postman

1. **Get Firebase Token:**
   - Login via Firebase Auth
   - Get ID token from Firebase SDK

2. **Add to Headers:**
   ```
   Authorization: Bearer <your_token>
   Content-Type: application/json
   ```

3. **Test Endpoints:**
   - Import the API documentation
   - Test with different user roles

### Test Cards (Stripe)

| Card Number | Scenario |
|------------|----------|
| 4242 4242 4242 4242 | ✅ Success |
| 4000 0025 0000 3155 | 🔐 3D Secure |
| 4000 0000 0000 9995 | ❌ Declined |

## 📊 Database Schema

### Collections

- **users** - User accounts and profiles
- **restaurants** - Restaurant information
- **riders** - Delivery rider profiles
- **menus** - Menu items for restaurants
- **carts** - Shopping carts
- **orders** - Customer orders
- **deliveries** - Delivery tracking data

### Key Features

- **MongoDB Native Driver** (not Mongoose)
- **Connection Pooling** for performance
- **Lazy Connection** for serverless optimization
- **ISO String Timestamps** for consistency

## 🔧 Development

### Available Scripts

```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Production start
```

### Code Style

- Use `async/await` for asynchronous operations
- Always use `responseHelper` for API responses
- Validate inputs before database queries
- Log errors with `console.error`
- Use meaningful variable names

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

##  Repository

- Repository: [yummy_go_backend](https://github.com/iamamolsarker/yummy_go_backend)

## 🙏 Acknowledgments

- Express.js team for the excellent framework
- MongoDB team for the native driver
- Firebase team for authentication services
- Stripe team for payment infrastructure
- Vercel team for serverless deployment platform

## 📞 Support

For support, email [team.codewarriors25@gmail.com] or open an issue in the repository.

## 🔄 Version History

- **v2.1** (Oct 30, 2025) - Added complete authentication & authorization middleware
- **v2.0** (Oct 28, 2025) - Added Stripe payment integration
- **v1.0** (Oct 2025) - Initial release with core features

---

**⭐ Star this repository if you find it helpful!**

Made with ❤️ by [Amol Sarker](https://github.com/iamamolsarker)
