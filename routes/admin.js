import express from 'express'
import { requireAdmin, requirePermission, requireSuperAdmin } from '../middlewares/auth.js'
import Booking from '../models/Booking.js'
import Admin from '../models/Admin.js'

const router = express.Router()

// ==========================================
// 1. BOOKINGS MANAGEMENT
// ==========================================
router.get('/bookings', requireAdmin, requirePermission('bookings'), async (req, res, next) => {
  try {
    const { status, search, limit = 100, offset = 0 } = req.query
    const bookings = await Booking.getAll({ status, search, limit, offset })
    const stats = await Booking.getStats()
    res.json({ success: true, data: bookings, stats })
  } catch (error) {
    next(error)
  }
})

router.put('/bookings/:id', requireAdmin, requirePermission('bookings'), async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, phone, email, date, shoot_time, service, note, preparation_notes, admin_notes, status } = req.body
    await Booking.update(id, { name, phone, email, date, shoot_time, service, note, preparation_notes, admin_notes, status })
    const updated = await Booking.getById(id)
    res.json({ success: true, message: 'Cập nhật thông tin lịch hẹn thành công', data: updated })
  } catch (error) {
    next(error)
  }
})

router.patch('/bookings/:id', requireAdmin, requirePermission('bookings'), async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, phone, email, date, shoot_time, service, note, preparation_notes, admin_notes, status } = req.body
    await Booking.update(id, { name, phone, email, date, shoot_time, service, note, preparation_notes, admin_notes, status })
    const updated = await Booking.getById(id)
    res.json({ success: true, message: 'Cập nhật thông tin lịch hẹn thành công', data: updated })
  } catch (error) {
    next(error)
  }
})

router.patch('/bookings/:id/status', requireAdmin, requirePermission('bookings'), async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body
    await Booking.updateStatus(id, status)
    res.json({ success: true, message: 'Cập nhật trạng thái thành công' })
  } catch (error) {
    next(error)
  }
})

router.delete('/bookings/:id', requireAdmin, requirePermission('bookings'), async (req, res, next) => {
  try {
    const { id } = req.params
    await Booking.delete(id)
    res.json({ success: true, message: 'Xóa lịch hẹn thành công' })
  } catch (error) {
    next(error)
  }
})

// ==========================================
// 2. USERS & PERMISSIONS MANAGEMENT
// ==========================================

// Lấy danh sách tất cả tài khoản quản trị
router.get('/users', requireAdmin, requirePermission('users'), async (req, res, next) => {
  try {
    const users = await Admin.getAll()
    res.json({ success: true, data: users })
  } catch (error) {
    next(error)
  }
})

// Lấy chi tiết tài khoản
router.get('/users/:id', requireAdmin, requirePermission('users'), async (req, res, next) => {
  try {
    const user = await Admin.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' })
    }
    res.json({ success: true, data: user })
  } catch (error) {
    next(error)
  }
})

// Tạo tài khoản mới
router.post('/users', requireAdmin, requirePermission('users'), async (req, res, next) => {
  try {
    const { username, password, full_name, email, phone, role, permissions, status } = req.body

    if (!username || !password || !full_name) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ tên đăng nhập, mật khẩu và họ tên',
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 6 ký tự',
      })
    }

    const existing = await Admin.findByUsername(username.trim())
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập này đã được sử dụng. Vui lòng chọn tên khác.',
      })
    }

    const newUser = await Admin.create({
      username: username.trim(),
      password,
      full_name: full_name.trim(),
      email: email ? email.trim() : null,
      phone: phone ? phone.trim() : null,
      role: role || 'staff',
      permissions: permissions || [],
      status: status || 'active',
    })

    res.status(201).json({
      success: true,
      message: 'Tạo tài khoản quản trị mới thành công',
      data: newUser,
    })
  } catch (error) {
    next(error)
  }
})

// Cập nhật thông tin & phân quyền tài khoản
router.put('/users/:id', requireAdmin, requirePermission('users'), async (req, res, next) => {
  try {
    const { id } = req.params
    const { full_name, email, phone, role, permissions, status } = req.body

    const targetUser = await Admin.findById(id)
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản cần sửa' })
    }

    // Không cho phép tài khoản không phải superadmin hạ quyền tài khoản superadmin gốc (id 1)
    if (Number(id) === 1 && req.admin.id !== 1 && req.admin.role !== 'superadmin') {
      return res.status(403).json({ success: false, message: 'Không thể chỉnh sửa tài khoản Super Admin gốc' })
    }

    await Admin.update(id, {
      full_name,
      email,
      phone,
      role,
      permissions,
      status,
    })

    const updated = await Admin.findById(id)
    res.json({
      success: true,
      message: 'Cập nhật tài khoản thành công',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
})

// Đổi mật khẩu cho người dùng
router.patch('/users/:id/password', requireAdmin, requirePermission('users'), async (req, res, next) => {
  try {
    const { id } = req.params
    const { newPassword } = req.body

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu mới phải có ít nhất 6 ký tự',
      })
    }

    const targetUser = await Admin.findById(id)
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản' })
    }

    await Admin.updatePassword(id, newPassword)
    res.json({
      success: true,
      message: `Đã đổi mật khẩu thành công cho tài khoản @${targetUser.username}`,
    })
  } catch (error) {
    next(error)
  }
})

// Đổi trạng thái hoạt động (khóa / mở khóa)
router.patch('/users/:id/status', requireAdmin, requirePermission('users'), async (req, res, next) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (Number(id) === Number(req.admin.id)) {
      return res.status(400).json({ success: false, message: 'Bạn không thể tự khóa tài khoản của chính mình' })
    }

    if (Number(id) === 1) {
      return res.status(400).json({ success: false, message: 'Không thể khóa tài khoản Super Admin gốc' })
    }

    await Admin.updateStatus(id, status)
    res.json({
      success: true,
      message: `Đã ${status === 'active' ? 'mở khóa' : 'tạm khóa'} tài khoản thành công`,
    })
  } catch (error) {
    next(error)
  }
})

// Xóa tài khoản
router.delete('/users/:id', requireAdmin, requireSuperAdmin, async (req, res, next) => {
  try {
    const { id } = req.params

    if (Number(id) === Number(req.admin.id)) {
      return res.status(400).json({ success: false, message: 'Bạn không thể tự xóa tài khoản của chính mình' })
    }

    if (Number(id) === 1) {
      return res.status(400).json({ success: false, message: 'Không thể xóa tài khoản Super Admin gốc' })
    }

    const targetUser = await Admin.findById(id)
    if (!targetUser) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản cần xóa' })
    }

    await Admin.delete(id)
    res.json({
      success: true,
      message: `Đã xóa tài khoản @${targetUser.username} thành công`,
    })
  } catch (error) {
    next(error)
  }
})

export default router
