import SequelizeMock from "sequelize-mock";

const bdMock = new SequelizeMock();

const AddressMock = bdMock.define("Address", {
  id: 1,
  userId: 1,
  label: "Home",
  fullName: "Prabin giri",
  phone: "1234567890",
  address: "123 Main St",
  city: "kathmandu",
  state: "kathmandu",
  zipCode: "12345",
  isDefault: true,
});

describe("Address Model", () => {
  it("should create an address instance", async () => {
    const address = await AddressMock.create({
      fullName: "Prabin giri",
    });

    expect(address).toBeDefined();
    expect(address.fullName).toBe("Prabin giri");
    expect(address.label).toBe("Home");
  });
});
