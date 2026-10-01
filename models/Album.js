import pool from '../config/db.js'

export class Album {
  static async getAll({ category = null } = {}) {
    let sql = 'SELECT a.*, COUNT(p.id) as photo_count FROM albums a LEFT JOIN photos p ON a.id = p.album_id'
    const params = []

    if (category && category !== 'all') {
      sql += ' WHERE a.category = ?'
      params.push(category)
    }

    sql += ' GROUP BY a.id ORDER BY a.sort_order ASC, a.id DESC'
    const [rows] = await pool.query(sql, params)
    return rows
  }

  static async getBySlug(slug) {
    const isNum = !isNaN(slug) && !isNaN(parseFloat(slug))
    const [rows] = await pool.query('SELECT * FROM albums WHERE slug = ? OR id = ? LIMIT 1', [slug, isNum ? Number(slug) : 0])
    if (!rows[0]) return null
    const album = rows[0]
    const [photos] = await pool.query('SELECT * FROM photos WHERE album_id = ? ORDER BY sort_order ASC, id ASC', [album.id])
    album.photos = photos
    return album
  }

  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM albums WHERE id = ?', [id])
    if (!rows[0]) return null
    const album = rows[0]
    const [photos] = await pool.execute('SELECT * FROM photos WHERE album_id = ? ORDER BY sort_order ASC, id ASC', [album.id])
    album.photos = photos
    return album
  }

  static async create({ title, slug, category, category_label, cover_image, description, location, date_shot, package_name, story, is_featured = 1, sort_order = 0 }) {
    const [result] = await pool.execute(
      'INSERT INTO albums (title, slug, category, category_label, cover_image, description, location, date_shot, package_name, story, is_featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, slug, category, category_label || '', cover_image || null, description || null, location || null, date_shot || null, package_name || null, story || null, is_featured ? 1 : 0, sort_order]
    )
    return { id: result.insertId, title, slug, category, category_label, cover_image, description, location, date_shot, package_name, story, is_featured, sort_order }
  }

  static async update(id, { title, slug, category, category_label, cover_image, description, location, date_shot, package_name, story, is_featured, sort_order }) {
    const [result] = await pool.execute(
      'UPDATE albums SET title = ?, slug = ?, category = ?, category_label = ?, cover_image = ?, description = ?, location = ?, date_shot = ?, package_name = ?, story = ?, is_featured = ?, sort_order = ? WHERE id = ?',
      [title, slug, category, category_label, cover_image, description, location, date_shot, package_name, story, is_featured ? 1 : 0, sort_order, id]
    )
    return result.affectedRows > 0
  }

  static async delete(id) {
    const [result] = await pool.execute('DELETE FROM albums WHERE id = ?', [id])
    return result.affectedRows > 0
  }
}

export default Album
