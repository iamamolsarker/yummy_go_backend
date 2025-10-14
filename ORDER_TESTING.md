# Order API Testing Guide

## Test the Order Routes

### 1. Create an Order from Cart
```bash
POST http://localhost:5000/api/orders
Content-Type: application/json

{
  "cart_id": "60f7b1b9e5b6c8b9a0b1c1d3",
  "user_email": "test@example.com",
  "delivery_address": {
    "street": "123 Main Street",
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

### 2. Get All Orders (Admin)
```bash
GET http://localhost:5000/api/orders
```

### 3. Get Order by ID
```bash
GET http://localhost:5000/api/orders/{orderId}
```

### 4. Get Order by Order Number
```bash
GET http://localhost:5000/api/orders/number/{orderNumber}
```

### 5. Get Orders by User Email
```bash
GET http://localhost:5000/api/orders/user/test@example.com
```

### 6. Get Orders by Restaurant ID
```bash
GET http://localhost:5000/api/orders/restaurant/{restaurantId}
```

### 7. Get Orders by Rider ID
```bash
GET http://localhost:5000/api/orders/rider/{riderId}
```

### 8. Get Orders by Status
```bash
GET http://localhost:5000/api/orders/status/pending
GET http://localhost:5000/api/orders/status/confirmed
GET http://localhost:5000/api/orders/status/delivered
```

### 9. Update Order Status
```bash
PATCH http://localhost:5000/api/orders/{orderId}/status
Content-Type: application/json

{
  "status": "confirmed"
}
```

### 10. Update Payment Status
```bash
PATCH http://localhost:5000/api/orders/{orderId}/payment
Content-Type: application/json

{
  "payment_status": "paid"
}
```

### 11. Assign Rider to Order
```bash
PATCH http://localhost:5000/api/orders/{orderId}/rider
Content-Type: application/json

{
  "rider_id": "60f7b1b9e5b6c8b9a0b1c1d6"
}
```

### 12. Update Delivery Time
```bash
PATCH http://localhost:5000/api/orders/{orderId}/delivery-time
Content-Type: application/json

{
  "estimated_time": "2025-10-14T18:30:00.000Z",
  "actual_time": "2025-10-14T18:25:00.000Z"
}
```

### 13. Cancel Order
```bash
PATCH http://localhost:5000/api/orders/{orderId}/cancel
Content-Type: application/json

{
  "cancellation_reason": "Customer requested cancellation"
}
```

### 14. Get Order Statistics (Admin)
```bash
GET http://localhost:5000/api/orders/stats
```

### 15. Delete Order (Admin)
```bash
DELETE http://localhost:5000/api/orders/{orderId}
```

## Order Data Structure

### Order Object
```json
{
  "_id": "ObjectId",
  "order_number": "string",
  "user_email": "string",
  "restaurant_id": "ObjectId",
  "rider_id": "ObjectId | null",
  "items": [
    {
      "menu_id": "ObjectId",
      "name": "string",
      "price": "number",
      "quantity": "number",
      "notes": "string",
      "subtotal": "number"
    }
  ],
  "subtotal": "number",
  "delivery_fee": "number",
  "tax_amount": "number",
  "discount_amount": "number",
  "total_amount": "number",
  "status": "string",
  "payment_status": "string",
  "payment_method": "string",
  "delivery_address": {
    "street": "string",
    "city": "string",
    "area": "string",
    "postal_code": "string",
    "phone": "string",
    "instructions": "string"
  },
  "restaurant_address": {
    "street": "string",
    "city": "string",
    "area": "string",
    "phone": "string"
  },
  "estimated_delivery_time": "ISO string",
  "actual_delivery_time": "ISO string",
  "preparation_time": "number",
  "special_instructions": "string",
  "placed_at": "ISO string",
  "confirmed_at": "ISO string",
  "prepared_at": "ISO string",
  "picked_up_at": "ISO string",
  "delivered_at": "ISO string",
  "cancelled_at": "ISO string",
  "created_at": "ISO string",
  "updated_at": "ISO string"
}
```

## Order Status Flow

### Normal Order Flow
1. **pending** → Order created, waiting for restaurant confirmation
2. **confirmed** → Restaurant confirmed the order
3. **preparing** → Restaurant is preparing the food
4. **ready** → Food is ready for pickup
5. **picked_up** → Rider picked up the order
6. **on_the_way** → Rider is on the way to deliver
7. **delivered** → Order successfully delivered

### Alternative Flows
- **cancelled** → Order cancelled at any point before delivery

## Payment Status Flow

1. **pending** → Payment not yet processed
2. **paid** → Payment successful
3. **failed** → Payment failed
4. **refunded** → Payment refunded (for cancelled orders)

## Important Notes

- Orders are created from existing carts
- Order numbers are automatically generated with format: `YG{timestamp}{random}`
- Cart status changes to 'ordered' when order is created
- Status changes automatically update relevant timestamps
- Orders can only be cancelled if not delivered or already cancelled
- Estimated delivery time is set to 45 minutes from order creation by default
- User, restaurant, and rider must exist before creating/updating orders

## Test Sequence

1. Create a user
2. Create a restaurant
3. Create a cart for the user and restaurant
4. Add items to the cart
5. Create an order from the cart
6. Update order status through the workflow
7. Assign a rider
8. Update delivery times
9. Mark as delivered or cancel if needed