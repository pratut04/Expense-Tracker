const path = require('path');
// Always load from the server directory's own .env file
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const transactionRoutes = require('./routes/transactions');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in server/.env!');
  console.error('   Make sure server/.env contains: MONGODB_URI=mongodb+srv://...');
  process.exit(1);
}

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  // Render deployed frontend — set FRONTEND_URL in server/.env on Render
  process.env.FRONTEND_URL,
].filter(Boolean); // remove undefined/null entries

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check — also shows MongoDB connection status
app.get('/api/health', (req, res) => {
  const mongoState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.json({
    status: 'ok',
    mongodb: mongoState[mongoose.connection.readyState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/settings', settingsRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found.` });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error.' });
});

// Connect to MongoDB Atlas and start server
const startServer = async () => {
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // fail fast if Atlas unreachable
    });
    console.log('✅ Connected to MongoDB Atlas');

    app.listen(PORT, () => {
      console.log(`\n🚀 Backend running at  http://localhost:${PORT}`);
      console.log(`📊 Health check:       http://localhost:${PORT}/api/health`);
      console.log(`🔐 Auth endpoints:     http://localhost:${PORT}/api/auth/*`);
      console.log(`💳 Transaction API:    http://localhost:${PORT}/api/transactions\n`);
    });
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

startServer();
