import { Cart, Product, ProductImage } from "../../Model/index.js";

// Get user's cart
const getCart = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [{ 
        model: Product,
        include: [{ model: ProductImage, as: 'images' }]
      }]
    });
    
    const subtotal = cartItems.reduce((sum, item) => {
      return sum + (parseFloat(item.Product.price) * item.quantity);
    }, 0);
    
    res.status(200).json({ 
      data: { items: cartItems, subtotal },
      message: "Cart fetched successfully" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch cart" });
  }
};

// Add to cart
const addToCart = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { productId, quantity = 1 } = req.body;
    
    if (!productId) return res.status(400).json({ error: "Product ID is required" });
    
    // Check if product exists
    const product = await Product.findByPk(productId);
    if (!product) return res.status(404).json({ error: "Product not found" });
    
    // Check stock availability
    if (product.stock_quantity < quantity) {
      return res.status(400).json({ 
        error: `Only ${product.stock_quantity} items available in stock` 
      });
    }
    
    // Check if already in cart
    const existingItem = await Cart.findOne({ where: { userId, productId } });
    
    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;
      
      // Check if total quantity exceeds stock
      if (newQuantity > product.stock_quantity) {
        return res.status(400).json({ 
          error: `Cannot add more. Only ${product.stock_quantity} items available (${existingItem.quantity} already in cart)` 
        });
      }
      
      existingItem.quantity = newQuantity;
      await existingItem.save();
      return res.status(200).json({ data: existingItem, message: "Cart updated" });
    }
    
    const cartItem = await Cart.create({ userId, productId, quantity });
    res.status(201).json({ data: cartItem, message: "Added to cart" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add to cart" });
  }
};

// Update cart quantity
const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { id } = req.params;
    const { quantity } = req.body;
    
    if (quantity < 1) return res.status(400).json({ error: "Quantity must be at least 1" });
    
    const cartItem = await Cart.findOne({ where: { id, userId } });
    if (!cartItem) return res.status(404).json({ error: "Cart item not found" });
    
    cartItem.quantity = quantity;
    await cartItem.save();
    
    res.status(200).json({ data: cartItem, message: "Cart updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update cart" });
  }
};

// Remove from cart
const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { id } = req.params;
    
    const cartItem = await Cart.findOne({ where: { id, userId } });
    if (!cartItem) return res.status(404).json({ error: "Cart item not found" });
    
    await cartItem.destroy();
    res.status(200).json({ message: "Item removed from cart" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove from cart" });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.user.id;
    await Cart.destroy({ where: { userId } });
    res.status(200).json({ message: "Cart cleared" });
  } catch (error) {
    res.status(500).json({ error: "Failed to clear cart" });
  }
};

export { getCart, addToCart, updateCartItem, removeFromCart, clearCart };
