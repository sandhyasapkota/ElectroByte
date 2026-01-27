import { Category } from "../../Model/index.js";

// Get all categories
const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ where: { isActive: true } });
    res.status(200).json({ data: categories, message: "Categories fetched successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

// Get category by ID
const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });
    res.status(200).json({ data: category });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch category" });
  }
};

// Create category (Admin)
const createCategory = async (req, res) => {
  try {
    const { name, description, image } = req.body;
    if (!name) return res.status(400).json({ error: "Category name is required" });
    
    const category = await Category.create({ name, description, image });
    res.status(201).json({ data: category, message: "Category created successfully" });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: "Category already exists" });
    }
    res.status(500).json({ error: "Failed to create category" });
  }
};

// Update category (Admin)
const updateCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });
    
    await category.update(req.body);
    res.status(200).json({ data: category, message: "Category updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update category" });
  }
};

// Delete category (Admin)
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findByPk(req.params.id);
    if (!category) return res.status(404).json({ error: "Category not found" });
    
    await category.update({ isActive: false });
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete category" });
  }
};

export { getAllCategories, getCategoryById, createCategory, updateCategory, deleteCategory };
