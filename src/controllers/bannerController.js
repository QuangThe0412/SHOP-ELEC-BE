const prisma = require('../lib/prisma');
const { successResponse, errorResponse } = require('../utils/response');
const { validateRequiredFields } = require('../utils/validation');

/**
 * Get all banners
 * GET /api/banners
 */
const getAllBanners = async (req, res) => {
  try {
    const { status = 'active', page = 1, limit = 10, sort = 'priority' } = req.query;

    const where = {};
    
    if (status) {
      where.status = status;
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.max(1, Math.min(100, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    let orderBy = [{ priority: 'desc' }, { createdAt: 'desc' }];
    if (sort === 'recent') {
      orderBy = [{ createdAt: 'desc' }];
    } else if (sort === 'oldest') {
      orderBy = [{ createdAt: 'asc' }];
    }

    const [banners, total] = await Promise.all([
      prisma.banner.findMany({
        where,
        select: {
          id: true,
          title: true,
          description: true,
          image: true,
          url: true,
          priority: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy,
        skip,
        take: limitNum
      }),
      prisma.banner.count({ where })
    ]);

    return successResponse(res, {
      banners,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalBanners: total,
        hasMore: skip + limitNum < total
      }
    });

  } catch (error) {
    console.error('Get banners error:', error);
    return errorResponse(res, 'Failed to get banners', 500);
  }
};

/**
 * Get banner by ID
 * GET /api/banners/:bannerId
 */
const getBannerById = async (req, res) => {
  try {
    const { bannerId } = req.params;

    const banner = await prisma.banner.findUnique({
      where: { id: bannerId },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        url: true,
        priority: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!banner) {
      return errorResponse(res, 'Banner not found', 404, 'BANNER_NOT_FOUND');
    }

    return successResponse(res, { banner });

  } catch (error) {
    console.error('Get banner error:', error);
    return errorResponse(res, 'Failed to get banner', 500);
  }
};

/**
 * Create new banner (Admin only)
 * POST /api/banners
 */
const createBanner = async (req, res) => {
  try {
    const requiredFields = ['title', 'image'];
    const missing = validateRequiredFields(req.body, requiredFields);

    if (missing) {
      return errorResponse(res, `Missing required fields: ${missing.join(', ')}`, 400, 'MISSING_FIELDS');
    }

    const {
      title,
      description,
      image,
      url,
      status = 'active',
      priority = 0
    } = req.body;

    const newBanner = await prisma.banner.create({
      data: {
        title,
        description,
        image,
        url,
        status,
        priority: Number(priority)
      },
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        url: true,
        priority: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return successResponse(res, { banner: newBanner }, 'Banner created successfully', 201);

  } catch (error) {
    console.error('Create banner error:', error);
    return errorResponse(res, 'Failed to create banner', 500);
  }
};

/**
 * Update banner (Admin only)
 * PUT /api/banners/:bannerId
 */
const updateBanner = async (req, res) => {
  try {
    const { bannerId } = req.params;

    const banner = await prisma.banner.findUnique({
      where: { id: bannerId }
    });

    if (!banner) {
      return errorResponse(res, 'Banner not found', 404, 'BANNER_NOT_FOUND');
    }

    const {
      title,
      description,
      image,
      url,
      status,
      priority
    } = req.body;

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (image !== undefined) updateData.image = image;
    if (url !== undefined) updateData.url = url;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = Number(priority);

    const updatedBanner = await prisma.banner.update({
      where: { id: bannerId },
      data: updateData,
      select: {
        id: true,
        title: true,
        description: true,
        image: true,
        url: true,
        priority: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return successResponse(res, { banner: updatedBanner }, 'Banner updated successfully');

  } catch (error) {
    console.error('Update banner error:', error);
    return errorResponse(res, 'Failed to update banner', 500);
  }
};

/**
 * Delete banner (Admin only)
 * DELETE /api/banners/:bannerId
 */
const deleteBanner = async (req, res) => {
  try {
    const { bannerId } = req.params;

    const banner = await prisma.banner.findUnique({
      where: { id: bannerId }
    });

    if (!banner) {
      return errorResponse(res, 'Banner not found', 404, 'BANNER_NOT_FOUND');
    }

    await prisma.banner.delete({
      where: { id: bannerId }
    });

    return successResponse(res, null, 'Banner deleted successfully');

  } catch (error) {
    console.error('Delete banner error:', error);
    return errorResponse(res, 'Failed to delete banner', 500);
  }
};

module.exports = {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner
};
