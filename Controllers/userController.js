const User = require('../models/User');
const { sendSuccess, sendError, sendCreated, sendNotFound, sendBadRequest } = require('../utils/responseHelper');

const createUser = async (req, res) => {
  try {
    const { email, name, phone, role } = req.body;

    // Basic validation
    if (!email || !name) {
      return sendBadRequest(res, 'Name and email are required');
    }

    // Check if user already exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return sendBadRequest(res, 'User with this email already exists');
    }

    // Create new user
    const userData = { 
      name, 
      email, 
      phone: phone || null,
      role: role || 'user'
    };
    
    const result = await User.create(userData);

    return sendCreated(res, { 
      userId: result.insertedId,
      user: userData
    }, 'User created successfully');

  } catch (error) {
    console.error('Error creating user:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    if (!email) {
      return sendBadRequest(res, 'Email is required');
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return sendNotFound(res, 'User not found');
    }

    return sendSuccess(res, user, 'User retrieved successfully');

  } catch (error) {
    console.error('Error retrieving user:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

module.exports = {
  createUser,
  getUserByEmail
};