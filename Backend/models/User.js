const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    default: undefined,
    validate: [
      {
        validator: function (v) {
          return !!v || !!this.phoneNumber;
        },
        message: 'Email is required if phone number is not provided',
      },
      {
        validator: function (v) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: 'Invalid email format',
      },
    ],
  },
  phoneNumber: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    default: undefined,
    validate: [
      {
        validator: function (v) {
          return !!v || !!this.email;
        },
        message: 'Phone number is required if email is not provided',
      },
      {
        validator: function (v) {
          return !v || /^\+?[1-9]\d{1,14}$/.test(v);
        },
        message: 'Invalid phone number format',
      },
    ],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    trim: true,
  },
  address: {
    type: String,
    trim: true,
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active',
    trim: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);