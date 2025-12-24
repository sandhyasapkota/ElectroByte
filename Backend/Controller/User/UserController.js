import {User} from '../../Model/index.js';

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
    console.log(body);
    if (!body.username || !body.email) {
      return res.status(400).json({ error: "Username and Email are required" });
    }
    const newUser = await User.create({ username: body.username, email: body.email, password: body.password, role: body.role });
    res.status(201).json({ data: newUser, message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
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
  // Implementation for updating a user
  try {
    const userId = req.params.id;
    const body = req.body;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    await user.update(body);
    res.status(200).json({ data: user, message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
};

const deleteUserById = async (req, res) => {
  // Implementation for deleting a user
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
export { getAllUsers, createUser, getUserById, updateUserById, deleteUserById };