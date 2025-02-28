import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Please provide a name'] },
  email: { 
    type: String, 
    required: [true, 'Please provide an email'], 
    unique: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  password: { 
    type: String, 
    required: [true, 'Please provide a password'],
    minlength: 8,
    select: false
  },
  profileImage: { type: String, default: '/images/default-avatar.png' },
  bio: { type: String, default: '' },
  interests: [{ type: String }],
  travelStyle: { type: String, enum: ['budget', 'comfort', 'luxury'], default: 'comfort' },
  languages: [{ type: String }],
  isGuide: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to check password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.models.User || mongoose.model('User', UserSchema);