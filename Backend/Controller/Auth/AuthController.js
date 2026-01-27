import { User } from "../../Model/index.js";
import { generateToken } from "../../Routes/index.js";
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendVerificationEmail, sendPasswordResetEmail } from '../../services/emailService.js';

const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');
const isValidUsername = (username) => {
  if (typeof username !== 'string') return false;
  const trimmed = username.trim();
  if (trimmed.length < 3 || trimmed.length > 50) return false;
  return /^(?!\s*$)[a-zA-Z0-9_ ]+$/.test(username);
};
const isValidPassword = (password) =>
  typeof password === 'string' &&
  password.length >= 6 &&
  /[A-Z]/.test(password) &&
  /[0-9]/.test(password);
const isValidPhone = (phone) => !phone || /^[0-9]{10,15}$/.test(phone);

// Register
const register = async (req, res) => {
  try {
    const { username, email, password, phone } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Username, email and password are required" });
    }

    if (!isValidUsername(username)) {
      return res.status(400).json({ error: "Username must be 3-50 characters" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ error: "Password must be at least 6 characters, include an uppercase letter and a number" });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ error: "Phone number must be 10-15 digits" });
    }
    
    // Check existing
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: "Email already exists" });
    }
    
    const existingUsername = await User.findOne({ where: { username } });
    if (existingUsername) {
      return res.status(400).json({ error: "Username already exists" });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      phone,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    });
    
    // Send verification email
    try {
      await sendVerificationEmail(email, username, verificationToken);
      console.log(`Verification email sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }
    
    res.status(201).json({ 
      message: "Registration successful. Please check your email to verify your account."
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Registration failed" });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    console.log('📧 Verifying email with token:', token ? token.substring(0, 10) + '...' : 'NO TOKEN');
    
    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }
    
    // First try to find user with this token
    let user = await User.findOne({
      where: {
        emailVerificationToken: token
      }
    });
    
    // If no user found with token, it might already be verified (token was cleared)
    // In this case, we can't identify the user, so show appropriate message
    if (!user) {
      console.log('ℹ️ No user found with this token - may already be verified or token invalid');
      // Return success-like message since the most common case is already verified
      return res.status(200).json({ 
        message: "Email verification complete! If your email was already verified, you can proceed to login.",
        alreadyVerified: true
      });
    }
    
    console.log('✅ Found user:', user.email);
    
    // Check if already verified
    if (user.isEmailVerified) {
      console.log('ℹ️ Email already verified for:', user.email);
      return res.status(200).json({ 
        message: "Email already verified! You can now login.",
        alreadyVerified: true
      });
    }
    
    // Check if token expired
    if (user.emailVerificationExpires && new Date() > new Date(user.emailVerificationExpires)) {
      console.log('❌ Token expired for:', user.email);
      return res.status(400).json({ error: "Verification token has expired. Please request a new verification email." });
    }
    
    // Verify the email
    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationExpires = null;
    await user.save();
    
    console.log('✅ Email verified successfully for:', user.email);
    res.status(200).json({ message: "Email verified successfully! You can now login." });
  } catch (error) {
    console.error('❌ Verification error:', error);
    res.status(500).json({ error: "Verification failed. Please try again." });
  }
};

// Resend verification email
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (user.isEmailVerified) {
      return res.status(400).json({ error: "Email already verified" });
    }
    
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpires = verificationExpires;
    await user.save();
    
    // Send verification email
    try {
      await sendVerificationEmail(email, user.username, verificationToken);
      console.log(`Verification email resent to ${email}`);
    } catch (emailError) {
      console.error('Failed to resend verification email:', emailError);
    }
    
    res.status(200).json({ 
      message: "Verification email sent. Please check your inbox."
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to resend verification" });
  }
};

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();
    
    // Send password reset email
    try {
      await sendPasswordResetEmail(email, user.username, resetToken);
      console.log(`Password reset email sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
    }
    
    res.status(200).json({ 
      message: "Password reset link sent to your email"
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to send reset link" });
  }
};

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    
    const user = await User.findOne({
      where: { passwordResetToken: token }
    });
    
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }
    
    if (new Date() > user.passwordResetExpires) {
      return res.status(400).json({ error: "Reset token expired" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await user.save();
    
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: "Password reset failed" });
  }
};

// Change password (logged in)
const changePassword = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password required" });
    }
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to change password" });
  }
};

const login = async (req, res) => {
  try {
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    if (!isValidEmail(req.body.email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    
    const user = await User.findOne({ where: { email: req.body.email } });
    
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    if (user.isBlocked) {
      return res.status(403).json({ error: "Your account has been blocked" });
    }
    
    // Check email verification
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        error: "Please verify your email before logging in",
        needsVerification: true,
        email: user.email
      });
    }
    
    const passwordMatch = await bcrypt.compare(req.body.password, user.password);
    
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    const tokenPayload = {
      id: user.id,
      role: user.role,
      email: user.email,
      username: user.username
    };
    const token = generateToken({ user: tokenPayload });
    
    const userData = user.toJSON();
    delete userData.password;
    
    res.status(200).json({
      data: { 
        access_token: token,
        user: userData
      },
      message: "Login successful"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Login failed" });
  }
};

const init = async (req, res) => {
  try {
    // Get fresh user data from database (not from token - which may be stale)
    const userId = req.user.user.id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken', 'passwordResetExpires'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json({ data: user, message: "User fetched successfully" });
  } catch (e) {
    console.error("Init error:", e);
    res.status(500).json({ error: "Failed to fetch user" });
  }
};

// Get profile
const getProfile = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'emailVerificationToken', 'passwordResetToken'] }
    });
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.status(200).json({ data: user });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch profile" });
  }
};

// Update profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.user.id;
    const { username, phone, address } = req.body;
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    if (username) user.username = username;
    if (phone) user.phone = phone;
    if (address) user.address = address;
    
    await user.save();
    
    const userData = user.toJSON();
    delete userData.password;
    
    res.status(200).json({ data: userData, message: "Profile updated" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
};

export { 
  register,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  changePassword,
  login, 
  init,
  getProfile,
  updateProfile
};
