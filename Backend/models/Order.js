const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  user_fullName: {
    type: String,
    required: true
  },
  user_email: {
    type: String,
    required: true
  },
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      productQuantity: {
        type: Number,
        default: 1,
        required: true
      },
      unit: {
        type: String,
        default: 'pcs',
        required: true
      },
      price: {
        type: Number,
        required: true
      },
      productImage: {
        type: String,
        required: false
      },
      productName: {
        type: String,
        required: false
      }
    }
  ],
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  paymentType: {
    type: String,
    required: true
  },
  paymentStatus: {
    type: String,
    default: 'pending'
  },
  status: {
    type: String,
    default: 'pending'
  },
  flwTransactionRef: {
    type: String
  },
  flwTransactionId: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);