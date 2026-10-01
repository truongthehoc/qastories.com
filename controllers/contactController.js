import Booking from '../models/Booking.js'
import { sendNotificationEmail } from '../config/mailer.js'
import logger from '../utils/logger.js'

export const submitBooking = async (req, res, next) => {
  try {
    const { name, phone, email, date, service, note } = req.body

    if (!name || !phone || !service) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ các thông tin bắt buộc (Họ tên, Số điện thoại, Gói dịch vụ).',
      })
    }

    let bookingRecord = null
    // 1. Lưu thông tin vào Database MySQL (nếu DB đang chạy)
    try {
      bookingRecord = await Booking.create({ name, phone, email, date, service, note })
      logger.info('Đã lưu thông tin đặt lịch vào MySQL:', { id: bookingRecord.id, name, phone, service })
    } catch (dbError) {
      logger.warn(`Không thể lưu vào MySQL (${dbError.message}). Đang tiếp tục gửi email...`)
    }

    // 2. Gửi email thông báo
    try {
      await sendNotificationEmail({ name, phone, email, date, service, note })
    } catch (mailError) {
      logger.warn(`Lỗi gửi mail thông báo (${mailError.message})`)
    }

    return res.json({
      success: true,
      message: 'Đặt lịch thành công! QA Stories sẽ liên hệ xác nhận với bạn trong thời gian sớm nhất.',
      data: bookingRecord,
    })
  } catch (error) {
    next(error)
  }
}

export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.getAll()
    res.json({ success: true, data: bookings })
  } catch (error) {
    next(error)
  }
}
