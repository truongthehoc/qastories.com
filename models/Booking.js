import pool from '../config/db.js'

export class Booking {
  // Tạo đặt lịch mới
  static async create({ name, phone, email, date, service, note }) {
    const sql = `
      INSERT INTO bookings (name, phone, email, date, service, note, status)
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
    `
    const [result] = await pool.execute(sql, [
      name,
      phone,
      email || null,
      date || null,
      service,
      note || null,
    ])
    return {
      id: result.insertId,
      name,
      phone,
      email,
      date,
      service,
      note,
      status: 'pending',
    }
  }

  // Lấy danh sách đặt lịch với bộ lọc, tìm kiếm và phân trang
  static async getAll({ status = null, search = null, limit = 100, offset = 0 } = {}) {
    let sql = 'SELECT * FROM bookings WHERE 1=1'
    const params = []

    if (status && status !== 'all') {
      sql += ' AND status = ?'
      params.push(status)
    }

    if (search && search.trim()) {
      sql += ' AND (name LIKE ? OR phone LIKE ? OR email LIKE ? OR service LIKE ?)'
      const term = `%${search.trim()}%`
      params.push(term, term, term, term)
    }

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?'
    params.push(Number(limit), Number(offset))

    const [rows] = await pool.query(sql, params)
    return rows
  }

  // Đếm tổng số lượng theo trạng thái
  static async getStats() {
    const [rows] = await pool.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as confirmed,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled
      FROM bookings
    `)
    return rows[0] || { total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 }
  }

  // Lấy chi tiết đặt lịch theo ID
  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM bookings WHERE id = ?', [id])
    return rows[0] || null
  }

  // Cập nhật trạng thái
  static async updateStatus(id, status) {
    const [result] = await pool.execute(
      'UPDATE bookings SET status = ? WHERE id = ?',
      [status, id]
    )
    return result.affectedRows > 0
  }

  // Cập nhật đầy đủ chi tiết lịch hẹn (thời gian chụp, đồ cần chuẩn bị, ghi chú studio)
  static async update(id, { name, phone, email, date, shoot_time, service, note, preparation_notes, admin_notes, status }) {
    const fields = []
    const values = []

    if (name !== undefined) { fields.push('name = ?'); values.push(name) }
    if (phone !== undefined) { fields.push('phone = ?'); values.push(phone) }
    if (email !== undefined) { fields.push('email = ?'); values.push(email) }
    if (date !== undefined) { fields.push('date = ?'); values.push(date) }
    if (shoot_time !== undefined) { fields.push('shoot_time = ?'); values.push(shoot_time) }
    if (service !== undefined) { fields.push('service = ?'); values.push(service) }
    if (note !== undefined) { fields.push('note = ?'); values.push(note) }
    if (preparation_notes !== undefined) { fields.push('preparation_notes = ?'); values.push(preparation_notes) }
    if (admin_notes !== undefined) { fields.push('admin_notes = ?'); values.push(admin_notes) }
    if (status !== undefined) { fields.push('status = ?'); values.push(status) }

    if (fields.length === 0) return true

    values.push(id)
    const sql = `UPDATE bookings SET ${fields.join(', ')} WHERE id = ?`
    const [result] = await pool.execute(sql, values)
    return result.affectedRows > 0
  }

  // Xóa đặt lịch
  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM bookings WHERE id = ?', [id])
    return result.affectedRows > 0
  }
}

// Tự động kiểm tra và thêm các cột nâng cao cho bảng bookings nếu chưa có
async function initBookingTableColumns() {
  try {
    const [cols] = await pool.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'bookings'
    `)
    const colNames = (cols || []).map(c => c.COLUMN_NAME.toLowerCase())

    if (!colNames.includes('shoot_time')) {
      await pool.query('ALTER TABLE bookings ADD COLUMN shoot_time VARCHAR(100) NULL COMMENT "Khung giờ chụp cụ thể"')
    }
    if (!colNames.includes('preparation_notes')) {
      await pool.query('ALTER TABLE bookings ADD COLUMN preparation_notes TEXT NULL COMMENT "Thứ cần chuẩn bị, trang phục, concept"')
    }
    if (!colNames.includes('admin_notes')) {
      await pool.query('ALTER TABLE bookings ADD COLUMN admin_notes TEXT NULL COMMENT "Ghi chú nội bộ studio"')
    }
  } catch (e) {
    // MySQL table check pass
  }
}

initBookingTableColumns()

export default Booking
