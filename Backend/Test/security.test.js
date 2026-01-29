import request from "supertest";

let app;

beforeAll(async () => {
  app = (await import("../app.js")).default;
});

describe("Security Tests", () => {
  // Product security
  it("should prevent SQL Injection on product creation", async () => {
    const res = await request(app)
      .post("/api/products")
      .send({ name: "' OR 1=1 -- ", price: 99.99, description: "Hacked" });
    expect([400, 401, 403]).toContain(res.statusCode);
  });

  it("should prevent XSS attacks on product creation", async () => {
    const res = await request(app)
      .post("/api/products")
      .send({
        name: "<script>alert('XSS')</script>",
        price: 99.99,
        description: "XSS Test",
      });
    expect([400, 401, 403]).toContain(res.statusCode);
  });

  it("should return 404 for unknown product route", async () => {
    const res = await request(app).get("/api/products/unknown");
    expect([404, 400, 401]).toContain(res.statusCode);
  });

  // Booking security
  it("should prevent SQL Injection on booking creation", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .send({
        appointmentDate: "2026-02-01",
        appointmentTime: "10:00 AM",
        deviceType: "' OR 1=1 -- ",
        issueDescription: "Hacked device issue description",
      });
    expect([400, 401, 403]).toContain(res.statusCode);
  });

  it("should prevent XSS attacks on booking creation", async () => {
    const res = await request(app)
      .post("/api/appointments")
      .send({
        appointmentDate: "2026-02-01",
        appointmentTime: "10:00 AM",
        deviceType: "Laptop",
        issueDescription: "<script>alert('XSS')</script>",
      });
    expect([400, 401, 403]).toContain(res.statusCode);
  });

  it("should return 404 for unknown booking route", async () => {
    const res = await request(app).get("/api/appointments/unknown");
    expect([404, 400, 401]).toContain(res.statusCode);
  });

  // User security
  it("should prevent SQL Injection on user registration", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({
        username: "Sandhya' OR 1=1 -- ",
        email: "sapkotasandhya160@gmail.com",
        phone: "1234567890",
        password: "testpass",
      });
    expect([400, 401, 403]).toContain(res.statusCode);
  });

  it("should prevent XSS attacks on user registration", async () => {
    const res = await request(app)
      .post("/api/register")
      .send({
        username: "<script>alert('XSS')</script>",
        email: "sapkotasandhya160@gmail.com",
        phone: "1234567890",
        password: "testpass",
      });
    expect([400, 401, 403]).toContain(res.statusCode);
  });

  it("should return 404 for unknown user route", async () => {
    const res = await request(app).get("/api/users/unknown");
    expect([404, 400, 401]).toContain(res.statusCode);
  });

  // Review security
  it("should prevent SQL Injection on review creation", async () => {
    const res = await request(app)
      .post("/api/feedback")
      .send({
        type: "product",
        referenceId: "' OR 1=1 -- ",
        rating: 5,
        comment: "Hacked",
      });
    expect([400, 401, 403]).toContain(res.statusCode);
  });

  it("should prevent XSS attacks on review creation", async () => {
    const res = await request(app)
      .post("/api/feedback")
      .send({
        type: "product",
        referenceId: 1,
        rating: 5,
        comment: "<script>alert('XSS')</script>",
      });
    expect([400, 401, 403]).toContain(res.statusCode);
  });

  it("should return 404 for unknown review route", async () => {
    const res = await request(app).get("/api/feedback/unknown");
    expect([404, 400, 401]).toContain(res.statusCode);
  });
});
