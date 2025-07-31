// CartRoutes.js
const express = require('express');
const router = express.Router();
const {
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    getCart,
    clearCart
} = require('../Controllers/CartController.js');
const { verifyToken } = require('../middleware/UserTokenVerify.js'); 
// Route to add a product to cart (requires authentication)
router.post('/add', verifyToken, addToCart);

// Route to remove a product from cart (requires authentication)
router.delete('/remove/:productId', verifyToken, removeFromCart);

// Route to update cart item quantity (requires authentication)
router.put('/update/:productId', verifyToken, updateCartItemQuantity);

// Route to get user's cart (requires authentication)
router.get('/', verifyToken, getCart);

// Route to clear user's cart (requires authentication)
router.delete('/clear', verifyToken, clearCart);

module.exports = router;