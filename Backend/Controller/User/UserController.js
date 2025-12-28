import {User} from '../../Model/index.js';
import bcrypt from 'bcryptjs';

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json({data: users, message: "Users fetched successfully"});
    } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const createUser = async (req, res) => {
  try {
    const body = req.body;
    console.log("=== CREATE USER REQUEST ===");
    console.log("Request body:", body);
    
    if (!body.username || !body.email || !body.password) {
      return res.status(400).json({ error: "Username, Email, and Password are required" });
    }
    
    // Check if user already exists
    const existingUserByEmail = await User.findOne({ where: { email: body.email } });
    if (existingUserByEmail) {
      console.log("❌ Email already exists:", body.email);
      return res.status(400).json({ error: "Email already registered" });
    }
    
    const existingUserByUsername = await User.findOne({ where: { username: body.username } });
    if (existingUserByUsername) {
      console.log("❌ Username already exists:", body.username);
      return res.status(400).json({ error: "Username already taken" });
    }
    
    // Hash the password before saving
    console.log("🔐 Hashing password...");
    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(body.password, salt);
    
    console.log("💾 Creating user...");
    const newUser = await User.create({ 
      username: body.username, 
      email: body.email, 
      password: hashedPassword, 
      role: body.role || 'user' 
    });
    
    console.log("✅ User created successfully! ID:", newUser.id);
    
    // Don't send password back
    const userResponse = newUser.toJSON();
    delete userResponse.password;
    
    res.status(201).json({ data: userResponse, message: "User created successfully" });
  } catch (error) {
    console.error("❌ CREATE USER ERROR:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    
    // Handle specific Sequelize errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        error: "Username or email already exists" 
      });
    }
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        error: error.errors[0].message 
      });
    }
    
    res.status(500).json({ 
      error: "Failed to create user",
      details: error.message 
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ data: user, message: "User fetched successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

const updateUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const body = req.body;
    
    console.log("=== UPDATE USER REQUEST ===");
    console.log("User ID:", userId);
    console.log("Fields to update:", Object.keys(body));
    
    const user = await User.findByPk(userId);
    if (!user) {
      console.log("❌ User not found with ID:", userId);
      return res.status(404).json({ error: "User not found" });
    }
    
    // If password is being updated, validate current password first
    if (body.password) {
      console.log("🔐 Password change requested");
      
      // Check if currentPassword is provided
      if (!body.currentPassword) {
        console.log("❌ Current password not provided");
        return res.status(400).json({ error: "Current password is required to change password" });
      }
      
      // Verify current password using bcrypt
      const isCurrentPasswordValid = await bcrypt.compare(body.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        console.log("❌ Current password is incorrect");
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      
      console.log("✅ Current password verified, hashing new password...");
      const salt = await bcrypt.genSalt(10);
      body.password = await bcrypt.hash(body.password, salt);
      
      // Remove currentPassword from body so it doesn't get saved
      delete body.currentPassword;
    }
    
    console.log("📝 Updating user...");
    await user.update(body);
    
    console.log("✅ User updated successfully!");
    
    // Don't send password back to client
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.status(200).json({ data: userResponse, message: "User updated successfully" });
  } catch (error) {
    console.error("❌ UPDATE USER ERROR:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    
    res.status(500).json({ 
      error: "Failed to update user", 
      details: error.message,
      errorName: error.name
    });
  }
};

const deleteUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await user.destroy();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// Update current authenticated user's profile
const updateCurrentUser = async (req, res) => {
  try {
    const userId = req.user.user.id; // Get user ID from JWT token
    const body = req.body;
    
    console.log("=== UPDATE CURRENT USER REQUEST ===");
    console.log("User ID from token:", userId);
    console.log("Fields to update:", Object.keys(body));
    
    const user = await User.findByPk(userId);
    if (!user) {
      console.log("❌ User not found with ID:", userId);
      return res.status(404).json({ error: "User not found" });
    }
    
    // If password is being updated, validate current password first
    if (body.password) {
      console.log("🔐 Password change requested");
      
      // Check if currentPassword is provided
      if (!body.currentPassword) {
        console.log("❌ Current password not provided");
        return res.status(400).json({ error: "Current password is required to change password" });
      }
      
      // Verify current password using bcrypt
      const isCurrentPasswordValid = await bcrypt.compare(body.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        console.log("❌ Current password is incorrect");
        return res.status(401).json({ error: "Current password is incorrect" });
      }
      
      console.log("✅ Current password verified, hashing new password...");
      const salt = await bcrypt.genSalt(10);
      body.password = await bcrypt.hash(body.password, salt);
      
      // Remove currentPassword from body so it doesn't get saved
      delete body.currentPassword;
    }
    
    console.log("📝 Updating user...");
    await user.update(body);
    
    console.log("✅ User updated successfully!");
    
    // Don't send password back to client
    const userResponse = user.toJSON();
    delete userResponse.password;
    
    res.status(200).json({ data: userResponse, message: "Profile updated successfully" });
  } catch (error) {
    console.error("❌ UPDATE CURRENT USER ERROR:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    
    res.status(500).json({ 
      error: "Failed to update profile", 
      details: error.message,
      errorName: error.name
    });
  }
};

export { getAllUsers, createUser, getUserById, updateUserById, deleteUserById, updateCurrentUser };