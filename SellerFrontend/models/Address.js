const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  description: { 
    type: String, 
    required: [true, 'Description is required'],
    trim: true
  },
  city: { 
    type: String, 
    required: [true, 'City is required'],
    trim: true
  },
  street: { 
    type: String, 
    required: [true, 'Street is required'],
    trim: true
  },
  district: { 
    type: String, 
    required: [true, 'District is required'],
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  postalCode: {
    type: String,
    trim: true,
    default: null
  },
  phoneNumber: {
    type: String,
    trim: true,
    default: null
  },
  additionalInfo: {
    type: String,
    trim: true,
    maxLength: [500, 'Additional info cannot exceed 500 characters'],
    default: null
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true
  }
}, { 
  timestamps: true 
});

// Pre-save middleware to ensure only one default address per user
AddressSchema.pre('save', async function(next) {
  if (this.isDefault) {
    try {
      await this.constructor.updateMany(
        { userId: this.userId, _id: { $ne: this._id }, isDefault: true },
        { isDefault: false }
      );
    } catch (error) {
      next(error);
    }
  }
  next();
});

// Static method to handle default address updates
AddressSchema.statics.setDefaultAddress = async function(userId, addressId) {
  try {
    // First, unset any existing default address
    await this.updateMany(
      { userId, isDefault: true },
      { isDefault: false }
    );
    
    // Then set the new default address
    const address = await this.findOneAndUpdate(
      { _id: addressId, userId },
      { isDefault: true },
      { new: true }
    );
    
    return address;
  } catch (error) {
    throw error;
  }
};

// Add compound index for better query performance
AddressSchema.index({ userId: 1, isDefault: 1 });

module.exports = mongoose.model('Address', AddressSchema);