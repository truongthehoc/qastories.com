import pool from '../config/db.js'

export class Advertisement {
  static async ensureTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`advertisements\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`title\` VARCHAR(255) NOT NULL,
          \`description\` TEXT NULL,
          \`media_type\` ENUM('image', 'video') DEFAULT 'image',
          \`media_url\` VARCHAR(500) NOT NULL,
          \`media_thumbnail\` VARCHAR(500) NULL,
          \`link_url\` VARCHAR(500) NULL,
          \`button_text\` VARCHAR(100) DEFAULT 'Xem Ngay',
          \`placement\` VARCHAR(50) DEFAULT 'popup' COMMENT 'popup, top_bar, floating_bottom_right, floating_bottom_left, in_page',
          \`target_pages\` VARCHAR(255) DEFAULT 'all' COMMENT 'all, home, album, about, contact',
          \`popup_delay\` INT DEFAULT 3 COMMENT 'Số giây chờ trước khi popup hiển thị',
          \`popup_duration\` INT DEFAULT 0 COMMENT 'Số giây hiển thị trước khi tự động đóng (0 = không tự đóng)',
          \`popup_frequency\` VARCHAR(50) DEFAULT 'once_per_session' COMMENT 'always, once_per_session, once_per_day',
          \`start_date\` DATETIME NULL,
          \`end_date\` DATETIME NULL,
          \`is_active\` TINYINT(1) DEFAULT 1,
          \`sort_order\` INT DEFAULT 0,
          \`views_count\` INT DEFAULT 0,
          \`clicks_count\` INT DEFAULT 0,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `)
    } catch (e) {
      // Table creation handled or already exists
    }
  }

  static async getAll({ activeOnly = false, placement = null, page = null } = {}) {
    await this.ensureTable()
    let sql = 'SELECT * FROM advertisements WHERE 1=1'
    const params = []

    if (activeOnly) {
      sql += ' AND is_active = 1'
      sql += ' AND (start_date IS NULL OR start_date <= NOW())'
      sql += ' AND (end_date IS NULL OR end_date >= NOW())'
    }

    if (placement && placement !== 'all') {
      sql += ' AND placement = ?'
      params.push(placement)
    }

    if (page && page !== 'all') {
      sql += ' AND (target_pages = "all" OR target_pages LIKE ?)'
      params.push(`%${page}%`)
    }

    sql += ' ORDER BY sort_order ASC, id DESC'
    const [rows] = await pool.query(sql, params)
    return rows
  }

  static async getById(id) {
    await this.ensureTable()
    const [rows] = await pool.execute('SELECT * FROM advertisements WHERE id = ?', [id])
    return rows[0] || null
  }

  static async create({
    title,
    description = null,
    media_type = 'image',
    media_url,
    media_thumbnail = null,
    link_url = null,
    button_text = 'Xem Ngay',
    placement = 'popup',
    target_pages = 'all',
    popup_delay = 3,
    popup_duration = 0,
    popup_frequency = 'once_per_session',
    start_date = null,
    end_date = null,
    sort_order = 0,
    is_active = 1,
  }) {
    await this.ensureTable()
    const [result] = await pool.execute(
      `INSERT INTO advertisements 
        (title, description, media_type, media_url, media_thumbnail, link_url, button_text, 
         placement, target_pages, popup_delay, popup_duration, popup_frequency, start_date, end_date, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        title,
        description,
        media_type,
        media_url,
        media_thumbnail,
        link_url,
        button_text,
        placement,
        target_pages,
        popup_delay,
        popup_duration,
        popup_frequency,
        start_date || null,
        end_date || null,
        sort_order,
        is_active,
      ]
    )
    return this.getById(result.insertId)
  }

  static async update(id, data) {
    await this.ensureTable()
    const fields = []
    const values = []

    const allowed = [
      'title',
      'description',
      'media_type',
      'media_url',
      'media_thumbnail',
      'link_url',
      'button_text',
      'placement',
      'target_pages',
      'popup_delay',
      'popup_duration',
      'popup_frequency',
      'start_date',
      'end_date',
      'sort_order',
      'is_active',
    ]

    for (const key of allowed) {
      if (data[key] !== undefined) {
        fields.push(`\`${key}\` = ?`)
        values.push(data[key] === '' ? null : data[key])
      }
    }

    if (fields.length === 0) return this.getById(id)

    values.push(id)
    await pool.execute(`UPDATE advertisements SET ${fields.join(', ')} WHERE id = ?`, values)
    return this.getById(id)
  }

  static async toggleActive(id) {
    await this.ensureTable()
    await pool.execute('UPDATE advertisements SET is_active = NOT is_active WHERE id = ?', [id])
    return this.getById(id)
  }

  static async delete(id) {
    await this.ensureTable()
    const [result] = await pool.execute('DELETE FROM advertisements WHERE id = ?', [id])
    return result.affectedRows > 0
  }

  static async trackView(id) {
    await this.ensureTable()
    await pool.execute('UPDATE advertisements SET views_count = views_count + 1 WHERE id = ?', [id])
  }

  static async trackClick(id) {
    await this.ensureTable()
    await pool.execute('UPDATE advertisements SET clicks_count = clicks_count + 1 WHERE id = ?', [id])
  }
}

export default Advertisement
