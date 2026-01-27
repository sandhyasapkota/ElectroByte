import express from 'express';
import { getAllFAQs, createFAQ, updateFAQ, deleteFAQ } from '../../Controller/index.js';
import { authenticateToken, requireAdmin } from '../../Middleware/token-middleware.js';

const router = express.Router();

router.get('/', getAllFAQs);
router.post('/', authenticateToken, requireAdmin, createFAQ);
router.put('/:id', authenticateToken, requireAdmin, updateFAQ);
router.delete('/:id', authenticateToken, requireAdmin, deleteFAQ);

export { router as faqRoute };
