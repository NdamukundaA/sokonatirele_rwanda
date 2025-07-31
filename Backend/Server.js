const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const authRouter = require('./Routes/UserAuthRoute.js');
const UserRoute = require('./Routes/userRoute.js');
const SellerRoutes = require('./Routes/SellerRoutes.js');
const ProductRoute = require('./Routes/ProductRoutes.js');
const CategoryRoute = require('./Routes/CategoryRoutes.js');
const AddressRoute = require('./Routes/AddressRoutes.js');
const CartRoutes = require('./Routes/CartRoutes.js');
const OrderRoutes = require('./Routes/OrderRoutes.js');
const CustomerRoute = require('./Routes/CustomerRoute.js');
const adminRoutes = require('./Routes/AdminRoutes.js');


// Load environment variables
dotenv.config({ path: './.env' }); // Explicitly specify .env file path

// Log environment variables for debugging
console.log('Environment Variables:');
console.log('FRONTENDCONNECTIONS:', process.env.FRONTENDCONNECTIONS);
console.log('DBCONNECTION:', process.env.DBCONNECTION ? 'Set (hidden for security)' : 'Not set');
console.log('PORT:', process.env.PORT);

// Define allowed origins
const allowedOrigins = (process.env.FRONTENDCONNECTIONS || 'http://localhost:8080,http://localhost:8081')
  .split(',')
  .map(url => url.trim());
console.log('Allowed Origins:', allowedOrigins);

// Create HTTP server and initialize Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      console.log('Socket.IO CORS: Request origin:', origin);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('Socket.IO CORS: Blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Make io accessible in routes
app.set('io', io);

// Connect to MongoDB
mongoose.connect(process.env.DBCONNECTION)
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

// Middleware
app.use(express.json());

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      console.log('Express CORS: Request origin:', origin, 'Allowed origins:', allowedOrigins);
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('Express CORS: Blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  })
);

// Test endpoint to verify CORS
app.get('/api/test-cors', (req, res) => {
  res.json({ message: 'CORS test endpoint reached' });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/user', UserRoute);
app.use('/api/seller', SellerRoutes);
app.use('/api/product', ProductRoute);
app.use('/api/category', CategoryRoute);
app.use('/api/address', AddressRoute);
app.use('/api/cart', CartRoutes);
app.use('/api/order', OrderRoutes);
app.use('/api/customer', CustomerRoute);
app.use('/api/admin', adminRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Isoko app listening on port ${PORT}`);
  console.log(`http://localhost:${PORT}`);
});