const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');

// POST: Add a new user
router.post('/', userController.createUser);

// GET: Get all users
router.get('/', userController.getAllUsers);

// GET: Get users by role
router.get('/role/:role', userController.getUsersByRole);

// GET: Get users role by email (must come before /:email)
router.get('/:email/role', userController.getUserRoleByEmail);

// PATCH: Update user role (must come before /:email)
router.patch('/:email/role', userController.updateUserRole);

// GET: get user by email (must come last among /:email routes)
router.get('/:email', userController.getUserByEmail);

module.exports = router;