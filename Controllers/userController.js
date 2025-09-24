const User = require('../models/User');
const { sendSuccess, sendError, sendCreated, sendNotFound, sendBadRequest } = require('../utils/responseHelper');

const createUser = async (req, res) => {
  try {
    const { email, name, role, created_at, last_log_in } = req.body;

    if (!email) {
      return sendBadRequest(res, 'Email is required');
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      // User already exists: update last_log_in
      const updateResult = await User.updateLastLogin(email);
      if (updateResult.modifiedCount === 0) {
        return sendError(res, 'Failed to update last login', 500);
      }
      return sendSuccess(res, { inserted: false }, 'User already exists. Last login updated.');
    }

    // Create new user
    const userData = { name, email, role, created_at, last_log_in };
    const result = await User.create(userData);

    return sendCreated(res, { inserted: true, userId: result.insertedId }, 'User created successfully');

  } catch (error) {
    console.error('Error inserting/updating user:', error);
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