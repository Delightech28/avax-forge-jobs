import mongoose from 'mongoose';

const savedJobSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

savedJobSchema.index({ job: 1, user: 1 }, { unique: true });

export default mongoose.model('SavedJob', savedJobSchema);

