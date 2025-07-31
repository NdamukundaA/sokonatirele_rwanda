const express = require('express');
const router = express.Router();
const { verifySellerToken } = require('../middleware/SellerTokenVerify.js');
const { addCategory, getAllCategories, deleteCategory, updateCategory } = require('../Controllers/CategoryController.js');
const { getProductsByCategory } = require('../Controllers/ProductController.js');
const multer = require('multer');

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

router.post('/addCategory', verifySellerToken, upload.array('image'), addCategory);
router.get('/getAllCategories', getAllCategories);
router.get('/:id/products', getProductsByCategory);
router.delete('/:id', verifySellerToken, deleteCategory);
router.put('/:id', verifySellerToken, upload.array('image'), updateCategory);

module.exports = router;


