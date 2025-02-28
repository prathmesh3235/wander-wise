import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  experience: { type: mongoose.Schema.Types.ObjectId, ref: 'Experience', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true },
  photos: [{ type: String }],
  helpfulVotes: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);