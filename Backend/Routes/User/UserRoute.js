import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { getAllUsers, updateUserById, deleteUserById, createUser, getUserById, updateCurrentUser } from '../../Controller/index.js';
import { uploadProfileImage } from '../../Controller/User/ImageController.js';
import { authenticateToken, requireAdmin } from '../../Middleware/token-middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

router.use(authenticateToken);

// Create profiles uploads directory if it doesn't exist
const profileUploadsDir = path.join(__dirname, '../../uploads/profiles');
if (!fs.existsSync(profileUploadsDir)) {
  fs.mkdirSync(profileUploadsDir, { recursive: true });
}

// Configure multer for profile image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, profileUploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

router.get('/', requireAdmin, getAllUsers);
router.post('/', requireAdmin, createUser);
router.put('/me', updateCurrentUser); // Update current authenticated user
router.get('/:id', requireAdmin, getUserById);
router.put('/:id', requireAdmin, updateUserById);
router.delete('/:id', requireAdmin, deleteUserById);
router.post('/upload-image', upload.single('profileImage'), uploadProfileImage);

export { router as UserRoute };
