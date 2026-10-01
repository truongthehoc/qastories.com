import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'
import logger from '../utils/logger.js'

const JWT_SECRET = process.env.JWT_SECRET || 'qastories_secret_jwt_key_2026_super_secure'

export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu' })
    }

    const admin = await Admin.findByUsername(username)
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác' })
    }

    if (admin.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ Quản trị viên cấp cao.',
      })
    }

    const isValid = await Admin.verifyPassword(password, admin.password_hash)
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác' })
    }

    // Cập nhật last login
    await Admin.updateLastLogin(admin.id)

    // Tạo JWT Token (7 ngày)
    const token = jwt.sign(
      { id: admin.id, username: admin.username, role: admin.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    logger.info(`Admin ${admin.username} đăng nhập thành công`)

    return res.json({
      success: true,
      message: 'Đăng nhập thành công',
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        full_name: admin.full_name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        permissions: admin.permissions,
        status: admin.status,
      },
    })
  } catch (error) {
    next(error)
  }
}

export const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      admin: req.admin,
    })
  } catch (error) {
    next(error)
  }
}

export const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Vui lòng cung cấp mật khẩu cũ và mật khẩu mới' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có ít nhất 6 ký tự' })
    }

    const admin = await Admin.findByUsername(req.admin.username)
    const isValid = await Admin.verifyPassword(oldPassword, admin.password_hash)
    if (!isValid) {
      return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác' })
    }

    await Admin.updatePassword(req.admin.id, newPassword)
    res.json({ success: true, message: 'Đổi mật khẩu thành công' })
  } catch (error) {
    next(error)
  }
}

export const updateProfile = async (req, res, next) => {
  try {
    const { full_name, email } = req.body
    await Admin.updateProfile(req.admin.id, { full_name, email })
    res.json({ success: true, message: 'Cập nhật thông tin thành công' })
  } catch (error) {
    next(error)
  }
}
