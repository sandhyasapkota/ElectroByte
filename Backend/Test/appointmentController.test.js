import { jest } from "@jest/globals";

jest.unstable_mockModule("../Model/index.js", () => ({
  Appointment: {
    findAll: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    findOne: jest.fn(),
    findByPk: jest.fn(),
  },
  Repair: {
    create: jest.fn(),
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  },
  User: {
    findByPk: jest.fn(),
  },
  Technician: {
    findOne: jest.fn(),
  },
}));

const { Appointment, Repair, User, Technician } = await import("../Model/index.js");
const controller = await import("../Controller/Appointment/AppointmentController.js");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Appointment Controller (ESM)", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getSlotAvailability should return slot counts", async () => {
    const req = { query: { date: "2025-01-01" } };
    const res = mockResponse();

    Appointment.findAll.mockResolvedValue([
      { appointmentTime: "10:00" },
      { appointmentTime: "10:00" },
      { appointmentTime: "11:00" },
    ]);

    await controller.getSlotAvailability(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test("bookAppointment should create appointment successfully", async () => {
    const req = {
      user: { user: { id: 1 } },
      body: {
        appointmentDate: "2099-01-01",
        appointmentTime: "10:00 AM",
        deviceType: "Laptop",
        deviceBrand: "Dell",
        issueDescription: "Screen issue",
        pickupRequired: false,
        pickupAddress: "",
      },
    };
    const res = mockResponse();

    Appointment.count.mockResolvedValue(0);
    Appointment.create.mockResolvedValue({ id: 1, ...req.body });

    Repair.create.mockResolvedValue({
      repairToken: "RPR-ABC123",
      appointmentId: 1,
      userId: 1,
      status: "received",
    });

    User.findByPk.mockResolvedValue({
      id: 1,
      email: "test@example.com",
      username: "test",
    });

    await controller.bookAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  test("getMyAppointments should return list", async () => {
    const req = { user: { user: { id: 1 } } };
    const res = mockResponse();

    Appointment.findAll.mockResolvedValue([
      { id: 1, userId: 1, appointmentDate: "2025-01-01" },
    ]);

    await controller.getMyAppointments(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test("editAppointment should update appointment", async () => {
    const req = {
      user: { user: { id: 1 } },
      params: { id: 1 },
      body: { appointmentTime: "11:00" },
    };
    const res = mockResponse();

    const appointment = {
      id: 1,
      userId: 1,
      appointmentDate: "2099-01-01",
      status: "pending",
      update: jest.fn(),
    };

    Appointment.findOne.mockResolvedValue(appointment);
    appointment.update.mockResolvedValue(appointment);

    await controller.editAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test("cancelAppointment should cancel appointment", async () => {
    const req = {
      user: { user: { id: 1 } },
      params: { id: 1 },
    };
    const res = mockResponse();

    const appointment = {
      id: 1,
      userId: 1,
      status: "pending",
      save: jest.fn().mockResolvedValue(true),
    };

    Appointment.findOne.mockResolvedValue(appointment);

    await controller.cancelAppointment(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Appointment cancelled successfully",
    });
  });

  test("getRepairStatus should return repair by token", async () => {
    const req = { params: { token: "RPR-ABC123" } };
    const res = mockResponse();

    Repair.findOne.mockResolvedValue({ id: 1, repairToken: "RPR-ABC123" });

    await controller.getRepairStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test("getRepairHistory should return completed repairs", async () => {
    const req = { user: { user: { id: 1 } } };
    const res = mockResponse();

    Repair.findAll.mockResolvedValue([{ id: 1, status: "completed" }]);

    await controller.getRepairHistory(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test("getAllAppointments should return all appointments", async () => {
    const req = {};
    const res = mockResponse();

    Appointment.findAll.mockResolvedValue([{ id: 1 }]);

    await controller.getAllAppointments(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test("assignTechnician should assign technician", async () => {
    const req = { body: { repairId: 1, technicianId: 1 } };
    const res = mockResponse();

    const repair = {
      id: 1,
      technicianId: null,
      save: jest.fn(),
    };

    Repair.findByPk.mockResolvedValue(repair);

    await controller.assignTechnician(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test("updateRepairStatus should update repair", async () => {
    const req = {
      params: { id: 1 },
      body: { status: "completed", finalCost: 200 },
    };
    const res = mockResponse();

    const repair = {
      id: 1,
      status: "received",
      save: jest.fn(),
    };

    Repair.findByPk.mockResolvedValue(repair);

    await controller.updateRepairStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test("getTechnicianJobs should return jobs for technician", async () => {
    const req = { user: { user: { id: 1, role: "technician" } } };
    const res = mockResponse();

    Technician.findOne.mockResolvedValue({ id: 1 });

    Repair.findAll.mockResolvedValue([{ id: 1 }]);

    await controller.getTechnicianJobs(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test("updateAppointmentStatus should update appointment status", async () => {
    const req = {
      params: { id: 1 },
      body: { status: "confirmed" },
    };
    const res = mockResponse();

    const appointment = {
      id: 1,
      status: "pending",
      save: jest.fn(),
    };

    Appointment.findByPk.mockResolvedValue(appointment);

    await controller.updateAppointmentStatus(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

});
