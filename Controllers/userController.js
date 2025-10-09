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



const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    
    return sendSuccess(res, users, 'Users retrieved successfully');
    
  } catch (error) {
    console.error('Error retrieving users:', error);
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

// Get users by role
const getUsersByRole = async (req, res) => {
  try {
    const { role } = req.params;

    if (!role) {
      return sendBadRequest(res, 'Role is required');
    }

    // Validate role
    const validRoles = ['user', 'admin', 'restaurant_owner', 'rider'];
    if (!validRoles.includes(role)) {
      return sendBadRequest(res, 'Invalid role. Valid roles are: ' + validRoles.join(', '));
    }

    const users = await User.findByRole(role);

    return sendSuccess(res, users, `Users with role '${role}' retrieved successfully`);

  } catch (error) {
    console.error('Error retrieving users by role:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get user role by email
const getUserRoleByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // Basic validation
    if (!email) {
      return sendBadRequest(res, 'Email is required');
    }

    // Get user role by email
    const role = await User.getUserRoleByEmail(email);
    
    if (!role) {
      return sendNotFound(res, 'User not found');
    }

    // Return role information
    const roleData = {
      email: email,
      role: role
    };

    return sendSuccess(res, roleData, 'User role retrieved successfully');

  } catch (error) {
    console.error('Error retrieving user role by email:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { email } = req.params;
    const { role } = req.body;

    if (!email) {
      return sendBadRequest(res, 'Email is required');
    }

    if (!role) {
      return sendBadRequest(res, 'Role is required');
    }

    // Validate role
    const validRoles = ['user', 'admin', 'restaurant_owner', 'rider'];
    if (!validRoles.includes(role)) {
      return sendBadRequest(res, 'Invalid role. Valid roles are: ' + validRoles.join(', '));
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (!existingUser) {
      return sendNotFound(res, 'User not found');
    }

    // Update user role
    const result = await User.updateRole(email, role);

    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to update user role', 400);
    }

    return sendSuccess(res, { 
      updated: true, 
      email: email, 
      newRole: role 
    }, 'User role updated successfully');

  } catch (error) {
    console.error('Error updating user role:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserByEmail,
  getUsersByRole,
  updateUserRole,
  getUserRoleByEmail
};