import express from 'express';
import { 
  createOrder, 
  getMyOrders, 
  getOrderById, 
  cancelOrder, 
  getAllOrders, 
  updateOrderStatus 
} from '../../Controller/index.js';
import { requireAdmin } from '../../Middleware/token-middleware.js';

const router = express.Router();

// User routes
router.post('/', createOrder);
router.get('/my-orders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

// Admin routes
router.get('/', requireAdmin, getAllOrders);
router.put('/:id/status', requireAdmin, updateOrderStatus);

export { router as orderRoute };
