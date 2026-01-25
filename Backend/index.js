import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import {
  UserRoute,
  productRoute,
  authRouter,
  categoryRoute,
  brandRoute,
  cartRoute,
  orderRoute,
  addressRoute,
  appointmentRoute,
  ticketRoute,
  faqRoute,
  feedbackRoute,
  adminRoute,
  wishlistRouter
} from './Routes/index.js';
import {testConnection, sequelize} from './Database/db.js';
import { authenticateToken } from './Middleware/token-middleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Public routes (no auth required)
app.use('/api', authRouter);
app.use('/api/faqs', faqRoute);
app.use('/api/products', productRoute);  // Products browsing is public
app.use('/api/categories', categoryRoute);  // Categories are public
app.use('/api/brands', brandRoute);  // Brands are public
app.get('/api/feedback/product/:productId', (req, res, next) => {
  // Product ratings are public
  import('./Controller/Feedback/FeedbackController.js').then(({ getProductRatings }) => {
    getProductRatings(req, res);
  });
});

// Contact form is public (no auth required)
app.post('/api/tickets/contact', (req, res) => {
  import('./Controller/Ticket/TicketController.js').then(({ submitContactForm }) => {
    submitContactForm(req, res);
  });
});

// Auth middleware for protected routes
app.use(authenticateToken);

// Protected routes
app.use('/api/users', UserRoute);
app.use('/api/cart', cartRoute);
app.use('/api/orders', orderRoute);
app.use('/api/addresses', addressRoute);
app.use('/api/appointments', appointmentRoute);
app.use('/api/tickets', ticketRoute);
app.use('/api/feedback', feedbackRoute);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/admin', adminRoute);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await testConnection();
  
  // Use alter: true in development (preserves data)
  await sequelize.sync({ alter: true });
  console.log("✅ Database synced!");
});

export default app;