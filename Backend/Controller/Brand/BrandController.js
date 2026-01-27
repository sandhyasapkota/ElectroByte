import { Brand } from "../../Model/index.js";

// Get all brands
const getAllBrands = async (req, res) => {
  try {
    const brands = await Brand.findAll({ where: { isActive: true } });
    res.status(200).json({ data: brands, message: "Brands fetched successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch brands" });
  }
};

// Create brand (Admin)
const createBrand = async (req, res) => {
  try {
    const { name, logo } = req.body;
    if (!name) return res.status(400).json({ error: "Brand name is required" });
    
    const brand = await Brand.create({ name, logo });
    res.status(201).json({ data: brand, message: "Brand created successfully" });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: "Brand already exists" });
    }
    res.status(500).json({ error: "Failed to create brand" });
  }
};

// Update brand (Admin)
const updateBrand = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ error: "Brand not found" });
    
    await brand.update(req.body);
    res.status(200).json({ data: brand, message: "Brand updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update brand" });
  }
};

// Delete brand (Admin)
const deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findByPk(req.params.id);
    if (!brand) return res.status(404).json({ error: "Brand not found" });
    
    await brand.update({ isActive: false });
    res.status(200).json({ message: "Brand deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete brand" });
  }
};

export { getAllBrands, createBrand, updateBrand, deleteBrand };
