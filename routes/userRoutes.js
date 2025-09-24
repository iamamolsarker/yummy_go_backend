const express = require('express');
const router = express.Router();
const userController = require('../Controllers/userController');

// POST: Add a new user
router.post('/users', userController.createUser);

// GET: get user by email
router.get('/users/:email', userController.getUserByEmail);

module.exports = router;