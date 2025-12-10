import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  seeker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Please provide a scheduled date']
  },
  scheduledTime: {
    type: String,
    required: [true, 'Please provide a scheduled time']
  },
  duration: {
    type: Number,
    default: 1
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  price: {
    amount: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  payment: {
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending'
    },
    method: {
      type: String,
      enum: ['card', 'paypal', 'cash'],
      default: 'card'
    },
    transactionId: String,
    paidAt: Date
  },
  location: {
    address: String,
    city: String,
    state: String,
    type: {
      type: String,
      enum: ['provider-location', 'seeker-location', 'online', 'custom'],
      default: 'provider-location'
    }
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  seekerNotes: String,
  providerNotes: String,
  cancellationReason: String,
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  cancelledAt: Date,
  completedAt: Date,
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

// Indexes
bookingSchema.index({ seeker: 1, status: 1 });
bookingSchema.index({ provider: 1, status: 1 });
bookingSchema.index({ scheduledDate: 1 });

// Update service booking count when booking is created
bookingSchema.post('save', async function() {
  if (this.status === 'confirmed' || this.status === 'completed') {
    const Service = mongoose.model('Service');
    await Service.findByIdAndUpdate(this.service, {
      $inc: { totalBookings: 1 }
    });
  }
});

export default mongoose.model('Booking', bookingSchema);
