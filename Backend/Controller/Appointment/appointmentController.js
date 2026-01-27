import { Appointment, Repair, User, Technician } from "../../Model/index.js";
import { v4 as uuidv4 } from 'uuid';
import { Op } from 'sequelize';
import { sendAppointmentConfirmationEmail } from '../../services/emailService.js';

const MAX_BOOKINGS_PER_SLOT = 5;
const ALLOWED_TIME_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:00 AM',
  '12:00 PM',
  '02:00 PM',
  '03:00 PM',
  '04:00 PM',
  '05:00 PM',
];

// Generate repair token
const generateRepairToken = () => {
  return 'RPR-' + Date.now().toString(36).toUpperCase() + uuidv4().substring(0, 4).toUpperCase();
};

// Get slot availability for a specific date
const getSlotAvailability = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }
    
    // Count bookings for each time slot on the given date (excluding cancelled)
    const bookings = await Appointment.findAll({
      where: {
        appointmentDate: date,
        status: {
          [Op.ne]: 'cancelled'
        }
      },
      attributes: ['appointmentTime']
    });
    
    // Count bookings per time slot
    const slotCounts = {};
    bookings.forEach(booking => {
      const time = booking.appointmentTime;
      slotCounts[time] = (slotCounts[time] || 0) + 1;
    });
    
    res.status(200).json({ 
      data: slotCounts,
      maxPerSlot: MAX_BOOKINGS_PER_SLOT,
      message: "Slot availability fetched successfully" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch slot availability" });
  }
};

// Book appointment
const bookAppointment = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { appointmentDate, appointmentTime, deviceType, deviceBrand, issueDescription, pickupRequired, pickupAddress } = req.body;
    
    if (!appointmentDate || !appointmentTime || !deviceType || !issueDescription) {
      return res.status(400).json({ error: "Date, time, device type and issue description are required" });
    }

    const parsedDate = new Date(appointmentDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({ error: "Invalid appointment date" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    parsedDate.setHours(0, 0, 0, 0);
    if (parsedDate < today) {
      return res.status(400).json({ error: "Appointment date cannot be in the past" });
    }

    if (!ALLOWED_TIME_SLOTS.includes(appointmentTime)) {
      return res.status(400).json({ error: "Invalid appointment time slot" });
    }

    if (typeof issueDescription !== 'string' || issueDescription.trim().length < 10) {
      return res.status(400).json({ error: "Issue description must be at least 10 characters" });
    }
    if (issueDescription.length > 2000) {
      return res.status(400).json({ error: "Issue description must be less than 2000 characters" });
    }

    if (deviceBrand && deviceBrand.length > 100) {
      return res.status(400).json({ error: "Device brand must be less than 100 characters" });
    }

    if (pickupRequired && (!pickupAddress || pickupAddress.trim().length < 10)) {
      return res.status(400).json({ error: "Pickup address is required (min 10 characters)" });
    }
    if (pickupAddress && pickupAddress.length > 500) {
      return res.status(400).json({ error: "Pickup address must be less than 500 characters" });
    }
    
    // Check if the slot is full (max 5 bookings per slot)
    const existingBookings = await Appointment.count({
      where: {
        appointmentDate,
        appointmentTime,
        status: {
          [Op.ne]: 'cancelled'
        }
      }
    });
    
    if (existingBookings >= MAX_BOOKINGS_PER_SLOT) {
      return res.status(400).json({ error: "This time slot is fully booked. Please select another time." });
    }
    
    const appointment = await Appointment.create({
      userId,
      appointmentDate,
      appointmentTime,
      deviceType,
      deviceBrand,
      issueDescription,
      pickupRequired,
      pickupAddress
    });
    
    // Create repair record with token
    const repair = await Repair.create({
      repairToken: generateRepairToken(),
      appointmentId: appointment.id,
      userId,
      status: 'received'
    });
    
    // Send appointment confirmation email
    try {
      const user = await User.findByPk(userId);
      if (user) {
        await sendAppointmentConfirmationEmail(user.email, user.username, {
          deviceType,
          deviceBrand,
          appointmentDate,
          appointmentTime,
          issueDescription
        }, repair.repairToken);
        console.log(`Appointment confirmation email sent to ${user.email}`);
      }
    } catch (emailError) {
      console.error('Failed to send appointment confirmation email:', emailError);
    }
    
    res.status(201).json({ 
      data: { appointment, repairToken: repair.repairToken },
      message: "Appointment booked successfully" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to book appointment" });
  }
};

// Get my appointments
const getMyAppointments = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const appointments = await Appointment.findAll({
      where: { userId },
      include: [{ model: Repair }],
      order: [['appointmentDate', 'DESC']]
    });
    
    res.status(200).json({ data: appointments, message: "Appointments fetched successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
};

// Edit appointment (before date)
const editAppointment = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { id } = req.params;
    
    const appointment = await Appointment.findOne({ where: { id, userId } });
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    
    // Check if appointment date has passed
    if (new Date(appointment.appointmentDate) < new Date()) {
      return res.status(400).json({ error: "Cannot edit past appointments" });
    }
    
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({ error: "Cannot edit completed or cancelled appointments" });
    }
    
    await appointment.update(req.body);
    res.status(200).json({ data: appointment, message: "Appointment updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update appointment" });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { id } = req.params;
    
    const appointment = await Appointment.findOne({ where: { id, userId } });
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    
    if (appointment.status === 'completed') {
      return res.status(400).json({ error: "Cannot cancel completed appointments" });
    }
    
    appointment.status = 'cancelled';
    await appointment.save();
    
    res.status(200).json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
};

// Get repair status by token
const getRepairStatus = async (req, res) => {
  try {
    const { token } = req.params;
    
    const repair = await Repair.findOne({
      where: { repairToken: token },
      include: [{ model: Appointment }]
    });
    
    if (!repair) return res.status(404).json({ error: "Repair not found" });
    
    res.status(200).json({ data: repair });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch repair status" });
  }
};

// Get repair history
const getRepairHistory = async (req, res) => {
  try {
    const userId = req.user.user.id;
    
    const repairs = await Repair.findAll({
      where: { userId, status: 'completed' },
      include: [{ model: Appointment }],
      order: [['completedAt', 'DESC']]
    });
    
    res.status(200).json({ data: repairs, message: "Repair history fetched" });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch repair history" });
  }
};

// Get all appointments (Admin)
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      include: [
        { model: User, attributes: ['id', 'username', 'email', 'phone'] },
        { 
          model: Repair,
          include: [{
            model: Technician,
            include: [{ model: User, attributes: ['id', 'username', 'email'] }]
          }]
        }
      ],
      order: [['appointmentDate', 'DESC']]
    });
    
    res.status(200).json({ data: appointments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
};

// Assign technician (Admin)
const assignTechnician = async (req, res) => {
  try {
    const { repairId, technicianId } = req.body;
    
    const repair = await Repair.findByPk(repairId);
    if (!repair) return res.status(404).json({ error: "Repair not found" });
    
    repair.technicianId = technicianId;
    await repair.save();
    
    res.status(200).json({ data: repair, message: "Technician assigned" });
  } catch (error) {
    res.status(500).json({ error: "Failed to assign technician" });
  }
};

// Update repair status (Technician)
const updateRepairStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, technicianNotes, estimatedCost, finalCost } = req.body;
    
    const repair = await Repair.findByPk(id);
    if (!repair) return res.status(404).json({ error: "Repair not found" });
    
    if (status) repair.status = status;
    if (technicianNotes) repair.technicianNotes = technicianNotes;
    if (estimatedCost) repair.estimatedCost = estimatedCost;
    if (finalCost) repair.finalCost = finalCost;
    
    if (status === 'completed') {
      repair.completedAt = new Date();
    }
    
    await repair.save();
    
    res.status(200).json({ data: repair, message: "Repair updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update repair" });
  }
};

// Get technician's assigned jobs (or all for admin)
const getTechnicianJobs = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const userRole = req.user.user.role;
    
    let repairs;
    
    // Admin can see all repairs
    if (userRole === 'admin') {
      repairs = await Repair.findAll({
        include: [
          { 
            model: Appointment,
            include: [{ model: User, attributes: ['id', 'username', 'email', 'phone'] }]
          },
          {
            model: Technician,
            include: [{ model: User, attributes: ['id', 'username'] }]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
    } else {
      // Find technician record for this user
      const technician = await Technician.findOne({ where: { userId } });
      if (!technician) {
        return res.status(404).json({ error: "Technician record not found. Please contact admin to set up your technician profile." });
      }
      
      repairs = await Repair.findAll({
        where: { technicianId: technician.id },
        include: [
          { 
            model: Appointment,
            include: [{ model: User, attributes: ['id', 'username', 'email', 'phone'] }]
          }
        ],
        order: [['createdAt', 'DESC']]
      });
    }
    
    res.status(200).json({ data: repairs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

// Update appointment status (Admin)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const appointment = await Appointment.findByPk(id);
    if (!appointment) return res.status(404).json({ error: "Appointment not found" });
    
    if (!['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    appointment.status = status;
    await appointment.save();
    
    res.status(200).json({ data: appointment, message: "Appointment status updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update appointment status" });
  }
};

export { 
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
};
