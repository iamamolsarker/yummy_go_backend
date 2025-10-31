const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');
const { verifyJWT, optionalAuth } = require('../middleware/auth');
const { verifyAdmin, verifyActiveUser } = require('../middleware/roleAuth');

// Public routes
// POST: Add a new user (registration - no auth required)
router.post('/', userController.createUser);

// Admin-only routes
// GET: Get all users
router.get('/', verifyJWT, verifyAdmin, userController.getAllUsers);

// GET: Get users by role
router.get('/role/:role', verifyJWT, verifyAdmin, userController.getUsersByRole);

// GET: Get users by status
router.get('/status/:status', verifyJWT, verifyAdmin, userController.getUsersByStatus);

// POST: Bulk activate pending users with role 'user' (admin utility)
router.post('/bulk-activate', verifyJWT, verifyAdmin, userController.bulkActivatePendingUsers);

// PATCH: Update user role (admin only)
router.patch('/:email/role', verifyJWT, verifyAdmin, userController.updateUserRole);

// PATCH: Update user status (admin only)
router.patch('/:email/status', verifyJWT, verifyAdmin, userController.updateUserStatus);


// GET: Get users role by email 
router.get('/:email/role', userController.getUserRoleByEmail);

// GET: Get users status by email (user can check their own or admin can check any)
router.get('/:email/status', userController.getUserStatusByEmail);

// PATCH: Update user profile (authenticated users can update their own profile)
router.patch('/:email/profile', verifyJWT, verifyActiveUser, userController.updateProfile);

// GET: get user by email (public with optional auth for enhanced data)
router.get('/:email', optionalAuth, userController.getUserByEmail);

module.exports = router;