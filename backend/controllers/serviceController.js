import Service from '../models/Service.js';

// @desc    Get all services
// @route   GET /api/services
// @access  Public
export const getServices = async (req, res, next) => {
  try {
    // Build query
    let query = { isActive: true };

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by location
    if (req.query.city) {
      query['location.city'] = new RegExp(req.query.city, 'i');
    }

    // Search by title or description
    if (req.query.search) {
      query.$or = [
        { title: new RegExp(req.query.search, 'i') },
        { description: new RegExp(req.query.search, 'i') },
        { tags: new RegExp(req.query.search, 'i') }
      ];
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query['price.amount'] = {};
      if (req.query.minPrice) query['price.amount'].$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) query['price.amount'].$lte = Number(req.query.maxPrice);
    }

    // Sort
    let sort = '-createdAt';
    if (req.query.sort === 'price-low') sort = 'price.amount';
    if (req.query.sort === 'price-high') sort = '-price.amount';
    if (req.query.sort === 'rating') sort = '-rating';
    if (req.query.sort === 'popular') sort = '-totalBookings';

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const services = await Service.find(query)
      .populate('provider', 'name avatar rating location')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Service.countDocuments(query);

    res.status(200).json({
      success: true,
      count: services.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: services
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
export const getService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name avatar rating location phone email bio totalReviews')
      .populate({
        path: 'reviews',
        populate: { path: 'seeker', select: 'name avatar' }
      });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Increment views
    service.views += 1;
    await service.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Provider only)
export const createService = async (req, res, next) => {
  try {
    // Add user as provider
    req.body.provider = req.user.id;

    const service = await Service.create(req.body);

    res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private
export const updateService = async (req, res, next) => {
  try {
    let service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Make sure user is service owner
    if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this service'
      });
    }

    service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private
export const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    // Make sure user is service owner
    if (service.provider.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this service'
      });
    }

    await service.deleteOne();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get provider's services
// @route   GET /api/services/provider/:providerId
// @access  Public
export const getProviderServices = async (req, res, next) => {
  try {
    const services = await Service.find({
      provider: req.params.providerId,
      isActive: true
    }).populate('provider', 'name avatar rating');

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    next(error);
  }
};
