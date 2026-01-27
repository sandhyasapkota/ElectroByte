import { Order, OrderItem, Cart, Product, User, ProductImage } from "../../Model/index.js";
import { v4 as uuidv4 } from 'uuid';
import { sendOrderConfirmationEmail } from '../../services/emailService.js';

// Generate order ID
const generateOrderId = () => {
  return 'EB-' + Date.now().toString(36).toUpperCase() + uuidv4().substring(0, 4).toUpperCase();
};

// Create order (Checkout)
const createOrder = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { shippingAddress, contactPhone, notes } = req.body;
    
    if (!shippingAddress || !contactPhone) {
      return res.status(400).json({ error: "Shipping address and contact phone are required" });
    }

    if (typeof shippingAddress !== 'string' || shippingAddress.trim().length < 10 || shippingAddress.length > 500) {
      return res.status(400).json({ error: "Shipping address must be 10-500 characters" });
    }

    if (!/^[0-9]{10,15}$/.test(contactPhone)) {
      return res.status(400).json({ error: "Contact phone must be 10-15 digits" });
    }

    if (notes && notes.length > 500) {
      return res.status(400).json({ error: "Notes must be less than 500 characters" });
    }
    
    // Get cart items
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [{ 
        model: Product,
        include: [{ model: ProductImage, as: 'images' }]
      }]
    });
    
    if (cartItems.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }
    
    // Check stock availability for all items
    for (const item of cartItems) {
      if (item.Product.stock_quantity < item.quantity) {
        return res.status(400).json({ 
          error: `Insufficient stock for ${item.Product.name}. Only ${item.Product.stock_quantity} available.` 
        });
      }
    }
    
    // Calculate total
    let totalAmount = 0;
    for (const item of cartItems) {
      totalAmount += parseFloat(item.Product.price) * item.quantity;
    }
    
    // Create order
    const order = await Order.create({
      orderId: generateOrderId(),
      userId,
      totalAmount,
      shippingAddress,
      contactPhone,
      notes,
      status: 'pending'
    });
    
    // Create order items and decrease stock
    for (const item of cartItems) {
      await OrderItem.create({
        orderId: order.id,
        productId: item.productId,
        productName: item.Product.name,
        quantity: item.quantity,
        price: item.Product.price
      });
      
      // Decrease product stock
      await item.Product.update({
        stock_quantity: item.Product.stock_quantity - item.quantity
      });
    }
    
    // Clear cart
    await Cart.destroy({ where: { userId } });
    
    // Send order confirmation email
    try {
      const user = await User.findByPk(userId);
      if (user) {
        await sendOrderConfirmationEmail(user.email, user.username, {
          orderNumber: order.orderId,
          totalAmount: totalAmount,
          paymentMethod: 'Cash on Delivery',
          createdAt: order.createdAt
        });
        console.log(`Order confirmation email sent for order ${order.orderId}`);
      }
    } catch (emailError) {
      console.error('Failed to send order confirmation email:', emailError);
    }
    
    res.status(201).json({ 
      data: { order, orderId: order.orderId },
      message: "Order placed successfully" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create order" });
  }
};

// Get user's orders
const getMyOrders = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const orders = await Order.findAll({
      where: { userId },
      include: [{ 
        model: OrderItem,
        include: [{
          model: Product,
          include: [{ model: ProductImage, as: 'images' }]
        }]
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({ data: orders, message: "Orders fetched successfully" });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Get order by ID
const getOrderById = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { id } = req.params;
    
    const order = await Order.findOne({
      where: { id, userId },
      include: [{ model: OrderItem }]
    });
    
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    res.status(200).json({ data: order });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
};

// Cancel order (User - only if pending)
const cancelOrder = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { id } = req.params;
    
    const order = await Order.findOne({ 
      where: { id, userId },
      include: [{ model: OrderItem }]
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    if (order.status !== 'pending') {
      return res.status(400).json({ error: "Only pending orders can be cancelled" });
    }
    
    // Restore stock for each item
    for (const item of order.OrderItems) {
      const product = await Product.findByPk(item.productId);
      if (product) {
        await product.update({
          stock_quantity: product.stock_quantity + item.quantity
        });
      }
    }
    
    order.status = 'cancelled';
    await order.save();
    
    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to cancel order" });
  }
};

// Get all orders (Admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { 
          model: OrderItem,
          include: [{
            model: Product,
            include: [{ model: ProductImage, as: 'images' }]
          }]
        },
        { model: User, attributes: ['id', 'username', 'email'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({ data: orders, message: "Orders fetched successfully" });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
};

// Update order status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, estimatedDeliveryDate } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    
    const order = await Order.findByPk(id, {
      include: [{ model: OrderItem }]
    });
    if (!order) return res.status(404).json({ error: "Order not found" });
    
    const previousStatus = order.status;
    
    // If cancelling order, restore stock
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      for (const item of order.OrderItems) {
        const product = await Product.findByPk(item.productId);
        if (product) {
          await product.update({
            stock_quantity: product.stock_quantity + item.quantity
          });
        }
      }
    }
    
    if (status) order.status = status;
    if (estimatedDeliveryDate) {
      const parsed = new Date(estimatedDeliveryDate);
      if (Number.isNaN(parsed.getTime())) {
        return res.status(400).json({ error: "Invalid estimated delivery date" });
      }
      order.estimatedDeliveryDate = parsed;
    }
    await order.save();
    
    res.status(200).json({ data: order, message: "Order status updated" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update order status" });
  }
};

export { createOrder, getMyOrders, getOrderById, cancelOrder, getAllOrders, updateOrderStatus };
