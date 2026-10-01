import pool from '../config/db.js'

export class Package {
  static async ensureTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS \`packages\` (
          \`id\` INT AUTO_INCREMENT PRIMARY KEY,
          \`name\` VARCHAR(255) NOT NULL,
          \`slug\` VARCHAR(255) NULL,
          \`price\` DECIMAL(15, 0) DEFAULT 0,
          \`description\` TEXT NULL,
          \`is_active\` TINYINT(1) DEFAULT 1,
          \`sort_order\` INT DEFAULT 0,
          \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `)
    } catch (err) {
      console.warn('⚠️ Lỗi khởi tạo bảng packages:', err.message)
    }
  }

  static async getAll({ is_active = null } = {}) {
    await this.ensureTable()
    let sql = 'SELECT * FROM `packages` WHERE 1=1'
    const params = []

    if (is_active !== null && is_active !== undefined && is_active !== 'all') {
      sql += ' AND is_active = ?'
      params.push(is_active === true || is_active === '1' || is_active === 1 ? 1 : 0)
    }

    sql += ' ORDER BY sort_order ASC, id ASC'
    const [rows] = await pool.query(sql, params)
    return rows
  }

  static async getById(id) {
    await this.ensureTable()
    const [rows] = await pool.execute('SELECT * FROM `packages` WHERE id = ?', [id])
    return rows[0] || null
  }

  static async create({
    name,
    slug = '',
    price = 0,
    description = '',
    is_active = 1,
    sort_order = 0,
  }) {
    await this.ensureTable()
    const [result] = await pool.execute(
      `INSERT INTO \`packages\` (name, slug, price, description, is_active, sort_order)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        name,
        slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        price ? Number(price) : 0,
        description || '',
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        sort_order ? Number(sort_order) : 0,
      ]
    )
    return {
      id: result.insertId,
      name,
      slug,
      price,
      description,
      is_active,
      sort_order,
    }
  }

  static async update(id, {
    name,
    slug = '',
    price = 0,
    description = '',
    is_active = 1,
    sort_order = 0,
  }) {
    await this.ensureTable()
    const [result] = await pool.execute(
      `UPDATE \`packages\` SET
        name = ?,
        slug = ?,
        price = ?,
        description = ?,
        is_active = ?,
        sort_order = ?
       WHERE id = ?`,
      [
        name,
        slug || name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        price ? Number(price) : 0,
        description || '',
        is_active ? 1 : 0,
        sort_order ? Number(sort_order) : 0,
        id,
      ]
    )
    return result.affectedRows > 0
  }

  static async delete(id) {
    await this.ensureTable()
    const [result] = await pool.execute('DELETE FROM `packages` WHERE id = ?', [id])
    return result.affectedRows > 0
  }
}

export default Package
