const mongoose = require('mongoose');

const AddressSchema = new mongoose.Schema({
  description: { 
    type: String, 
    required: true 
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  city: { 
    type: String, 
    required: true 
  },
  street: { 
    type: String, 
    required: true 
  },
  district: { 
    type: String, 
    required: true 
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Address', AddressSchema);