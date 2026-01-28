import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

jest.unstable_mockModule("../Middleware/token-middleware.js", () => ({
  authenticateToken: (req, res, next) => next(),
  requireAdmin: (req, res, next) => next(),
}));

jest.unstable_mockModule("../Controller/index.js", () => ({
  getDashboardStats: (req, res) => res.status(200).json({ ok: true }),
  adminGetAllUsers: (req, res) => res.status(200).json({ ok: true }),
  toggleUserBlock: (req, res) => res.status(200).json({ ok: true }),
  updateUserRole: (req, res) => res.status(200).json({ ok: true }),
  promoteToTechnician: (req, res) => res.status(200).json({ ok: true }),
  deleteUser: (req, res) => res.status(200).json({ ok: true }),
  getAllTechnicians: (req, res) => res.status(200).json({ ok: true }),
  createTechnician: (req, res) => res.status(201).json({ ok: true }),
  updateTechnician: (req, res) => res.status(200).json({ ok: true }),
  deactivateTechnician: (req, res) => res.status(200).json({ ok: true }),
  deleteTechnician: (req, res) => res.status(200).json({ ok: true }),
}));

const { adminRoute } = await import("../Routes/Admin/AdminRoute.js");

const app = express();
app.use(express.json());
app.use("/api/admin", adminRoute);

describe("Admin Routes", () => {
  it("should get dashboard stats", async () => {
    const res = await request(app).get("/api/admin/dashboard");
    expect(res.statusCode).toBe(200);
  });

  it("should get users", async () => {
    const res = await request(app).get("/api/admin/users");
    expect(res.statusCode).toBe(200);
  });

  it("should toggle user block", async () => {
    const res = await request(app).put("/api/admin/users/1/toggle-block");
    expect(res.statusCode).toBe(200);
  });

  it("should update user role", async () => {
    const res = await request(app)
      .put("/api/admin/users/1/role")
      .send({ role: "user" });
    expect(res.statusCode).toBe(200);
  });

  it("should promote user to technician", async () => {
    const res = await request(app)
      .post("/api/admin/users/1/promote-technician")
      .send({ specialization: "General", experience: 0 });
    expect(res.statusCode).toBe(200);
  });

  it("should delete user", async () => {
    const res = await request(app).delete("/api/admin/users/1");
    expect(res.statusCode).toBe(200);
  });

  it("should get technicians", async () => {
    const res = await request(app).get("/api/admin/technicians");
    expect(res.statusCode).toBe(200);
  });

  it("should create technician", async () => {
    const res = await request(app)
      .post("/api/admin/technicians")
      .send({ username: "tech", email: "t@e.com", password: "123" });
    expect(res.statusCode).toBe(201);
  });

  it("should update technician", async () => {
    const res = await request(app)
      .put("/api/admin/technicians/1")
      .send({ specialization: "Laptop" });
    expect(res.statusCode).toBe(200);
  });

  it("should delete technician", async () => {
    const res = await request(app).delete("/api/admin/technicians/1");
    expect(res.statusCode).toBe(200);
  });
});
