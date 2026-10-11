import pool from '../config/db.js'

export class Banner {
  static async ensureColumns() {
    try {
      const [cols] = await pool.query('SHOW COLUMNS FROM banners')
      const colNames = cols.map((c) => c.Field)
      if (!colNames.includes('device_type')) {
        await pool.query("ALTER TABLE banners ADD COLUMN device_type VARCHAR(20) DEFAULT 'all' AFTER subtitle")
      }
      if (!colNames.includes('image_mobile')) {
        await pool.query("ALTER TABLE banners ADD COLUMN image_mobile VARCHAR(500) NULL AFTER image_url")
      }
    } catch (e) {
      // Ignore if table does not exist yet or already updated
    }
  }

  static async getAll({ activeOnly = false, device = null } = {}) {
    await this.ensureColumns()
    let sql = activeOnly
      ? 'SELECT * FROM banners WHERE is_active = 1'
      : 'SELECT * FROM banners WHERE 1=1'
    const params = []

    if (device && device !== 'all') {
      sql += ' AND (device_type = ? OR device_type = "all" OR device_type IS NULL)'
      params.push(device)
    }

    sql += ' ORDER BY sort_order ASC, id DESC'
    const [rows] = await pool.query(sql, params)
    return rows
  }

  static async getById(id) {
    await this.ensureColumns()
    const [rows] = await pool.execute('SELECT * FROM banners WHERE id = ?', [id])
    return rows[0] || null
  }

  static async create({
    title,
    subtitle,
    device_type = 'all',
    image_url,
    image_mobile = null,
    link_url,
    button_text,
    sort_order = 0,
    is_active = 1,
  }) {
    await this.ensureColumns()
    const [result] = await pool.execute(
      'INSERT INTO banners (title, subtitle, device_type, image_url, image_mobile, link_url, button_text, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        title || null,
        subtitle || null,
        device_type || 'all',
        image_url,
        image_mobile || null,
        link_url || '/contact',
        button_text || 'Đặt Lịch Ngay',
        sort_order,
        is_active ? 1 : 0,
      ]
    )
    return {
      id: result.insertId,
      title,
      subtitle,
      device_type,
      image_url,
      image_mobile,
      link_url,
      button_text,
      sort_order,
      is_active,
    }
  }

  static async update(
    id,
    {
      title,
      subtitle,
      device_type = 'all',
      image_url,
      image_mobile = null,
      link_url,
      button_text,
      sort_order,
      is_active,
    }
  ) {
    await this.ensureColumns()
    const [result] = await pool.execute(
      'UPDATE banners SET title = ?, subtitle = ?, device_type = ?, image_url = ?, image_mobile = ?, link_url = ?, button_text = ?, sort_order = ?, is_active = ? WHERE id = ?',
      [
        title,
        subtitle,
        device_type || 'all',
        image_url,
        image_mobile || null,
        link_url,
        button_text,
        sort_order,
        is_active ? 1 : 0,
        id,
      ]
    )
    return result.affectedRows > 0
  }

  static async toggleActive(id, is_active) {
    const [result] = await pool.execute('UPDATE banners SET is_active = ? WHERE id = ?', [
      is_active ? 1 : 0,
      id,
    ])
    return result.affectedRows > 0
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM banners WHERE id = ?', [id])
    return result.affectedRows > 0
  }
}

export default Banner