import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  seeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please provide a review comment'],
    maxlength: [500, 'Review cannot be more than 500 characters']
  },
  response: {
    text: String,
    respondedAt: Date
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  helpful: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Prevent duplicate reviews for same booking
reviewSchema.index({ seeker: 1, booking: 1 }, { unique: true });

// Update service and provider ratings after review is saved
reviewSchema.post('save', async function() {
  const Service = mongoose.model('Service');
  const User = mongoose.model('User');
  
  const service = await Service.findById(this.service);
  const provider = await User.findById(this.provider);
  
  if (service) await service.calculateRating();
  if (provider) await provider.calculateRating();
});

// Update ratings after review is deleted
reviewSchema.post('remove', async function() {
  const Service = mongoose.model('Service');
  const User = mongoose.model('User');
  
  const service = await Service.findById(this.service);
  const provider = await User.findById(this.provider);
  
  if (service) await service.calculateRating();
  if (provider) await provider.calculateRating();
});

export default mongoose.model('Review', reviewSchema);
