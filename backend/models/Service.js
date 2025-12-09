import mongoose from 'mongoose';

/**
 * Service Schema
 */
const serviceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a service title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot be more than 1000 characters']
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    enum: [
      'Tutoring',
      'Home Services',
      'Tech Support',
      'Creative Services',
      'Business Services',
      'Health & Wellness',
      'Transportation',
      'Events',
      'Other'
    ]
  },
  subcategory: {
    type: String,
    default: ''
  },
  // Reference to the user who provides this service
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Nested object for price details
  price: {
    amount: {
      type: Number,
      required: [true, 'Please provide a price']
    },
    type: {
      type: String,
      enum: ['hourly', 'fixed', 'per-session'],
      default: 'hourly'
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  // Nested object for location details, including coordinates for mapping
  location: {
    address: String,
    city: String,
    state: String,
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  availability: {
    // Simple availability status for the service
    type: Array,
    of: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'Not Available'],
    default: 'Not Available'
  },
  schedule: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  // Array of URLs for service images
  images: [{
    type: String
  }],
  tags: [{
    type: String
  }],
  // Aggregated rating from reviews
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
  totalBookings: {
    type: Number,
    default: 0
  },
  // Allows providers to enable/disable their service listings
  isActive: {
    type: Boolean,
    default: true
  },
  // Allows admins to feature a service on the platform
  isFeatured: {
    type: Boolean,
    default: false
  },
  // Tracks the number of times a service page has been viewed
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes on frequently queried fields to improve database performance
serviceSchema.index({ category: 1, isActive: 1 });
serviceSchema.index({ provider: 1 });
serviceSchema.index({ 'location.city': 1, 'location.state': 1 });
serviceSchema.index({ rating: -1 });

// Create a virtual 'reviews' field to populate reviews for a service without storing them in the document
serviceSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'service',
  justOne: false
});

// Method to calculate and update the average rating and total reviews for a service
serviceSchema.methods.calculateRating = async function() {
  const Review = mongoose.model('Review');
  const stats = await Review.aggregate([
    { $match: { service: this._id } },
    {
      $group: {
        _id: '$service',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  if (stats.length > 0) {
    // Round to one decimal place.
    this.rating = Math.round(stats[0].averageRating * 10) / 10;
    this.totalReviews = stats[0].totalReviews;
  } else {
    this.rating = 0;
    this.totalReviews = 0;
  }
  
  await this.save();
};

export default mongoose.model('Service', serviceSchema);