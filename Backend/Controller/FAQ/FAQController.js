import { FAQ } from "../../Model/index.js";

// Get all FAQs (public)
const getAllFAQs = async (req, res) => {
  try {
    const { category } = req.query;
    const where = { isActive: true };
    if (category) where.category = category;
    
    const faqs = await FAQ.findAll({
      where,
      order: [['order', 'ASC']]
    });
    
    res.status(200).json({ data: faqs });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch FAQs" });
  }
};

// Create FAQ (Admin)
const createFAQ = async (req, res) => {
  try {
    const { question, answer, category, order } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ error: "Question and answer are required" });
    }
    
    const faq = await FAQ.create({ question, answer, category, order });
    res.status(201).json({ data: faq, message: "FAQ created" });
  } catch (error) {
    res.status(500).json({ error: "Failed to create FAQ" });
  }
};

// Update FAQ (Admin)
const updateFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    
    const faq = await FAQ.findByPk(id);
    if (!faq) return res.status(404).json({ error: "FAQ not found" });
    
    await faq.update(req.body);
    res.status(200).json({ data: faq, message: "FAQ updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update FAQ" });
  }
};

// Delete FAQ (Admin)
const deleteFAQ = async (req, res) => {
  try {
    const { id } = req.params;
    
    const faq = await FAQ.findByPk(id);
    if (!faq) return res.status(404).json({ error: "FAQ not found" });
    
    await faq.update({ isActive: false });
    res.status(200).json({ message: "FAQ deleted" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete FAQ" });
  }
};

export { getAllFAQs, createFAQ, updateFAQ, deleteFAQ };
