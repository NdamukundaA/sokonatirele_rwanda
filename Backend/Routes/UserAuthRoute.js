const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { body, validationResult } = require('express-validator');

dotenv.config();

// REGISTER NEW USER API
router.post(
  '/register',
  [
    body('fullName').trim().notEmpty().withMessage('Full name is required'),
    body('email')
      .if((value, { req }) => !req.body.phoneNumber)
      .notEmpty().withMessage('Email is required')
      .bail()
      .isEmail().withMessage('Invalid email format')
      .normalizeEmail(),
    body('phoneNumber')
      .if((value, { req }) => !req.body.email)
      .notEmpty().withMessage('Phone number is required')
      .bail()
      .matches(/^\+?[1-9]\d{1,14}$/).withMessage('Invalid phone number format'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array().map(err => ({ msg: err.msg, param: err.param })) });
      }

      const { fullName, email, phoneNumber, password } = req.body;

      // Only include email/phoneNumber if provided
      const newUserData = {
        fullName,
        password: await bcrypt.hash(password, 10),
      };
      if (email) newUserData.email = email;
      if (phoneNumber) newUserData.phoneNumber = phoneNumber;

      // Check for existing user with email
      if (email) {
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
          return res.status(400).json({
            errors: [{ msg: 'User with this email already exists', param: 'email' }],
          });
        }
      }

      // Check for existing user with phone number
      if (phoneNumber) {
        const existingPhone = await User.findOne({ phoneNumber });
        if (existingPhone) {
          return res.status(400).json({
            errors: [{ msg: 'User with this phone number already exists', param: 'phoneNumber' }],
          });
        }
      }

      // Create and save new user
      const newUser = new User(newUserData);
      const savedUser = await newUser.save();

      // Generate JWT token
      const token = jwt.sign({ _id: savedUser._id }, process.env.SECRETKEY, {
        expiresIn: '1d',
      });

      // Send response
      res.status(201).json({
        token,
        user: {
          id: savedUser._id,
          fullName: savedUser.fullName,
          email: savedUser.email,
          phoneNumber: savedUser.phoneNumber,
          isAdmin: savedUser.isAdmin,
        },
      });
    } catch (err) {
      // Handle MongoDB duplicate key error
      if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return res.status(400).json({
          errors: [{ msg: `User with this ${field} already exists`, param: field }],
        });
      }
      // Handle Mongoose validation errors
      if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => ({
          msg: e.message,
          param: e.path,
        }));
        return res.status(400).json({ errors: messages });
      }
      console.error('Registration error:', err);
      res.status(500).json({ message: 'Internal server error', error: 'unknown_error' });
    }
  }
);

// LOGIN USER API
router.post(
  '/login',
  [
    body('identifier').notEmpty().withMessage('Email or phone number is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array().map(err => ({ msg: err.msg, param: err.param })) });
    }

    try {
      const user = await User.findOne({
        $or: [
          { email: req.body.identifier },
          { phoneNumber: req.body.identifier },
        ],
      });

      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials', param: 'identifier' }] });
      }

      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials', param: 'password' }] });
      }

      const token = jwt.sign({ _id: user._id }, process.env.SECRETKEY, {
        expiresIn: '1d',
      });
      res.status(200).json({
        token,
        user: {
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          phoneNumber: user.phoneNumber,
          isAdmin: user.isAdmin,
        },
      });
    } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
);

module.exports = router;