const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables FIRST
dotenv.config();

const notificationService = require('./services/notificationService');

// Import routes
const authRoutes = require('./routes/auth');
const itineraryRoutes = require('./routes/itineraries');
const dataRoutes = require('./routes/data');
const assistantRoutes = require('./routes/assistant');
const imageRoutes = require('./routes/images');
const notificationRoutes = require('./routes/notifications');
const hotelRoutes = require('./routes/hotels');
const profileRoutes = require('./routes/profile');
const employeeRoutes = require('./routes/employees');
const adminRoutes = require('./routes/admin');

const app = express();

// Middleware - CORS MUST be first
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000',
  'https://tourism-and-travel-tech-front.onrender.com',
  'https://tourism-and-travel-tech.onrender.com'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
}));

app.use(express.json({ limit: '10mb' }));

// Connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-travel-assistant');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/data', dataRoutes);
app.use('/api/assistant', assistantRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Smart Travel Assistant API is running', timestamp: new Date().toISOString() });
});

// CORS test endpoint
app.get('/api/test-cors', (req, res) => {
  res.json({ 
    message: 'CORS test successful', 
    origin: req.headers.origin,
    corsEnabled: true,
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  
  // Start notification processor
  console.log('Starting notification scheduler...');
  setInterval(() => {
    notificationService.processPendingNotifications();
  }, 60000); // Check every minute
});
