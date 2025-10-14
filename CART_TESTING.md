# Cart API Testing Guide

## Test the Cart Routes

### 1. Create a Cart
```bash
POST http://localhost:5000/api/carts
Content-Type: application/json

{
  "user_email": "test@example.com",
  "restaurant_id": "60f7b1b9e5b6c8b9a0b1c1d2"
}
```

### 2. Get Cart by User Email
```bash
GET http://localhost:5000/api/carts/user/test@example.com
```

### 3. Add Item to Cart
```bash
POST http://localhost:5000/api/carts/{cartId}/items
Content-Type: application/json

{
  "menu_id": "60f7b1b9e5b6c8b9a0b1c1d4",
  "quantity": 2,
  "price": 15.99,
  "notes": "Extra spicy"
}
```

### 4. Update Item Quantity
```bash
PATCH http://localhost:5000/api/carts/{cartId}/items/{menuId}/quantity
Content-Type: application/json

{
  "quantity": 3
}
```

### 5. Remove Item from Cart
```bash
DELETE http://localhost:5000/api/carts/{cartId}/items/{menuId}
```

### 6. Clear Cart
```bash
DELETE http://localhost:5000/api/carts/{cartId}/clear
```

### 7. Update Cart Status
```bash
PATCH http://localhost:5000/api/carts/{cartId}/status
Content-Type: application/json

{
  "status": "checkout"
}
```

### 8. Get All Carts (Admin)
```bash
GET http://localhost:5000/api/carts
```

### 9. Delete Cart
```bash
DELETE http://localhost:5000/api/carts/{cartId}
```

## Cart Data Structure

### Cart Object
```json
{
  "_id": "ObjectId",
  "user_email": "string",
  "restaurant_id": "ObjectId",
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
  "total_amount": "number",
  "status": "active|checkout|ordered|cancelled",
  "created_at": "ISO string",
  "updated_at": "ISO string"
}
```

## Important Notes

- Users can only have one active cart at a time
- Cart total is automatically calculated when items are added/updated/removed
- Valid cart statuses: active, checkout, ordered, cancelled
- Items are automatically removed when quantity is set to 0
- Restaurant and menu items must exist before adding to cart