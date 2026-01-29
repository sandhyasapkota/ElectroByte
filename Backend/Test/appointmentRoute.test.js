import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

jest.unstable_mockModule("../Middleware/token-middleware.js", () => ({
  authenticateToken: (req, res, next) => next(),
  requireAdmin: (req, res, next) => next(),
  requireTechnician: (req, res, next) => next(),
}));

jest.unstable_mockModule("../Controller/index.js", () => ({
  getSlotAvailability: (req, res) => res.status(200).json({ ok: true }),
  bookAppointment: (req, res) => res.status(201).json({ ok: true }),
  getMyAppointments: (req, res) => res.status(200).json({ ok: true }),
  editAppointment: (req, res) => res.status(200).json({ ok: true }),
  cancelAppointment: (req, res) => res.status(200).json({ ok: true }),
  getRepairStatus: (req, res) => res.status(200).json({ ok: true }),
  getRepairHistory: (req, res) => res.status(200).json({ ok: true }),
  getAllAppointments: (req, res) => res.status(200).json({ ok: true }),
  assignTechnician: (req, res) => res.status(200).json({ ok: true }),
  updateAppointmentStatus: (req, res) => res.status(200).json({ ok: true }),
  updateRepairStatus: (req, res) => res.status(200).json({ ok: true }),
  getTechnicianJobs: (req, res) => res.status(200).json({ ok: true }),
}));

const { appointmentRoute } = await import("../Routes/Appointment/AppointmentRoute.js");

const app = express();
app.use(express.json());
app.use("/api/appointments", appointmentRoute);

describe("Appointment Routes", () => {
  it("should get slot availability", async () => {
    const res = await request(app).get("/api/appointments/slot-availability?date=2099-01-01");
    expect(res.statusCode).toBe(200);
  });

  it("should book appointment", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .send({ appointmentDate: "2099-01-01", appointmentTime: "10:00 AM" });
    expect(res.statusCode).toBe(201);
  });

  it("should get my appointments", async () => {
    const res = await request(app).get("/api/appointments/my-appointments");
    expect(res.statusCode).toBe(200);
  });

  it("should edit appointment", async () => {
    const res = await request(app)
      .put("/api/appointments/1")
      .send({ appointmentTime: "11:00 AM" });
    expect(res.statusCode).toBe(200);
  });

  it("should cancel appointment", async () => {
    const res = await request(app).put("/api/appointments/1/cancel");
    expect(res.statusCode).toBe(200);
  });

  it("should get repair status", async () => {
    const res = await request(app).get("/api/appointments/repair/RPR-ABC123");
    expect(res.statusCode).toBe(200);
  });

  it("should get repair history", async () => {
    const res = await request(app).get("/api/appointments/repair-history");
    expect(res.statusCode).toBe(200);
  });

  it("should get all appointments (admin)", async () => {
    const res = await request(app).get("/api/appointments");
    expect(res.statusCode).toBe(200);
  });

  it("should assign technician (admin)", async () => {
    const res = await request(app)
      .post("/api/appointments/assign-technician")
      .send({ repairId: 1, technicianId: 1 });
    expect(res.statusCode).toBe(200);
  });

  it("should update appointment status (admin)", async () => {
    const res = await request(app)
      .put("/api/appointments/1/status")
      .send({ status: "confirmed" });
    expect(res.statusCode).toBe(200);
  });

  it("should update repair status (technician)", async () => {
    const res = await request(app)
      .put("/api/appointments/repair/1/status")
      .send({ status: "completed" });
    expect(res.statusCode).toBe(200);
  });

  it("should get technician jobs", async () => {
    const res = await request(app).get("/api/appointments/technician/jobs");
    expect(res.statusCode).toBe(200);
  });
});
