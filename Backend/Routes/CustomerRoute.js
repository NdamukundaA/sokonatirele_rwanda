const express = require('express');
const router = express.Router();
const { verifySellerToken } = require('../middleware/SellerTokenVerify.js');
const adminMiddleware = require('../middleware/AdminMiddleWare.js')
const { getAllCustomers, getCustomerById, getCustomerOrders } = require('../Controllers/CustomerController.js');

console.log('verifyAdminToken:', verifySellerToken);
console.log('getAllCustomers:', getAllCustomers);
console.log('getCustomerById:', getCustomerById);
console.log('getCustomerOrders:', getCustomerOrders);

router.get('/getAllCustomers', verifySellerToken, adminMiddleware, getAllCustomers);
router.get('/getCustomerById/:id', verifySellerToken, adminMiddleware, getCustomerById);
router.get('/getCustomerOrders/:id', verifySellerToken, adminMiddleware, getCustomerOrders);

module.exports = router;