import express from 'express'
import contactRouter from './contact.js'
import uploadRouter from './upload.js'
import authRouter from './auth.js'
import bannersRouter from './banners.js'
import albumsRouter from './albums.js'
import packagesRouter from './packages.js'
import settingsRouter from './settings.js'
import analyticsRouter from './analytics.js'
import adminRouter from './admin.js'

const router = express.Router()

router.use('/auth', authRouter)
router.use('/contact', contactRouter)
router.use('/upload', uploadRouter)
router.use('/banners', bannersRouter)
router.use('/albums', albumsRouter)
router.use('/packages', packagesRouter)
router.use('/settings', settingsRouter)
router.use('/analytics', analyticsRouter)
router.use('/admin', adminRouter)

router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'QA Stories API is operating normally',
    timestamp: new Date().toISOString(),
  })
})

export default router

