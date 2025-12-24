import { Appointment, User } from "../../Model/index.js";

/* 🔹 Create Appointment */
const createAppointment = async (req, res) => {
  try {
    const { service, appointmentDate, appointmentTime, userId } = req.body;

    if (!service || !appointmentDate || !appointmentTime || !userId) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const appointment = await Appointment.create({
      service,
      appointmentDate,
      appointmentTime,
      userId,
    });

    res.status(201).json({
      data: appointment,
      message: "Appointment created successfully",
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to create appointment" });
  }
};

/* 🔹 Get Appointments by User */
const getAppointmentsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const appointments = await Appointment.findAll({
      where: { userId },
      include: {
        model: User,
        attributes: ["username", "email"],
      },
    });

    res.status(200).json({ data: appointments });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
};

/* 🔹 Cancel Appointment */
const cancelAppointment = async (req, res) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    await appointment.update({ status: "Cancelled" });

    res.status(200).json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
};

export {
  createAppointment,
  getAppointmentsByUser,
  cancelAppointment,
};
