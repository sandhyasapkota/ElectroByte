import { User } from "../../Model/index.js";
import { generateToken } from "../../Routes/index.js";
import bcrypt from 'bcryptjs';

const login = async (req, res) => {
  try {
    console.log("=== LOGIN ATTEMPT ===");
    console.log("Request body:", req.body);
    console.log("Email from request:", `"${req.body.email}"`);
    console.log("Password from request:", `"${req.body.password}"`);
    
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    
    const user = await User.findOne({ where: { email: req.body.email } });
    console.log("User found:", user ? "YES" : "NO");
    
    if (!user) {
      console.log("❌ No user found with email:", req.body.email);
      return res.status(401).json({ message: "User not found." });
    }
    
    console.log("✅ User ID:", user.id);
    console.log("✅ User email from DB:", user.email);
    console.log("✅ User username:", user.username);
    
    // Check if user has a password
    if (!user.password) {
      console.error("❌ User has no password stored!");
      return res.status(500).json({ message: "Account configuration error" });
    }
    
    console.log("Stored password length:", user.password.length);
    console.log("Stored password preview:", user.password.substring(0, 20) + "...");
    console.log("Input password:", `"${req.body.password}"`);
    
    // Check if password is hashed (starts with $2a$ or $2b$ = bcrypt hash)
    const isPasswordHashed = user.password.startsWith('$2a$') || user.password.startsWith('$2b$');
    let passwordMatch = false;
    
    if (isPasswordHashed) {
      console.log("🔐 Password is hashed, using bcrypt comparison...");
      passwordMatch = await bcrypt.compare(req.body.password, user.password);
    } else {
      console.log("⚠️ Password is plain text (old format), using direct comparison...");
      passwordMatch = user.password === req.body.password;
    }
    
    console.log("Passwords match:", passwordMatch);
    
    if (passwordMatch) {
      const token = generateToken({ user: user.toJSON() });
      console.log("🎉 LOGIN SUCCESS!");
      return res.status(200).send({
        data: { access_token: token },
        message: "successfully logged in",
      });
    } else {
      console.log("❌ PASSWORD MISMATCH");
      return res.status(401).json({ message: "Invalid password." });
    }
  } catch (error) {
    console.error("❌ LOGIN ERROR:");
    console.error("Error type:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const init = async (req, res) => {
  try {
    const user = req.user.user;
    delete user.password;
    res
      .status(201)
      .send({ data: user, message: "successfully fetched current  user" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

export { login, init };
