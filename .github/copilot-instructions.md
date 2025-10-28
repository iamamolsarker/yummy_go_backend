# Yummy Go Backend - AI Coding Instructions

## Project Overview
Food delivery API backend using Node.js/Express with MongoDB native driver (NOT Mongoose). Deployed on Vercel as serverless functions with lazy database connection for cold start optimization.

## Architecture Pattern: 3-Tier MVC

### 1. Models (`/models/*`)
**Direct MongoDB operations** - No ORM abstraction layer.
```javascript
// Always use database.getCollection() wrapper
const collection = database.getCollection('users');
const user = await collection.findOne({ email });

// ObjectId conversion required for _id queries
const { ObjectId } = require('mongodb');
const doc = await collection.findOne({ _id: new ObjectId(id) });
```
**Pre-initialized collections**: `users`, `restaurants`, `riders`, `menus`, `carts`, `orders`, `deliveries`

### 2. Controllers (`/Controllers/*`)
**Business logic layer** - Always use `responseHelper` for consistency:
```javascript
const { sendSuccess, sendError, sendCreated, sendNotFound, sendBadRequest } = require('../utils/responseHelper');

// Standard controller pattern
const getUser = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) return sendBadRequest(res, 'Email is required');
    
    const user = await User.findByEmail(email);
    if (!user) return sendNotFound(res, 'User not found');
    
    return sendSuccess(res, user, 'User retrieved successfully');
  } catch (error) {
    console.error('Error:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};
```

### 3. Routes (`/routes/*`)
All routes mounted at `/api` prefix. **Route ordering is critical** - specific paths BEFORE parametric:
```javascript
router.get('/:email/role', controller.getUserRoleByEmail);    // BEFORE
router.get('/:email/status', controller.getUserStatusByEmail); // BEFORE  
router.get('/:email', controller.getUserByEmail);              // AFTER (catches all)
```

## Database Connection (Serverless Optimization)

**Lazy connection strategy** prevents cold start timeouts:
```javascript
// index.js - Database connected per API request, NOT on startup
app.use('/api', async (req, res, next) => {
  await database.connect(); // Connection pooling handles reuse
  next();
});
```

**Connection state management** (`config/database.js`):
- Maintains singleton connection with pooling (maxPoolSize: 10)
- `connectionPromise` prevents duplicate connection attempts
- `getCollection()` throws if database not connected
- Models may call `await database.connect()` defensively

## Data Model Conventions

### Timestamps
Use **ISO strings** (not Date objects) for consistency:
```javascript
created_at: new Date().toISOString()
updated_at: new Date().toISOString()
```

### Nested Objects
Location data uses nested structure:
```javascript
location: {
  address: string | null,
  city: string | null,
  area: string | null
}
```

### Status Workflows
- **User/Restaurant**: `pending` → `approved`/`rejected` → `active`/`suspended`
- **Orders**: `pending` → `confirmed` → `preparing` → `ready` → `picked_up` → `on_the_way` → `delivered`
- **Payment**: `pending` → `paid`/`failed`/`refunded`
- **Delivery**: `assigned` → `accepted` → `picked_up` → `on_the_way` → `delivered`

### Primary Identifiers
- **Users**: Use `email` (case-insensitive) as primary identifier, not `_id`
- **Restaurants/Riders**: Use MongoDB `_id` (ObjectId)
- **Orders**: Auto-generated `order_number` via `Order.generateOrderNumber()`

## Business Logic Patterns

### Order Creation Flow
Orders are **created from carts**, not directly:
```javascript
// 1. Validate cart exists and belongs to user
const cart = await Cart.findById(cart_id);
if (cart.user_email !== user_email) return sendBadRequest(res, 'Unauthorized');

// 2. Generate unique order number
const orderNumber = await Order.generateOrderNumber();

// 3. Copy cart items to order with pricing
const orderData = {
  order_number: orderNumber,
  user_email,
  restaurant_id: cart.restaurant_id,
  items: cart.items,
  total_amount: subtotal + delivery_fee + tax - discount
};

// 4. Create order and clear cart
await Order.create(orderData);
await Cart.clearCart(cart_id);
```

### Validation Pattern
**Always validate before querying**:
1. Extract parameters (`req.params`, `req.body`)
2. Check required fields → `sendBadRequest` if missing
3. Validate format/values → `sendBadRequest` if invalid
4. Check resource exists → `sendNotFound` if missing
5. Perform operation
6. Return appropriate response via `responseHelper`

## Response Helper Usage

Available functions in `utils/responseHelper.js`:
- `sendSuccess(res, data, message, statusCode=200)` - Standard success
- `sendCreated(res, data, message)` - 201 Created
- `sendError(res, message, statusCode=500, error)` - Error with optional stack
- `sendNotFound(res, message)` - 404 Not Found
- `sendBadRequest(res, message)` - 400 Bad Request
- `sendUnauthorized(res, message)` - 401 Unauthorized
- `sendForbidden(res, message)` - 403 Forbidden

**Error object only shown in development** (`NODE_ENV=development`)

## Development Commands

```bash
npm run dev    # Start with nodemon (auto-reload)
npm start      # Production start (used by Vercel)
```

## Deployment (Vercel Serverless)

**Configuration** (`vercel.json`):
- All routes proxy to `index.js`
- Max lambda size: 50mb
- Cold start mitigation: `/api/health` and `/api/warmup` endpoints

**Health check endpoint**:
```javascript
GET /api/health
// Returns: { status, message, timestamp, uptime, connected }
```

**Warmup endpoint** (pre-warm collections):
```javascript
GET /api/warmup
// Pre-loads: users, restaurants, orders, menus, carts
```

## Critical "Gotchas"

1. **ObjectId conversion**: Always wrap `_id` values: `new ObjectId(id)`
2. **Email queries**: Use case-insensitive regex for user lookups
3. **Route order**: Specific routes (`/:email/role`) before generic (`/:email`)
4. **Timestamps**: Use `.toISOString()`, not `new Date()` directly
5. **Database connection**: Models can defensively call `await database.connect()`
6. **Response helpers**: NEVER use `res.json()` directly - use `responseHelper` functions
7. **Error logging**: Always `console.error()` before calling `sendError()`

## External Dependencies

- **MongoDB**: Native driver v6.20.0 (NOT Mongoose)
- **Express**: v5.1.0 with JSON body parser (10mb limit)
- **Firebase Admin**: v13.5.0 (configured but commented out in `index.js`)
- **CORS**: Enabled for all origins
- **dotenv**: Environment variables from `.env`

## Testing
No test framework configured. Future tests should:
- Use same `database.getCollection()` pattern
- Mock MongoDB collections, not Mongoose models
- Test controller validation logic thoroughly