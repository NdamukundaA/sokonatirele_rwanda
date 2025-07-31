const express = require('express');
const router = express.Router();
const {
    loginAdmin,
    getAdminProfile,
    addNewAdmin,
    logoutAdmin
} = require('../Controllers/AdminController.js');
const adminMiddleware = require('../middleware/AdminMiddleWare');

// Public routes
router.post('/login', loginAdmin);

// Protected routes
router.get('/profile', adminMiddleware, getAdminProfile);
router.post('/add-admin', adminMiddleware, addNewAdmin);
router.post('/logout', adminMiddleware, logoutAdmin);

module.exports = router;