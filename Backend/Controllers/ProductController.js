const Product = require('../models/Product');
const connectCloudinary = require('../Config/Cloudinary');
const { Readable } = require('stream');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const cloudinary = connectCloudinary();

const addProduct = async (req, res) => {
  try {
    console.log("Request body:", req.body);
    console.log("Request files:", req.files);

    if (!req.body.productData) {
      return res.status(400).json({
        success: false,
        message: "Please provide product data",
      });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide at least one product image",
      });
    }

    let productData;
    try {
      productData = JSON.parse(req.body.productData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: "Invalid product data format",
      });
    }

    productData.productname = String(productData.productname || "").trim();

    if (!productData.productCategory) {
      return res.status(400).json({
        success: false,
        message: "Product category is required",
      });
    }
    if (!mongoose.Types.ObjectId.isValid(productData.productCategory)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product category ID format",
      });
    }

    const categoryExists = await Category.exists({ _id: productData.productCategory });
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Specified category not found",
      });
    }

    if (productData.inStock === undefined) {
      productData.inStock = true;
    }

    const uploadResults = await Promise.all(
      req.files.map(file => {
        return new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            { folder: "products" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result.secure_url);
            }
          );
          const readableStream = Readable.from(file.buffer);
          readableStream.pipe(uploadStream);
        });
      })
    );

    productData.productImage = uploadResults[0];

    const newProduct = await Product.create(productData);

    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      product: newProduct,
    });
  } catch (error) {
    console.error("Error in addProduct:", error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 15;
    const search = req.query.search || '';
    const category = req.query.category;

    const skip = (page - 1) * limit;

    let query = {};

    if (search) {
      query.productname = { $regex: search, $options: 'i' };
    }

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      query.productCategory = category;
    }

    const totalProducts = await Product.countDocuments(query);

    const productList = await Product.find(query)
      .populate('productCategory', 'name')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      productList,
      pagination: {
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        hasNextPage: page * limit < totalProducts,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error in getAllProducts:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

const getProductDetails = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format"
      });
    }

    const product = await Product.findById(id)
      .populate('productCategory', 'name')
      .populate('ratings.user', 'name');

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({ success: true, product });
  } catch (error) {
    console.error("Error in getProductDetails:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }

    const categoryExists = await Category.exists({ _id: categoryId });
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    const products = await Product.find({ productCategory: categoryId })
      .populate('productCategory', 'name')
      .select('productname price inStock productImage')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalProducts = await Product.countDocuments({ productCategory: categoryId });
    const totalPages = Math.ceil(totalProducts / limit);

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        hasNextPage: page * limit < totalProducts,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error("Error in getProductsByCategory:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

const changeStock = async (req, res) => {
  try {
    const id = req.params.id || req.body.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const newStockStatus = !product.inStock;
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { inStock: newStockStatus },
      { new: true }
    );

    const message = newStockStatus
      ? 'Product set to in stock successfully'
      : 'Product set to out of stock successfully';

    res.status(200).json({
      success: true,
      message,
      product: updatedProduct,
    });
  } catch (error) {
    console.error('Error in changeStock:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide product id"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format"
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    const deletedProduct = await Product.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      product: deletedProduct
    });
  } catch (error) {
    console.error("Error in deleteProduct:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

const updateProduct = async (req, res) => {
  try {
    console.log("Update Request body:", req.body);
    console.log("Update Request files:", req.files);
    
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Please provide product id"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID format"
      });
    }

    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found"
      });
    }

    let updateData = req.body;
    
    if (req.body.productData) {
      try {
        updateData = JSON.parse(req.body.productData);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid product data format"
        });
      }
    }

    if (req.files && req.files.length > 0) {
      const uploadResults = await Promise.all(
        req.files.map(file => {
          return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              { folder: "products" },
              (error, result) => {
                if (error) reject(error);
                else resolve(result.secure_url);
              }
            );
            const readableStream = Readable.from(file.buffer);
            readableStream.pipe(uploadStream);
          });
        })
      );
      
      updateData.productImage = uploadResults[0];
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      product: updatedProduct
    });
  } catch (error) {
    console.error("Error in updateProduct:", error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

const rateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id; 

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID',
      });
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid product ID format',
      });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    const existingRatingIndex = product.ratings.findIndex(
      (r) => r.user.toString() === userId.toString()
    );

    let newRating;
    if (existingRatingIndex !== -1) {
      const currentRating = product.ratings[existingRatingIndex].rating;
      newRating = Math.min(currentRating + 1, 5);
      product.ratings[existingRatingIndex].rating = newRating;
    } else {
      newRating = 1;
      product.ratings.push({
        user: userId,
        rating: newRating,
      });
    }

    await product.save();

    res.status(200).json({
      success: true,
      message: `Rating ${existingRatingIndex !== -1 ? 'incremented' : 'added'} successfully`,
      product,
    });
  } catch (error) {
    console.error('Error in rateProduct:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
};

module.exports = {
  addProduct,
  getAllProducts,
  getProductDetails,
  getProductsByCategory,
  changeStock,
  deleteProduct,
  updateProduct,
  rateProduct
};