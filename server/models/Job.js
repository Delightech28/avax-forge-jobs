import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    jobType: { type: String, enum: ['full_time','part_time','contract','internship','freelance'], required: true },
    locationType: { type: String, enum: ['remote','on_site','hybrid'], required: true },
    location: { type: String },
    salaryMin: { type: Number },
    salaryMax: { type: Number },
    salaryCurrency: { type: String, default: 'USD' },
    experienceLevel: { type: String, enum: ['entry','mid','senior','lead','executive'], required: true },
    skills: [{ type: String }],
    tokenCompensation: { type: String },
    tokenAmount: { type: Number },
    requiresWallet: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    expiresAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Job', jobSchema);

