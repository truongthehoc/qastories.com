import express from 'express'
import { submitBooking, getAllBookings } from '../controllers/contactController.js'

const router = express.Router()

router.post('/', submitBooking)
router.get('/', getAllBookings)

export default router
