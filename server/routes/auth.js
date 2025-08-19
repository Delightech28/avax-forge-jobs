import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { ethers } from 'ethers';
import User from '../models/User.js';
import { issueToken } from '../middleware/auth.js';

const router = Router();

router.post('/signup', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ error: 'Email already in use' });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ email, passwordHash, fullName });
    const token = issueToken(user.id);

    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    return res.status(201).json({ user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, createdAt: user.createdAt, walletAddress: user.walletAddress } });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const token = issueToken(user.id);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    return res.json({ user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, createdAt: user.createdAt, walletAddress: user.walletAddress } });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  return res.json({ ok: true });
});

router.get('/me', async (req, res) => {
  try {
    const token = (req.cookies.token || '').toString();
    if (!token) return res.json({ user: null });
    const { sub } = jwt.verify(token, process.env.JWT_SECRET || 'change_me');
    const user = await User.findById(sub).select('email fullName role walletAddress createdAt');
    return res.json({ user: user ? { id: user.id, email: user.email, fullName: user.fullName, role: user.role, walletAddress: user.walletAddress, createdAt: user.createdAt } : null });
  } catch {
    return res.json({ user: null });
  }
});

// Wallet auth endpoints
router.get('/wallet/nonce', async (req, res) => {
  try {
    const address = (req.query.address || '').toString().toLowerCase();
    if (!address) return res.status(400).json({ error: 'address is required' });
    const nonce = randomBytes(16).toString('hex');
    const expires = new Date(Date.now() + 5 * 60 * 1000);
    const user = await User.findOneAndUpdate(
      { walletAddress: address },
      { $set: { siweNonce: nonce, siweNonceExpiresAt: expires }, $setOnInsert: { role: 'user' } },
      { new: true, upsert: true }
    );
    return res.json({ nonce });
  } catch (err) {
    console.error('Wallet nonce error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/wallet/verify', async (req, res) => {
  try {
    const { address, signature, nonce } = req.body || {};
    if (!address || !signature || !nonce) return res.status(400).json({ error: 'Missing fields' });
    const lower = address.toLowerCase();
    const user = await User.findOne({ walletAddress: lower });
    if (!user || !user.siweNonce || user.siweNonce !== nonce) return res.status(401).json({ error: 'Invalid nonce' });
    if (user.siweNonceExpiresAt && user.siweNonceExpiresAt.getTime() < Date.now()) return res.status(401).json({ error: 'Nonce expired' });

    // Recover address from signature of the nonce
    const recovered = ethers.verifyMessage(nonce, signature).toLowerCase();
    if (recovered !== lower) return res.status(401).json({ error: 'Signature mismatch' });

    // Clear nonce and ensure user record exists
    if (!user.fullName) user.fullName = `User_${lower.slice(2, 8)}`;
    user.siweNonce = undefined;
    user.siweNonceExpiresAt = undefined;
    await user.save();

    const token = issueToken(user.id);
    res.cookie('token', token, { httpOnly: true, sameSite: 'lax' });
    return res.json({ user: { id: user.id, email: user.email, fullName: user.fullName, role: user.role, createdAt: user.createdAt, walletAddress: user.walletAddress } });
  } catch (err) {
    console.error('Wallet verify error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

