# Delivery API Testing Guide

## Test the Delivery Routes

### 1. Create a Delivery from Order
```bash
POST http://localhost:5000/api/deliveries
Content-Type: application/json

{
  "order_id": "60f7b1b9e5b6c8b9a0b1c1d5",
  "rider_id": "60f7b1b9e5b6c8b9a0b1c1d6",
  "pickup_address": {
    "street": "123 Restaurant Street",
    "city": "Dhaka",
    "area": "Gulshan",
    "latitude": 23.7808,
    "longitude": 90.4142,
    "contact_phone": "+8801234567890"
  },
  "delivery_address": {
    "street": "456 Customer Avenue",
    "city": "Dhaka",
    "area": "Dhanmondi",
    "postal_code": "1205",
    "latitude": 23.7461,
    "longitude": 90.3742,
    "contact_phone": "+8801987654321",
    "instructions": "Ring the bell twice"
  },
  "estimated_pickup_time": "2025-10-14T18:00:00.000Z",
  "estimated_delivery_time": "2025-10-14T18:45:00.000Z",
  "delivery_instructions": "Handle with care",
  "priority": "normal"
}
```

### 2. Get All Deliveries (Admin)
```bash
GET http://localhost:5000/api/deliveries
```

### 3. Get Active Deliveries
```bash
GET http://localhost:5000/api/deliveries/active
```

### 4. Get Delivery by ID
```bash
GET http://localhost:5000/api/deliveries/{deliveryId}
```

### 5. Get Delivery by Order ID
```bash
GET http://localhost:5000/api/deliveries/order/{orderId}
```

### 6. Get Deliveries by Rider ID
```bash
GET http://localhost:5000/api/deliveries/rider/{riderId}
```

### 7. Get Deliveries by User Email
```bash
GET http://localhost:5000/api/deliveries/user/customer@example.com
```

### 8. Get Deliveries by Status
```bash
GET http://localhost:5000/api/deliveries/status/assigned
GET http://localhost:5000/api/deliveries/status/picked_up
GET http://localhost:5000/api/deliveries/status/on_the_way
GET http://localhost:5000/api/deliveries/status/delivered
```

### 9. Update Delivery Status
```bash
PATCH http://localhost:5000/api/deliveries/{deliveryId}/status
Content-Type: application/json

{
  "status": "accepted"
}
```

### 10. Update Rider Location (Real-time tracking)
```bash
PATCH http://localhost:5000/api/deliveries/{deliveryId}/location
Content-Type: application/json

{
  "latitude": 23.8103,
  "longitude": 90.4125
}
```

### 11. Update Estimated Times
```bash
PATCH http://localhost:5000/api/deliveries/{deliveryId}/times
Content-Type: application/json

{
  "estimated_pickup_time": "2025-10-14T17:55:00.000Z",
  "estimated_delivery_time": "2025-10-14T18:40:00.000Z"
}
```

### 12. Add Delivery Issue
```bash
POST http://localhost:5000/api/deliveries/{deliveryId}/issues
Content-Type: application/json

{
  "issue_type": "traffic",
  "description": "Heavy traffic on main road causing delay",
  "severity": "medium"
}
```

### 13. Update Delivery Proof
```bash
PATCH http://localhost:5000/api/deliveries/{deliveryId}/proof
Content-Type: application/json

{
  "photo_url": "https://example.com/delivery-photo.jpg",
  "signature": "base64-encoded-signature-data",
  "notes": "Delivered to customer at door",
  "verification_code": "1234"
}
```

### 14. Add Customer Rating
```bash
PATCH http://localhost:5000/api/deliveries/{deliveryId}/rating
Content-Type: application/json

{
  "rating": 5,
  "feedback": "Excellent service, very fast delivery!"
}
```

### 15. Cancel Delivery
```bash
PATCH http://localhost:5000/api/deliveries/{deliveryId}/cancel
Content-Type: application/json

{
  "cancellation_reason": "Customer requested cancellation"
}
```

### 16. Get Delivery Statistics (Admin)
```bash
GET http://localhost:5000/api/deliveries/stats
```

### 17. Get Rider Delivery Statistics
```bash
GET http://localhost:5000/api/deliveries/rider/{riderId}/stats
```

### 18. Delete Delivery (Admin)
```bash
DELETE http://localhost:5000/api/deliveries/{deliveryId}
```

## Delivery Data Structure

### Delivery Object
```json
{
  "_id": "ObjectId",
  "order_id": "ObjectId",
  "order_number": "string",
  "rider_id": "ObjectId",
  "user_email": "string",
  "restaurant_id": "ObjectId",
  "status": "string",
  "pickup_address": {
    "street": "string",
    "city": "string",
    "area": "string",
    "latitude": "number",
    "longitude": "number",
    "contact_phone": "string"
  },
  "delivery_address": {
    "street": "string",
    "city": "string",
    "area": "string",
    "postal_code": "string",
    "latitude": "number",
    "longitude": "number",
    "contact_phone": "string",
    "instructions": "string"
  },
  "current_location": {
    "latitude": "number",
    "longitude": "number",
    "last_updated": "ISO string"
  },
  "estimated_distance": "number",
  "actual_distance": "number",
  "estimated_duration": "number",
  "actual_duration": "number",
  "delivery_fee": "number",
  "delivery_instructions": "string",
  "priority": "normal|high|urgent",
  "assigned_at": "ISO string",
  "accepted_at": "ISO string",
  "picked_up_at": "ISO string",
  "arrived_at_customer_at": "ISO string",
  "delivered_at": "ISO string",
  "cancelled_at": "ISO string",
  "estimated_pickup_time": "ISO string",
  "estimated_delivery_time": "ISO string",
  "delivery_proof": {
    "photo_url": "string",
    "signature": "string",
    "notes": "string",
    "verification_code": "string"
  },
  "issues": [
    {
      "issue_type": "string",
      "description": "string",
      "severity": "low|medium|high",
      "reported_at": "ISO string"
    }
  ],
  "rider_notes": "string",
  "customer_rating": "number (1-5)",
  "customer_feedback": "string",
  "location_history": [
    {
      "latitude": "number",
      "longitude": "number",
      "timestamp": "ISO string"
    }
  ],
  "created_at": "ISO string",
  "updated_at": "ISO string"
}
```

## Delivery Status Flow

### Normal Delivery Flow
1. **assigned** → Delivery assigned to rider
2. **accepted** → Rider accepted the delivery
3. **picked_up** → Rider picked up the order from restaurant
4. **on_the_way** → Rider is on the way to customer
5. **arrived** → Rider arrived at customer location
6. **delivered** → Order successfully delivered

### Alternative Flows
- **cancelled** → Delivery cancelled at any point before delivery

## Priority Levels

- **normal** → Standard delivery priority
- **high** → Higher priority delivery
- **urgent** → Urgent delivery (fastest processing)

## Issue Types

Common issue types for delivery problems:
- **traffic** → Traffic delays
- **weather** → Weather-related issues
- **address** → Address not found or incorrect
- **customer** → Customer-related issues
- **vehicle** → Rider vehicle problems
- **restaurant** → Restaurant-related delays
- **other** → Other miscellaneous issues

## Issue Severity Levels

- **low** → Minor issues that don't significantly impact delivery
- **medium** → Moderate issues causing some delay
- **high** → Major issues requiring immediate attention

## Real-time Features

### Location Tracking
- Real-time GPS location updates
- Location history for route tracking
- Automatic location logging with timestamps

### Status Updates
- Automatic timestamp recording for each status change
- Real-time status notifications
- Estimated vs actual time tracking

### Communication
- Issue reporting system
- Rider notes and customer feedback
- Delivery instructions and special requests

## Important Notes

- Deliveries are created from existing orders
- One delivery per order (1:1 relationship)
- Location updates create historical tracking data
- Status changes automatically update relevant timestamps
- Deliveries can only be cancelled if not delivered or already cancelled
- Customer ratings must be between 1 and 5
- All location data includes latitude and longitude coordinates
- Priority affects processing order and estimated times

## Test Sequence

1. Create an order (prerequisite)
2. Create a delivery for the order
3. Update delivery status through the workflow
4. Update rider location multiple times (simulate movement)
5. Add any delivery issues if needed
6. Update delivery proof when delivered
7. Add customer rating and feedback
8. View delivery statistics and history

## Integration Points

- **Orders**: Deliveries are created from orders
- **Riders**: Assigned rider tracks and completes delivery
- **Restaurants**: Pickup location and contact information
- **Customers**: Delivery address and contact details
- **Real-time Tracking**: Location updates for live tracking