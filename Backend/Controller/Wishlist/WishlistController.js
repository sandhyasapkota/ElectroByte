import { Wishlist } from "../../Model/Wishlist/WishlistModel.js";
import { Product } from "../../Model/Product/productModel.js";
import { ProductImage } from "../../Model/Product/ProductImageModel.js";
import { Category } from "../../Model/Category/CategoryModel.js";
import { Brand } from "../../Model/Brand/BrandModel.js";

// Get user's wishlist
const getWishlist = async (req, res) => {
  try {
    const userId = req.user.user.id;
    
    const wishlistItems = await Wishlist.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          include: [
            { model: ProductImage, as: 'images' },
            { model: Category },
            { model: Brand }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({ data: wishlistItems });
  } catch (error) {
    console.error("Get wishlist error:", error);
    res.status(500).json({ error: "Failed to get wishlist" });
  }
};

// Add to wishlist
const addToWishlist = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }
    
    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // Check if already in wishlist
    const existing = await Wishlist.findOne({
      where: { userId, productId }
    });
    
    if (existing) {
      return res.status(400).json({ error: "Product already in wishlist" });
    }
    
    const wishlistItem = await Wishlist.create({
      userId,
      productId
    });
    
    res.status(201).json({ 
      message: "Added to wishlist",
      data: wishlistItem 
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    res.status(500).json({ error: "Failed to add to wishlist" });
  }
};

// Remove from wishlist
const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { productId } = req.params;
    
    const wishlistItem = await Wishlist.findOne({
      where: { userId, productId }
    });
    
    if (!wishlistItem) {
      return res.status(404).json({ error: "Item not found in wishlist" });
    }
    
    await wishlistItem.destroy();
    
    res.status(200).json({ message: "Removed from wishlist" });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    res.status(500).json({ error: "Failed to remove from wishlist" });
  }
};

// Toggle wishlist (add if not exists, remove if exists)
const toggleWishlist = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { productId } = req.body;
    
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }
    
    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    // Check if already in wishlist
    const existing = await Wishlist.findOne({
      where: { userId, productId }
    });
    
    if (existing) {
      await existing.destroy();
      res.status(200).json({ 
        message: "Removed from wishlist",
        isInWishlist: false 
      });
    } else {
      await Wishlist.create({ userId, productId });
      res.status(200).json({ 
        message: "Added to wishlist",
        isInWishlist: true 
      });
    }
  } catch (error) {
    console.error("Toggle wishlist error:", error);
    res.status(500).json({ error: "Failed to update wishlist" });
  }
};

// Check if product is in wishlist
const checkWishlist = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { productId } = req.params;
    
    const existing = await Wishlist.findOne({
      where: { userId, productId }
    });
    
    res.status(200).json({ isInWishlist: !!existing });
  } catch (error) {
    console.error("Check wishlist error:", error);
    res.status(500).json({ error: "Failed to check wishlist" });
  }
};

export {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  toggleWishlist,
  checkWishlist
};
