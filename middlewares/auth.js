import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'

const JWT_SECRET = process.env.JWT_SECRET || 'qastories_secret_jwt_key_2026_super_secure'

export const requireAdmin = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Bạn chưa đăng nhập hoặc phiên làm việc đã hết hạn' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)

    const admin = await Admin.findById(decoded.id)
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Tài khoản quản trị không tồn tại' })
    }

    if (admin.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị tạm khóa. Vui lòng liên hệ Quản trị viên cấp cao.',
      })
    }

    req.admin = admin
    next()
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' })
  }
}

// Middleware kiểm tra quyền Super Admin
export const requireSuperAdmin = (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ success: false, message: 'Chưa xác thực quyền' })
  }

  if (req.admin.role === 'superadmin') {
    return next()
  }

  return res.status(403).json({
    success: false,
    message: 'Bạn không có quyền thực hiện thao tác này. Chỉ Super Admin mới có quyền quản trị.',
  })
}

// Middleware kiểm tra quyền truy cập module chi tiết
export const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Chưa xác thực quyền' })
    }

    if (req.admin.role === 'superadmin') {
      return next()
    }

    const userPerms = Array.isArray(req.admin.permissions) ? req.admin.permissions : []
    if (userPerms.includes(permission)) {
      return next()
    }

    return res.status(403).json({
      success: false,
      message: `Bạn không có quyền truy cập vào chức năng "${permission}". Vui lòng liên hệ quản trị viên.`,
    })
  }
}

export default requireAdmin
