import express from 'express';
import multer from 'multer';
import { getAllUsers, updateUserById, deleteUserById, createUser, getUserById, updateCurrentUser } from '../../Controller/index.js';
import { uploadProfileImage } from '../../Controller/User/ImageController.js';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

router.get('/', getAllUsers);
router.post('/', createUser);
router.put('/me', updateCurrentUser); // Update current authenticated user
router.get('/:id', getUserById);
router.put('/:id', updateUserById);
router.delete('/:id', deleteUserById);
router.post('/upload-image', upload.single('profileImage'), uploadProfileImage);

export { router as UserRoute };