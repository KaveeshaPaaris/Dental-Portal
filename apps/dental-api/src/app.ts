import 'dotenv/config';
import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middleware/error.middleware';

// Route modules
import bookingsRouter from './modules/bookings/bookings.routes';
import reviewsRouter from './modules/reviews/reviews.routes';
import inventoryRouter from './modules/inventory/inventory.routes';
import notificationsRouter from './modules/notifications/notifications.routes';
import adminsRouter from './modules/admins/admins.routes';
import faqsRouter from './modules/faqs/faqs.routes';
import contentRouter from './modules/content/content.routes';

const app = express();

// ─── Security ────────────────────────────────────────────────
app.use(helmet());

const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps, curl)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

// ─── Logging ─────────────────────────────────────────────────
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ─── Body Parsing ────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Rate Limiting (public OTP endpoints) ────────────────────
const otpLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  message: { error: 'Too many OTP requests. Please try again in 10 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  message: { error: 'Too many requests. Please slow down.' },
});

// ─── Health Check ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), env: env.NODE_ENV });
});

// ─── API Routes ───────────────────────────────────────────────
const BASE = '/api/v1';

// Public — apply general rate limiter
app.use(`${BASE}/bookings`, publicLimiter, bookingsRouter);
app.use(`${BASE}/reviews`, publicLimiter, reviewsRouter);
app.use(`${BASE}/faqs`, publicLimiter, faqsRouter);
app.use(`${BASE}/content`, publicLimiter, contentRouter);

// Apply stricter rate limit specifically to OTP endpoints
app.use(`${BASE}/bookings/verify-otp`, otpLimiter);
app.use(`${BASE}/bookings/resend-otp`, otpLimiter);

// Admin — JWT + role enforced inside each router
app.use(`${BASE}/admin/inventory`, inventoryRouter);
app.use(`${BASE}/admin/notifications`, notificationsRouter);
app.use(`${BASE}/admin/admins`, adminsRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use(errorHandler);

export default app;
