import express from 'express'
import { login, getMe, changePassword, updateProfile } from '../controllers/authController.js'
import { requireAdmin } from '../middlewares/auth.js'

const router = express.Router()

router.post('/login', login)
router.get('/me', requireAdmin, getMe)
router.post('/change-password', requireAdmin, changePassword)
router.post('/profile', requireAdmin, updateProfile)

export default router
