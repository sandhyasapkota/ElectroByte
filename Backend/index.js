import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

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
  adminRoute
} from './Routes/index.js';
import {testConnection, sequelize} from './Database/db.js';
import { authenticateToken } from './Middleware/token-middleware.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes (no auth required)
app.use('/api', authRouter);
app.use('/api/faqs', faqRoute);
app.use('/api/products', productRoute);  // Products browsing is public
app.use('/api/categories', categoryRoute);  // Categories are public
app.use('/api/brands', brandRoute);  // Brands are public
app.post('/api/tickets/contact', (req, res, next) => next()); // Contact form is public

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
app.use('/api/admin', adminRoute);

app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await testConnection();
  
  // Use alter: true in development (preserves data)
  await sequelize.sync({ alter: true });
  console.log("✅ Database synced!");
});

export default app;