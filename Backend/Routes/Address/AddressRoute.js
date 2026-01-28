import express from 'express';
import { getAddresses, addAddress, updateAddress, deleteAddress } from '../../Controller/index.js';
import { authenticateToken } from '../../Middleware/token-middleware.js';

const router = express.Router();

router.use(authenticateToken);

router.get('/', getAddresses);
router.post('/', addAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);

export { router as addressRoute };
