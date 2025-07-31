const Admin = require('../models/Sellers.js');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// middleware
dotenv.config();

// Login Admin
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if admin exists
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: admin._id, isAdmin: admin.isAdmin },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            admin: {
                id: admin._id,
                fullName: admin.fullName,
                email: admin.email,
                isAdmin: admin.isAdmin
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Admin Profile
const getAdminProfile = async (req, res) => {
    try {
        const admin = await Admin.findById(req.admin._id).select('-password');
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add New Admin
const addNewAdmin = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, password } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin
        const newAdmin = new Admin({
            fullName,
            email,
            phoneNumber,
            password: hashedPassword,
            isAdmin: true
        });

        await newAdmin.save();

        res.status(201).json({
            message: "Admin created successfully",
            admin: {
                id: newAdmin._id,
                fullName: newAdmin.fullName,
                email: newAdmin.email,
                phoneNumber: newAdmin.phoneNumber
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Logout Admin
const logoutAdmin = async (req, res) => {
    try {
        // Since JWT is stateless, we just need to tell the client to remove the token
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    loginAdmin,
    getAdminProfile,
    addNewAdmin,
    logoutAdmin
};





