import express from 'express'
import { getPublicSettings, updateSettingsAdmin } from '../controllers/settingController.js'
import { requireAdmin } from '../middlewares/auth.js'

const router = express.Router()

// Public route
router.get('/', getPublicSettings)

// Admin route
router.post('/', requireAdmin, updateSettingsAdmin)

export default router
