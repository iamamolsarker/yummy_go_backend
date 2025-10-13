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

## 🔧 System Routes

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

---

## 📝 Notes

- **PUT vs PATCH:** 
  - Use PUT for complete resource replacement
  - Use PATCH for partial updates (status, rating, location, etc.)
- **User Status Values:** pending, approved, rejected, suspended, active
- **User Role Values:** user, admin, restaurant_owner, rider
- **Restaurant Status Values:** pending, approved, rejected, suspended, active
- All endpoints return JSON responses
- New users are created with default status: "pending"
- New restaurants are created with default status: "pending"
- Authentication middleware can be added as needed
- Database: MongoDB with native driver
- Deployment: Vercel serverless functions