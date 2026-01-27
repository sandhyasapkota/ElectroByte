import { User } from '../../Model/index.js';
import bcrypt from 'bcryptjs';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
const isValidUsername = (username) => {
  if (typeof username !== 'string') return false;
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 50) return false;
  return /^(?!\s*$)[a-zA-Z0-9_ ]+$/.test(username);
};
const isValidPhone = (phone) => !phone || /^[0-9]{10,15}$/.test(phone);
const isValidAddress = (address) => !address || (typeof address === 'string' && address.length <= 500);

const pickFields = (source, allowed) => {
  return allowed.reduce((acc, key) => {
    if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== undefined) {
      acc[key] = source[key];
    }
    return acc;
  }, {});
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken', 'passwordResetExpires'] }
    });
    res.status(200).json({ data: users, message: "Users fetched successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const createUser = async (req, res) => {
  try {
    const body = req.body;

    if (!body.username || !body.email || !body.password) {
      return res.status(400).json({ error: "Username, Email, and Password are required" });
    }

    if (!isValidUsername(body.username)) {
      return res.status(400).json({ error: "Username must be 3-50 characters and may include spaces" });
    }

    if (!isValidEmail(body.email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!isValidPhone(body.phone)) {
      return res.status(400).json({ error: "Phone number must be 10-15 digits" });
    }

    const existingUserByEmail = await User.findOne({ where: { email: body.email } });
    if (existingUserByEmail) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const existingUserByUsername = await User.findOne({ where: { username: body.username } });
    if (existingUserByUsername) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const salt = await bcrypt.genSalt(8);
    const hashedPassword = await bcrypt.hash(body.password, salt);

    const newUser = await User.create({
      username: body.username,
      email: body.email,
      password: hashedPassword,
      role: body.role || 'user'
    });

    const userResponse = newUser.toJSON();
    delete userResponse.password;

    res.status(201).json({ data: userResponse, message: "User created successfully" });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ error: "Username or email already exists" });
    }

    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ error: error.errors[0].message });
    }

    res.status(500).json({ error: "Failed to create user", details: error.message });
  }
};

const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken', 'passwordResetExpires'] }
    });
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

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updateData = pickFields(body, ['username', 'email', 'phone', 'address']);

    if (updateData.username && !isValidUsername(updateData.username)) {
      return res.status(400).json({ error: "Username must be 3-50 characters and may include spaces" });
    }

    if (updateData.email && !isValidEmail(updateData.email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!isValidPhone(updateData.phone)) {
      return res.status(400).json({ error: "Phone number must be 10-15 digits" });
    }

    if (!isValidAddress(updateData.address)) {
      return res.status(400).json({ error: "Address must be less than 500 characters" });
    }

    if (body.password) {
      if (!body.currentPassword) {
        return res.status(400).json({ error: "Current password is required to change password" });
      }

      const isCurrentPasswordValid = await bcrypt.compare(body.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(body.password, salt);
    }

    await user.update(updateData);

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(200).json({ data: userResponse, message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user", details: error.message, errorName: error.name });
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

const updateCurrentUser = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const body = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const updateData = pickFields(body, ['username', 'phone', 'address']);

    if (updateData.username && !isValidUsername(updateData.username)) {
      return res.status(400).json({ error: "Username must be 3-50 characters and may include spaces" });
    }

    if (!isValidPhone(updateData.phone)) {
      return res.status(400).json({ error: "Phone number must be 10-15 digits" });
    }

    if (!isValidAddress(updateData.address)) {
      return res.status(400).json({ error: "Address must be less than 500 characters" });
    }

    if (body.password) {
      if (!body.currentPassword) {
        return res.status(400).json({ error: "Current password is required to change password" });
      }

      const isCurrentPasswordValid = await bcrypt.compare(body.currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      const salt = await bcrypt.genSalt(10);
      updateData.password = await bcrypt.hash(body.password, salt);
    }

    await user.update(updateData);

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(200).json({ data: userResponse, message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile", details: error.message, errorName: error.name });
  }
};

export { getAllUsers, createUser, getUserById, updateUserById, deleteUserById, updateCurrentUser };
