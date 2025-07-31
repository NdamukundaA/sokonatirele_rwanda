// CartSchema.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CartSchema = new Schema({
    userId: { 
        type: String, 
        required: false // Made optional for anonymous users
    },
    guestId: { 
        type: String, 
        required: false // Optional for anonymous users
    },
    products: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true,
                min: [1, 'Quantity must be at least 1'],
                default: 1
            }
        }
    ],
    totalPrice: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'Total price cannot be negative']
    },
    shippingPrice: {
        type: String, 
        required: true,
        default: "negotiable with deliverer" 
    }
}, {
    timestamps: true
});

// Add a comment to the schema for clarity
CartSchema.set('toJSON', {
    transform: (doc, ret) => {
        ret._id = ret._id.toString();
        ret.comments = {
            shippingPrice: 'The shipping fee defaults to "negotiable with deliverer"'
        };
        return ret;
    }
});

module.exports = mongoose.model('Cart', CartSchema);