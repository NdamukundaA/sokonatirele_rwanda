const Cart = require('../models/Cart');
const Product = require('../models/Product');
const mongoose = require('mongoose');

// Add a product to the cart
const addToCart = async (req, res) => {
  try {
    const { productId, quantity, unit } = req.body;
    const userId = req.user._id;

    console.log('addToCart: Request received', { productId, quantity, unit, userId });

    // Validate request data
    if (!productId) {
      console.log('addToCart: Missing productId');
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      console.log('addToCart: Invalid productId format', { productId });
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    if (quantity && (!Number.isInteger(quantity) || quantity < 1)) {
      console.log('addToCart: Invalid quantity', { quantity });
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer',
      });
    }

    // Fetch the product
    const product = await Product.findById(productId);
    if (!product) {
      console.log('addToCart: Product not found', { productId });
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }
    console.log('addToCart: Product found', { productId, productname: product.productname, price: product.price, inStock: product.inStock });

    if (!product.inStock) {
      console.log('addToCart: Product out of stock', { productId });
      return res.status(400).json({
        success: false,
        message: 'Product is out of stock',
      });
    }

    // Validate unit if provided
    if (unit && unit !== product.productUnit) {
      console.log('addToCart: Invalid unit', { unit, productUnit: product.productUnit });
      return res.status(400).json({
        success: false,
        message: `Invalid unit. Product unit must be ${product.productUnit}`,
      });
    }

    // Find or create cart
    let cart = await Cart.findOne({ userId });
    console.log('addToCart: Cart lookup', { userId, cartExists: !!cart, cartId: cart?._id });

    const newQuantity = quantity || 1;

    if (!cart) {
      cart = new Cart({
        userId,
        products: [{ productId: new mongoose.Types.ObjectId(productId), quantity: newQuantity }],
        totalPrice: product.price * newQuantity,
      });
      console.log('addToCart: Created new cart', {
        userId,
        cartId: cart._id,
        products: cart.products.map(p => ({ productId: p.productId.toString(), quantity: p.quantity })),
        totalPrice: cart.totalPrice,
      });
    } else {
      const productIndex = cart.products.findIndex(
        (item) => item.productId.toString() === productId
      );

      if (productIndex > -1) {
        cart.products[productIndex].quantity += newQuantity;
        console.log('addToCart: Updated product quantity', {
          productId,
          newQuantity: cart.products[productIndex].quantity,
        });
      } else {
        cart.products.push({ productId: new mongoose.Types.ObjectId(productId), quantity: newQuantity });
        console.log('addToCart: Added new product', {
          productId,
          quantity: newQuantity,
        });
      }

      // Calculate total price for all products in the cart
      cart.totalPrice = await cart.products.reduce(async (totalPromise, item) => {
        const total = await totalPromise;
        const product = await Product.findById(item.productId);
        return product ? total + ((product.offerPrice || product.price) * item.quantity) : total;
      }, Promise.resolve(0));
      console.log('addToCart: Calculated totalPrice', { totalPrice: cart.totalPrice });
    }

    // Save the cart
    try {
      console.log('addToCart: Cart before saving', {
        cartId: cart._id,
        products: cart.products.map(p => ({ productId: p.productId.toString(), quantity: p.quantity })),
        totalPrice: cart.totalPrice,
      });
      await cart.save();
      console.log('addToCart: Cart saved successfully', {
        cartId: cart._id,
        products: cart.products.map(p => ({
          productId: p.productId.toString(),
          quantity: p.quantity,
        })),
        totalPrice: cart.totalPrice,
      });
    } catch (saveError) {
      console.error('addToCart: Failed to save cart', saveError);
      return res.status(500).json({
        success: false,
        message: 'Failed to save cart',
        error: saveError.message,
      });
    }

    // Populate cart for response
    const populatedCart = await Cart.findById(cart._id).populate({
      path: 'products.productId',
      select: 'productname price productImage description productUnit offerPrice productCategory',
    });

    console.log('addToCart: Returning populated cart', {
      cartId: populatedCart._id,
      products: populatedCart.products.map(p => ({
        productId: p.productId?._id?.toString(),
        productname: p.productId?.productname,
        quantity: p.quantity,
      })),
      totalPrice: populatedCart.totalPrice,
    });

    res.status(200).json({
      success: true,
      message: 'Product added to cart successfully',
      cart: populatedCart,
    });
  } catch (error) {
    console.error('addToCart: Error', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('getCart: Fetching cart for userId', { userId });

    // Find cart and populate product details
    const cart = await Cart.findOne({ userId }).populate({
      path: 'products.productId',
      select: 'productname price productImage description productUnit offerPrice productCategory',
    });

    if (!cart) {
      console.log('getCart: No cart found for userId', { userId });
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    // Log initial cart state
    console.log('getCart: Initial cart', {
      cartId: cart._id,
      products: cart.products.map(p => ({
        productId: p.productId?._id?.toString(),
        quantity: p.quantity,
      })),
      totalPrice: cart.totalPrice,
    });

    // Fetch all product IDs in the cart
    const productIds = cart.products.map(p => p.productId?._id).filter(Boolean);
    const products = await Product.find({ _id: { $in: productIds } });

    // Filter out invalid products (where productId is null or product doesn't exist)
    const initialProductCount = cart.products.length;
    cart.products = cart.products.filter(item => {
      const exists = item.productId && products.some(p => p._id.toString() === item.productId._id.toString());
      if (!exists) {
        console.warn('getCart: Filtering out invalid product', {
          productId: item.productId?._id?.toString(),
          quantity: item.quantity,
        });
      }
      return exists;
    });

    if (cart.products.length < initialProductCount) {
      console.log('getCart: Filtered out invalid products', {
        removedCount: initialProductCount - cart.products.length,
        remainingProducts: cart.products.map(p => p.productId._id.toString()),
      });
    }

    // Recalculate total price based on populated products
    cart.totalPrice = cart.products.reduce((total, item) => {
      const product = products.find(p => p._id.toString() === item.productId._id.toString());
      const price = product ? (product.offerPrice || product.price) : 0;
      return total + (price * item.quantity);
    }, 0);

    // Save updated cart if products were filtered or totalPrice changed
    await cart.save();
    console.log('getCart: Updated cart saved', {
      cartId: cart._id,
      totalPrice: cart.totalPrice,
      products: cart.products.map(p => ({
        productId: p.productId._id.toString(),
        quantity: p.quantity,
      })),
    });

    res.status(200).json({
      success: true,
      cart,
    });
  } catch (error) {
    console.error('getCart: Error', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

// Remove a product from the cart
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart',
      });
    }

    // Remove the product from the cart
    cart.products.splice(productIndex, 1);

    // Recalculate total price
    if (cart.products.length > 0) {
      const products = await Product.find({ _id: { $in: cart.products.map(p => p.productId) } });
      cart.products = cart.products.filter(item =>
        products.some(p => p._id.toString() === item.productId.toString())
      );
      cart.totalPrice = cart.products.reduce((total, item) => {
        const product = products.find(p => p._id.toString() === item.productId.toString());
        return product ? total + ((product.offerPrice || product.price) * item.quantity) : total;
      }, 0);
    } else {
      cart.totalPrice = 0;
    }

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Product removed from cart successfully',
      cart,
    });
  } catch (error) {
    console.error('Error in removeFromCart:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

// Update cart item quantity
const updateCartItemQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive integer',
      });
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    const productIndex = cart.products.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in cart',
      });
    }

    // Update quantity
    cart.products[productIndex].quantity = quantity;

    // Fetch all products in the cart
    const products = await Product.find({ _id: { $in: cart.products.map(p => p.productId) } });

    // Filter out any invalid products
    cart.products = cart.products.filter(item =>
      products.some(p => p._id.toString() === item.productId.toString())
    );

    // Recalculate total price
    cart.totalPrice = cart.products.reduce((total, item) => {
      const product = products.find(p => p._id.toString() === item.productId.toString());
      return product ? total + ((product.offerPrice || product.price) * item.quantity) : total;
    }, 0);

    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart item quantity updated successfully',
      cart,
    });
  } catch (error) {
    console.error('Error in updateCartItemQuantity:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

// Clear user's cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found',
      });
    }

    cart.products = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully',
      cart,
    });
  } catch (error) {
    console.error('Error in clearCart:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

module.exports = {
  addToCart,
  removeFromCart,
  updateCartItemQuantity,
  getCart,
  clearCart,
};