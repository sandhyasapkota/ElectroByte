import { Product } from "../../Model/index.js";

const createProduct = async (req, res) => {
  try {
    const body = req.body;
    console.log(body);
    if (body.name == null || body.price == null || body.category_id == null || body.brand_id == null) {
      return res.status(400).json({ error: "All fields are required" });
    }
    const newProduct = await Product.create(body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: "Failed to create product" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve products" });
  }
};
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByPk(id);
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
    } catch (error) {
    res.status(500).json({ error: "Failed to retrieve product" });
    }
};

const updateProduct = async (req, res) => {
    try {
    const { id } = req.params;
    const {
        name,
        description,
        price,
        stock_quantity,
        warranty_months,
        category_id,
        brand_id,
        image_url,
        status,
    } = req.body;
    const [updated] = await Product.update(
        {
        name,
        description,
        price,
        stock_quantity,
        warranty_months,
        category_id,
        brand_id,
        image_url,
        status,
        },
        { where: { id } }
    );
    if (updated) {
        const updatedProduct = await Product.findByPk(id);
        res.status(200).json(updatedProduct);
    } else {
        res.status(404).json({ error: "Product not found" });
    }
    } catch (error) {
    res.status(500).json({ error: "Failed to update product" });
    }
};

const deleteProduct = async (req, res) => {
    try {
    const { id } = req.params;
    const deleted = await Product.destroy({ where: { id } });
    if (deleted) {
        res.status(204).send();
    } else {
        res.status(404).json({ error: "Product not found" });
    }
    } catch (error) {
    res.status(500).json({ error: "Failed to delete product" });
    }
};

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};