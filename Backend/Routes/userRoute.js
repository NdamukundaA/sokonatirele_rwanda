const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/UserTokenVerify.js');
const adminMiddleware = require('../middleware/AdminMiddleWare.js')
const User = require('../models/User.js');
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

router.get('/account', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password'); 
    if (!user) {
      console.log('Account: User not found for ID:', req.user._id); 
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Account error:', error.message); 
    res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
});

router.put(
  '/updatePassword',
  [
    body('email')
      .optional()
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    body('phoneNumber')
      .optional()
      .matches(/^\+?[1-9]\d{1,14}$/)
      .withMessage('Invalid phone number format (e.g., +1234567890)'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body().custom((value) => {
      if (!value.email && !value.phoneNumber) {
        throw new Error('Either email or phone number is required');
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const { email, phoneNumber, password } = req.body;
      const user = await User.findOne({
        $or: [
          { phoneNumber: phoneNumber || null }, 
          { email: email || null },
        ],
      });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      res.json({ message: 'Password updated successfully' });
    } catch (error) {
      console.error('Update password error:', error);
      res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
  }
);

router.get('/is-auth', verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      console.log('isAuth: User not found for ID:', req.user._id);
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
      },
    });
  } catch (err) {
    console.error('is-auth error:', err.message);
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
});


// updating  user profile 
router.put("/updateProfile", verifyToken, async(req,res) => {
  try {
    const {fullName, email, phoneNumber} = req.body;
    const user = await User.findById(req.user._id);
    if (!user){
      console.log("User not found  for Id: ", req.user._id);
      return res.status(404).json({message: "User not found"});
    }
    user.fullName = fullName || user.fullName;
    user.email = email || user.email;
    user.phoneNumber = phoneNumber || user.phoneNumber;
    await user.save();
    return  res.status(200).json({message: "Profile updated successfully"});
  }

  
  catch (error){
    console.error("update profile error: ", error)
    res.status(500).json({message: "Something went wrong", error: error.meassage})
  }
})


router.get('/logout', verifyToken, async (req, res) => {
  try {
    return res.status(200).json({ message: 'Logout successful' });
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong', error: err.message });
  }
});


// user Management by Admin 

// =================== Get All Users ===================
router.get('/all', adminMiddleware, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    if (!users || users.length === 0){
      return res.status(404).json({ message: 'No users found'});
  
    }

    // returning paginated response
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const totalUsers = await User.countDocuments();
    const totalPages = Math.ceil(totalUsers / limit);

    const usersToReturn = users.slice((page - 1) * limit, page * limit);

    return res.status(200).json({
      success: true,
      data: usersToReturn,
      pagination: {
        totalUsers,
        totalPages,
        currentPage: page,
        limit,
      },
    });

  }
  catch (error){
    console.error("Error fetching all users:", error);
    return res.status(500).json({ message: 'Something went wrong', error: error.message})
  }
})

// =================== Get User by ID ===================
router.get('/getUser/:id', adminMiddleware, async (req, res) => {
  try {
    const { id} = req.params;
    if (!id) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ success: true, user });

  }
  catch (error){
    console.error("Error fetching user by ID:", error);
    return res.status(500).json({ message: 'Something went wrong', error: error.message });
  }
})

module.exports = router;