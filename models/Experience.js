import mongoose from 'mongoose';

const ExperienceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  guide: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  location: {
    name: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    },
    address: { type: String }
  },
  duration: { type: Number, required: true }, // in hours
  price: { type: Number, required: true },
  currency: { type: String, default: 'USD' },
  categories: [{ type: String }],
  languages: [{ type: String }],
  maxGroupSize: { type: Number, default: 10 },
  includedItems: [{ type: String }],
  excludedItems: [{ type: String }],
  images: [{ type: String }],
  availableDates: [{ type: Date }],
  averageRating: { type: Number, default: 0 },
  reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Review' }],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.models.Experience || mongoose.model('Experience', ExperienceSchema);
