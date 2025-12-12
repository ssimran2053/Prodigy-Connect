/**
 * Main entry point for the Prodigy Connect API server
 * This file initializes the Express application, sets up middleware
 * connects to the database, mounts API routes, and starts the server
 */
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';

// --- Core Application Imports ---
import { connectDB } from './config/db.js';
import errorHandler from './middleware/errorHandler.js';

// Load env vars
dotenv.config();

// --- Database Connection ---
connectDB();

// Route files
import authRoutes from './routes/auth.js';
import serviceRoutes from './routes/services.js';
import bookingRoutes from './routes/bookings.js';
import reviewRoutes from './routes/reviews.js';
import messageRoutes from './routes/messages.js';
import adminRoutes from './routes/admin.js';
import mapsRoutes from './routes/maps.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Set security-related HTTP headers to protect against common vulnerabilities
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// Enable Cross-Origin Resource Sharing (CORS) to allow requests from the frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

// Parse incoming JSON payloads
app.use(express.json());
// Parse incoming URL-encoded payloads
app.use(express.urlencoded({ extended: true }));

// Compress response bodies for better performance
app.use(compression());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Log HTTP requests in development mode for easier debugging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Apply rate limiting to all API routes to prevent abuse
const limiter = rateLimit({
  windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 500,
  message: 'Too many requests from this IP, please try again later'
});
app.use('/api', limiter);

// --- API Routes ---
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/maps', mapsRoutes);

// A simple health check endpoint to verify that the API is running
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Prodigy Connect API is running',
    timestamp: new Date().toISOString(),
    endpoints: {
      auth: '/api/auth',
      services: '/api/services',
      bookings: '/api/bookings',
      reviews: '/api/reviews',
      messages: '/api/messages',
      admin: '/api/admin',
      maps: '/api/maps'
    }
  });
});

// --- Error Handling ---
// Custom error handler middleware
app.use(errorHandler);

// Catch-all for 404 Not Found errors for any unhandled routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// --- Server Startup ---
const PORT = process.env.PORT || 5001;

// Start the Express server
const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   🚀 Prodigy Connect Server                   ║
║   🌐 Port: ${PORT}                             ║
║   💻 API: http://localhost:${PORT}/api         ║
╚═══════════════════════════════════════════════╝
  `);
});

// Gracefully handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`❌ Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
});

// Export the app for testing purposes
export default app;