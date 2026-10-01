import express from 'express'
import {
  getPublicBanners,
  getAllBannersAdmin,
  createBanner,
  updateBanner,
  toggleBannerActive,
  deleteBanner,
} from '../controllers/bannerController.js'
import { requireAdmin } from '../middlewares/auth.js'

const router = express.Router()

// Public route
router.get('/', getPublicBanners)

// Admin routes
router.get('/all', requireAdmin, getAllBannersAdmin)
router.post('/', requireAdmin, createBanner)
router.put('/:id', requireAdmin, updateBanner)
router.patch('/:id/active', requireAdmin, toggleBannerActive)
router.delete('/:id', requireAdmin, deleteBanner)

export default router
