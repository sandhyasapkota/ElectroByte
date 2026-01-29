import SequelizeMock from "sequelize-mock";

const bdMock = new SequelizeMock();

const AppointmentMock = bdMock.define("Appointment", {
  id: 1,
  userId: 1,
  date: "2024-07-01",
  time: "10:00",
  description: "General Checkup",
  status: "Scheduled",
  pickupRequired: false,
});

describe("Appointment Model", () => {
  it("should create an appointment instance", async () => {
    const appointment = await AppointmentMock.create({
      description: "General Checkup",
    });

    expect(appointment).toBeDefined();
    expect(appointment.description).toBe("General Checkup");
    expect(appointment.status).toBe("Scheduled");
  });
});
