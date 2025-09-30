const express = require('express');
const router = express.Router({ mergeParams: true });
const menuController = require('../Controllers/menuController');

// All routes are nested under /restaurants/:restaurantId/menus

// POST: Add a new menu item to restaurant
router.post('/', menuController.createMenu);

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

// PATCH: Update menu item
router.patch('/:menuId', menuController.updateMenu);

// PATCH: Update menu rating
router.patch('/:menuId/rating', menuController.updateMenuRating);

// DELETE: Delete menu item
router.delete('/:menuId', menuController.deleteMenu);

module.exports = router;