import { jest } from "@jest/globals";

jest.unstable_mockModule("../Model/index.js", () => ({
  Address: {
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findOne: jest.fn(),
  },
}));

const { Address } = await import("../Model/index.js");
const controller = await import("../Controller/Address/AddressController.js");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("Address Controller (ESM)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("getAddresses should return addresses", async () => {
    const req = { user: { user: { id: 1 } } };
    const res = mockResponse();

    Address.findAll.mockResolvedValue([
      { id: 1, userId: 1, label: "Home" },
    ]);

    await controller.getAddresses(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: [{ id: 1, userId: 1, label: "Home" }],
      message: "Addresses fetched successfully",
    });
  });

  test("addAddress should create address successfully", async () => {
    const req = {
      user: { user: { id: 1 } },
      body: {
        label: "Home",
        fullName: "Prabin",
        phone: "1234567890",
        address: "123 Street",
        city: "Kathmandu",
        state: "Bagmati",
        zipCode: "44600",
        isDefault: true,
      },
    };
    const res = mockResponse();

    Address.update.mockResolvedValue([1]);
    Address.create.mockResolvedValue({
      id: 1,
      userId: 1,
      ...req.body,
    });

    await controller.addAddress(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      data: {
        id: 1,
        userId: 1,
        ...req.body,
      },
      message: "Address added successfully",
    });
  });

  test("addAddress should return 400 if required fields missing", async () => {
    const req = {
      user: { user: { id: 1 } },
      body: { fullName: null, phone: null, address: null, city: null },
    };
    const res = mockResponse();

    await controller.addAddress(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "Full name, phone, address and city are required",
    });
  });

  test("updateAddress should update address successfully", async () => {
    const req = {
      user: { user: { id: 1 } },
      params: { id: 1 },
      body: { city: "Lalitpur", isDefault: true },
    };
    const res = mockResponse();

    const fakeAddress = {
      id: 1,
      userId: 1,
      update: jest.fn(),
    };

    Address.findOne.mockResolvedValue(fakeAddress);
    Address.update.mockResolvedValue([1]);
    fakeAddress.update.mockResolvedValue(fakeAddress);

    await controller.updateAddress(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      data: fakeAddress,
      message: "Address updated successfully",
    });
  });

  test("updateAddress should return 404 if not found", async () => {
    const req = {
      user: { user: { id: 1 } },
      params: { id: 99 },
      body: { city: "Lalitpur" },
    };
    const res = mockResponse();

    Address.findOne.mockResolvedValue(null);

    await controller.updateAddress(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Address not found",
    });
  });

  test("deleteAddress should delete address successfully", async () => {
    const req = {
      user: { user: { id: 1 } },
      params: { id: 1 },
    };
    const res = mockResponse();

    const fakeAddress = {
      id: 1,
      userId: 1,
      destroy: jest.fn().mockResolvedValue(true),
    };

    Address.findOne.mockResolvedValue(fakeAddress);

    await controller.deleteAddress(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Address deleted successfully",
    });
  });

  test("deleteAddress should return 404 if not found", async () => {
    const req = {
      user: { user: { id: 1 } },
      params: { id: 99 },
    };
    const res = mockResponse();

    Address.findOne.mockResolvedValue(null);

    await controller.deleteAddress(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Address not found",
    });
  });
});
