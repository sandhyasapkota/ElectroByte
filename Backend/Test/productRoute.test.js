import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

jest.unstable_mockModule("../Middleware/token-middleware.js", () => ({
  authenticateToken: (req, res, next) => next(),
  requireAdmin: (req, res, next) => next(),
  requireRole: () => (req, res, next) => next(),
  requireTechnician: (req, res, next) => next(),
}));

jest.unstable_mockModule("../Controller/index.js", () => ({
  getAllProducts: (req, res) => res.status(200).json([{ id: 1, name: "Laptop" }]),
  getProductById: (req, res) => res.status(200).json({ id: 1, name: "Laptop" }),
  createProduct: (req, res) => res.status(201).json({ id: 1, name: "Laptop" }),
  updateProduct: (req, res) => res.status(200).json({ id: 1, name: "Laptop" }),
  deleteProduct: (req, res) => res.status(204).send(),
  uploadProductImages: (req, res, next) => next(),
  addProductImages: (req, res) => res.status(201).json([]),
  deleteProductImage: (req, res) => res.status(200).json({ message: "Image deleted successfully" }),
  setPrimaryImage: (req, res) => res.status(200).json({ message: "Primary image updated" }),
  updateProductStock: (req, res) => res.status(200).json({ message: "Stock updated successfully" })
}));

const { productRoute } = await import("../Routes/Product/productRoutes.js");

const app = express();
app.use(express.json());
app.use("/api/products", productRoute);

describe("Product Routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a new product", async () => {
    const res = await request(app)
      .post("/api/products")
      .send({
        name: "Laptop",
        price: 1000,
        category_id: 1,
        brand_id: 1,
        description: "A high performance laptop for testing purposes",
        status: "active"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.id).toBe(1);
  });

  it("should get all products", async () => {
    const res = await request(app).get("/api/products");

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0].id).toBe(1);
  });

  it("should get product by ID", async () => {
    const res = await request(app).get("/api/products/1");

    expect(res.statusCode).toBe(200);
    expect(res.body.id).toBe(1);
  });

  it("should update a product", async () => {
    const res = await request(app)
      .put("/api/products/1")
      .send({ name: "Updated Laptop" });

    expect(res.statusCode).toBe(200);
  });

  it("should delete a product", async () => {
    const res = await request(app).delete("/api/products/1");

    expect(res.statusCode).toBe(204);
  });
});
