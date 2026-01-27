import express from 'express';
import { 
  createTicket, 
  submitContactForm, 
  getMyTickets,
  getTicketById,
  addReply,
  getAllTickets, 
  replyToTicket, 
  updateTicketStatus 
} from '../../Controller/index.js';
import { requireAdmin } from '../../Middleware/token-middleware.js';

const router = express.Router();

// Public route
router.post('/contact', submitContactForm);

// User routes
router.post('/', createTicket);
router.get('/my-tickets', getMyTickets);
router.get('/:id', getTicketById);
router.post('/:id/reply', addReply);

// Admin routes
router.get('/', requireAdmin, getAllTickets);
router.put('/:id/reply', requireAdmin, replyToTicket);
router.put('/:id/status', requireAdmin, updateTicketStatus);

export { router as ticketRoute };
