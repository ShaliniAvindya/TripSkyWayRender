import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import morgan from 'morgan';

// Configs
import corsOptions from './config/cors.js';
import { limiter } from './config/rateLimiter.js';
import logger from './config/logger.js';
import { dropReviewsIndexes } from './utils/indexManager.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import adminRoutes from './routes/admin.routes.js';
import salesRepRoutes from './routes/salesRep.routes.js';
import vendorRoutes from './routes/vendor.routes.js';
import packageRoutes from './routes/package.routes.js';
import packageAIRoutes from './routes/packageAI.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import reviewRoutes from './routes/review.routes.js';
import leadRoutes from './routes/lead.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';
import itineraryRoutes from './routes/itinerary.routes.js';
import manualItineraryRoutes from './routes/manualItinerary.routes.js';
import customizedPackageRoutes from './routes/customizedPackage.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import careerRoutes from './routes/career.routes.js';
import vacancyRoutes from './routes/vacancy.routes.js';

// Billing
import quotationRoutes from './routes/quotation.routes.js';
import paymentReceiptRoutes from './routes/paymentReceipt.routes.js';
import creditNoteRoutes from './routes/creditNote.routes.js';
import billingRoutes from './routes/billing.routes.js';

// Middleware
import errorHandler from './middleware/errorHandler.js';
import notFound from './middleware/notFound.js';
import emailService from './utils/emailService.js';

// --------------------
// Setup
// --------------------

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../.env') });

const app = express();

// --------------------
// Middleware
// --------------------
app.use(helmet());
app.use(cors(corsOptions));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(xss());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

app.use('/api', limiter);

// --------------------
// Health check
// --------------------
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// --------------------
// Routes
// --------------------
const API_VERSION = process.env.API_VERSION || 'v1';

app.use(`/api/${API_VERSION}/auth`, authRoutes);
app.use(`/api/${API_VERSION}/users`, userRoutes);
app.use(`/api/${API_VERSION}/admin`, adminRoutes);
app.use(`/api/${API_VERSION}/sales-reps`, salesRepRoutes);
app.use(`/api/${API_VERSION}/vendors`, vendorRoutes);
app.use(`/api/${API_VERSION}/packages`, packageAIRoutes);
app.use(`/api/${API_VERSION}/packages`, packageRoutes);
app.use(`/api/${API_VERSION}/bookings`, bookingRoutes);
app.use(`/api/${API_VERSION}/reviews`, reviewRoutes);
app.use(`/api/${API_VERSION}/leads`, leadRoutes);
app.use(`/api/${API_VERSION}/invoices`, invoiceRoutes);
app.use(`/api/${API_VERSION}/billing/invoices`, invoiceRoutes);
app.use(`/api/${API_VERSION}/itineraries`, itineraryRoutes);
app.use(`/api/${API_VERSION}/manual-itineraries`, manualItineraryRoutes);
app.use(`/api/${API_VERSION}/customized-packages`, customizedPackageRoutes);
app.use(`/api/${API_VERSION}/payments`, paymentRoutes);
app.use(`/api/${API_VERSION}/notifications`, notificationRoutes);
app.use(`/api/${API_VERSION}/dashboard`, dashboardRoutes);
app.use(`/api/${API_VERSION}/upload`, uploadRoutes);
app.use(`/api/${API_VERSION}/analytics`, analyticsRoutes);
app.use(`/api/${API_VERSION}/billing/quotations`, quotationRoutes);
app.use(`/api/${API_VERSION}/billing/receipts`, paymentReceiptRoutes);
app.use(`/api/${API_VERSION}/billing/credit-notes`, creditNoteRoutes);
app.use(`/api/${API_VERSION}/billing`, billingRoutes);
app.use(`/api/${API_VERSION}/careers`, careerRoutes);
app.use(`/api/${API_VERSION}/vacancies`, vacancyRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// --------------------
// MongoDB Connection (Serverless-friendly)
// --------------------
let cachedDB = null;

export async function connectDB() {
  if (cachedDB) return cachedDB;

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    cachedDB = conn;
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    await dropReviewsIndexes();
    return conn;
  } catch (error) {
    logger.error(`MongoDB connection error: ${error.message}`);
    throw error;
  }
}

// --------------------
// Vercel Serverless Export
// --------------------
export default async function handler(req, res) {
  try {
    await connectDB(); // connect on-demand
    app(req, res); // forward request to Express app
  } catch (err) {
    logger.error(err.message);
    res.status(500).json({ status: 'error', message: err.message });
  }
}


