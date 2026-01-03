import { User, Order, OrderItem, Appointment, Technician, Product, Category, Ticket } from "../../Model/index.js";
import bcrypt from 'bcryptjs';
import { Op, fn, col, literal } from 'sequelize';
import { sequelize } from '../../Database/db.js';

// Get dashboard stats with chart data
const getDashboardStats = async (req, res) => {
  try {
    // Basic counts
    const totalUsers = await User.count({ where: { role: 'user' } });
    const totalOrders = await Order.count();
    const totalAppointments = await Appointment.count();
    const totalProducts = await Product.count();
    const pendingOrders = await Order.count({ where: { status: 'pending' } });
    const pendingAppointments = await Appointment.count({ where: { status: 'pending' } });
    const openTickets = await Ticket.count({ where: { status: { [Op.ne]: 'closed' } } });
    
    // Total revenue
    const revenueResult = await Order.sum('totalAmount', { 
      where: { status: { [Op.notIn]: ['cancelled'] } } 
    });
    const totalRevenue = revenueResult || 0;
    
    // Recent orders
    const recentOrders = await Order.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['username', 'email'] }]
    });
    
    // Recent appointments
    const recentAppointments = await Appointment.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [{ model: User, attributes: ['username', 'email'] }]
    });
    
    // Monthly order stats for last 6 months (for line chart)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyOrders = await Order.findAll({
      attributes: [
        [fn('DATE_TRUNC', 'month', col('createdAt')), 'month'],
        [fn('COUNT', '*'), 'count'],
        [fn('SUM', col('totalAmount')), 'revenue']
      ],
      where: {
        createdAt: { [Op.gte]: sixMonthsAgo }
      },
      group: [fn('DATE_TRUNC', 'month', col('createdAt'))],
      order: [[fn('DATE_TRUNC', 'month', col('createdAt')), 'ASC']],
      raw: true
    });
    
    // Order status distribution (for bar chart)
    const ordersByStatus = await Order.findAll({
      attributes: [
        'status',
        [fn('COUNT', '*'), 'count']
      ],
      group: ['status'],
      raw: true
    });
    
    // Products by category (for bar chart)
    const productsByCategory = await Product.findAll({
      attributes: [
        [fn('COUNT', '*'), 'count']
      ],
      include: [{
        model: Category,
        attributes: ['name']
      }],
      group: ['Category.id', 'Category.name'],
      raw: true
    });
    
    // User registration trend (last 6 months)
    const userTrend = await User.findAll({
      attributes: [
        [fn('DATE_TRUNC', 'month', col('createdAt')), 'month'],
        [fn('COUNT', '*'), 'count']
      ],
      where: {
        createdAt: { [Op.gte]: sixMonthsAgo },
        role: 'user'
      },
      group: [fn('DATE_TRUNC', 'month', col('createdAt'))],
      order: [[fn('DATE_TRUNC', 'month', col('createdAt')), 'ASC']],
      raw: true
    });
    
    // Top selling products
    const topProducts = await OrderItem.findAll({
      attributes: [
        'productId',
        [fn('SUM', col('quantity')), 'totalSold']
      ],
      include: [{
        model: Product,
        attributes: ['name', 'price', 'image_url']
      }],
      group: ['productId', 'Product.id', 'Product.name', 'Product.price', 'Product.image_url'],
      order: [[fn('SUM', col('quantity')), 'DESC']],
      limit: 5,
      raw: true
    });
    
    res.status(200).json({
      data: {
        stats: {
          totalUsers,
          totalOrders,
          totalAppointments,
          totalProducts,
          pendingOrders,
          pendingAppointments,
          openTickets,
          totalRevenue
        },
        recentOrders,
        recentAppointments,
        charts: {
          monthlyOrders,
          ordersByStatus,
          productsByCategory,
          userTrend,
          topProducts
        }
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

// Get all users (Admin)
const adminGetAllUsers = async (req, res) => {
  try {
    const { search, role } = req.query;
    const where = {};
    
    if (role) where.role = role;
    if (search) {
      where[Op.or] = [
        { username: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    const users = await User.findAll({
      where,
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({ data: users });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

// Block/Unblock user
const toggleUserBlock = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    user.isBlocked = !user.isBlocked;
    await user.save();
    
    res.status(200).json({ 
      data: { isBlocked: user.isBlocked },
      message: user.isBlocked ? "User blocked" : "User unblocked" 
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

// Get all technicians
const getAllTechnicians = async (req, res) => {
  try {
    const technicians = await Technician.findAll({
      include: [{
        model: User,
        attributes: ['id', 'username', 'email', 'phone']
      }]
    });
    
    res.status(200).json({ data: technicians });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch technicians" });
  }
};

// Create technician
const createTechnician = async (req, res) => {
  try {
    const { username, email, password, phone, specialization, experience } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email and password are required" });
    }
    
    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }
    
    // Create user with technician role
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      phone,
      role: 'technician'
    });
    
    // Create technician record
    const technician = await Technician.create({
      userId: user.id,
      specialization,
      experience
    });
    
    res.status(201).json({ data: technician, message: "Technician created" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create technician" });
  }
};

// Update technician
const updateTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { specialization, experience, isActive } = req.body;
    
    const technician = await Technician.findByPk(id);
    if (!technician) return res.status(404).json({ error: "Technician not found" });
    
    if (specialization) technician.specialization = specialization;
    if (experience) technician.experience = experience;
    if (isActive !== undefined) technician.isActive = isActive;
    
    await technician.save();
    
    res.status(200).json({ data: technician, message: "Technician updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update technician" });
  }
};

// Deactivate technician
const deactivateTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    
    const technician = await Technician.findByPk(id);
    if (!technician) return res.status(404).json({ error: "Technician not found" });
    
    technician.isActive = false;
    await technician.save();
    
    res.status(200).json({ message: "Technician deactivated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to deactivate technician" });
  }
};

// Delete technician
const deleteTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    
    const technician = await Technician.findByPk(id);
    if (!technician) return res.status(404).json({ error: "Technician not found" });
    
    // Update user role back to user
    await User.update({ role: 'user' }, { where: { id: technician.userId } });
    
    await technician.destroy();
    
    res.status(200).json({ message: "Technician removed" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete technician" });
  }
};

// Update user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;
    
    if (!['user', 'admin', 'technician'].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }
    
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    const oldRole = user.role;
    
    // If promoting to technician, create technician record
    if (role === 'technician' && oldRole !== 'technician') {
      const existingTech = await Technician.findOne({ where: { userId: id } });
      if (!existingTech) {
        await Technician.create({
          userId: id,
          specialization: 'General',
          experience: 0
        });
      }
    }
    
    // If demoting from technician, deactivate technician record
    if (oldRole === 'technician' && role !== 'technician') {
      await Technician.update({ isActive: false }, { where: { userId: id } });
    }
    
    user.role = role;
    await user.save();
    
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.status(200).json({ 
      data: userResponse, 
      message: `User role updated to ${role}` 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update user role" });
  }
};

// Promote existing user to technician
const promoteToTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { specialization, experience } = req.body;
    
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    // Check if already a technician
    let technician = await Technician.findOne({ where: { userId: id } });
    
    if (technician) {
      // Reactivate if exists
      technician.isActive = true;
      if (specialization) technician.specialization = specialization;
      if (experience) technician.experience = experience;
      await technician.save();
    } else {
      // Create new technician record
      technician = await Technician.create({
        userId: id,
        specialization: specialization || 'General',
        experience: experience || 0
      });
    }
    
    // Update user role
    user.role = 'technician';
    await user.save();
    
    res.status(200).json({ 
      data: technician, 
      message: "User promoted to technician" 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to promote user" });
  }
};

// Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    const user = await User.findByPk(id);
    if (!user) return res.status(404).json({ error: "User not found" });
    
    if (user.role === 'admin') {
      return res.status(400).json({ error: "Cannot delete admin user" });
    }
    
    // Delete associated technician record if exists
    await Technician.destroy({ where: { userId: id } });
    
    await user.destroy();
    
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

export { 
  getDashboardStats, 
  adminGetAllUsers, 
  toggleUserBlock, 
  getAllTechnicians,
  createTechnician,
  updateTechnician,
  deactivateTechnician,
  deleteTechnician,
  updateUserRole,
  promoteToTechnician,
  deleteUser
};
