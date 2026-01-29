import express from 'express';
import { createFeedback, getProductRatings, getAllFeedbacks, getMyReviews, deleteMyReview } from '../../Controller/index.js';
import { authenticateToken, requireAdmin } from '../../Middleware/token-middleware.js';

const router = express.Router();

router.get('/product/:productId', getProductRatings);

// Require auth for the routes below
router.use(authenticateToken);

router.post('/', createFeedback);
router.get('/my-reviews', getMyReviews);
router.delete('/:id', deleteMyReview);
router.get('/', requireAdmin, getAllFeedbacks);

export { router as feedbackRoute };
