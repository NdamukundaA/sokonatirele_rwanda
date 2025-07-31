// models/Product.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  productname: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true
  },
  productUnit: {
    type: String,
    required: [true, 'Product unit is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  offerPrice: {
    type: Number,
    min: [0, 'Offer price cannot be negative']
  },
  productImage: {
    type: String,
    required: [true, 'Product image is required']
  },
  productCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  ratings: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  inStock: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for average rating with proper null check
ProductSchema.virtual('averageRating').get(function() {
  if (!this.ratings || !Array.isArray(this.ratings) || this.ratings.length === 0) {
    return 0;
  }
  const sum = this.ratings.reduce((total, rating) => total + rating.rating, 0);
  return (sum / this.ratings.length).toFixed(1);
});

// Removed problematic pre('validate') hook
// If you need to transform productUnit (e.g., standardize values), use something like this:
// ProductSchema.pre('validate', function(next) {
//   if (this.productUnit) {
//     this.productUnit = this.productUnit.trim().toLowerCase(); // Example: standardize unit
//   }
//   next();
// });

// Index for better search performance
ProductSchema.index({ productname: 'text', description: 'text' });

module.exports = mongoose.model('Product', ProductSchema);