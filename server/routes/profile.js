import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import User from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Multer storage for avatars
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(process.cwd(), 'uploads', 'avatars')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.png';
    cb(null, `${req.userId}${ext}`);
  }
});
const upload = multer({ storage });

router.put('/', requireAuth, async (req, res) => {
  try {
    const updates = {};
    const allowed = ['fullName', 'walletAddress', 'bio', 'location', 'websiteUrl', 'avatarUrl'];
    for (const key of allowed) {
      if (key in req.body) updates[key] = req.body[key];
    }
    const user = await User.findByIdAndUpdate(req.userId, updates, { new: true })
      .select('email fullName role walletAddress bio location websiteUrl avatarUrl createdAt');
    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        walletAddress: user.walletAddress,
        bio: user.bio,
        location: user.location,
        websiteUrl: user.websiteUrl,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/avatar', requireAuth, upload.single('avatar'), async (req, res) => {
  try {
    const relative = `/uploads/avatars/${req.file.filename}`;
    const user = await User.findByIdAndUpdate(req.userId, { avatarUrl: relative }, { new: true })
      .select('email fullName role walletAddress bio location websiteUrl avatarUrl createdAt');
    return res.json({ avatarUrl: relative, user: user ? { id: user.id, email: user.email, fullName: user.fullName, role: user.role, walletAddress: user.walletAddress, bio: user.bio, location: user.location, websiteUrl: user.websiteUrl, avatarUrl: user.avatarUrl, createdAt: user.createdAt } : null });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

