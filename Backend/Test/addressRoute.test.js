import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";

jest.unstable_mockModule("../Controller/index.js", () => ({
  getAddresses: (req, res) => res.status(200).json({ ok: true }),
  addAddress: (req, res) => res.status(201).json({ ok: true }),
  updateAddress: (req, res) => res.status(200).json({ ok: true }),
  deleteAddress: (req, res) => res.status(200).json({ ok: true }),
}));

const { addressRoute } = await import("../Routes/Address/AddressRoute.js");

const app = express();
app.use(express.json());
app.use("/api/addresses", addressRoute);

describe("Address Routes", () => {
  it("should get addresses", async () => {
    const res = await request(app).get("/api/addresses");
    expect(res.statusCode).toBe(200);
  });

  it("should add address", async () => {
    const res = await request(app)
      .post("/api/addresses")
      .send({ fullName: "Test", phone: "1234567890", address: "123 St", city: "City" });
    expect(res.statusCode).toBe(201);
  });

  it("should update address", async () => {
    const res = await request(app)
      .put("/api/addresses/1")
      .send({ city: "New City" });
    expect(res.statusCode).toBe(200);
  });

  it("should delete address", async () => {
    const res = await request(app).delete("/api/addresses/1");
    expect(res.statusCode).toBe(200);
  });
});
