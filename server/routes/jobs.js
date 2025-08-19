import { Router } from 'express';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import SavedJob from '../models/SavedJob.js';
import JobApplication from '../models/JobApplication.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', async (req, res) => {
  try {
    const { search, type, location, experience } = req.query;
    const filter = { isActive: true };
    if (type && type !== 'all') filter.jobType = type;
    if (location && location !== 'all') filter.locationType = location;
    if (experience && experience !== 'all') filter.experienceLevel = experience;
    if (search) filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
    const jobs = await Job.find(filter).sort({ createdAt: -1 }).populate('company');
    return res.json({ jobs });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).populate('company');
    if (!job || !job.isActive) return res.status(404).json({ error: 'Not found' });
    return res.json({ job });
  } catch (err) {
    return res.status(404).json({ error: 'Not found' });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const {
      title, description, company_id, job_type, location_type, location,
      salary_min, salary_max, salary_currency, experience_level, skills,
      token_compensation, token_amount, requires_wallet, expires_at
    } = req.body;

    const company = await Company.findById(company_id);
    if (!company) return res.status(400).json({ error: 'Company not found' });

    const job = await Job.create({
      title,
      description,
      company: company._id,
      jobType: job_type,
      locationType: location_type,
      location,
      salaryMin: salary_min,
      salaryMax: salary_max,
      salaryCurrency: salary_currency,
      experienceLevel: experience_level,
      skills: skills || [],
      tokenCompensation: token_compensation,
      tokenAmount: token_amount,
      requiresWallet: !!requires_wallet,
      postedBy: req.userId,
      expiresAt: expires_at || null,
    });
    return res.status(201).json({ job });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/save', requireAuth, async (req, res) => {
  try {
    await SavedJob.create({ job: req.params.id, user: req.userId });
    return res.json({ ok: true });
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ error: 'Already saved' });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/:id/apply', requireAuth, async (req, res) => {
  try {
    await JobApplication.create({ job: req.params.id, applicant: req.userId });
    return res.json({ ok: true });
  } catch (err) {
    if (err && err.code === 11000) return res.status(409).json({ error: 'Already applied' });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/:id/application-status', requireAuth, async (req, res) => {
  const exists = await JobApplication.exists({ job: req.params.id, applicant: req.userId });
  return res.json({ hasApplied: !!exists });
});

export default router;

