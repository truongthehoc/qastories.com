import express from 'express'
import {
  getPublicAlbums,
  getPublicAlbumBySlug,
  getAlbumByIdAdmin,
  createAlbum,
  updateAlbum,
  deleteAlbum,
  addPhotoToAlbum,
  addPhotosBatchToAlbum,
  deletePhoto,
} from '../controllers/albumController.js'
import { requireAdmin } from '../middlewares/auth.js'

const router = express.Router()

// Public routes
router.get('/', getPublicAlbums)
router.get('/detail/:slug', getPublicAlbumBySlug)

// Admin routes
router.get('/admin/:id', requireAdmin, getAlbumByIdAdmin)
router.post('/', requireAdmin, createAlbum)
router.put('/:id', requireAdmin, updateAlbum)
router.delete('/:id', requireAdmin, deleteAlbum)
router.post('/:id/photos', requireAdmin, addPhotoToAlbum)
router.post('/:id/photos/batch', requireAdmin, addPhotosBatchToAlbum)
router.delete('/photos/:photoId', requireAdmin, deletePhoto)

export default router
