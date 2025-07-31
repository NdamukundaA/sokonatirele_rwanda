const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SellerSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phoneNumber: { type: String, required: true },
    companyName: { type: String, required: true },
    companyAddress: { type: String, required: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Admin', SellerSchema);