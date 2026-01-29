import { jest } from "@jest/globals";

jest.unstable_mockModule("../Model/index.js", () => ({
  Product: {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    update: jest.fn(),
    destroy: jest.fn(),
  },
  ProductImage: {
    bulkCreate: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    destroy: jest.fn(),
    update: jest.fn(),
  },
  Category: {},
  Brand: {},
}));

const { Product, ProductImage } = await import("../Model/index.js");
const controller = await import("../Controller/Product/productController.js");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

describe("Product Controller (ESM)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("createProduct should create product successfully", async () => {
    const req = {
      body: {
        name: "Test",
        price: 100,
        category_id: 1,
        brand_id: 1,
      },
      files: [],
    };

    const res = mockResponse();

    Product.create.mockResolvedValue({
      id: 1,
      ...req.body,
    });

    Product.findByPk.mockResolvedValue({
      id: 1,
      ...req.body,
      images: [],
    });

    await controller.createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalled();
  });

  test("createProduct should return 400 if missing fields", async () => {
    const req = { body: { name: null } };
    const res = mockResponse();

    await controller.createProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: "All fields are required",
    });
  });

  test("getAllProducts should return products", async () => {
    const req = { query: {} };
    const res = mockResponse();

    Product.findAll.mockResolvedValue([{ id: 1, name: "Test", price: 100 }]);

    await controller.getAllProducts(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test("getProductById should return product", async () => {
    const req = { params: { id: 1 } };
    const res = mockResponse();

    Product.findByPk.mockResolvedValue({ id: 1, name: "Test" });

    await controller.getProductById(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalled();
  });

  test("getProductById should return 404 when not found", async () => {
    const req = { params: { id: 2 } };
    const res = mockResponse();

    Product.findByPk.mockResolvedValue(null);

    await controller.getProductById(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Product not found",
    });
  });

  test("deleteProduct should delete product", async () => {
    const req = { params: { id: 1 } };
    const res = mockResponse();

    ProductImage.findAll.mockResolvedValue([]);
    ProductImage.destroy.mockResolvedValue(1);
    Product.destroy.mockResolvedValue(1);

    await controller.deleteProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(204);
  });

  test("deleteProduct should return 404 if not found", async () => {
    const req = { params: { id: 5 } };
    const res = mockResponse();

    ProductImage.findAll.mockResolvedValue([]);
    ProductImage.destroy.mockResolvedValue(0);
    Product.destroy.mockResolvedValue(0);

    await controller.deleteProduct(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "Product not found",
    });
  });
});
