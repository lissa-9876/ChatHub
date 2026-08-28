import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  name: { type: String, default: '' },
  otp: { type: String, default: null },
  otpExpires: { type: Date, default: null },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', userSchema);