import SequelizeMock from "sequelize-mock";

const bdMock = new SequelizeMock();

const ProductMock = bdMock.define("Product", {
  id: 1,
  productName: "Test Product",
  productDescription: "This is a test product",
  productPrice: 99.99,
  productStock_details: 50,
  productWarranty_months: 12,
  productCategory_id: 2,
  productBrand_id: 3,
  productImage_url: "http://example.com/image.jpg",
  productStatus: "active",
});

describe("Product Model", () => {
  it("should create a product instance", async () => {
    const product = await ProductMock.create({
      productName: "Laptop",
    });

    expect(product).toBeDefined();
    expect(product.productName).toBe("Laptop");
    expect(product.productStatus).toBe("active");
  });
});
