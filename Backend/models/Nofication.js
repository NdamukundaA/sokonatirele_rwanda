const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    enum: ['new_order', 'payment_update', 'status_update'],
    default: 'new_order'
  }
}, {
  timestamps: true
});

// Clear Mongoose model cache to prevent schema mismatch
if (mongoose.models.Notification) {
  delete mongoose.models.Notification;
}

module.exports = mongoose.model('Notification', NotificationSchema);