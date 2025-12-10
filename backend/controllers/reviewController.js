import Review from '../models/Review.js';
import Booking from '../models/Booking.js';

// @desc    Get all reviews for a service
// @route   GET /api/reviews/service/:serviceId
// @access  Public
export const getServiceReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      service: req.params.serviceId
    })
      .populate('seeker', 'name avatar')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews for a provider
// @route   GET /api/reviews/provider/:providerId
// @access  Public
export const getProviderReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({
      provider: req.params.providerId
    })
      .populate('seeker', 'name avatar')
      .populate('service', 'title category')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new review
// @route   POST /api/reviews
// @access  Private (Seeker)
export const createReview = async (req, res, next) => {
  try {
    const { service, booking, rating, comment } = req.body;

    // Verify booking exists and is completed
    const bookingDoc = await Booking.findById(booking);

    if (!bookingDoc) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (bookingDoc.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }

    if (bookingDoc.seeker.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this booking'
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      seeker: req.user.id,
      booking
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this booking'
      });
    }

    const review = await Review.create({
      service,
      provider: bookingDoc.provider,
      seeker: req.user.id,
      booking,
      rating,
      comment,
      isVerified: true
    });

    const populatedReview = await Review.findById(review._id)
      .populate('seeker', 'name avatar')
      .populate('service', 'title');

    res.status(201).json({
      success: true,
      data: populatedReview
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update review
// @route   PUT /api/reviews/:id
// @access  Private
export const updateReview = async (req, res, next) => {
  try {
    let review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Make sure user is review owner
    if (review.seeker.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('seeker', 'name avatar')
      .populate('service', 'title');

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
export const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Make sure user is review owner
    if (review.seeker.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    await review.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add provider response to review
// @route   PUT /api/reviews/:id/response
// @access  Private (Provider)
export const addResponse = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    // Make sure user is the provider
    if (review.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to respond to this review'
      });
    }

    review.response = {
      text: req.body.response,
      respondedAt: Date.now()
    };

    await review.save();

    res.status(200).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};
