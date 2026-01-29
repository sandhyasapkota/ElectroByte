import { Product, ProductImage, Category, Brand } from "../../Model/index.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create product uploads directory if it doesn't exist
const productUploadsDir = path.join(__dirname, '../../uploads/products');
if (!fs.existsSync(productUploadsDir)) {
  fs.mkdirSync(productUploadsDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, productUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Multer upload middleware for multiple images
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter
});

const uploadProductImages = upload.array('images', 10); // Max 10 images

const pickProductFields = (body) => {
  const fields = [
    'name',
    'description',
    'price',
    'stock_quantity',
    'warranty_months',
    'category_id',
    'brand_id',
    'image_url',
    'status'
  ];

  return fields.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(body, key) && body[key] !== undefined) {
      acc[key] = body[key];
    }
    return acc;
  }, {});
};

const isValidProductName = (name) =>
  typeof name === 'string' && name.trim().length >= 3 && name.length <= 200;
const isValidDescription = (description) =>
  !description || (typeof description === 'string' && description.trim().length >= 20 && description.length <= 5000);
const isValidStatus = (status) => !status || ['active', 'inactive', 'discontinued'].includes(status);

const createProduct = async (req, res) => {
  try {
    const body = req.body;
    console.log(body);
    if (body.name == null || body.price == null || body.category_id == null || body.brand_id == null) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!isValidProductName(body.name)) {
      return res.status(400).json({ error: "Product name must be 3-200 characters" });
    }
    if (!isValidDescription(body.description)) {
      return res.status(400).json({ error: "Description must be 20-5000 characters" });
    }
    if (!isValidStatus(body.status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    const productData = pickProductFields(body);
    const newProduct = await Product.create(productData);
    
    // If files were uploaded, create ProductImage records
    if (req.files && req.files.length > 0) {
      const imageRecords = req.files.map((file, index) => ({
        productId: newProduct.id,
        imageUrl: `/uploads/products/${file.filename}`,
        isPrimary: index === 0, // First image is primary
        displayOrder: index
      }));
      
      await ProductImage.bulkCreate(imageRecords);
      
      // Set the first image as the main image_url
      await newProduct.update({ image_url: imageRecords[0].imageUrl });
    }
    
    // Fetch the product with images
    const productWithImages = await Product.findByPk(newProduct.id, {
      include: [{ model: ProductImage, as: 'images' }]
    });
    
    res.status(201).json(productWithImages);
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: "Failed to create product" });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const { search, category, brand, minPrice, maxPrice } = req.query;
    
    // Build where clause for search/filter
    const where = {};
    
    // Search by name or description
    if (search) {
      const { Op } = await import('sequelize');
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Filter by category
    if (category) {
      where.category_id = category;
    }
    
    // Filter by brand
    if (brand) {
      where.brand_id = brand;
    }
    
    // Filter by price range
    if (minPrice || maxPrice) {
      const { Op } = await import('sequelize');
      where.price = {};
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice);
    }
    
    const products = await Product.findAll({
      where,
      include: [
        { model: Category },
        { model: Brand },
        { model: ProductImage, as: 'images', order: [['displayOrder', 'ASC']] }
      ]
    });
    res.status(200).json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: "Failed to retrieve products" });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = Number(id);
    if (!Number.isInteger(parsedId) || parsedId <= 0) {
      return res.status(400).json({ error: "Invalid product id" });
    }
    const product = await Product.findByPk(id, {
      include: [
        { model: Category },
        { model: Brand },
        { model: ProductImage, as: 'images', order: [['displayOrder', 'ASC']] }
      ]
    });
    if (product) {
      res.status(200).json(product);
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: "Failed to retrieve product" });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // Update product fields
    const updateData = pickProductFields(req.body);

    if (updateData.name && !isValidProductName(updateData.name)) {
      return res.status(400).json({ error: "Product name must be 3-200 characters" });
    }
    if (!isValidDescription(updateData.description)) {
      return res.status(400).json({ error: "Description must be 20-5000 characters" });
    }
    if (!isValidStatus(updateData.status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    await product.update(updateData);
    
    // If new files were uploaded, add them
    if (req.files && req.files.length > 0) {
      // Get current max display order
      const existingImages = await ProductImage.findAll({
        where: { productId: id },
        order: [['displayOrder', 'DESC']],
        limit: 1
      });
      
      let startOrder = existingImages.length > 0 ? existingImages[0].displayOrder + 1 : 0;
      
      const imageRecords = req.files.map((file, index) => ({
        productId: id,
        imageUrl: `/uploads/products/${file.filename}`,
        isPrimary: false,
        displayOrder: startOrder + index
      }));
      
      await ProductImage.bulkCreate(imageRecords);
    }
    
    // Fetch updated product with images
    const updatedProduct = await Product.findByPk(id, {
      include: [
        { model: Category },
        { model: Brand },
        { model: ProductImage, as: 'images', order: [['displayOrder', 'ASC']] }
      ]
    });
    
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: "Failed to update product" });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get product images to delete files
    const images = await ProductImage.findAll({ where: { productId: id } });
    
    // Delete image files
    for (const image of images) {
      const filePath = path.join(__dirname, '../..', image.imageUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    
    // Delete image records
    await ProductImage.destroy({ where: { productId: id } });
    
    // Delete product
    const deleted = await Product.destroy({ where: { id } });
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Product not found" });
    }
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: "Failed to delete product" });
  }
};

// Upload images for existing product
const addProductImages = async (req, res) => {
  try {
    const { id } = req.params;
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No images uploaded" });
    }
    
    // Get current max display order
    const existingImages = await ProductImage.findAll({
      where: { productId: id },
      order: [['displayOrder', 'DESC']],
      limit: 1
    });
    
    let startOrder = existingImages.length > 0 ? existingImages[0].displayOrder + 1 : 0;
    const hasExisting = existingImages.length > 0;
    
    const imageRecords = req.files.map((file, index) => ({
      productId: id,
      imageUrl: `/uploads/products/${file.filename}`,
      isPrimary: !hasExisting && index === 0,
      displayOrder: startOrder + index
    }));
    
    const createdImages = await ProductImage.bulkCreate(imageRecords);
    
    // If no primary image exists, set the first new one as primary
    if (!hasExisting && createdImages.length > 0) {
      await product.update({ image_url: createdImages[0].imageUrl });
    }
    
    res.status(201).json(createdImages);
  } catch (error) {
    console.error('Add images error:', error);
    res.status(500).json({ error: "Failed to upload images" });
  }
};

// Delete a specific product image
const deleteProductImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    
    const image = await ProductImage.findOne({
      where: { id: imageId, productId: id }
    });
    
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }
    
    // Delete file
    const filePath = path.join(__dirname, '../..', image.imageUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    
    const wasPrimary = image.isPrimary;
    await image.destroy();
    
    // If deleted image was primary, set another as primary
    if (wasPrimary) {
      const nextImage = await ProductImage.findOne({
        where: { productId: id },
        order: [['displayOrder', 'ASC']]
      });
      
      if (nextImage) {
        await nextImage.update({ isPrimary: true });
        await Product.update(
          { image_url: nextImage.imageUrl },
          { where: { id } }
        );
      } else {
        await Product.update(
          { image_url: null },
          { where: { id } }
        );
      }
    }
    
    res.status(200).json({ message: "Image deleted successfully" });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: "Failed to delete image" });
  }
};

// Set primary image
const setPrimaryImage = async (req, res) => {
  try {
    const { id, imageId } = req.params;
    
    const image = await ProductImage.findOne({
      where: { id: imageId, productId: id }
    });
    
    if (!image) {
      return res.status(404).json({ error: "Image not found" });
    }
    
    // Remove primary from all other images
    await ProductImage.update(
      { isPrimary: false },
      { where: { productId: id } }
    );
    
    // Set this image as primary
    await image.update({ isPrimary: true });
    
    // Update product's main image_url
    await Product.update(
      { image_url: image.imageUrl },
      { where: { id } }
    );
    
    res.status(200).json({ message: "Primary image updated" });
  } catch (error) {
    console.error('Set primary error:', error);
    res.status(500).json({ error: "Failed to set primary image" });
  }
};

// Update product stock (Admin)
const updateProductStock = async (req, res) => {
  try {
    const { id } = req.params;
    const { stock_quantity, action } = req.body;
    
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    let newStock;
    
    if (action === 'add') {
      // Add to existing stock
      newStock = product.stock_quantity + parseInt(stock_quantity);
    } else if (action === 'set') {
      // Set absolute stock value
      newStock = parseInt(stock_quantity);
    } else {
      // Default: set absolute value
      newStock = parseInt(stock_quantity);
    }
    
    if (newStock < 0) {
      return res.status(400).json({ error: "Stock cannot be negative" });
    }
    
    await product.update({ stock_quantity: newStock });
    
    res.status(200).json({ 
      data: { 
        id: product.id,
        name: product.name,
        previous_stock: product.stock_quantity,
        new_stock: newStock 
      },
      message: `Stock updated successfully. New stock: ${newStock}` 
    });
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ error: "Failed to update stock" });
  }
};

export {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  uploadProductImages,
  addProductImages,
  deleteProductImage,
  setPrimaryImage,
  updateProductStock,
};
