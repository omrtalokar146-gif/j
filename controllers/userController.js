import cloudinary from '../config/cloudinary.js';
import User from '../models/User.js';

const uploadToCloudinary = (fileBuffer) => {
  // fail fast if Cloudinary not configured
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    return Promise.reject(new Error('Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in your environment.'));
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'nexus/avatars', resource_type: 'image' },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    uploadStream.end(fileBuffer);
  });
};

export const getProfile = async (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { username, xp, level, badges } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (username) {
      user.username = username;
    }

    if (xp !== undefined) {
      user.xp = Number(xp) || user.xp;
    }

    if (level !== undefined) {
      user.level = Number(level) || user.level;
    }

    if (badges !== undefined && Array.isArray(badges)) {
      user.badges = badges;
    }

    await user.save();
    const userData = user.toObject();
    delete userData.password;

    res.json({ user: userData });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ error: 'Avatar file is required' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    if (user.avatarPublicId) {
      try {
        await cloudinary.uploader.destroy(user.avatarPublicId);
      } catch (destroyError) {
        console.warn('Failed to delete old avatar from Cloudinary:', destroyError);
      }
    }

    user.avatarUrl = result.secure_url;
    user.avatarPublicId = result.public_id;
    await user.save();

    const userData = user.toObject();
    delete userData.password;

    res.json({ user: userData });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
};
