import Booking from '../models/Booking.js';
import Service from '../models/Service.js';
import User from '../models/User.js';

// @desc    Get all bookings for logged in user
// @route   GET /api/bookings
// @access  Private
export const getBookings = async (req, res, next) => {
  try {
    let query;

    if (req.user.role === 'provider') {
      query = { provider: req.user.id };
    } else if (req.user.role === 'seeker') {
      query = { seeker: req.user.id };
    } else if (req.user.role === 'admin') {
      query = {};
    }

    // Filter by status
    if (req.query.status) {
      query.status = req.query.status;
    }

    const bookings = await Booking.find(query)
      .populate('service', 'title category price images')
      .populate('seeker', 'name avatar email phone')
      .populate('provider', 'name avatar email phone')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
// @access  Private
export const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('service')
      .populate('seeker', 'name avatar email phone')
      .populate('provider', 'name avatar email phone');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Make sure user is authorized
    if (
      booking.seeker._id.toString() !== req.user.id &&
      booking.provider._id.toString() !== req.user.id &&
      req.user.role !== 'admin'
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Seeker)
export const createBooking = async (req, res, next) => {
  try {
    const service = await Service.findById(req.body.service);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Add seeker and provider to booking
    req.body.seeker = req.user.id;
    req.body.provider = service.provider;

    // Set price from service if not provided
    if (!req.body.price) {
      req.body.price = {
        amount: service.price.amount,
        currency: service.price.currency
      };
    }

    const booking = await Booking.create(req.body);

    const populatedBooking = await Booking.findById(booking._id)
      .populate('service')
      .populate('seeker', 'name avatar email')
      .populate('provider', 'name avatar email');

    res.status(201).json({
      success: true,
      data: populatedBooking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking
// @route   PUT /api/bookings/:id
// @access  Private
export const updateBooking = async (req, res, next) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const isSeeker = booking.seeker.toString() === req.user.id;
    const isProvider = booking.provider.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isSeeker && !isProvider && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    // Update booking
    booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
      .populate('service')
      .populate('seeker', 'name avatar email')
      .populate('provider', 'name avatar email');

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check authorization
    const isSeeker = booking.seeker.toString() === req.user.id;
    const isProvider = booking.provider.toString() === req.user.id;

    if (!isSeeker && !isProvider && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    booking.status = 'cancelled';
    booking.cancelledBy = req.user.id;
    booking.cancelledAt = Date.now();
    booking.cancellationReason = req.body.reason || '';

    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm booking (Provider only)
// @route   PUT /api/bookings/:id/confirm
// @access  Private (Provider)
export const confirmBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to confirm this booking'
      });
    }

    booking.status = 'confirmed';
    await booking.save();

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Complete booking
// @route   PUT /api/bookings/:id/complete
// @access  Private (Provider)
export const completeBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    if (booking.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to complete this booking'
      });
    }

    booking.status = 'completed';
    booking.completedAt = Date.now();
    await booking.save();

    // Update provider's completed jobs count
    await User.findByIdAndUpdate(booking.provider, {
      $inc: { completedJobs: 1 }
    });

    res.status(200).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};
