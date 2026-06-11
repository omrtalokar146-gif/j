import express from 'express';
import multer from 'multer';
import { protect } from '../middleware/auth.js';
import { getProfile, updateProfile, uploadAvatar } from '../controllers/userController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/profile', protect, getProfile);
router.put('/profile/update', protect, updateProfile);
router.post('/profile/avatar', protect, upload.single('avatar'), uploadAvatar);

export default router;
