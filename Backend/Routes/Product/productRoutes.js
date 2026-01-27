import express from 'express';
import { 
  getAllProducts, 
  getProductById, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  uploadProductImages,
  addProductImages,
  deleteProductImage,
  setPrimaryImage,
  updateProductStock
} from '../../Controller/index.js';
import { authenticateToken, requireAdmin } from '../../Middleware/token-middleware.js';

const router = express.Router();

// Product routes with image upload middleware
router.get('/', getAllProducts);
router.get('/:id', getProductById);
router.post('/', authenticateToken, requireAdmin, uploadProductImages, createProduct);
router.put('/:id', authenticateToken, requireAdmin, uploadProductImages, updateProduct);
router.delete('/:id', authenticateToken, requireAdmin, deleteProduct);

// Stock management route (Admin)
router.put('/:id/stock', authenticateToken, requireAdmin, updateProductStock);

// Image management routes
router.post('/:id/images', authenticateToken, requireAdmin, uploadProductImages, addProductImages);
router.delete('/:id/images/:imageId', authenticateToken, requireAdmin, deleteProductImage);
router.put('/:id/images/:imageId/primary', authenticateToken, requireAdmin, setPrimaryImage);

export { router as productRoute };
