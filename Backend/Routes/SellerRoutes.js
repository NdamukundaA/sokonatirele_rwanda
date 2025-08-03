// Routes/SellerRoutes.js
const express = require('express');
const router = express.Router();
const Admin = require('../models/Admins.js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const adminMiddleware = require('../middleware/AdminMiddleWare.js');
const { verifySellerToken } = require('../middleware/SellerTokenVerify.js');

dotenv.config();

// =================== Register Seller ===================
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phoneNumber, companyName, companyAddress, password } = req.body;

    const existingSeller = await Admin.findOne({ email });
    if (existingSeller) {
      return res.status(400).json({
        success: false,
        message: 'Seller with this email already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const sellerInstance = new Admin({
      fullName,
      email,
      phoneNumber,
      companyName,
      companyAddress,
      password: hashedPassword,
      isAdmin: true // Set seller as admin
    });

    const savedSeller = await sellerInstance.save();
    const { password: _, ...sellerWithoutPassword } = savedSeller.toObject();

    res.status(201).json({
      success: true,
      message: 'Seller registered successfully',
      seller: sellerWithoutPassword,
    });
  } catch (err) {
    console.error('Seller registration error:', err);
    res.status(500).json({
      success: false,
      message: err.message || 'Internal Server Error',
    });
  }
});

router.get('/getAllSeller', adminMiddleware, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    let searchFilter = { isAdmin: true };
    if (search) {
      searchFilter = {
        isAdmin: true,
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phoneNumber: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const totalSellers = await Admin.countDocuments(searchFilter);
    const sellers = await Admin.find(searchFilter)
      .select('-password')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalSellers / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    if (totalSellers === 0) {
      return res.status(200).json({
        success: true,
        message: search ? 'No sellers found matching your search' : 'No sellers found',
        sellers: [],
        pagination: {
          currentPage: page,
          totalPages: 0,
          totalItems: 0,
          itemsPerPage: limit,
          hasNextPage: false,
          hasPrevPage: false,
        },
      });
    }

    res.status(200).json({
      success: true,
      sellers,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: totalSellers,
        itemsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        nextPage: hasNextPage ? page + 1 : null,
        prevPage: hasPrevPage ? page - 1 : null,
      },
    });
  } catch (error) {
    console.error('Get all sellers error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
});

router.get('/getSeller/:id', adminMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Seller ID is required',
      });
    }

    const seller = await Admin.findOne({ _id: id, isAdmin: true }).select('-password');

    if (!seller) {
      return res.status(404).json({
        success: false,
        message: 'Seller not found',
      });
    }

    return res.status(200).json({
      success: true,
      seller: {
        id: seller._id,
        fullName: seller.fullName,
        email: seller.email,
        phoneNumber: seller.phoneNumber,
        companyName: seller.companyName,
        companyAddress: seller.companyAddress,
        isSeller: seller.isSeller,
        isAdmin: seller.isAdmin,
        createdAt: seller.createdAt,
        updatedAt: seller.updatedAt,
      },
    });
  } catch (error) {
    console.error('Get seller by ID error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: error.message,
    });
  }
});

// =================== Seller Login ===================
router.post('/login', async (req, res) => {
  try {
    const user = await Admin.findOne({ email: req.body.email, isAdmin: true });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { adminId: user._id, isAdmin: true },
      process.env.SECRETKEY,
      { expiresIn: '1d' }
    );

    const { password, ...userWithoutPassword } = user.toObject();

    res.status(200).json({
      token,
      user: userWithoutPassword,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// =================== Check Seller Authentication ===================
router.get('/is-auth', verifySellerToken, async (req, res) => {
  try {
    const adminId = req.adminId;
    const seller = await Admin.findOne({ _id: adminId, isAdmin: true }).select('-password');

    if (!seller) {
      console.log('isAuth: Seller not found for ID:', adminId);
      return res.status(404).json({ success: false, message: 'Seller not found' });
    }

    console.log('isAuth: Seller found:', seller.email);
    return res.json({
      success: true,
      seller: {
        id: seller._id,
        fullName: seller.fullName,
        email: seller.email,
        phoneNumber: seller.phoneNumber,
        isSeller: seller.isSeller,
        isAdmin: seller.isAdmin,
      },
    });
  } catch (err) {
    console.error('isAuth error:', err);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

// =================== Seller Logout ===================
router.get('/logout', verifySellerToken, async (req, res) => {
  try {
    res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// =================== Update Seller ===================
router.put('/update/:id', verifySellerToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phoneNumber, password } = req.body;
    const seller = await Admin.findOne({ _id: id, isAdmin: true });

    if (!seller) {
      console.log('Seller not found for ID:', id);
      return res.status(404).json({ message: 'Seller not found' });
    }

    if (password) {
      const salt = await bcrypt.genSalt(10);
      seller.password = await bcrypt.hash(password, salt);
    }

    seller.fullName = fullName || seller.fullName;
    seller.email = email || seller.email;
    seller.phoneNumber = phoneNumber || seller.phoneNumber;
    await seller.save();

    res.status(200).json({
      message: 'Seller updated successfully',
    });
  } catch (error) {
    console.error('Update seller error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// =================== Delete Seller ===================
router.delete('/delete/:id', verifySellerToken, async (req, res) => {
  try {
    const { id } = req.params;
    const seller = await Admin.findOneAndDelete({ _id: id, isAdmin: true });
    if (!seller) {
      console.log('Seller not found for ID:', id);
      return res.status(404).json({ message: 'Seller not found' });
    }
    res.status(200).json({ message: 'Seller deleted successfully' });
  } catch (error) {
    console.error('Delete seller error:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;