import express from 'express'
import {
  getPublicPackages,
  getAllPackagesAdmin,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
} from '../controllers/packageController.js'
import { requireAdmin } from '../middlewares/auth.js'

const router = express.Router()

// Public routes
router.get('/', getPublicPackages)
router.get('/:id', getPackageById)

// Admin routes
router.get('/admin/all', requireAdmin, getAllPackagesAdmin)
router.post('/', requireAdmin, createPackage)
router.put('/:id', requireAdmin, updatePackage)
router.delete('/:id', requireAdmin, deletePackage)

export default router
