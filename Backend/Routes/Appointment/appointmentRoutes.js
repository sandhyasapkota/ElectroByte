import express from "express";
import {
  createAppointment,
  getAppointmentsByUser,
  cancelAppointment,
} from "../Controller/appointmentController.js";

const router = express.Router();

router.post("/", createAppointment);
router.get("/user/:userId", getAppointmentsByUser);
router.put("/cancel/:id", cancelAppointment);

export default router;
