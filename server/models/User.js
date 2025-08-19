import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true, sparse: true, index: true },
    passwordHash: { type: String },
    fullName: { type: String },
    role: { type: String, enum: ['admin', 'moderator', 'user'], default: 'user' },
    walletAddress: { type: String, unique: true, sparse: true, index: true },
    bio: { type: String },
    location: { type: String },
    websiteUrl: { type: String },
    avatarUrl: { type: String },
    siweNonce: { type: String },
    siweNonceExpiresAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('User', userSchema);

