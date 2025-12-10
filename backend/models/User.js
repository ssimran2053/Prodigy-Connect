import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * User Schema
 */
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please provide a valid email'
    ]
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    // Exclude password from being returned in queries by default
    select: false
  },
  role: {
    type: String,
    enum: ['seeker', 'provider', 'admin'],
    default: 'seeker',
    // Role-based access control
  },
  avatar: {
    type: String,
    default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'
  },
  phone: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot be more than 500 characters'],
    default: ''
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  // Indicates if the user has verified their email address
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    // Allows admins to deactivate a user account
    type: Boolean,
    default: true
  },
  // Provider-specific fields
  services: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  // Tracks the number of jobs a provider has completed
  completedJobs: {
    type: Number,
    default: 0
  },
  // Settings
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    sms: { type: Boolean, default: false }
  },
  privacy: {
    profileVisibility: { type: String, enum: ['public', 'members', 'private'], default: 'public' },
    showEmail: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false }
  },
  // A list of services the user has favorited
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }],
  lastLogin: Date,
}, {
  timestamps: true
});

// Encrypt password using bcrypt before saving a user document
userSchema.pre('save', async function(next) {
  // Only run this function if password was actually modified
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

/**
 * Compares the entered password with the hashed password in the database
 * @param {string} enteredPassword - The password entered by the user
 * @returns {Promise<boolean>} - True if the passwords match
 */
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * Generates and signs a JSON Web Token (JWT) for authentication
 * @returns {string} - The signed JWT
 */
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Calculate average rating
userSchema.methods.calculateRating = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { provider: this._id } },
    {
      $group: {
        _id: '$provider',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    this.rating = Math.round(stats[0].averageRating * 10) / 10;
    this.totalReviews = stats[0].totalReviews;
  } else {
    this.rating = 0;
    this.totalReviews = 0;
  }
  
  await this.save();
};

export default mongoose.model('User', userSchema);
