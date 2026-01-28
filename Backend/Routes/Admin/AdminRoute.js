import express from 'express';
import { 
  getDashboardStats, 
  adminGetAllUsers, 
  toggleUserBlock, 
  getAllTechnicians,
  createTechnician,
  updateTechnician,
  deactivateTechnician,
  deleteTechnician,
  updateUserRole,
  promoteToTechnician,
  deleteUser
} from '../../Controller/index.js';
import { authenticateToken, requireAdmin } from '../../Middleware/token-middleware.js';

const router = express.Router();

router.use(authenticateToken);
router.use(requireAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/users', adminGetAllUsers);
router.put('/users/:id/toggle-block', toggleUserBlock);
router.put('/users/:id/role', updateUserRole);
router.post('/users/:id/promote-technician', promoteToTechnician);
router.delete('/users/:id', deleteUser);
router.get('/technicians', getAllTechnicians);
router.post('/technicians', createTechnician);
router.put('/technicians/:id', updateTechnician);
router.delete('/technicians/:id', deleteTechnician);

export { router as adminRoute };
