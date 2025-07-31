const Category = require('../models/Category.js');
const Product = require('../models/Product');
const connectCloudinary = require('../Config/Cloudinary');
const { Readable } = require('stream');
const mongoose = require('mongoose');

const cloudinary = connectCloudinary();

// ADD CATEGORY
const addCategory = async (req, res) => {
  try {
    console.log("req.body:", req.body);
    console.log("req.files:", req.files);
    
    let categoryData;
    
    // Handle different request body formats
    if (req.body.categoryData) {
      try {
        categoryData = JSON.parse(req.body.categoryData);
      } catch (e) {
        console.log("Error parsing categoryData:", e);
        return res.status(400).json({
          success: false,
          message: "Invalid category data format"
        });
      }
    } else if (req.body.name && req.body.description) {
      // Direct fields in request body
      categoryData = {
        name: req.body.name,
        description: req.body.description
      };
    } else {
      return res.status(400).json({
        success: false,
        message: "Please provide category name and description"
      });
    }
    
    // Ensure name is properly formatted
    categoryData.name = String(categoryData.name || "").trim();
    
    // Create the new category object
    const newCategoryData = { ...categoryData };
    
    // Handle image upload if files are present
    if (req.files && req.files.length > 0) {
      try {
        const uploadResults = await Promise.all(
          req.files.map(file => {
            return new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "categories" },
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
        
        newCategoryData.image = uploadResults[0]; // Assuming one image per category
      } catch (uploadError) {
        console.log("Image upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Error uploading image"
        });
      }
    }

    // Create the category in the database
    const newCategory = await Category.create(newCategoryData);

    return res.status(201).json({
      success: true,
      message: "Category added successfully",
      category: newCategory
    });
    
  } catch (error) {
    console.log(error);
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors
      });
    }
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// GET ALL CATEGORIES
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    return res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// GET PRODUCTS BY CATEGORY ID
/**
 * Get products by category ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProductsByCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Validate category ID
    if (!mongoose.Types.ObjectId.isValid(categoryId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid category ID format",
      });
    }

    // Check if category exists
    const categoryExists = await Category.exists({ _id: categoryId });
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    // Pagination parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination
    const totalProducts = await Product.countDocuments({ productCategory: categoryId });

    // Query products with pagination
    const products = await Product.find({ productCategory: categoryId })
      .populate('productCategory', 'name')
      .skip(skip)
      .limit(limit);

    return res.status(200).json({
      success: true,
      products,
      pagination: {
        totalProducts,
        totalPages: Math.ceil(totalProducts / limit),
        currentPage: page,
        hasNextPage: page * limit < totalProducts,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error("Error in getProductsByCategory:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};

// DELETE CATEGORY
const deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    
    const deleted = await Category.findByIdAndDelete(categoryId);
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error"
    });
  }
};

// UPDATE CATEGORY
const updateCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;
    let categoryData;

    // Handle different request body formats
    if (req.body.categoryData) {
      try {
        categoryData = JSON.parse(req.body.categoryData);
      } catch (e) {
        return res.status(400).json({
          success: false,
          message: "Invalid category data format",
        });
      }
    } else {
      categoryData = {
        name: req.body.name,
        description: req.body.description,
        status: req.body.status,
      };
    }

    // Ensure name is properly formatted
    if (categoryData.name) categoryData.name = String(categoryData.name).trim();

    // Handle image upload if files are present
    if (req.files && req.files.length > 0) {
      try {
        const uploadResults = await Promise.all(
          req.files.map(file => {
            return new Promise((resolve, reject) => {
              const uploadStream = cloudinary.uploader.upload_stream(
                { folder: "categories" },
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
        categoryData.image = uploadResults[0]; // Assuming one image
      } catch (uploadError) {
        console.log("Image upload error:", uploadError);
        return res.status(500).json({
          success: false,
          message: "Error uploading image",
        });
      }
    }

    // Update the category in the database
    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      { $set: categoryData },
      { new: true, runValidators: true }
    );

    if (!updatedCategory) {
      return res.status(404).json({
        success: false,
        message: "Category not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      category: updatedCategory,
    });
  } catch (error) {
    console.log(error);
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

module.exports = {
  addCategory,
  getAllCategories,
  getProductsByCategory,
  deleteCategory,
  updateCategory
};

