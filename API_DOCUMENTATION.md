# Yummy Go Backend API Documentation

## Base URL
- **Production:** `https://yummy-go-server-c7y32u0q2-code-warriors-projects.vercel.app`
- **Local:** `http://localhost:5000`

## HTTP Methods Used
- **POST:** Create new resources
- **GET:** Retrieve resources  
- **PUT:** Complete replacement of resources
- **PATCH:** Partial updates (small changes)
- **DELETE:** Remove resources

---

## 👥 User Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users` | Create new user (default status: pending) |
| GET | `/api/users` | Get all users |
| GET | `/api/users/role/:role` | Get users by role (admin, user, rider, restaurant_owner) |
| GET | `/api/users/status/:status` | Get users by status (pending, approved, rejected, suspended, active) |
| GET | `/api/users/:email/role` | Get user role by email |
| GET | `/api/users/:email/status` | Get user status by email |
| PATCH | `/api/users/:email/role` | Update user role |
| PATCH | `/api/users/:email/status` | Update user status |
| PATCH | `/api/users/:email/profile` | Update user profile (name, phone, address) |
| GET | `/api/users/:email` | Get user by email |

---

## 🏪 Restaurant Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/restaurants` | Create new restaurant (default status: pending) |
| GET | `/api/restaurants` | Get all restaurants |
| GET | `/api/restaurants/search` | Search restaurants |
| GET | `/api/restaurants/nearby` | Get nearby restaurants |
| GET | `/api/restaurants/status/:status` | Get restaurants by status (pending, approved, rejected, suspended, active) |
| GET | `/api/restaurants/email/:email` | Get restaurant by email |
| GET | `/api/restaurants/:id/status` | Get restaurant status by ID |
| GET | `/api/restaurants/:id` | Get restaurant by ID |
| PUT | `/api/restaurants/:id` | Update complete restaurant info |
| DELETE | `/api/restaurants/:id` | Delete restaurant |
| PATCH | `/api/restaurants/:id/rating` | Update restaurant rating |
| PATCH | `/api/restaurants/:id/status` | Update restaurant status |

---

## 🍕 Menu Routes (Nested under restaurants)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/restaurants/:restaurantId/menus` | Add menu item to restaurant |
| GET | `/api/restaurants/:restaurantId/menus` | Get all menu items for restaurant |
| GET | `/api/restaurants/:restaurantId/menus/search` | Search menu items in restaurant |
| GET | `/api/restaurants/:restaurantId/menus/featured` | Get featured menu items |
| GET | `/api/restaurants/:restaurantId/menus/category/:category` | Get menus by category |
| GET | `/api/restaurants/:restaurantId/menus/:menuId` | Get specific menu item |
| PATCH | `/api/restaurants/:restaurantId/menus/:menuId` | Update menu item |
| PATCH | `/api/restaurants/:restaurantId/menus/:menuId/rating` | Update menu rating |
| DELETE | `/api/restaurants/:restaurantId/menus/:menuId` | Delete menu item |

---

## 🏍️ Rider Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/riders` | Create new rider |
| GET | `/api/riders` | Get all riders |
| GET | `/api/riders/available` | Get available riders |
| GET | `/api/riders/:id` | Get rider by ID |
| GET | `/api/riders/email/:email` | Get rider by email |
| PUT | `/api/riders/:id` | Update complete rider info |
| PATCH | `/api/riders/:id/status` | Update rider status (available/busy/offline) |
| PATCH | `/api/riders/:id/location` | Update rider location |
| PATCH | `/api/riders/:id/rating` | Update rider rating |
| DELETE | `/api/riders/:id` | Delete rider |

---

## � Cart Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/carts` | Create new cart |
| GET | `/api/carts` | Get all carts (admin function) |
| GET | `/api/carts/user/:userEmail` | Get cart by user email |
| GET | `/api/carts/:cartId` | Get cart by ID |
| POST | `/api/carts/:cartId/items` | Add item to cart |
| PATCH | `/api/carts/:cartId/items/:menuId/quantity` | Update item quantity in cart |
| DELETE | `/api/carts/:cartId/items/:menuId` | Remove item from cart |
| DELETE | `/api/carts/:cartId/clear` | Clear all items from cart |
| DELETE | `/api/carts/:cartId` | Delete cart |
| PATCH | `/api/carts/:cartId/status` | Update cart status (active/checkout/ordered/cancelled) |

---

## � Order Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create new order from cart |
| GET | `/api/orders` | Get all orders (admin function) |
| GET | `/api/orders/stats` | Get order statistics (admin function) |
| GET | `/api/orders/status/:status` | Get orders by status |
| GET | `/api/orders/user/:userEmail` | Get orders by user email |
| GET | `/api/orders/restaurant/:restaurantId` | Get orders by restaurant ID |
| GET | `/api/orders/rider/:riderId` | Get orders by rider ID |
| GET | `/api/orders/number/:orderNumber` | Get order by order number |
| GET | `/api/orders/:orderId` | Get order by ID |
| PATCH | `/api/orders/:orderId/status` | Update order status |
| PATCH | `/api/orders/:orderId/payment` | Update payment status |
| PATCH | `/api/orders/:orderId/rider` | Assign rider to order |
| PATCH | `/api/orders/:orderId/delivery-time` | Update delivery time |
| PATCH | `/api/orders/:orderId/cancel` | Cancel order |
| DELETE | `/api/orders/:orderId` | Delete order (admin function) |

---

## � Delivery Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/deliveries` | Create new delivery from order |
| GET | `/api/deliveries` | Get all deliveries (admin function) |
| GET | `/api/deliveries/stats` | Get delivery statistics (admin function) |
| GET | `/api/deliveries/active` | Get active deliveries |
| GET | `/api/deliveries/status/:status` | Get deliveries by status |
| GET | `/api/deliveries/user/:userEmail` | Get deliveries by user email |
| GET | `/api/deliveries/rider/:riderId` | Get deliveries by rider ID |
| GET | `/api/deliveries/rider/:riderId/stats` | Get rider delivery statistics |
| GET | `/api/deliveries/order/:orderId` | Get delivery by order ID |
| GET | `/api/deliveries/:deliveryId` | Get delivery by ID |
| PATCH | `/api/deliveries/:deliveryId/status` | Update delivery status |
| PATCH | `/api/deliveries/:deliveryId/location` | Update rider location |
| PATCH | `/api/deliveries/:deliveryId/times` | Update estimated times |
| PATCH | `/api/deliveries/:deliveryId/proof` | Update delivery proof |
| PATCH | `/api/deliveries/:deliveryId/rating` | Add customer rating |
| PATCH | `/api/deliveries/:deliveryId/cancel` | Cancel delivery |
| POST | `/api/deliveries/:deliveryId/issues` | Add delivery issue |
| DELETE | `/api/deliveries/:deliveryId` | Delete delivery (admin function) |

---

## �🔧 System Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Root endpoint (health check) |
| GET | `/health` | Server health status |
| GET | `/api/status` | API and database status |

---

## 📊 HTTP Status Codes Used

- **200:** Success
- **201:** Created
- **400:** Bad Request
- **404:** Not Found
- **500:** Internal Server Error

---

## 🚀 Usage Examples

### Create User
```bash
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user"
}
```

### Update Rider Status
```bash
PATCH /api/riders/123/status
Content-Type: application/json

{
  "status": "available"
}
```

### Update Restaurant Rating
```bash
PATCH /api/restaurants/456/rating
Content-Type: application/json

{
  "rating": 4.5
}
```

### Update User Status
```bash
PATCH /api/users/john@example.com/status
Content-Type: application/json

{
  "status": "approved"
}
```

### Update User Profile
```bash
PATCH /api/users/john@example.com/profile
Content-Type: application/json

{
  "name": "John Smith",
  "phone": "+8801234567890",
  "address": {
    "street": "123 Main Street",
    "city": "Dhaka",
    "area": "Dhanmondi",
    "postal_code": "1205"
  }
}
```

### Get Users by Status
```bash
GET /api/users/status/pending
```

### Update Restaurant Status (Accept/Reject)
```bash
PATCH /api/restaurants/123/status
Content-Type: application/json

{
  "status": "approved"
}
```

### Get Pending Restaurants
```bash
GET /api/restaurants/status/pending
```

### Get Restaurant by Email
```bash
GET /api/restaurants/email/info@dhakabiryani.com
```

### Create Cart
```bash
POST /api/carts
Content-Type: application/json

{
  "user_email": "john@example.com",
  "restaurant_id": "60f7b1b9e5b6c8b9a0b1c1d2"
}
```

### Add Item to Cart
```bash
POST /api/carts/60f7b1b9e5b6c8b9a0b1c1d3/items
Content-Type: application/json

{
  "menu_id": "60f7b1b9e5b6c8b9a0b1c1d4",
  "quantity": 2,
  "price": 15.99,
  "notes": "Extra spicy"
}
```

### Update Item Quantity
```bash
PATCH /api/carts/60f7b1b9e5b6c8b9a0b1c1d3/items/60f7b1b9e5b6c8b9a0b1c1d4/quantity
Content-Type: application/json

{
  "quantity": 3
}
```

### Update Cart Status
```bash
PATCH /api/carts/60f7b1b9e5b6c8b9a0b1c1d3/status
Content-Type: application/json

{
  "status": "checkout"
}
```

### Create Order from Cart
```bash
POST /api/orders
Content-Type: application/json

{
  "cart_id": "60f7b1b9e5b6c8b9a0b1c1d3",
  "user_email": "john@example.com",
  "delivery_address": {
    "street": "123 Main St",
    "city": "Dhaka",
    "area": "Dhanmondi",
    "postal_code": "1205",
    "phone": "+8801234567890",
    "instructions": "Ring the bell twice"
  },
  "payment_method": "card",
  "delivery_fee": 5.00,
  "tax_amount": 2.50,
  "discount_amount": 1.00,
  "special_instructions": "No onions please"
}
```

### Update Order Status
```bash
PATCH /api/orders/60f7b1b9e5b6c8b9a0b1c1d5/status
Content-Type: application/json

{
  "status": "confirmed"
}
```

### Assign Rider to Order
```bash
PATCH /api/orders/60f7b1b9e5b6c8b9a0b1c1d5/rider
Content-Type: application/json

{
  "rider_id": "60f7b1b9e5b6c8b9a0b1c1d6"
}
```

### Update Payment Status
```bash
PATCH /api/orders/60f7b1b9e5b6c8b9a0b1c1d5/payment
Content-Type: application/json

{
  "payment_status": "paid"
}
```

### Create Delivery from Order
```bash
POST /api/deliveries
Content-Type: application/json

{
  "order_id": "60f7b1b9e5b6c8b9a0b1c1d5",
  "rider_id": "60f7b1b9e5b6c8b9a0b1c1d6",
  "pickup_address": {
    "street": "123 Restaurant St",
    "city": "Dhaka",
    "area": "Gulshan",
    "contact_phone": "+8801234567890"
  },
  "delivery_address": {
    "street": "456 Customer Ave",
    "city": "Dhaka",
    "area": "Dhanmondi",
    "contact_phone": "+8801987654321",
    "instructions": "Ring the bell twice"
  },
  "estimated_pickup_time": "2025-10-14T18:00:00.000Z",
  "estimated_delivery_time": "2025-10-14T18:45:00.000Z",
  "priority": "normal"
}
```

### Update Delivery Status
```bash
PATCH /api/deliveries/60f7b1b9e5b6c8b9a0b1c1d7/status
Content-Type: application/json

{
  "status": "picked_up"
}
```

### Update Rider Location
```bash
PATCH /api/deliveries/60f7b1b9e5b6c8b9a0b1c1d7/location
Content-Type: application/json

{
  "latitude": 23.8103,
  "longitude": 90.4125
}
```

### Add Delivery Issue
```bash
POST /api/deliveries/60f7b1b9e5b6c8b9a0b1c1d7/issues
Content-Type: application/json

{
  "issue_type": "traffic",
  "description": "Heavy traffic on main road",
  "severity": "medium"
}
```

### Update Delivery Proof
```bash
PATCH /api/deliveries/60f7b1b9e5b6c8b9a0b1c1d7/proof
Content-Type: application/json

{
  "photo_url": "https://example.com/delivery-photo.jpg",
  "signature": "base64-signature-data",
  "notes": "Delivered to customer directly",
  "verification_code": "1234"
}
```

---

## 📝 Notes

- **PUT vs PATCH:** 
  - Use PUT for complete resource replacement
  - Use PATCH for partial updates (status, rating, location, etc.)
- **User Status Values:** pending, approved, rejected, suspended, active
- **User Role Values:** user, admin, restaurant_owner, rider
- **Restaurant Status Values:** pending, approved, rejected, suspended, active
- **Cart Status Values:** active, checkout, ordered, cancelled
- **Order Status Values:** pending, confirmed, preparing, ready, picked_up, on_the_way, delivered, cancelled
- **Payment Status Values:** pending, paid, failed, refunded
- **Delivery Status Values:** assigned, accepted, picked_up, on_the_way, arrived, delivered, cancelled
- All endpoints return JSON responses
- New users are created with default status: "pending"
- New restaurants are created with default status: "pending"
- New carts are created with default status: "active"
- New orders are created with default status: "pending" and payment status: "pending"
- New deliveries are created with default status: "assigned"
- Users can only have one active cart at a time
- Cart total amount is automatically calculated when items are added/updated
- Orders are created from carts and include automatic order number generation
- Order status changes automatically update relevant timestamps (confirmed_at, delivered_at, etc.)
- Deliveries track real-time location and provide location history
- Delivery status changes automatically update relevant timestamps (accepted_at, delivered_at, etc.)
- Deliveries support issue reporting, customer ratings, and delivery proof
- Authentication middleware can be added as needed
- Database: MongoDB with native driver
- Deployment: Vercel serverless functions