# Yummy Go Backend - AI Coding Instructions

## Project Architecture

This is a Node.js/Express food delivery API backend with MongoDB using the native driver (not Mongoose). The app follows a 3-tier MVC pattern with clear separation:

- **Models** (`/models/*`): Direct MongoDB operations using `database.getCollection()`
- **Controllers** (`/Controllers/*`): Business logic with consistent response patterns via `responseHelper`
- **Routes** (`/routes/*`): Express routing mounted at `/api` prefix

## Key Patterns

### Database Layer
- Use `database.getCollection('collectionName')` instead of direct MongoDB client
- Collections are pre-initialized: `users`, `restaurants`, `riders`, `menus`, `carts`, `orders`
- Models return raw MongoDB results (not abstracted objects)
- Always use `new ObjectId(id)` for MongoDB `_id` queries

### Response Consistency
Import and use `responseHelper` functions in ALL controllers:
```javascript
const { sendSuccess, sendError, sendCreated, sendNotFound, sendBadRequest } = require('../utils/responseHelper');
```

### User Role & Status System
- **Roles**: `user`, `admin`, `restaurant_owner`, `rider`
- **Statuses**: `pending`, `approved`, `rejected`, `suspended`, `active`
- **Order Statuses**: `pending`, `confirmed`, `preparing`, `ready`, `picked_up`, `on_the_way`, `delivered`, `cancelled`
- **Payment Statuses**: `pending`, `paid`, `failed`, `refunded`
- New users/restaurants default to `pending` status
- Use email as primary identifier (not _id) for user operations
- Orders are created from carts and auto-generate unique order numbers

### Route Ordering (Critical)
When adding parametric routes, order matters. Specific paths must come BEFORE generic `:param` routes:
```javascript
router.get('/:email/role', controller.getUserRoleByEmail);  // BEFORE
router.get('/:email', controller.getUserByEmail);           // AFTER
```

### Controller Validation Pattern
Every controller function follows this structure:
1. Extract and validate required parameters
2. Check resource existence when updating
3. Use appropriate `responseHelper` function
4. Always wrap in try/catch with error logging

### Model Conventions
- Use ISO timestamp strings: `new Date().toISOString()`
- Include `created_at` and `updated_at` fields
- Use nested objects for complex data (e.g., `location: { address, city, area }`)

## Development Workflow

- **Start dev server**: `npm run dev` (uses nodemon)
- **Production**: `npm start`
- Firebase is configured but commented out in `index.js`
- Vercel deployment ready with `vercel.json`

## External Integrations

- **MongoDB**: Native driver with connection pooling
- **Firebase**: Admin SDK ready (currently disabled)
- **CORS**: Enabled for all origins
- **Vercel**: Serverless deployment configured

## Testing
No test framework currently configured. When adding tests, ensure database operations use the same `database.getCollection()` pattern.