import { Ticket, TicketReply, User } from "../../Model/index.js";
import { v4 as uuidv4 } from 'uuid';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
const isValidName = (name) => typeof name === 'string' && name.trim().length >= 2 && name.length <= 100;
const isValidSubject = (subject) => typeof subject === 'string' && subject.trim().length >= 5 && subject.length <= 200;
const isValidMessage = (message) => typeof message === 'string' && message.trim().length >= 1 && message.length <= 2000;
const isValidReplyMessage = (message) => typeof message === 'string' && message.trim().length >= 1 && message.length <= 2000;

// Generate ticket number
const generateTicketNumber = () => {
  return 'TKT-' + Date.now().toString(36).toUpperCase() + uuidv4().substring(0, 4).toUpperCase();
};

// Create support ticket
const createTicket = async (req, res) => {
  try {
    const userId = req.user?.user?.id || null;
    const { name, email, subject, message, type = 'support' } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "Name, email, subject and message are required" });
    }

    if (!isValidName(name)) {
      return res.status(400).json({ error: "Name must be 2-100 characters" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    if (!isValidSubject(subject)) {
      return res.status(400).json({ error: "Subject must be 5-200 characters" });
    }
    if (!isValidReplyMessage(message)) {
      return res.status(400).json({ error: "Message must be 1-2000 characters" });
    }
    
    const ticket = await Ticket.create({
      ticketNumber: generateTicketNumber(),
      userId,
      name,
      email,
      subject,
      message,
      type
    });
    
    res.status(201).json({ data: ticket, message: "Ticket created successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create ticket" });
  }
};

// Contact form (public)
const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: "All fields are required" });
    }

    if (!isValidName(name)) {
      return res.status(400).json({ error: "Name must be 2-100 characters" });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    if (!isValidSubject(subject)) {
      return res.status(400).json({ error: "Subject must be 5-200 characters" });
    }
    if (!isValidMessage(message)) {
      return res.status(400).json({ error: "Message must be 10-2000 characters" });
    }
    
    const ticket = await Ticket.create({
      ticketNumber: generateTicketNumber(),
      name,
      email,
      subject,
      message,
      type: 'contact'
    });
    
    res.status(201).json({ message: "Message sent successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to send message" });
  }
};

// Get my tickets with replies
const getMyTickets = async (req, res) => {
  try {
    const userId = req.user.user.id;
    
    const tickets = await Ticket.findAll({
      where: { userId },
      include: [{
        model: TicketReply,
        include: [{ model: User, attributes: ['id', 'username', 'role'] }]
      }],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({ data: tickets });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
};

// Get single ticket by ID (user or admin)
const getTicketById = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const userRole = req.user.user.role;
    const { id } = req.params;
    
    // Build where clause - admin can see any, user only their own
    const whereClause = userRole === 'admin' ? { id } : { id, userId };
    
    const ticket = await Ticket.findOne({
      where: whereClause,
      include: [{
        model: TicketReply,
        include: [{ model: User, attributes: ['id', 'username', 'role'] }]
      }]
    });
    
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    
    res.status(200).json({ data: ticket });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch ticket" });
  }
};

// Add reply to ticket (user or admin)
const addReply = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const userRole = req.user.user.role;
    const { id } = req.params;
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    if (!isValidMessage(message)) {
      return res.status(400).json({ error: "Message must be 10-2000 characters" });
    }
    
    // Check ticket exists and user has access
    const ticket = await Ticket.findByPk(id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    
    // User can only reply to their own tickets, admin can reply to any
    if (userRole !== 'admin' && ticket.userId !== userId) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    const reply = await TicketReply.create({
      ticketId: id,
      userId,
      message,
      isAdmin: userRole === 'admin'
    });
    
    // If admin replies, update ticket status to in_progress
    if (userRole === 'admin' && ticket.status === 'open') {
      ticket.status = 'in_progress';
      await ticket.save();
    }
    
    // Fetch reply with user info
    const replyWithUser = await TicketReply.findByPk(reply.id, {
      include: [{ model: User, attributes: ['id', 'username', 'role'] }]
    });
    
    res.status(201).json({ data: replyWithUser, message: "Reply added" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to add reply" });
  }
};

// Get all tickets (Admin)
const getAllTickets = async (req, res) => {
  try {
    const { type, status } = req.query;
    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    
    const tickets = await Ticket.findAll({
      where,
      include: [
        { model: User, attributes: ['id', 'username', 'email'] },
        { 
          model: TicketReply,
          include: [{ model: User, attributes: ['id', 'username', 'role'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({ data: tickets });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch tickets" });
  }
};

// Reply to ticket (Admin) - legacy, use addReply instead
const replyToTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminReply, status } = req.body;
    const userId = req.user.user.id;
    
    const ticket = await Ticket.findByPk(id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    
    // Add as chat reply
    if (adminReply) {
      if (!isValidReplyMessage(adminReply)) {
        return res.status(400).json({ error: "Reply must be 1-2000 characters" });
      }
      await TicketReply.create({
        ticketId: id,
        userId,
        message: adminReply,
        isAdmin: true
      });
    }
    
    ticket.adminReply = adminReply;
    ticket.repliedAt = new Date();
    if (status) ticket.status = status;
    
    await ticket.save();
    
    res.status(200).json({ data: ticket, message: "Reply sent" });
  } catch (error) {
    res.status(500).json({ error: "Failed to reply to ticket" });
  }
};

// Update ticket status (Admin)
const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const ticket = await Ticket.findByPk(id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found" });
    
    ticket.status = status;
    await ticket.save();
    
    res.status(200).json({ data: ticket, message: "Status updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update status" });
  }
};

export { 
  createTicket, 
  submitContactForm, 
  getMyTickets, 
  getTicketById,
  addReply,
  getAllTickets, 
  replyToTicket, 
  updateTicketStatus 
};
