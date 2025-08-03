const Admin = require('../models/Sellers.js');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// middleware
dotenv.config();

// Lgin Admin
const loginAdmin = async (req, res) => {
    try {
        const { email, password} = req.body;

        // Validate request body
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" }); 
        }

        // Check if admin exists
        const admin = await Admin.findOne({ email});

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Varify password
        const isPasswordValid = await bcrypt.compare(password, admin.password)
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Validate Secret Key
        if (!process.env.SECRETKEY) {
            return res.status(500).json({ message: "Server configuration error" });
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                adminId: admin._id,
                isAdmin: admin.isAdmin
            }, 
            process.env.SECRETKEY,
            { expiresIn: '24h' }
        );

        // Return response
        res.status(200).json({
            message: "Login successful",
            token,
            admin: {
                id: admin._id,
                fullName: admin.fullName,
                email: admin.email,
                phoneNumber: admin.phoneNumber,
                isAdmin: admin.isAdmin
            }
        })

    }
    catch (error) {
        res.status(500).json({ message: error.message });
        return console.error({error, message: "Error logging in admin"});
    }
}

// Get Admin Profile
const getAdminProfile = async (req, res) => {
    try {
        // req.admin is already populated by the middleware
        const admin = req.admin;
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        // Remove sensitive information
        const adminProfile = {
            id: admin._id,
            fullName: admin.fullName,
            email: admin.email,
            phoneNumber: admin.phoneNumber,
            isAdmin: admin.isAdmin
        };
        res.status(200).json(adminProfile);
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





