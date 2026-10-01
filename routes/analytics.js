import express from 'express'
import { trackPageView, getAnalyticsOverview } from '../controllers/analyticsController.js'
import { requireAdmin } from '../middlewares/auth.js'

const router = express.Router()

// Public route for tracking visits
router.post('/track', trackPageView)

// Admin analytics summary & charts
router.get('/overview', requireAdmin, getAnalyticsOverview)

export default router
