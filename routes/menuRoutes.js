const express = require('express');
const router = express.Router({ mergeParams: true });
const menuController = require('../Controllers/menuController');
const { verifyJWT } = require('../middleware/auth');
const { verifyAdminOrRestaurantOwner } = require('../middleware/roleAuth');

// All routes are nested under /restaurants/:restaurantId/menus

// Public routes (anyone can view menus)
// GET: Get all menu items for restaurant
router.get('/', menuController.getRestaurantMenus);

// GET: Search menu items in restaurant
router.get('/search', menuController.searchRestaurantMenus);

// GET: Get featured menu items for restaurant
router.get('/featured', menuController.getFeaturedMenus);

// GET: Get menu items by category for restaurant
router.get('/category/:category', menuController.getMenusByCategory);

// GET: Get specific menu item
router.get('/:menuId', menuController.getMenuById);

// Restaurant owner or admin routes
// POST: Add a new menu item to restaurant (restaurant owner or admin)
router.post('/', verifyJWT, verifyAdminOrRestaurantOwner, menuController.createMenu);

// PATCH: Update menu item (restaurant owner or admin)
router.patch('/:menuId', verifyJWT, verifyAdminOrRestaurantOwner, menuController.updateMenu);

// DELETE: Delete menu item (restaurant owner or admin)
router.delete('/:menuId', verifyJWT, verifyAdminOrRestaurantOwner, menuController.deleteMenu);

// User routes (authenticated users can rate)
// PATCH: Update menu rating (any authenticated user can rate)
router.patch('/:menuId/rating', verifyJWT, menuController.updateMenuRating);

module.exports = router;