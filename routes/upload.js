import express from 'express'
import { upload } from '../middlewares/multer.js'
import { uploadPhotos } from '../controllers/uploadController.js'

const router = express.Router()

router.post('/', upload.array('photos', 100), uploadPhotos)

export default router
