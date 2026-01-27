import { User } from "../../Model/index.js";
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadProfileImage = async (req, res) => {
  try {
    const userId = req.user.user.id;
    
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided" });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      // Delete uploaded file if user not found
      if (req.file.path) fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: "User not found" });
    }

    // Delete old profile image if it exists and is a file (not base64)
    if (user.profileImage && user.profileImage.startsWith('/uploads/profiles/')) {
      const oldImagePath = path.join(__dirname, '../..', user.profileImage);
      if (fs.existsSync(oldImagePath)) {
        try {
          fs.unlinkSync(oldImagePath);
        } catch (err) {
          console.error("Error deleting old profile image:", err);
        }
      }
    }

    // Save image URL (relative path)
    const imageUrl = `/uploads/profiles/${req.file.filename}`;
    
    await user.update({ profileImage: imageUrl });

    res.status(200).json({ 
      data: { profileImage: imageUrl }, 
      message: "Profile image uploaded successfully" 
    });
  } catch (error) {
    console.error("Error uploading profile image:", error);
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error("Error cleaning up file:", err);
      }
    }
    res.status(500).json({ error: "Failed to upload profile image" });
  }
};

export { uploadProfileImage };