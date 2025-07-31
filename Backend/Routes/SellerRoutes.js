const express = require('express');
const router = express.Router();
const Admin = require('../models/Admins.js'); // Use capitalized model name
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');

const { verifySellerToken } = require('../middleware/SellerTokenVerify.js');

dotenv.config();

// =================== Register Seller ===================
router.post('/register', async (req, res) => {
    try {
        const { 
            fullName, 
            email, 
            phoneNumber, 
            companyName,
            companyAddress,
            password 
        } = req.body;

        // Check if seller already exists
        const existingSeller = await Admin.findOne({ email });
        if (existingSeller) {
            return res.status(400).json({ 
                success: false,
                message: 'Seller with this email already exists' 
            });
        }

        // Encrypt the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new seller
        const sellerInstance = new Admin({
            fullName,
            email,
            phoneNumber,
            companyName,
            companyAddress,
            password: hashedPassword,
            isSeller: true
        });

        const savedSeller = await sellerInstance.save();
        
        // Remove password from response
        const { password: _, ...sellerWithoutPassword } = savedSeller.toObject();

        res.status(201).json({
            success: true,
            message: 'Seller registered successfully',
            seller: sellerWithoutPassword
        });

    } catch (err) {
        console.error("Seller registration error:", err);
        res.status(500).json({ 
            success: false,
            message: err.message || "Internal Server Error" 
        });
    }
});

// =================== Get All Admins with Pagination ===================
router.get("/getAllAdmins", verifySellerToken, async (req, res) => {
    try {
        // Extract pagination parameters from query string
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;
        
        // Calculate skip value for pagination
        const skip = (page - 1) * limit;
        
        // Build search filter
        let searchFilter = {};
        if (search) {
            searchFilter = {
                $or: [
                    { fullName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phoneNumber: { $regex: search, $options: 'i' } }
                ]
            };
        }
        
        // Get total count for pagination info
        const totalAdmins = await Admin.countDocuments(searchFilter);
        
        // Fetch paginated admins
        const admins = await Admin.find(searchFilter)
            .select("-password")
            .sort({ [sortBy]: sortOrder })
            .skip(skip)
            .limit(limit);
        
        // Calculate pagination metadata
        const totalPages = Math.ceil(totalAdmins / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;
        
        if (totalAdmins === 0) {
            return res.status(200).json({
                success: true,
                message: search ? "No admins found matching your search" : "No admins found",
                admins: [],
                pagination: {
                    currentPage: page,
                    totalPages: 0,
                    totalItems: 0,
                    itemsPerPage: limit,
                    hasNextPage: false,
                    hasPrevPage: false
                }
            });
        }

        res.status(200).json({
            success: true,
            admins: admins,
            pagination: {
                currentPage: page,
                totalPages: totalPages,
                totalItems: totalAdmins,
                itemsPerPage: limit,
                hasNextPage: hasNextPage,
                hasPrevPage: hasPrevPage,
                nextPage: hasNextPage ? page + 1 : null,
                prevPage: hasPrevPage ? page - 1 : null
            }
        });
        
    } catch (error) {
        console.error("Get all admins error:", error);
        res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
});


// =================== Admin Login ===================
router.post('/login', async (req, res) => {
    try {
        const user = await Admin.findOne({ email: req.body.email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { adminId: user._id, isAdmin: user.isAdmin },
            process.env.SECRETKEY,
            { expiresIn: '1d' }
        );

        const { password, ...userWithoutPassword } = user.toObject();

        res.status(200).json({
            token,
            user: userWithoutPassword
        });
    } catch (err) {
        console.error("Login error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// =================== Check Admin Authentication ===================
router.get('/is-auth', verifySellerToken, async (req, res) => {
    try {
        const adminId = req.adminId;

        const adminUser = await Admin.findById(adminId).select("-password");

        if (!adminUser) {
            console.log("isAuth: Admin not found for ID:", adminId);
            return res.status(404).json({ success: false, message: "User not found" });
        }

        console.log("isAuth: Admin found:", adminUser.email);
        return res.json({
            success: true,
            admin: {
                id: adminUser._id,
                fullName: adminUser.fullName,
                email: adminUser.email,
                phoneNumber: adminUser.phoneNumber
            }
        });
    } catch (err) {
        console.error("isAuth error:", err);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// =================== Admin Logout ===================
router.get('/logout', verifySellerToken, async (req, res) => {
    try {
        // If using stateless JWT, logout is handled client-side by deleting the token.
        res.status(200).json({ message: 'Logout successful' });
    } catch (err) {
        console.error("Logout error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// =================== Update Admin ===================
router.put('/update/:id', verifySellerToken, async (req, res) => {
    try {
        const {id} = req.params;
        const { fullName, email, phoneNumber, password} = req.body;
        const admin = await Admin.findById(id);
        if (!admin){
            console.log("Admin not found for ID:", id);
            return res.status(404).json({ message: "Admin not found" });
        }

        // Check if password is provided and hash it
        if (password) {
            const salt = await bcrypt.genSalt(10);
            admin.password = await bcrypt.hash(password, salt);
        }

        //Update admin details
        admin.fullName = fullName || admin.fullName;
        admin.email = email || admin.email;
        admin.phoneNumber  = phoneNumber || admin.phoneNumber;
        await admin.save();

        res.status(200).json({
            message: "Admin updated successfully"
        });

    }
    catch (error){
        console.error("Update admin error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }

})

// =================== Delete Admin ===================
router.delete('/delete/:id', verifySellerToken, async (req, res) => {
    try {
        const { id } = req.params;
        const admin = await Admin.findByIdAndDelete(id);
        if (!admin) {
            console.log("Admin not found for ID:", id);
            return res.status(404).json({ message: "Admin not found" });
        }
        res.status(200).json({ message: "Admin deleted successfully" });
    } catch (error) {
        console.error("Delete admin error:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});
module.exports = router;
