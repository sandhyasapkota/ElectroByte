import express from 'express';
import { createFeedback, getProductRatings, getAllFeedbacks, getMyReviews, deleteMyReview } from '../../Controller/index.js';
import { requireAdmin } from '../../Middleware/token-middleware.js';

const router = express.Router();

router.post('/', createFeedback);
router.get('/my-reviews', getMyReviews);
router.delete('/:id', deleteMyReview);
router.get('/product/:productId', getProductRatings);
router.get('/', requireAdmin, getAllFeedbacks);

export { router as feedbackRoute };
