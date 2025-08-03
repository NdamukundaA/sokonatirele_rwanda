const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/UserTokenVerify');
const { verifySellerToken } = require('../middleware/SellerTokenVerify.js');
const adminMiddleware = require('../middleware/AdminMiddleWare.js');
const {
  placeOrder,
  handleFlutterwaveWebhook,
  getUserOrders,
  getOrderDetails,
  getAllOrders,
  updateOrderStatus,
  getOrderStatistics,
  confirmCashPayment,
  gettingOrderDetailsAdmin,
  getNotifications,
  markNotificationAsRead,
  clearReadNotifications
} = require('../Controllers/OrderController.js');

// User routes (authenticated)
router.post('/placeOrder', verifyToken, (req, res) => placeOrder(req, res, req.app.get('io')));
router.get('/getUserOrders', verifyToken, getUserOrders);
router.get('/getOrderDetails/:orderId', verifyToken, getOrderDetails);

// Flutterwave webhook endpoint
router.post('/flw-webhook', handleFlutterwaveWebhook);

// Admin and  Seller routes
router.get('/admin/getOrderDetails/:orderId', verifySellerToken, gettingOrderDetailsAdmin);
router.get('/getAllOrders', verifySellerToken, getAllOrders);
router.put('/updateOrderStatus/:orderId', verifySellerToken, updateOrderStatus);
router.get('/getOrderStatistics', verifySellerToken, getOrderStatistics);
router.put('/confirmCashPayment/:orderId', verifySellerToken, confirmCashPayment);
router.get('/notifications', verifySellerToken, getNotifications);
router.put('/notifications/:notificationId/read', verifySellerToken, markNotificationAsRead);
router.delete('/notifications/clear-read', verifySellerToken, clearReadNotifications);

module.exports = router;