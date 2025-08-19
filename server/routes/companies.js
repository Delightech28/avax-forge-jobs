import { Router } from 'express';
import Company from '../models/Company.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, async (req, res) => {
  const companies = await Company.find({ createdBy: req.userId }).select('id name');
  return res.json({ companies });
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, description, logoUrl, websiteUrl, location, sizeRange, industry } = req.body || {};
    if (!name) return res.status(400).json({ error: 'Name is required' });
    const company = await Company.create({
      name,
      description,
      logoUrl,
      websiteUrl,
      location,
      sizeRange,
      industry,
      createdBy: req.userId,
    });
    return res.status(201).json({ company });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const company = await Company.findOne({ _id: req.params.id, createdBy: req.userId });
    if (!company) return res.status(404).json({ error: 'Not found' });
    return res.json({ company });
  } catch (err) {
    return res.status(404).json({ error: 'Not found' });
  }
});

router.put('/:id', requireAuth, async (req, res) => {
  try {
    const updates = {};
    const allowed = ['name', 'description', 'logoUrl', 'websiteUrl', 'location', 'sizeRange', 'industry'];
    for (const key of allowed) {
      if (key in req.body) updates[key] = req.body[key];
    }
    const company = await Company.findOneAndUpdate({ _id: req.params.id, createdBy: req.userId }, updates, { new: true });
    if (!company) return res.status(404).json({ error: 'Not found' });
    return res.json({ company });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const company = await Company.findOneAndDelete({ _id: req.params.id, createdBy: req.userId });
    if (!company) return res.status(404).json({ error: 'Not found' });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

