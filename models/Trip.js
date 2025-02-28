import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  coordinates: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  address: { type: String },
  placeId: { type: String }
});

const ActivitySchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  location: { type: LocationSchema },
  startTime: { type: Date },
  endTime: { type: Date },
  cost: { type: Number, default: 0 },
  category: { type: String },
  photos: [{ type: String }],
  notes: { type: String },
  isBooked: { type: Boolean, default: false },
  bookingReference: { type: String }
});

const DayPlanSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  activities: [{ type: ActivitySchema }],
  notes: { type: String }
});

const ExpenseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  category: { type: String, required: true },
  date: { type: Date, default: Date.now },
  splitWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

const TripSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  destination: {
    name: { type: String, required: true },
    coordinates: {
      lat: { type: Number },
      lng: { type: Number }
    },
    country: { type: String }
  },
  coverImage: { type: String },
  budget: {
    total: { type: Number },
    spent: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' }
  },
  itinerary: [{ type: DayPlanSchema }],
  expenses: [{ type: ExpenseSchema }],
  companions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  isPublic: { type: Boolean, default: false },
  journalEntries: [{ type: mongoose.Schema.Types.ObjectId, ref: 'JournalEntry' }]
}, { timestamps: true });

export default mongoose.models.Trip || mongoose.model('Trip', TripSchema);