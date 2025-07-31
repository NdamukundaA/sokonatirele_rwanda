const mongoose = require('mongoose');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const User = require('../models/User');
const Address = require('../models/Address');
const Notification = require('../models/Nofication');
const dotenv = require('dotenv');
const axios = require('axios');

dotenv.config();

const placeOrder = async (req, res, io) => {
  try {
    const userId = req.user._id.toString();
    const { addressId, paymentType } = req.body;
    console.log(`placeOrder: userId=${userId}, addressId=${addressId}, paymentType=${paymentType}`);

    // Validate addressId
    if (!addressId) {
      return res.status(400).json({ success: false, message: 'Address ID is required' });
    }

    // Validate paymentType
    if (!paymentType || !['online', 'cash'].includes(paymentType.toLowerCase())) {
      return res.status(400).json({ success: false, message: 'Payment type must be either "online" or "cash"' });
    }

    // Validate address
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      return res.status(404).json({ success: false, message: 'Address not found or does not belong to user' });
    }

    // Validate cart
    const cart = await Cart.findOne({ userId }).populate('products.productId');
    if (!cart || cart.products.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty, cannot place order' });
    }

    // Validate user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Prepare order products
    const orderProducts = cart.products.map(item => ({
      productId: item.productId._id,
      productQuantity: item.quantity,
      unit: item.productId.productUnit || 'pcs',
      price: item.productId.price,
      productImage: item.productId.productImage || null,
      productName: item.productId.productname || 'Unknown Product'
    }));

    // Calculate total amount
    const totalAmount = cart.products.reduce((total, item) => {
      return total + (item.productId.price * item.quantity);
    }, 0);

    // Prepare payment items for IremboPay
    const paymentItems = cart.products.map(item => ({
      code: process.env.PRODUCTCODE,
      quantity: item.quantity,
      unitAmount: parseFloat(item.productId.price) || 2000.00, // Ensure price is a number
      name: item.productId.productname || 'Product Item', // Add product name
      description: `${item.productId.productname || 'Product'} x ${item.quantity}` // Add description
    }));

    // Create new order
    // Set initial status based on payment type
    const initialStatus = paymentType.toLowerCase() === 'cash' ? 'pending' : 'processing';
    const initialPaymentStatus = paymentType.toLowerCase() === 'cash' ? 'pending' : 'processing';

    const newOrder = new Order({
      userId,
      products: orderProducts,
      address: addressId,
      amount: totalAmount,
      paymentType: paymentType.toLowerCase(),
      status: initialStatus,
      paymentStatus: initialPaymentStatus,
      user_fullName: user.fullName,
      user_email: user.email,
    });

    const savedOrder = await newOrder.save();

    // Create notification for admin
    try {
      const notification = new Notification({
        orderId: savedOrder._id,
        userId,
        message: `New order placed by ${user.fullName} for ${orderProducts.length} item(s) worth RWF ${totalAmount.toFixed(2)}`,
        type: 'new_order'
      });
      await notification.save();

      io.emit('newOrder', {
        notificationId: notification._id,
        orderId: savedOrder._id,
        userName: user.fullName,
        totalAmount: totalAmount.toFixed(2),
        createdAt: notification.createdAt,
        message: notification.message
      });
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    // Clear cart
    cart.products = [];
    cart.totalPrice = typeof cart.shippingPrice === 'number' ? cart.shippingPrice : 0;
    await cart.save();
    console.log('placeOrder: Cart cleared for user:', userId);

    if (paymentType.toLowerCase() === 'online') {
      try {
        // Prepare Flutterwave payment data
        const paymentData = {
          tx_ref: `ORDER-${savedOrder._id}-${Date.now()}`,
          amount: totalAmount,
          currency: "RWF",
          redirect_url: req.body.callbackUrl || `${req.protocol}://${req.get('host')}/order-confirmation`,
          payment_options: "card,mobilemoney,ussd",
          meta: {
            orderId: savedOrder._id.toString(),
            consumer_id: userId,
          },
          customer: {
            email: user.email || "customer@example.com",
            phonenumber: address.phoneNumber?.replace(/[^0-9]/g, '') || "0780000001",
            name: user.fullName || "Customer"
          },
          customizations: {
            title: "AgriMarket Rwanda",
            description: `Payment for order ${savedOrder._id}`,
            logo: "https://assets.piedpiper.com/logo.png" // Replace with your logo URL
          }
        };

        console.log('Initiating Flutterwave payment:', JSON.stringify(paymentData, null, 2));

        const response = await axios.post(
          `${process.env.FLW_BASE_URL}/payments`,
          paymentData,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`
            }
          }
        );

        // Save Flutterwave transaction reference
        savedOrder.flwTransactionRef = response.data.data.tx_ref;
        await savedOrder.save();

        // Return response with payment link for frontend redirection
        return res.status(201).json({
          success: true,
          message: 'Order created, redirect to Flutterwave payment',
          order: savedOrder,
          paymentUrl: response.data.data.link
        });
      } catch (paymentError) {
        console.error('IremboPay invoice creation error:', paymentError.response?.data || paymentError.message);
        await Order.findByIdAndDelete(savedOrder._id);
        return res.status(400).json({
          success: false,
          message: `Payment initiation failed: ${paymentError.message}`,
          errorDetails: paymentError.response?.data || paymentError.message
        });
      }
    } else {
      return res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        order: savedOrder
      });
    }
  } catch (error) {
    console.error('Error in placeOrder:', error);
    return res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const handleFlutterwaveWebhook = async (req, res) => {
  try {
    const secretHash = process.env.FLW_SECRET_KEY;
    const signature = req.headers["verif-hash"];
    
    // Validate webhook signature
    if (!signature || signature !== secretHash) {
      return res.status(401).json({ success: false, message: 'Invalid webhook signature' });
    }

    const payload = req.body;
    
    // Verify the transaction
    const transaction = await axios.get(
      `${process.env.FLW_BASE_URL}/transactions/${payload.data.id}/verify`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`
        }
      }
    );

    const txRef = payload.data.tx_ref;
    const order = await Order.findOne({ flwTransactionRef: txRef });
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found for this transaction' });
    }

      if (payload.event === 'charge.completed' && transaction.data.data.status === 'successful') {
      order.paymentStatus = 'completed';
      order.flwTransactionId = payload.data.id;
      order.status = 'completed';  // Set status to completed for successful online payments      const cart = await Cart.findOne({ userId: order.userId });
      if (cart) {
        cart.products = [];
        cart.totalPrice = cart.shippingPrice || 0;
        await cart.save();
      }

      await order.save();
      res.status(200).json({ success: true, message: 'Payment confirmed successfully', order });
    } else if (notification.paymentStatus === 'FAILED') {
      order.paymentStatus = 'failed';
      await order.save();
      res.status(400).json({ success: false, message: 'Payment not completed' });
    } else {
      res.status(200).json({ success: true, message: 'Notification received, no action taken' });
    }
  } catch (error) {
    console.error('Error in handleIremboPayNotification:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const getUserOrders = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    console.log(`getUserOrders: userId=${userId}`);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalOrders = await Order.countDocuments({ userId });

    const orders = await Order.find({ userId })
      .populate('address')
      .populate({
        path: 'products.productId',
        select: 'productname price productUnit productImage description offerPrice inStock',
        options: { strictPopulate: false }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const transformedOrders = orders.map(order => ({
      ...order,
      products: order.products
        .filter(product => product.productId !== null) // Filter out products with null productId
        .map(product => ({
          productId: product.productId?._id || null,
          productQuantity: product.productQuantity,
          unit: product.unit,
          price: product.price,
          productImage: product.productImage || product.productId?.productImage || null,
          productName: product.productName || product.productId?.productname || 'Unknown Product',
          subtotal: (product.price * product.productQuantity).toFixed(2),
          productDetails: product.productId
            ? {
                productname: product.productId.productname || 'Unknown Product',
                description: product.productId.description || '',
                productUnit: product.productId.productUnit || 'pcs',
                productImage: product.productId.productImage || null,
                offerPrice: product.productId.offerPrice || null,
                inStock: product.productId.inStock ?? true
              }
            : null
        }))
    }));

    // Log warning if any orders have missing product references
    const ordersWithMissingProducts = orders.filter(order =>
      order.products.some(product => product.productId === null)
    );
    if (ordersWithMissingProducts.length > 0) {
      console.warn(`getUserOrders: Found ${ordersWithMissingProducts.length} orders with missing product references for userId=${userId}`);
    }

    res.status(200).json({
      success: true,
      orders: transformedOrders,
      pagination: {
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: page,
        hasNextPage: page * limit < totalOrders,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error(`Error in getUserOrders for userId=${userId}:`, error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

const getOrderDetails = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { orderId } = req.params;
    console.log(`getOrderDetails: userId=${userId}, orderId=${orderId}`);

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    const isAdminRequest = req.path.includes('/admin') || req.user.isAdmin;
    const query = isAdminRequest ? { _id: orderId } : { _id: orderId, userId };

    try {
      const order = await Order.findOne(query)
        .populate('address')
        .populate({
          path: 'products.productId',
          select: 'productname price productUnit productImage description offerPrice inStock',
          options: { strictPopulate: false }
        })
        .lean();

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      order.products = order.products
        .filter(product => product.productId !== null) // Filter out products with null productId
        .map(product => ({
          productId: product.productId?._id || null,
          productQuantity: product.productQuantity,
          unit: product.unit,
          price: product.price,
          productImage: product.productImage || product.productId?.productImage || null,
          productName: product.productName || product.productId?.productname || 'Unknown Product',
          subtotal: (product.price * product.productQuantity).toFixed(2),
          productDetails: product.productId
            ? {
                productname: product.productId.productname || 'Unknown Product',
                description: product.productId.description || '',
                productUnit: product.productId.productUnit || 'pcs',
                productImage: product.productId.productImage || null,
                offerPrice: product.productId.offerPrice || null,
                inStock: product.productId.inStock ?? true
              }
            : null
        }));

      // Log warning if order has missing product references
      if (order.products.some(product => product.productId === null)) {
        console.warn(`getOrderDetails: Order ${orderId} has missing product references for userId=${userId}`);
      }

      res.status(200).json({ success: true, order });
    } catch (populateError) {
      console.error(`Error populating order data for orderId=${orderId}:`, populateError);

      const order = await Order.findOne(query).lean();

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      order.products = order.products.map(product => ({
        ...product,
        productId: product.productId || null,
        productQuantity: product.productQuantity,
        unit: product.unit,
        price: product.price,
        productImage: product.productImage || null,
        productName: product.productName || 'Unknown Product',
        subtotal: (product.price * product.productQuantity).toFixed(2),
        productDetails: null
      }));

      res.status(200).json({
        success: true,
        order,
        warning: 'Some order details could not be fully loaded'
      });
    }
  } catch (error) {
    console.error(`Error in getOrderDetails for orderId=${req.params.orderId}:`, error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

const getAllOrders = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges needed' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const searchQuery = req.query.search || '';
    const startDate = req.query.startDate ? new Date(req.query.startDate) : null;
    const endDate = req.query.endDate ? new Date(req.query.endDate) : null;

    let query = {};

    if (startDate && endDate) {
      endDate.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: startDate, $lte: endDate };
    } else if (startDate) {
      query.createdAt = { $gte: startDate };
    } else if (endDate) {
      endDate.setHours(23, 59, 59, 999);
      query.createdAt = { $lte: endDate };
    }

    if (searchQuery) {
      query.$or = [
        { user_fullName: { $regex: searchQuery, $options: 'i' } },
        { user_email: { $regex: searchQuery, $options: 'i' } }
      ];
    }

    const totalOrders = await Order.countDocuments(query);

    const orders = await Order.find(query)
      .populate('address')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const transformedOrders = orders.map(order => ({
      ...order,
      userId: {
        _id: order.userId,
        name: order.user_fullName || 'Unknown Customer',
        email: order.user_email || '',
      },
    }));

    res.status(200).json({
      success: true,
      orders: transformedOrders,
      pagination: {
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: page,
        hasNextPage: page * limit < totalOrders,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error in getAllOrders:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required' });
    }

    const { orderId } = req.params;
    const { status, paymentStatus } = req.body;
    console.log(`updateOrderStatus: orderId=${orderId}, status=${status}, paymentStatus=${paymentStatus}`);

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    const updateObj = {};

    if (status) {
      const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `Status must be one of: ${validStatuses.join(', ')}` });
      }
      updateObj.status = status;
    }

    if (paymentStatus) {
      const validPaymentStatuses = ['pending', 'completed', 'failed', 'refunded'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return res.status(400).json({ success: false, message: `Payment status must be one of: ${validPaymentStatuses.join(', ')}` });
      }
      updateObj.paymentStatus = paymentStatus;
    }

    if (Object.keys(updateObj).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid update fields provided' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      orderId,
      updateObj,
      { new: true }
    ).populate('address');

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Order updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error(`Error in updateOrderStatus for orderId=${req.params.orderId}:`, error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

const getOrderStatistics = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required' });
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const [
      totalOrders,
      pendingOrders,
      processingOrders,
      shippedOrders,
      deliveredOrders,
      cancelledOrders,
      pendingPayments,
      completedPayments,
      totalRevenue,
      dailyStats
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'pending' }),
      Order.countDocuments({ status: 'processing' }),
      Order.countDocuments({ status: 'shipped' }),
      Order.countDocuments({ status: 'delivered' }),
      Order.countDocuments({ status: 'cancelled' }),
      Order.countDocuments({ paymentStatus: 'pending' }),
      Order.countDocuments({ paymentStatus: 'completed' }),
      Order.aggregate([
        { $match: { status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$amount' },
            orders: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    res.status(200).json({
      success: true,
      statistics: {
        totalOrders,
        ordersByStatus: {
          pending: pendingOrders,
          processing: processingOrders,
          shipped: shippedOrders,
          delivered: deliveredOrders,
          cancelled: cancelledOrders
        },
        paymentsByStatus: {
          pending: pendingPayments,
          completed: completedPayments
        },
        totalRevenue: totalRevenue.length > 0 ? totalRevenue[0].total : 0,
        dailyStats
      }
    });
  } catch (error) {
    console.error('Error in getOrderStatistics:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

const confirmCashPayment = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required' });
    }

    const { orderId } = req.params;
    console.log(`confirmCashPayment: orderId=${orderId}`);

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.paymentType !== 'cash') {
      return res.status(400).json({ success: false, message: 'Only orders with cash payment type can be confirmed' });
    }

    order.paymentStatus = 'completed';
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Cash payment confirmed successfully',
      order
    });
  } catch (error) {
    console.error(`Error in confirmCashPayment for orderId=${req.params.orderId}:`, error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

const gettingOrderDetailsAdmin = async (req, res) => {
  try {
    if (!req.user || !req.user.adminId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Admin user not found' });
    }

    const adminId = req.user.adminId.toString();
    const { orderId } = req.params;
    console.log(`gettingOrderDetailsAdmin: adminId=${adminId}, orderId=${orderId}`);

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ success: false, message: 'Invalid order ID format' });
    }

    try {
      const order = await Order.findOne({ _id: orderId })
        .populate('address')
        .populate({
          path: 'products.productId',
          select: 'productname price productUnit productImage description offerPrice inStock',
          options: { strictPopulate: false }
        })
        .lean();

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      order.products = order.products
        .filter(product => product.productId !== null) // Filter out products with null productId
        .map(product => ({
          productId: product.productId?._id || null,
          productQuantity: product.productQuantity,
          unit: product.unit,
          price: product.price,
          productImage: product.productImage || product.productId?.productImage || null,
          productName: product.productName || product.productId?.productname || 'Unknown Product',
          subtotal: (product.price * product.productQuantity).toFixed(2),
          productDetails: product.productId
            ? {
                productname: product.productId.productname || 'Unknown Product',
                description: product.productId.description || '',
                productUnit: product.productId.productUnit || 'pcs',
                productImage: product.productId.productImage || null,
                offerPrice: product.productId.offerPrice || null,
                inStock: product.productId.inStock ?? true
              }
            : null
        }));

      // Log warning if order has missing product references
      if (order.products.some(product => product.productId === null)) {
        console.warn(`gettingOrderDetailsAdmin: Order ${orderId} has missing product references for adminId=${adminId}`);
      }

      res.status(200).json({ success: true, order });
    } catch (populateError) {
      console.error(`Error populating order data for orderId=${orderId}:`, populateError);

      const order = await Order.findOne({ _id: orderId }).lean();

      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }

      order.products = order.products.map(product => ({
        ...product,
        productId: product.productId || null,
        productQuantity: product.productQuantity,
        unit: product.unit,
        price: product.price,
        productImage: product.productImage || null,
        productName: product.productName || 'Unknown Product',
        subtotal: (product.price * product.productQuantity).toFixed(2),
        productDetails: null
      }));

      res.status(200).json({
        success: true,
        order,
        warning: 'Some order details could not be fully loaded'
      });
    }
  } catch (error) {
    console.error(`Error in gettingOrderDetailsAdmin for orderId=${req.params.orderId}:`, error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error'
    });
  }
};

const getNotifications = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalNotifications = await Notification.countDocuments();
    const notifications = await Notification.find()
      .populate('orderId')
      .populate('userId', 'fullName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.status(200).json({
      success: true,
      notifications,
      pagination: {
        totalNotifications,
        totalPages: Math.ceil(totalNotifications / limit),
        currentPage: page,
        hasNextPage: page * limit < totalNotifications,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Error in getNotifications:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const markNotificationAsRead = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required' });
    }

    const { notificationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      return res.status(400).json({ success: false, message: 'Invalid notification ID format' });
    }

    // Mark as read and immediately delete
    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    // Immediately delete the notification after marking as read
    await Notification.findByIdAndDelete(notificationId);

    res.status(200).json({
      success: true,
      message: 'Notification marked as read and deleted',
      notification
    });
  } catch (error) {
    console.error(`Error in markNotificationAsRead for notificationId=${req.params.notificationId}:`, error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

const clearReadNotifications = async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }
    const result = await Notification.deleteMany({ isRead: true });
    res.status(200).json({
      success: true,
      message: `${result.deletedCount} read notifications cleared`
    });
  } catch (error) {
    console.error('Error in clearReadNotifications:', error);
    res.status(500).json({ success: false, message: error.message || 'Internal server error' });
  }
};

module.exports = {
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
};