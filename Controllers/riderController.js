const FoodRider = require('../models/FoodRider');
const { sendSuccess, sendError, sendCreated, sendNotFound, sendBadRequest } = require('../utils/responseHelper');

// Create a new rider
const createRider = async (req, res) => {
  try {
    const { name, email, phone, vehicle, location, documents } = req.body;

    // Basic validation
    if (!name || !email || !phone) {
      return sendBadRequest(res, 'Name, email, and phone are required');
    }

    // Check if rider already exists
    const existingRiderByEmail = await FoodRider.findByEmail(email);
    if (existingRiderByEmail) {
      return sendBadRequest(res, 'Rider with this email already exists');
    }

    const existingRiderByPhone = await FoodRider.findByPhone(phone);
    if (existingRiderByPhone) {
      return sendBadRequest(res, 'Rider with this phone number already exists');
    }

    // Create new rider
    const riderData = {
      name,
      email,
      phone,
      vehicle: vehicle || {},
      location: location || {},
      documents: documents || {}
    };

    const result = await FoodRider.create(riderData);

    return sendCreated(res, {
      riderId: result.insertedId,
      rider: riderData
    }, 'Rider created successfully');

  } catch (error) {
    console.error('Error creating rider:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get all riders
const getAllRiders = async (req, res) => {
  try {
    const { status, city, vehicle_type, is_verified } = req.query;
    
    const filters = {};
    if (status) filters.status = status;
    if (city) filters.city = city;
    if (vehicle_type) filters.vehicle_type = vehicle_type;
    if (is_verified !== undefined) filters.is_verified = is_verified === 'true';

    const riders = await FoodRider.findAll(filters);

    return sendSuccess(res, riders, 'Riders retrieved successfully');

  } catch (error) {
    console.error('Error retrieving riders:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get rider by ID
const getRiderById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendBadRequest(res, 'Rider ID is required');
    }

    const rider = await FoodRider.findById(id);
    if (!rider) {
      return sendNotFound(res, 'Rider not found');
    }

    return sendSuccess(res, rider, 'Rider retrieved successfully');

  } catch (error) {
    console.error('Error retrieving rider:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get rider by email
const getRiderByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return sendBadRequest(res, 'Email is required');
    }

    const rider = await FoodRider.findByEmail(email);
    if (!rider) {
      return sendNotFound(res, 'Rider not found');
    }

    return sendSuccess(res, rider, 'Rider retrieved successfully');

  } catch (error) {
    console.error('Error retrieving rider:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Update rider
const updateRider = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return sendBadRequest(res, 'Rider ID is required');
    }

    // Check if rider exists
    const existingRider = await FoodRider.findById(id);
    if (!existingRider) {
      return sendNotFound(res, 'Rider not found');
    }

    // Remove fields that shouldn't be updated directly
    delete updateData.created_at;
    delete updateData._id;

    const result = await FoodRider.updateById(id, updateData);

    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to update rider', 400);
    }

    return sendSuccess(res, { updated: true }, 'Rider updated successfully');

  } catch (error) {
    console.error('Error updating rider:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Update rider status
const updateRiderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!id) {
      return sendBadRequest(res, 'Rider ID is required');
    }

    if (!status || !['available', 'busy', 'offline'].includes(status)) {
      return sendBadRequest(res, 'Valid status is required (available, busy, offline)');
    }

    // Check if rider exists
    const existingRider = await FoodRider.findById(id);
    if (!existingRider) {
      return sendNotFound(res, 'Rider not found');
    }

    const result = await FoodRider.updateStatus(id, status);

    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to update rider status', 400);
    }

    return sendSuccess(res, { updated: true, status }, 'Rider status updated successfully');

  } catch (error) {
    console.error('Error updating rider status:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Update rider location
const updateRiderLocation = async (req, res) => {
  try {
    const { id } = req.params;
    const { location } = req.body;

    if (!id) {
      return sendBadRequest(res, 'Rider ID is required');
    }

    if (!location) {
      return sendBadRequest(res, 'Location data is required');
    }

    // Check if rider exists
    const existingRider = await FoodRider.findById(id);
    if (!existingRider) {
      return sendNotFound(res, 'Rider not found');
    }

    const result = await FoodRider.updateLocation(id, location);

    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to update rider location', 400);
    }

    return sendSuccess(res, { updated: true, location }, 'Rider location updated successfully');

  } catch (error) {
    console.error('Error updating rider location:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Delete rider (soft delete)
const deleteRider = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return sendBadRequest(res, 'Rider ID is required');
    }

    // Check if rider exists
    const existingRider = await FoodRider.findById(id);
    if (!existingRider) {
      return sendNotFound(res, 'Rider not found');
    }

    const result = await FoodRider.deleteById(id);

    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to delete rider', 400);
    }

    return sendSuccess(res, { deleted: true }, 'Rider deleted successfully');

  } catch (error) {
    console.error('Error deleting rider:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get available riders
const getAvailableRiders = async (req, res) => {
  try {
    const { city } = req.query;

    const riders = await FoodRider.findAvailableRiders(city);

    return sendSuccess(res, riders, 'Available riders retrieved successfully');

  } catch (error) {
    console.error('Error retrieving available riders:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Update rider rating
const updateRiderRating = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, total_deliveries } = req.body;

    if (!id) {
      return sendBadRequest(res, 'Rider ID is required');
    }

    if (!rating || !total_deliveries) {
      return sendBadRequest(res, 'Rating and total deliveries are required');
    }

    // Check if rider exists
    const existingRider = await FoodRider.findById(id);
    if (!existingRider) {
      return sendNotFound(res, 'Rider not found');
    }

    const result = await FoodRider.updateRating(id, rating, total_deliveries);

    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to update rider rating', 400);
    }

    return sendSuccess(res, { updated: true }, 'Rider rating updated successfully');

  } catch (error) {
    console.error('Error updating rider rating:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

module.exports = {
  createRider,
  getAllRiders,
  getRiderById,
  getRiderByEmail,
  updateRider,
  updateRiderStatus,
  updateRiderLocation,
  deleteRider,
  getAvailableRiders,
  updateRiderRating
};