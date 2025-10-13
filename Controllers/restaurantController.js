const Restaurant = require('../models/Restaurant');
const { sendSuccess, sendError, sendCreated, sendNotFound, sendBadRequest } = require('../utils/responseHelper');

// Create a new restaurant
const createRestaurant = async (req, res) => {
  try {
    const { name, location, phone, email, cuisine, category } = req.body;

    // Basic validation
    if (!name) {
      return sendBadRequest(res, 'Restaurant name is required');
    }

    // Check if restaurant already exists
    const existingRestaurant = await Restaurant.findByName(name);
    if (existingRestaurant) {
      return sendBadRequest(res, 'Restaurant with this name already exists');
    }

    // Create new restaurant
    const restaurantData = {
      name,
      location: location ? (typeof location === 'string' ? { address: location } : location) : null,
      phone: phone || null,
      email: email || null,
      cuisine: cuisine || [],
      category: category || 'restaurant'
    };

    const result = await Restaurant.create(restaurantData);

    return sendCreated(res, {
      restaurantId: result.insertedId,
      restaurant: restaurantData
    }, 'Restaurant created successfully');

  } catch (error) {
    console.error('Error creating restaurant:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get all restaurants
const getAllRestaurants = async (req, res) => {
  try {
    const { cuisine, city, area, category, is_featured } = req.query;
    
    const filters = {};
    if (cuisine) filters.cuisine = cuisine;
    if (city) filters.city = city;
    if (area) filters.area = area;
    if (category) filters.category = category;
    if (is_featured) filters.is_featured = is_featured === 'true';

    const restaurants = await Restaurant.findAll(filters);

    return sendSuccess(res, restaurants, 'Restaurants retrieved successfully');

  } catch (error) {
    console.error('Error retrieving restaurants:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get restaurant by ID
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendBadRequest(res, 'Restaurant ID is required');
    }

    const restaurant = await Restaurant.findById(id);
    if (!restaurant) {
      return sendNotFound(res, 'Restaurant not found');
    }

    return sendSuccess(res, restaurant, 'Restaurant retrieved successfully');

  } catch (error) {
    console.error('Error retrieving restaurant:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Update restaurant
const updateRestaurant = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return sendBadRequest(res, 'Restaurant ID is required');
    }

    // Check if restaurant exists
    const existingRestaurant = await Restaurant.findById(id);
    if (!existingRestaurant) {
      return sendNotFound(res, 'Restaurant not found');
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.created_at;
    delete updateData._id;

    const result = await Restaurant.updateById(id, updateData);

    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to update restaurant', 400);
    }

    return sendSuccess(res, { updated: true }, 'Restaurant updated successfully');

  } catch (error) {
    console.error('Error updating restaurant:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Delete restaurant (soft delete)
const deleteRestaurant = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendBadRequest(res, 'Restaurant ID is required');
    }

    // Check if restaurant exists
    const existingRestaurant = await Restaurant.findById(id);
    if (!existingRestaurant) {
      return sendNotFound(res, 'Restaurant not found');
    }

    const result = await Restaurant.deleteById(id);

    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to delete restaurant', 400);
    }

    return sendSuccess(res, { deleted: true }, 'Restaurant deleted successfully');

  } catch (error) {
    console.error('Error deleting restaurant:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Search restaurants
const searchRestaurants = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return sendBadRequest(res, 'Search query is required');
    }

    const restaurants = await Restaurant.searchRestaurants(q);

    return sendSuccess(res, restaurants, 'Search results retrieved successfully');

  } catch (error) {
    console.error('Error searching restaurants:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get nearby restaurants
const getNearbyRestaurants = async (req, res) => {
  try {
    const { lat, lng, distance } = req.query;

    if (!lat || !lng) {
      return sendBadRequest(res, 'Latitude and longitude are required');
    }

    const coordinates = {
      lat: parseFloat(lat),
      lng: parseFloat(lng)
    };

    const maxDistance = distance ? parseInt(distance) : 5000; // Default 5km

    const restaurants = await Restaurant.findNearby(coordinates, maxDistance);

    return sendSuccess(res, restaurants, 'Nearby restaurants retrieved successfully');

  } catch (error) {
    console.error('Error finding nearby restaurants:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Update restaurant rating
const updateRestaurantRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, total_reviews } = req.body;

    if (!id) {
      return sendBadRequest(res, 'Restaurant ID is required');
    }

    if (!rating || !total_reviews) {
      return sendBadRequest(res, 'Rating and total reviews are required');
    }

    // Check if restaurant exists
    const existingRestaurant = await Restaurant.findById(id);
    if (!existingRestaurant) {
      return sendNotFound(res, 'Restaurant not found');
    }

    const result = await Restaurant.updateRating(id, rating, total_reviews);

    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to update rating', 400);
    }

    return sendSuccess(res, { updated: true }, 'Restaurant rating updated successfully');

  } catch (error) {
    console.error('Error updating restaurant rating:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get restaurants by status
const getRestaurantsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    if (!status) {
      return sendBadRequest(res, 'Status is required');
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'suspended', 'active'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return sendBadRequest(res, 'Invalid status. Valid statuses are: ' + validStatuses.join(', '));
    }

    const restaurants = await Restaurant.findByStatus(status.toLowerCase());

    return sendSuccess(res, restaurants, `Restaurants with status '${status}' retrieved successfully`);

  } catch (error) {
    console.error('Error retrieving restaurants by status:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Update restaurant status
const updateRestaurantStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return sendBadRequest(res, 'Restaurant ID is required');
    }

    if (!status) {
      return sendBadRequest(res, 'Status is required');
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'suspended', 'active'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return sendBadRequest(res, 'Invalid status. Valid statuses are: ' + validStatuses.join(', '));
    }

    // Check if restaurant exists
    const existingRestaurant = await Restaurant.findById(id);
    if (!existingRestaurant) {
      return sendNotFound(res, 'Restaurant not found');
    }

    // Update restaurant status
    const result = await Restaurant.updateStatus(id, status.toLowerCase());

    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to update restaurant status', 400);
    }

    return sendSuccess(res, { 
      updated: true, 
      restaurantId: id, 
      newStatus: status.toLowerCase() 
    }, 'Restaurant status updated successfully');

  } catch (error) {
    console.error('Error updating restaurant status:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get restaurant status by ID
const getRestaurantStatusById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendBadRequest(res, 'Restaurant ID is required');
    }

    // Get restaurant status by ID
    const status = await Restaurant.getRestaurantStatusById(id);
    
    if (!status) {
      return sendNotFound(res, 'Restaurant not found');
    }

    // Return status information
    const statusData = {
      restaurantId: id,
      status: status
    };

    return sendSuccess(res, statusData, 'Restaurant status retrieved successfully');

  } catch (error) {
    console.error('Error retrieving restaurant status by ID:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get restaurant by email
const getRestaurantByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return sendBadRequest(res, 'Email is required');
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendBadRequest(res, 'Invalid email format');
    }

    const restaurant = await Restaurant.findByEmail(email);
    if (!restaurant) {
      return sendNotFound(res, 'Restaurant not found with this email');
    }

    return sendSuccess(res, restaurant, 'Restaurant retrieved successfully');

  } catch (error) {
    console.error('Error retrieving restaurant by email:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

module.exports = {
  createRestaurant,
  getAllRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
  searchRestaurants,
  getNearbyRestaurants,
  updateRestaurantRating,
  getRestaurantsByStatus,
  updateRestaurantStatus,
  getRestaurantStatusById,
  getRestaurantByEmail
};
