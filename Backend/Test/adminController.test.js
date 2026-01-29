import { jest } from "@jest/globals";

jest.unstable_mockModule("../Model/index.js", () => ({
  User: {
    count: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  Order: {
    count: jest.fn(),
    sum: jest.fn(),
    findAll: jest.fn()
  },
  Appointment: {
    count: jest.fn(),
    findAll: jest.fn()
  },
  Product: {
    count: jest.fn(),
    findAll: jest.fn()
  },
  Category: {
    findAll: jest.fn()
  },
  Ticket: {
    count: jest.fn()
  },
  OrderItem: {
    findAll: jest.fn()
  },
  Technician: {
    count: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn()
  }
}));

const { User, Order, Appointment, Product, Category, Ticket, OrderItem, Technician } = await import("../Model/index.js");
const controller = await import("../Controller/Admin/AdminController.js");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Admin Controller (ESM)", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getDashboardStats should return dashboard data", async () => {
    const req = {};
    const res = mockResponse();

    User.count.mockResolvedValue(10);
    Order.count.mockResolvedValue(5);
    Appointment.count.mockResolvedValue(2);
    Technician.count.mockResolvedValue(4);
    Product.count.mockResolvedValue(8);
    Ticket.count.mockResolvedValue(3);
    Order.sum.mockResolvedValue(5000);

    Order.findAll.mockResolvedValue([{ id: 1, toJSON: () => ({ id: 1 }) }]);
    Appointment.findAll.mockResolvedValue([{ id: 1, toJSON: () => ({ id: 1 }) }]);
    OrderItem.findAll.mockResolvedValue([{ productId: 1, totalSold: 10, Product: { name: "Test", price: 100, image_url: "" } }]);
    Category.findAll.mockResolvedValue([{ id: 1, name: "Test" }]);

    await controller.getDashboardStats(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test("adminGetAllUsers should return user list", async () => {
    const req = { query: {} };
    const res = mockResponse();

    User.findAll.mockResolvedValue([{ id: 1, username: "test" }]);

    await controller.adminGetAllUsers(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test("toggleUserBlock should block/unblock user", async () => {
    const req = { params: { id: 1 } };
    const res = mockResponse();

    const user = { id: 1, isBlocked: false, save: jest.fn().mockResolvedValue(true) };
    User.findByPk.mockResolvedValue(user);

    await controller.toggleUserBlock(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test("getAllTechnicians should return technicians", async () => {
    const req = {};
    const res = mockResponse();

    Technician.findAll.mockResolvedValue([{ id: 1 }]);

    await controller.getAllTechnicians(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test("createTechnician should create technician", async () => {
    const req = {
      body: {
        username: "tech",
        email: "tech@test.com",
        password: "123456",
        phone: "123456",
        specialization: "Mobile",
        experience: 2
      }
    };
    const res = mockResponse();

    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ id: 1 });
    Technician.create.mockResolvedValue({ id: 1 });

    await controller.createTechnician(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  test("updateTechnician should update technician", async () => {
    const req = { params: { id: 1 }, body: { specialization: "Laptop", experience: 5 } };
    const res = mockResponse();

    const tech = { id: 1, save: jest.fn().mockResolvedValue(true) };
    Technician.findByPk.mockResolvedValue(tech);

    await controller.updateTechnician(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("deleteTechnician should delete technician", async () => {
    const req = { params: { id: 1 } };
    const res = mockResponse();

    const tech = { id: 1, userId: 2, destroy: jest.fn().mockResolvedValue(true) };
    Technician.findByPk.mockResolvedValue(tech);

    await controller.deleteTechnician(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("updateUserRole should update role", async () => {
    const req = { params: { id: 1 }, body: { role: "technician" } };
    const res = mockResponse();

    const user = { id: 1, role: "user", save: jest.fn().mockResolvedValue(true), toJSON: () => ({ id: 1, role: "technician" }) };
    User.findByPk.mockResolvedValue(user);
    Technician.findOne.mockResolvedValue(null);
    Technician.create.mockResolvedValue({ id: 1 });

    await controller.updateUserRole(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("promoteToTechnician should promote user", async () => {
    const req = { params: { id: 1 }, body: { specialization: "General", experience: 0 } };
    const res = mockResponse();

    const user = { id: 1, role: "user", save: jest.fn().mockResolvedValue(true) };
    User.findByPk.mockResolvedValue(user);
    Technician.findOne.mockResolvedValue(null);
    Technician.create.mockResolvedValue({ id: 1 });

    await controller.promoteToTechnician(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

  test("deleteUser should delete user", async () => {
    const req = { params: { id: 1 } };
    const res = mockResponse();

    const user = { id: 1, role: "user", destroy: jest.fn().mockResolvedValue(true) };
    User.findByPk.mockResolvedValue(user);
    Technician.destroy.mockResolvedValue(true);

    await controller.deleteUser(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
  });

});
