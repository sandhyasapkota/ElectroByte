import express from 'express';
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from '../../Controller/index.js';

const router = express.Router();

router.get('/', getCart);
router.post('/', addToCart);
router.put('/:id', updateCartItem);
router.delete('/:id', removeFromCart);
router.delete('/', clearCart);

export { router as cartRoute };
