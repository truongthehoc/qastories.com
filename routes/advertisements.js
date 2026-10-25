import express from 'express'
import {
  getPublicAdvertisements,
  getAllAdvertisementsAdmin,
  createAdvertisement,
  updateAdvertisement,
  toggleAdvertisementActive,
  deleteAdvertisement,
  trackView,
  trackClick,
} from '../controllers/advertisementController.js'
import { requireAdmin } from '../middlewares/auth.js'

const router = express.Router()

// Public routes for visitors
router.get('/', getPublicAdvertisements)
router.post('/:id/view', trackView)
router.post('/:id/click', trackClick)

// Protected Admin routes
router.get('/all', requireAdmin, getAllAdvertisementsAdmin)
router.post('/', requireAdmin, createAdvertisement)
router.put('/:id', requireAdmin, updateAdvertisement)
router.patch('/:id/active', requireAdmin, toggleAdvertisementActive)
router.delete('/:id', requireAdmin, deleteAdvertisement)

export default router
