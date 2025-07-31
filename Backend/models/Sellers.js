const mongoose  = require('mongoose');
const Schema = mongoose.Schema;


const AdminSchema = new Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        phoneNumber: { type: String, required: true },
        password: { type: String, required: true },
        isAdmin: { type: Boolean, default: true },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Sellers', AdminSchema);
    


