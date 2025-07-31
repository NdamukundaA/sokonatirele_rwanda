const mongoose = require('mongoose');
const Address = require('../models/Address');
const User = require('../models/User');

// Function for creating the address
const createAddress = async (req, res) => {
  try {
    // Extract userId from the verified token
    const userId = req.user._id;
    const { description,phoneNumber, city, street, district } = req.body;

    // Get user details
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate required fields
    if (!description || !city || !street || !district || !phoneNumber) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const newAddress = await new Address({
      description,
      phoneNumber,
      city,
      street,
      district,
      userId
    }).save();
    
    const populatedAddress = await Address.findById(newAddress._id)
      .populate('userId', 'fullName email phoneNumber');

    res.status(201).json({
      success: true,
      message: 'Address created successfully',
      address: populatedAddress
    });
  } catch (error) {
    console.error('Error in createAddress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create address',
      error: error.message
    });
  }
};

// Function for getting all addresses
const getAllAddress = async (req, res) => {
  try {
    const addresses = await Address.find()
      .populate('userId', 'fullName email phoneNumber')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: addresses.length,
      addresses: addresses.map(address => ({
        ...address._doc,
        userDetails: address.userId
      }))
    });
  } catch (error) {
    console.error('Error in getAllAddress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve addresses',
      error: error.message
    });
  }
};

// Function for updating an address
const updateAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const addressId = req.params.id;

    // Validate addressId
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address ID'
      });
    }

    const updateData = { ...req.body };
    delete updateData.userId; // Prevent userId from being updated

    const address = await Address.findOneAndUpdate(
      { _id: addressId, userId: userId },
      updateData,
      { new: true, runValidators: true }
    );

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Address updated successfully',
      address
    });
  } catch (error) {
    console.error('Error in updateAddress:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update address',
      error: error.message
    });
  }
};

// Function for deleting an address
const deleteAddress = async (req, res) => {
  try {
    const userId = req.user._id;
    const addressId = req.params.id;

    // Validate addressId
    if (!mongoose.Types.ObjectId.isValid(addressId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid address ID'
      });
    }

    const address = await Address.findOneAndDelete({ 
      _id: addressId, 
      userId: userId 
    });

    if (!address) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    console.error('Error in deleteAddress:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete address',
      error: error.message
    });
  }
};

module.exports = {
  createAddress,
  getAllAddress,
  updateAddress,
  deleteAddress
};