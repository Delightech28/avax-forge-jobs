import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import jobsRoutes from './routes/jobs.js';
import companiesRoutes from './routes/companies.js';
import locationsRoutes from './routes/locations.js';

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:8080',
    credentials: true,
  })
);

// Static files for uploads
const uploadsRoot = path.join(__dirname, '..', 'uploads');
const avatarsDir = path.join(uploadsRoot, 'avatars');
try {
  if (!fs.existsSync(uploadsRoot)) fs.mkdirSync(uploadsRoot);
  if (!fs.existsSync(avatarsDir)) fs.mkdirSync(avatarsDir);
} catch (e) {
  // eslint-disable-next-line no-console
  console.warn('Could not ensure upload directories:', e);
}
app.use('/uploads', express.static(uploadsRoot));

// Database
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/avax_forge_jobs';
// Determine dbName: prefer explicit env, otherwise parse from URI path, default to 'avax_forge_jobs'
const resolvedDbName = process.env.MONGODB_DBNAME || (() => {
  try {
    const u = new URL(mongoUri);
    const path = (u.pathname || '').replace(/^\//, '');
    return path || 'avax_forge_jobs';
  } catch {
    return 'avax_forge_jobs';
  }
})();

mongoose
  .connect(mongoUri, { dbName: resolvedDbName })
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Connected to MongoDB');
  })
  .catch((err) => {
    // eslint-disable-next-line no-console
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/locations', locationsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${port}`);
});

