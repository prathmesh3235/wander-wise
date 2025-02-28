import mongoose from 'mongoose';

const HiddenGemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    name: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    address: { type: String }
  },
  category: { type: String, required: true },
  photos: [{ type: String, required: true }],
  bestTimeToVisit: { type: String },
  crowdLevel: { type: Number, min: 1, max: 5 },
  priceRange: { type: Number, min: 1, max: 5 },
  tips: { type: String },
  verifications: { type: Number, default: 0 },
  upvotes: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.HiddenGem || mongoose.model('HiddenGem', HiddenGemSchema);