const express = require('express');
const router = express.Router();
const { verifySellerToken } = require('../middleware/SellerTokenVerify.js');
const { getAllCustomers, getCustomerById, getCustomerOrders } = require('../Controllers/CustomerController.js');

console.log('verifyAdminToken:', verifySellerToken);
console.log('getAllCustomers:', getAllCustomers);
console.log('getCustomerById:', getCustomerById);
console.log('getCustomerOrders:', getCustomerOrders);

router.get('/getAllCustomers', verifySellerToken, getAllCustomers);
router.get('/getCustomerById/:id', verifySellerToken, getCustomerById);
router.get('/getCustomerOrders/:id', verifySellerToken, getCustomerOrders);

module.exports = router;