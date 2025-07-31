// Modified ProductRoutes.js file

const express = require('express');
const router = express.Router();
const { verifySellerToken } = require('../middleware/SellerTokenVerify.js');
const { verifyToken } = require('../middleware/UserTokenVerify.js');
const multer = require('multer');
const {
  addProduct,
  getAllProducts,
  getProductDetails,
  changeStock,
  deleteProduct,
  updateProduct,
  rateProduct
} = require('../Controllers/ProductController.js');

// Configure multer with memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 4
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

// IMPORTANT: Using upload.any() to accept any field name
// Routes for Adding Product for Admin only
router.post(
  '/addProduct',
  verifySellerToken,
  upload.any(), 
  addProduct
);

// Routes for Getting all products
router.get('/getAllProducts', getAllProducts);

// Routes for Getting Product Details
router.get('/getProductDetails/:id', getProductDetails);

// Routes for Changing Stock of Product
router.post('/stock/:id', verifySellerToken, changeStock);

// Routes for Deleting Product
router.delete('/deleteProduct/:id', verifySellerToken, deleteProduct);

// Routes for Updating Product - also using upload.any() for consistency
router.put(
  '/updateProduct/:id', 
  verifySellerToken, 
  upload.any(),
  updateProduct
);

// Routes for rating Product
router.put('/rateProduct/:id', verifyToken, rateProduct);

module.exports = router;