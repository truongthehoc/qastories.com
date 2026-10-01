import pool from '../config/db.js'
import bcrypt from 'bcryptjs'

export class Admin {
  // Tìm theo username (bao gồm cả password_hash để đăng nhập)
  static async findByUsername(username) {
    const [rows] = await pool.execute('SELECT * FROM admins WHERE username = ?', [username])
    if (!rows[0]) return null
    return this.formatUser(rows[0])
  }

  // Tìm theo ID (an toàn không trả password_hash)
  static async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, username, full_name, email, phone, role, permissions, status, avatar, created_at, last_login FROM admins WHERE id = ?',
      [id]
    )
    if (!rows[0]) return null
    return this.formatUser(rows[0])
  }

  // Lấy toàn bộ danh sách tài khoản
  static async getAll() {
    const [rows] = await pool.query(
      'SELECT id, username, full_name, email, phone, role, permissions, status, avatar, created_at, last_login FROM admins ORDER BY id ASC'
    )
    return rows.map((u) => this.formatUser(u))
  }

  // Tạo tài khoản mới
  static async create({ username, password, full_name, email, phone, role = 'staff', permissions = [], status = 'active' }) {
    const hash = await bcrypt.hash(password, 10)
    const permsJson = typeof permissions === 'string' ? permissions : JSON.stringify(permissions || [])

    const [result] = await pool.execute(
      `INSERT INTO admins (username, password_hash, full_name, email, phone, role, permissions, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [username.trim(), hash, full_name.trim(), email ? email.trim() : null, phone ? phone.trim() : null, role, permsJson, status]
    )

    return await this.findById(result.insertId)
  }

  // Cập nhật thông tin tài khoản
  static async update(id, { full_name, email, phone, role, permissions, status }) {
    const fields = []
    const values = []

    if (full_name !== undefined) { fields.push('full_name = ?'); values.push(full_name.trim()) }
    if (email !== undefined) { fields.push('email = ?'); values.push(email ? email.trim() : null) }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone ? phone.trim() : null) }
    if (role !== undefined) { fields.push('role = ?'); values.push(role) }
    if (permissions !== undefined) {
      const permsJson = typeof permissions === 'string' ? permissions : JSON.stringify(permissions || [])
      fields.push('permissions = ?')
      values.push(permsJson)
    }
    if (status !== undefined) { fields.push('status = ?'); values.push(status) }

    if (fields.length === 0) return true

    values.push(id)
    const sql = `UPDATE admins SET ${fields.join(', ')} WHERE id = ?`
    const [result] = await pool.execute(sql, values)
    return result.affectedRows > 0
  }

  // Cập nhật trạng thái kích hoạt
  static async updateStatus(id, status) {
    const [result] = await pool.execute('UPDATE admins SET status = ? WHERE id = ?', [status, id])
    return result.affectedRows > 0
  }

  // Đổi mật khẩu
  static async updatePassword(id, newPassword) {
    const hash = await bcrypt.hash(newPassword, 10)
    const [result] = await pool.execute('UPDATE admins SET password_hash = ? WHERE id = ?', [hash, id])
    return result.affectedRows > 0
  }

  // Cập nhật hồ sơ cá nhân
  static async updateProfile(id, { full_name, email, phone }) {
    const [result] = await pool.execute(
      'UPDATE admins SET full_name = ?, email = ?, phone = ? WHERE id = ?',
      [full_name, email || null, phone || null, id]
    )
    return result.affectedRows > 0
  }

  // Xóa tài khoản
  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM admins WHERE id = ?', [id])
    return result.affectedRows > 0
  }

  // Xác thực mật khẩu
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword)
  }

  // Cập nhật lần đăng nhập cuối
  static async updateLastLogin(id) {
    await pool.execute('UPDATE admins SET last_login = NOW() WHERE id = ?', [id])
  }

  // Helper format user object & parse permissions JSON
  static formatUser(user) {
    if (!user) return null
    let parsedPermissions = []
    if (user.permissions) {
      if (Array.isArray(user.permissions)) {
        parsedPermissions = user.permissions
      } else if (typeof user.permissions === 'string') {
        try {
          parsedPermissions = JSON.parse(user.permissions)
        } catch {
          parsedPermissions = []
        }
      }
    } else if (user.role === 'superadmin') {
      parsedPermissions = [
        'dashboard',
        'bookings',
        'albums',
        'packages',
        'banners',
        'about',
        'quick-access',
        'analytics',
        'settings',
        'users',
      ]
    }

    return {
      ...user,
      permissions: parsedPermissions,
    }
  }
}

export default Admin
