const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs'); // For hashing password
const Admin = require('./models/Admin.js'); // Adjusted path to Admin model

// Load environment variables
dotenv.config();

// Single admin data
const admin = {
  fullName: 'Mugisha Prince',
  email: 'mugishaprince395@gmail.com',
  phoneNumber: '+12345678904',
  password: 'Prince@12002',
  isAdmin: true,
};

// Connect to MongoDB
mongoose.connect(process.env.DBCONNECTION, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('Connected to MongoDB for seeding'))
  .catch(err => {
    console.error('Database connection error:', err);
    process.exit(1);
  });

// Function to hash password
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Function to seed one admin
const seedOneAdmin = async () => {
  try {
    // Check if admin with the same email already exists
    const existingAdmin = await Admin.findOne({ email: admin.email });
    if (existingAdmin) {
      console.log('Admin with this email already exists:', admin.email);
      mongoose.connection.close();
      return;
    }

    // Hash the password
    const hashedPassword = await hashPassword(admin.password);

    // Create new admin
    const newAdmin = new Admin({
      ...admin,
      password: hashedPassword,
    });

    // Save the admin to the database
    await newAdmin.save();
    console.log('Admin seeded successfully:', admin.email);

    // Close the database connection
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

// Run the seeding function
seedOneAdmin();