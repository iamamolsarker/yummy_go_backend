const Menu = require('../models/Menu');
const Restaurant = require('../models/Restaurant');
const { sendSuccess, sendError, sendCreated, sendNotFound, sendBadRequest } = require('../utils/responseHelper');

// Create a new menu item for a restaurant
const createMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { name, description, price, category, image, ingredients, allergens, nutrition, is_vegetarian, is_vegan, is_halal, preparation_time } = req.body;

    // Basic validation
    if (!name || !price) {
      return sendBadRequest(res, 'Menu name and price are required');
    }

    if (!restaurantId) {
      return sendBadRequest(res, 'Restaurant ID is required');
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return sendNotFound(res, 'Restaurant not found');
    }

    // Create menu item
    const menuData = {
      restaurant_id: restaurantId,
      name,
      description,
      price: parseFloat(price),
      category,
      image,
      ingredients: ingredients || [],
      allergens: allergens || [],
      nutrition: nutrition || {},
      is_vegetarian: is_vegetarian || false,
      is_vegan: is_vegan || false,
      is_halal: is_halal !== undefined ? is_halal : true,
      preparation_time: preparation_time || '15-20 mins'
    };

    const result = await Menu.create(menuData);

    return sendCreated(res, {
      menuId: result.insertedId,
      menu: menuData
    }, 'Menu item created successfully');

  } catch (error) {
    console.error('Error creating menu:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get all menu items for a restaurant
const getRestaurantMenus = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { category, is_vegetarian, is_vegan, is_featured, min_price, max_price } = req.query;

    if (!restaurantId) {
      return sendBadRequest(res, 'Restaurant ID is required');
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return sendNotFound(res, 'Restaurant not found');
    }

    const filters = {};
    if (category) filters.category = category;
    if (is_vegetarian !== undefined) filters.is_vegetarian = is_vegetarian === 'true';
    if (is_vegan !== undefined) filters.is_vegan = is_vegan === 'true';
    if (is_featured !== undefined) filters.is_featured = is_featured === 'true';
    if (min_price) filters.min_price = min_price;
    if (max_price) filters.max_price = max_price;

    const menus = await Menu.findByRestaurantId(restaurantId, filters);

    return sendSuccess(res, menus, 'Restaurant menus retrieved successfully');

  } catch (error) {
    console.error('Error retrieving restaurant menus:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get a specific menu item
const getMenuById = async (req, res) => {
  try {
    const { restaurantId, menuId } = req.params;

    if (!restaurantId || !menuId) {
      return sendBadRequest(res, 'Restaurant ID and Menu ID are required');
    }

    const menu = await Menu.findById(menuId);
    if (!menu) {
      return sendNotFound(res, 'Menu item not found');
    }

    // Check if menu belongs to the restaurant
    if (menu.restaurant_id.toString() !== restaurantId) {
      return sendNotFound(res, 'Menu item not found in this restaurant');
    }

    return sendSuccess(res, menu, 'Menu item retrieved successfully');

  } catch (error) {
    console.error('Error retrieving menu item:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Update a menu item
const updateMenu = async (req, res) => {
  try {
    const { restaurantId, menuId } = req.params;
    const updateData = req.body;

    if (!restaurantId || !menuId) {
      return sendBadRequest(res, 'Restaurant ID and Menu ID are required');
    }

    // Check if menu exists and belongs to restaurant
    const existingMenu = await Menu.findById(menuId);
    if (!existingMenu) {
      return sendNotFound(res, 'Menu item not found');
    }

    if (existingMenu.restaurant_id.toString() !== restaurantId) {
      return sendNotFound(res, 'Menu item not found in this restaurant');
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.created_at;
    delete updateData._id;
    delete updateData.restaurant_id;

    // Convert price to number if provided
    if (updateData.price) {
      updateData.price = parseFloat(updateData.price);
    }

    const result = await Menu.updateById(menuId, updateData);

    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to update menu item', 400);
    }

    return sendSuccess(res, { updated: true }, 'Menu item updated successfully');

  } catch (error) {
    console.error('Error updating menu item:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Delete a menu item (soft delete)
const deleteMenu = async (req, res) => {
  try {
    const { restaurantId, menuId } = req.params;

    if (!restaurantId || !menuId) {
      return sendBadRequest(res, 'Restaurant ID and Menu ID are required');
    }

    // Check if menu exists and belongs to restaurant
    const existingMenu = await Menu.findById(menuId);
    if (!existingMenu) {
      return sendNotFound(res, 'Menu item not found');
    }

    if (existingMenu.restaurant_id.toString() !== restaurantId) {
      return sendNotFound(res, 'Menu item not found in this restaurant');
    }

    const result = await Menu.deleteById(menuId);

    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to delete menu item', 400);
    }

    return sendSuccess(res, { deleted: true }, 'Menu item deleted successfully');

  } catch (error) {
    console.error('Error deleting menu item:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Search menu items in a restaurant
const searchRestaurantMenus = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const { q } = req.query;

    if (!restaurantId) {
      return sendBadRequest(res, 'Restaurant ID is required');
    }

    if (!q) {
      return sendBadRequest(res, 'Search query is required');
    }

    const menus = await Menu.searchMenus(q, restaurantId);

    return sendSuccess(res, menus, 'Menu search results retrieved successfully');

  } catch (error) {
    console.error('Error searching menus:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get featured menu items for a restaurant
const getFeaturedMenus = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    if (!restaurantId) {
      return sendBadRequest(res, 'Restaurant ID is required');
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return sendNotFound(res, 'Restaurant not found');
    }

    const featuredMenus = await Menu.getFeaturedMenus(restaurantId);

    return sendSuccess(res, featuredMenus, 'Featured menus retrieved successfully');

  } catch (error) {
    console.error('Error retrieving featured menus:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get menus by category for a restaurant
const getMenusByCategory = async (req, res) => {
  try {
    const { restaurantId, category } = req.params;

    if (!restaurantId || !category) {
      return sendBadRequest(res, 'Restaurant ID and category are required');
    }

    // Check if restaurant exists
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return sendNotFound(res, 'Restaurant not found');
    }

    const menus = await Menu.getMenusByCategory(restaurantId, category);

    return sendSuccess(res, menus, `${category} menus retrieved successfully`);

  } catch (error) {
    console.error('Error retrieving menus by category:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Update menu rating
const updateMenuRating = async (req, res) => {
  try {
    const { restaurantId, menuId } = req.params;
    const { rating, total_reviews } = req.body;

    if (!restaurantId || !menuId) {
      return sendBadRequest(res, 'Restaurant ID and Menu ID are required');
    }

    if (!rating || !total_reviews) {
      return sendBadRequest(res, 'Rating and total reviews are required');
    }

    // Check if menu exists and belongs to restaurant
    const existingMenu = await Menu.findById(menuId);
    if (!existingMenu) {
      return sendNotFound(res, 'Menu item not found');
    }

    if (existingMenu.restaurant_id.toString() !== restaurantId) {
      return sendNotFound(res, 'Menu item not found in this restaurant');
    }

    const result = await Menu.updateRating(menuId, rating, total_reviews);

    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to update menu rating', 400);
    }

    return sendSuccess(res, { updated: true }, 'Menu rating updated successfully');

  } catch (error) {
    console.error('Error updating menu rating:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

module.exports = {
  createMenu,
  getRestaurantMenus,
  getMenuById,
  updateMenu,
  deleteMenu,
  searchRestaurantMenus,
  getFeaturedMenus,
  getMenusByCategory,
  updateMenuRating
};