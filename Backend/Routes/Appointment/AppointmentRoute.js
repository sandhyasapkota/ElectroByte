import express from 'express';
import { 
  bookAppointment, 
  getMyAppointments, 
  editAppointment, 
  cancelAppointment,
  getRepairStatus,
  getRepairHistory,
  getAllAppointments,
  assignTechnician,
  updateRepairStatus,
  getTechnicianJobs,
  updateAppointmentStatus,
  getSlotAvailability
} from '../../Controller/index.js';
import { requireAdmin, requireTechnician } from '../../Middleware/token-middleware.js';

const router = express.Router();

// User routes
router.get('/slot-availability', getSlotAvailability);
router.post('/', bookAppointment);
router.get('/my-appointments', getMyAppointments);
router.put('/:id', editAppointment);
router.put('/:id/cancel', cancelAppointment);
router.get('/repair/:token', getRepairStatus);
router.get('/repair-history', getRepairHistory);

// Admin routes
router.get('/', requireAdmin, getAllAppointments);
router.post('/assign-technician', requireAdmin, assignTechnician);
router.put('/:id/status', requireAdmin, updateAppointmentStatus);

// Technician routes
router.put('/repair/:id/status', requireTechnician, updateRepairStatus);
router.get('/technician/jobs', requireTechnician, getTechnicianJobs);

export { router as appointmentRoute };
