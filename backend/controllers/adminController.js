import User from '../models/User.js';
import Service from '../models/Service.js';
import Booking from '../models/Booking.js';
import Review from '../models/Review.js';
import { Message } from '../models/Message.js';

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { role, search } = req.query;

    const query = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip);

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user statistics
    const stats = {
      services: await Service.countDocuments({ provider: user._id }),
      bookings: await Booking.countDocuments({
        $or: [{ provider: user._id }, { seeker: user._id }]
      }),
      reviews: await Review.countDocuments({ user: user._id }),
      messages: await Message.countDocuments({
        $or: [{ sender: user._id }, { recipient: user._id }]
      })
    };

    res.status(200).json({
      success: true,
      data: { ...user.toObject(), stats }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUser = async (req, res, next) => {
  try {
    const allowedFields = ['name', 'email', 'role', 'status', 'verified'];
    const updateData = {};

    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        updateData[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Delete related data
    await Service.deleteMany({ provider: user._id });
    await Booking.deleteMany({
      $or: [{ provider: user._id }, { seeker: user._id }]
    });
    await Review.deleteMany({ user: user._id });
    await Message.deleteMany({
      $or: [{ sender: user._id }, { recipient: user._id }]
    });

    await user.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get platform statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getStats = async (req, res, next) => {
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats = {
      users: {
        total: await User.countDocuments(),
        seekers: await User.countDocuments({ role: 'seeker' }),
        providers: await User.countDocuments({ role: 'provider' }),
        admins: await User.countDocuments({ role: 'admin' }),
        newThisMonth: await User.countDocuments({
          createdAt: { $gte: thirtyDaysAgo }
        })
      },
      services: {
        total: await Service.countDocuments(),
        active: await Service.countDocuments({ status: 'active' }),
        newThisMonth: await Service.countDocuments({
          createdAt: { $gte: thirtyDaysAgo }
        })
      },
      bookings: {
        total: await Booking.countDocuments(),
        pending: await Booking.countDocuments({ status: 'pending' }),
        confirmed: await Booking.countDocuments({ status: 'confirmed' }),
        completed: await Booking.countDocuments({ status: 'completed' }),
        cancelled: await Booking.countDocuments({ status: 'cancelled' }),
        thisMonth: await Booking.countDocuments({
          createdAt: { $gte: thirtyDaysAgo }
        })
      },
      reviews: {
        total: await Review.countDocuments(),
        averageRating: await Review.aggregate([
          { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]).then(result => result[0]?.avgRating?.toFixed(2) || 0)
      },
      messages: {
        total: await Message.countDocuments(),
        thisMonth: await Message.countDocuments({
          createdAt: { $gte: thirtyDaysAgo }
        })
      }
    };

    // Get revenue data (mock for now)
    stats.revenue = {
      total: stats.bookings.completed * 45.50,
      thisMonth: stats.bookings.thisMonth * 45.50
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent activity
// @route   GET /api/admin/activity
// @access  Private/Admin
export const getRecentActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 20;

    // Get recent users
    const recentUsers = await User.find()
      .select('name email role createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent bookings
    const recentBookings = await Booking.find()
      .populate('seeker', 'name')
      .populate('provider', 'name')
      .populate('service', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent reviews
    const recentReviews = await Review.find()
      .populate('user', 'name')
      .populate('service', 'title')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        users: recentUsers,
        bookings: recentBookings,
        reviews: recentReviews
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Flag content for review
// @route   POST /api/admin/flag/:type/:id
// @access  Private/Admin
export const flagContent = async (req, res, next) => {
  try {
    const { type, id } = req.params;
    const { reason } = req.body;

    let model;
    switch (type) {
      case 'service':
        model = Service;
        break;
      case 'review':
        model = Review;
        break;
      case 'user':
        model = User;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid content type'
        });
    }

    const item = await model.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`
      });
    }

    item.flagged = true;
    item.flagReason = reason;
    await item.save();

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Unflag content
// @route   DELETE /api/admin/flag/:type/:id
// @access  Private/Admin
export const unflagContent = async (req, res, next) => {
  try {
    const { type, id } = req.params;

    let model;
    switch (type) {
      case 'service':
        model = Service;
        break;
      case 'review':
        model = Review;
        break;
      case 'user':
        model = User;
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid content type'
        });
    }

    const item = await model.findById(id);
    if (!item) {
      return res.status(404).json({
        success: false,
        message: `${type} not found`
      });
    }

    item.flagged = false;
    item.flagReason = undefined;
    await item.save();

    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    next(error);
  }
};
