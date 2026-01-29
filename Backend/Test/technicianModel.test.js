import SequelizeMock from "sequelize-mock";

const bdMock = new SequelizeMock();

const TechnicianMock = bdMock.define("Technician", {
  id: 1,
  userId: 1,
  specialization: "Laptop Repair",
  experience: 5,
  isActive: true,
});

describe("Technician Model", () => {
  it("should create a technician instance", async () => {
    const technician = await TechnicianMock.create({
      specialization: "Laptop Repair",
    });

    expect(technician).toBeDefined();
    expect(technician.specialization).toBe("Laptop Repair");
    expect(technician.experience).toBe(5);
  });
});
