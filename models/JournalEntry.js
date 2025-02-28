import mongoose from 'mongoose';

const JournalEntrySchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  location: {
    name: { type: String },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    }
  },
  mood: { type: String },
  photos: [{ type: String }],
  tags: [{ type: String }],
  isPublic: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.models.JournalEntry || mongoose.model('JournalEntry', JournalEntrySchema);
