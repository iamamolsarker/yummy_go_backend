# Middleware Usage Guide

## Available Middleware

### Authentication Middleware (`auth.js`)

#### 1. `verifyJWT`
Verifies Firebase JWT token from Authorization header.

**Usage:**
```javascript
const { verifyJWT } = require('./middleware/auth');

router.get('/protected', verifyJWT, (req, res) => {
    // req.decoded contains user info (email, uid, etc.)
    res.json({ user: req.decoded });
});
```

#### 2. `optionalAuth`
Optional authentication - continues even without valid token.

**Usage:**
```javascript
const { optionalAuth } = require('./middleware/auth');

router.get('/public', optionalAuth, (req, res) => {
    // req.decoded will be null if no token or user info if authenticated
    const isAuthenticated = req.decoded !== null;
    res.json({ isAuthenticated, user: req.decoded });
});
```

---

### Role-Based Authorization Middleware (`roleAuth.js`)

#### 1. `verifyAdmin`
Ensures user has admin role.

**Usage:**
```javascript
const { verifyJWT } = require('./middleware/auth');
const { verifyAdmin } = require('./middleware/roleAuth');

// Admin-only endpoint
router.get('/admin/dashboard', verifyJWT, verifyAdmin, (req, res) => {
    // req.user contains full user object
    res.json({ message: 'Admin dashboard' });
});
```

#### 2. `verifyRestaurantOwner`
Ensures user has restaurant_owner role.

**Usage:**
```javascript
router.get('/restaurant/dashboard', verifyJWT, verifyRestaurantOwner, (req, res) => {
    res.json({ message: 'Restaurant owner dashboard' });
});
```

#### 3. `verifyRider`
Ensures user has rider role.

**Usage:**
```javascript
router.get('/rider/deliveries', verifyJWT, verifyRider, (req, res) => {
    res.json({ message: 'Rider deliveries' });
});
```

#### 4. `verifyAdminOrRestaurantOwner`
Allows both admin and restaurant_owner roles.

**Usage:**
```javascript
router.patch('/restaurants/:id', verifyJWT, verifyAdminOrRestaurantOwner, (req, res) => {
    res.json({ message: 'Restaurant updated' });
});
```

#### 5. `verifyRole(roles)`
Custom role verification - accepts single role or array.

**Usage:**
```javascript
const { verifyRole } = require('./middleware/roleAuth');

// Single role
router.get('/admin-only', verifyJWT, verifyRole('admin'), (req, res) => {
    res.json({ message: 'Admin only' });
});

// Multiple roles
router.get('/staff-area', verifyJWT, verifyRole(['admin', 'restaurant_owner', 'rider']), (req, res) => {
    res.json({ message: 'Staff area' });
});
```

#### 6. `verifyActiveUser`
Ensures user's account status is 'active' or 'approved'.

**Usage:**
```javascript
router.post('/orders', verifyJWT, verifyActiveUser, (req, res) => {
    // Only active/approved users can create orders
    res.json({ message: 'Order created' });
});
```

---

## Complete Route Examples

### User Routes
```javascript
const express = require('express');
const router = express.Router();
const { verifyJWT, optionalAuth } = require('../middleware/auth');
const { verifyAdmin, verifyActiveUser } = require('../middleware/roleAuth');
const userController = require('../Controllers/userController');

// Public routes
router.post('/register', userController.createUser);
router.get('/:email', optionalAuth, userController.getUserByEmail);

// Protected routes (requires authentication)
router.patch('/:email/profile', verifyJWT, verifyActiveUser, userController.updateProfile);

// Admin-only routes
router.get('/', verifyJWT, verifyAdmin, userController.getAllUsers);
router.patch('/:email/role', verifyJWT, verifyAdmin, userController.updateUserRole);
router.patch('/:email/status', verifyJWT, verifyAdmin, userController.updateUserStatus);

module.exports = router;
```

### Restaurant Routes
```javascript
const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const { verifyAdmin, verifyRestaurantOwner, verifyAdminOrRestaurantOwner } = require('../middleware/roleAuth');
const restaurantController = require('../Controllers/restaurantController');

// Public routes
router.get('/', restaurantController.getAllRestaurants);
router.get('/:id', restaurantController.getRestaurantById);

// Restaurant owner routes
router.post('/', verifyJWT, verifyRestaurantOwner, restaurantController.createRestaurant);
router.put('/:id', verifyJWT, verifyRestaurantOwner, restaurantController.updateRestaurant);

// Admin or Restaurant owner routes
router.patch('/:id/rating', verifyJWT, verifyAdminOrRestaurantOwner, restaurantController.updateRating);

// Admin-only routes
router.patch('/:id/status', verifyJWT, verifyAdmin, restaurantController.updateStatus);
router.delete('/:id', verifyJWT, verifyAdmin, restaurantController.deleteRestaurant);

module.exports = router;
```

### Order Routes
```javascript
const express = require('express');
const router = express.Router();
const { verifyJWT } = require('../middleware/auth');
const { verifyAdmin, verifyActiveUser, verifyRole } = require('../middleware/roleAuth');
const orderController = require('../Controllers/orderController');

// User routes (authenticated and active)
router.post('/', verifyJWT, verifyActiveUser, orderController.createOrder);
router.get('/user/:userEmail', verifyJWT, orderController.getOrdersByUserEmail);

// Restaurant owner routes
router.get('/restaurant/:restaurantId', verifyJWT, verifyRole('restaurant_owner'), orderController.getOrdersByRestaurantId);
router.patch('/:orderId/status', verifyJWT, verifyRole('restaurant_owner'), orderController.updateOrderStatus);

// Rider routes
router.get('/rider/:riderId', verifyJWT, verifyRole('rider'), orderController.getOrdersByRiderId);

// Admin routes
router.get('/', verifyJWT, verifyAdmin, orderController.getAllOrders);
router.get('/stats', verifyJWT, verifyAdmin, orderController.getOrderStats);
router.delete('/:orderId', verifyJWT, verifyAdmin, orderController.deleteOrder);

// Multiple role access
router.patch('/:orderId/rider', verifyJWT, verifyRole(['admin', 'restaurant_owner']), orderController.assignRider);

module.exports = router;
```

---

## Request Flow

1. **Client sends request** with Authorization header:
   ```
   Authorization: Bearer <firebase_jwt_token>
   ```

2. **verifyJWT middleware** runs:
   - Extracts token from header
   - Verifies token with Firebase Admin
   - Attaches decoded user info to `req.decoded`
   - Continues to next middleware

3. **Role middleware** runs (if used):
   - Gets user email from `req.decoded.email`
   - Queries database for user
   - Checks user role/status
   - Attaches full user object to `req.user`
   - Continues to route handler

4. **Route handler** executes:
   - Access user info via `req.decoded` or `req.user`
   - Process request and send response

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized access - Please login first"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Forbidden access - Admin privileges required"
}
```

### 500 Server Error
```json
{
  "success": false,
  "message": "Error verifying admin access",
  "error": "Error details (in development mode)"
}
```

---

## Client-Side Integration

### Getting Firebase Token (Frontend)
```javascript
import { getAuth } from 'firebase/auth';

const auth = getAuth();
const user = auth.currentUser;

if (user) {
  const token = await user.getIdToken();
  
  // Make API request with token
  const response = await fetch('https://api.example.com/protected', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
}
```

### Axios Interceptor
```javascript
import axios from 'axios';
import { getAuth } from 'firebase/auth';

const api = axios.create({
  baseURL: 'https://api.example.com'
});

// Add token to every request
api.interceptors.request.use(async (config) => {
  const auth = getAuth();
  const user = auth.currentUser;
  
  if (user) {
    const token = await user.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
});

export default api;
```

---

## Best Practices

1. **Always use verifyJWT first** before role-based middleware
2. **Use verifyActiveUser** for user-facing features
3. **Use optionalAuth** for public endpoints that can show different content for authenticated users
4. **Chain middleware** in order: `verifyJWT → verifyRole → handler`
5. **Use verifyRole(['role1', 'role2'])** for flexible multi-role access
6. **Handle token expiration** on client-side by refreshing token

---

## Testing with Postman

1. **Login with Firebase** to get token
2. **Add to Headers:**
   ```
   Authorization: Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6...
   ```
3. **Test different roles** by changing user role in database
4. **Test expired tokens** to verify error handling

---

**Last Updated:** October 30, 2025  
**Version:** 1.0
