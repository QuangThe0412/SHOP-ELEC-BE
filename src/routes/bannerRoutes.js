const express = require('express');
const router = express.Router();
const {
  getAllBanners,
  getBannerById,
  createBanner,
  updateBanner,
  deleteBanner
} = require('../controllers/bannerController');
const { authenticate, authorizeAdmin } = require('../middleware/auth');

/**
 * @swagger
 * /api/banners:
 *   get:
 *     summary: Lấy danh sách banner
 *     tags: [Banners]
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, inactive]
 *         description: Lọc theo trạng thái
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           default: 10
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [priority, recent, oldest]
 *         description: Sắp xếp
 *     responses:
 *       200:
 *         description: Danh sách banner
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     banners:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       type: object
 */
router.get('/', getAllBanners);

/**
 * @swagger
 * /api/banners/{bannerId}:
 *   get:
 *     summary: Lấy chi tiết banner
 *     tags: [Banners]
 *     parameters:
 *       - in: path
 *         name: bannerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết banner
 *       404:
 *         description: Banner không tìm thấy
 */
router.get('/:bannerId', getBannerById);

/**
 * @swagger
 * /api/banners:
 *   post:
 *     summary: Tạo banner mới (Admin only)
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - image
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: uri
 *               url:
 *                 type: string
 *                 format: uri
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *                 default: active
 *               priority:
 *                 type: number
 *                 default: 0
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Banner đã được tạo
 *       400:
 *         description: Lỗi validation
 *       403:
 *         description: Không có quyền
 */
router.post('/', authenticate, authorizeAdmin, createBanner);

/**
 * @swagger
 * /api/banners/{bannerId}:
 *   put:
 *     summary: Cập nhật banner (Admin only)
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bannerId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               url:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [active, inactive]
 *               priority:
 *                 type: number
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Banner đã được cập nhật
 *       404:
 *         description: Banner không tìm thấy
 *       403:
 *         description: Không có quyền
 */
router.put('/:bannerId', authenticate, authorizeAdmin, updateBanner);

/**
 * @swagger
 * /api/banners/{bannerId}:
 *   delete:
 *     summary: Xóa banner (Admin only)
 *     tags: [Banners]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: bannerId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Banner đã được xóa
 *       404:
 *         description: Banner không tìm thấy
 *       403:
 *         description: Không có quyền
 */
router.delete('/:bannerId', authenticate, authorizeAdmin, deleteBanner);

module.exports = router;
