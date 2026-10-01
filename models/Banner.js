import pool from '../config/db.js'

export class Banner {
  static async getAll({ activeOnly = false } = {}) {
    const sql = activeOnly
      ? 'SELECT * FROM banners WHERE is_active = 1 ORDER BY sort_order ASC, id DESC'
      : 'SELECT * FROM banners ORDER BY sort_order ASC, id DESC'
    const [rows] = await pool.query(sql)
    return rows
  }

  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM banners WHERE id = ?', [id])
    return rows[0] || null
  }

  static async create({ title, subtitle, image_url, link_url, button_text, sort_order = 0, is_active = 1 }) {
    const [result] = await pool.execute(
      'INSERT INTO banners (title, subtitle, image_url, link_url, button_text, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title || null, subtitle || null, image_url, link_url || '/contact', button_text || 'Đặt Lịch Ngay', sort_order, is_active ? 1 : 0]
    )
    return { id: result.insertId, title, subtitle, image_url, link_url, button_text, sort_order, is_active }
  }

  static async update(id, { title, subtitle, image_url, link_url, button_text, sort_order, is_active }) {
    const [result] = await pool.execute(
      'UPDATE banners SET title = ?, subtitle = ?, image_url = ?, link_url = ?, button_text = ?, sort_order = ?, is_active = ? WHERE id = ?',
      [title, subtitle, image_url, link_url, button_text, sort_order, is_active ? 1 : 0, id]
    )
    return result.affectedRows > 0
  }

  static async toggleActive(id, is_active) {
    const [result] = await pool.execute('UPDATE banners SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id])
    return result.affectedRows > 0
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM banners WHERE id = ?', [id])
    return result.affectedRows > 0
  }
}

export default Banner