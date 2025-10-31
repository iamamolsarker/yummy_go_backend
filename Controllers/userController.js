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
      // User already exists - return success with existing user data
      // This allows idempotent user creation (Firebase login flow)
      console.log(`User already exists: ${email}`);
      return sendSuccess(res, {
        userId: existingUser._id,
        user: {
          name: existingUser.name,
          email: existingUser.email,
          phone: existingUser.phone,
          role: existingUser.role
        },
        alreadyExists: true
      }, 'User already exists');
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

// Get users by status
const getUsersByStatus = async (req, res) => {
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

    const users = await User.findByStatus(status.toLowerCase());

    return sendSuccess(res, users, `Users with status '${status}' retrieved successfully`);

  } catch (error) {
    console.error('Error retrieving users by status:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Update user status
const updateUserStatus = async (req, res) => {
  try {
    const { email } = req.params;
    const { status } = req.body;

    if (!email) {
      return sendBadRequest(res, 'Email is required');
    }

    if (!status) {
      return sendBadRequest(res, 'Status is required');
    }

    // Validate status
    const validStatuses = ['pending', 'approved', 'rejected', 'suspended', 'active'];
    if (!validStatuses.includes(status.toLowerCase())) {
      return sendBadRequest(res, 'Invalid status. Valid statuses are: ' + validStatuses.join(', '));
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (!existingUser) {
      return sendNotFound(res, 'User not found');
    }

    // Update user status
    const result = await User.updateStatus(email, status.toLowerCase());

    if (result.modifiedCount === 0) {
      return sendError(res, 'Failed to update user status', 400);
    }

    return sendSuccess(res, { 
      updated: true, 
      email: email, 
      newStatus: status.toLowerCase() 
    }, 'User status updated successfully');

  } catch (error) {
    console.error('Error updating user status:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Get user status by email
const getUserStatusByEmail = async (req, res) => {
  try {
    const { email } = req.params;

    // Basic validation
    if (!email) {
      return sendBadRequest(res, 'Email is required');
    }

    // Get user status by email
    const status = await User.getUserStatusByEmail(email);
    
    if (!status) {
      return sendNotFound(res, 'User not found');
    }

    // Return status information
    const statusData = {
      email: email,
      status: status
    };

    return sendSuccess(res, statusData, 'User status retrieved successfully');

  } catch (error) {
    console.error('Error retrieving user status by email:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { email } = req.params;
    const { name, phone, address, city, area, profile_image } = req.body;

    // Validate required parameter
    if (!email) {
      return sendBadRequest(res, 'Email is required');
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (!existingUser) {
      return sendNotFound(res, 'User not found');
    }

    // Validate at least one field is provided for update
    if (!name && !phone && !address && !city && !area && !profile_image) {
      return sendBadRequest(res, 'At least one field must be provided to update');
    }

    // Validate name length if provided
    if (name && (name.trim().length < 2 || name.trim().length > 100)) {
      return sendBadRequest(res, 'Name must be between 2 and 100 characters');
    }

    // Validate phone format if provided
    if (phone && phone.trim() !== '') {
      const phoneRegex = /^[+]?[\d\s\-\(\)]{10,20}$/;
      if (!phoneRegex.test(phone.trim())) {
        return sendBadRequest(res, 'Invalid phone number format');
      }
    }

    // Validate address fields length if provided
    if (address && address.trim().length > 200) {
      return sendBadRequest(res, 'Address must not exceed 200 characters');
    }

    if (city && city.trim().length > 50) {
      return sendBadRequest(res, 'City must not exceed 50 characters');
    }

    if (area && area.trim().length > 50) {
      return sendBadRequest(res, 'Area must not exceed 50 characters');
    }

    // Prepare profile data for update
    const profileData = {};
    if (name) profileData.name = name.trim();
    if (phone !== undefined) profileData.phone = phone.trim() || null;
    if (address !== undefined) profileData.address = address.trim() || null;
    if (city !== undefined) profileData.city = city.trim() || null;
    if (area !== undefined) profileData.area = area.trim() || null;
    if (profile_image !== undefined) profileData.profile_image = profile_image.trim() || null;

    // Update user profile
    const result = await User.updateProfile(email, profileData);

    if (result.modifiedCount === 0) {
      return sendError(res, 'No changes were made to the profile', 400);
    }

    // Get updated user data
    const updatedUser = await User.findByEmail(email);

    return sendSuccess(res, {
      updated: true,
      email: email,
      profile: {
        name: updatedUser.name,
        phone: updatedUser.phone,
        address: updatedUser.address || null,
        city: updatedUser.city || null,
        area: updatedUser.area || null,
        profile_image: updatedUser.profile_image || null,
        updated_at: updatedUser.updated_at
      }
    }, 'User profile updated successfully');

  } catch (error) {
    console.error('Error updating user profile:', error);
    return sendError(res, 'Internal Server Error', 500, error);
  }
};

module.exports = {
  createUser,
  getAllUsers,
  getUserByEmail,
  getUsersByRole,
  updateUserRole,
  getUserRoleByEmail,
  getUsersByStatus,
  updateUserStatus,
  getUserStatusByEmail,
  updateProfile
};

//amol-sarker
// hello