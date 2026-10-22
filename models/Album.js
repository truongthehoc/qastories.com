import pool from '../config/db.js'

export class Album {
  static async getAll({ category = null, featured = false, sortBy = 'default' } = {}) {
    let sql = 'SELECT a.*, COUNT(p.id) as photo_count FROM albums a LEFT JOIN photos p ON a.id = p.album_id'
    const params = []
    const whereClauses = []

    if (category && category !== 'all') {
      whereClauses.push('a.category = ?')
      params.push(category)
    }

    if (whereClauses.length > 0) {
      sql += ' WHERE ' + whereClauses.join(' AND ')
    }

    sql += ' GROUP BY a.id'

    if (featured || sortBy === 'trending' || sortBy === 'popular') {
      // Đề xuất tự động lên đầu: Ưu tiên theo điểm thịnh hành kết hợp lượt tym và lượt xem
      sql += ' ORDER BY (COALESCE(a.is_featured, 0) * 100 + COALESCE(a.likes, 0) * 10 + COALESCE(a.views, 0)) DESC, a.sort_order ASC, a.id DESC'
    } else if (sortBy === 'likes') {
      sql += ' ORDER BY a.likes DESC, a.views DESC, a.sort_order ASC, a.id DESC'
    } else if (sortBy === 'views') {
      sql += ' ORDER BY a.views DESC, a.likes DESC, a.sort_order ASC, a.id DESC'
    } else {
      sql += ' ORDER BY a.sort_order ASC, a.id DESC'
    }

    const [rows] = await pool.query(sql, params)
    return rows
  }

  static async getBySlug(slug) {
    const isNum = !isNaN(slug) && !isNaN(parseFloat(slug))
    const [rows] = await pool.query('SELECT * FROM albums WHERE slug = ? OR id = ? LIMIT 1', [slug, isNum ? Number(slug) : 0])
    if (!rows[0]) return null
    const album = rows[0]
    // Tấm hình thuộc album được nhiều tym sẽ được xếp thứ tự tự động lên đầu album
    const [photos] = await pool.query('SELECT * FROM photos WHERE album_id = ? ORDER BY likes DESC, sort_order ASC, id ASC', [album.id])
    album.photos = photos
    return album
  }

  static async getById(id) {
    const [rows] = await pool.execute('SELECT * FROM albums WHERE id = ?', [id])
    if (!rows[0]) return null
    const album = rows[0]
    // Tấm hình thuộc album được nhiều tym sẽ được xếp thứ tự tự động lên đầu album
    const [photos] = await pool.execute('SELECT * FROM photos WHERE album_id = ? ORDER BY likes DESC, sort_order ASC, id ASC', [album.id])
    album.photos = photos
    return album
  }

  static async incrementViews(id) {
    const isNum = !isNaN(id) && !isNaN(parseFloat(id))
    const where = isNum ? 'id = ?' : 'slug = ?'
    await pool.execute(`UPDATE albums SET views = COALESCE(views, 0) + 1 WHERE ${where}`, [id])
    const [rows] = await pool.execute(`SELECT id, slug, views, likes FROM albums WHERE ${where}`, [id])
    return rows[0] || null
  }

  static async toggleLike(id, action = 'like') {
    const isNum = !isNaN(id) && !isNaN(parseFloat(id))
    const where = isNum ? 'id = ?' : 'slug = ?'
    if (action === 'unlike') {
      await pool.execute(`UPDATE albums SET likes = GREATEST(0, COALESCE(likes, 0) - 1) WHERE ${where}`, [id])
    } else {
      await pool.execute(`UPDATE albums SET likes = COALESCE(likes, 0) + 1 WHERE ${where}`, [id])
    }
    const [rows] = await pool.execute(`SELECT id, slug, views, likes FROM albums WHERE ${where}`, [id])
    return rows[0] || null
  }

  static async create({ title, slug, category, category_label, cover_image, description, location, date_shot, package_name, story, is_featured = 1, sort_order = 0 }) {
    const [result] = await pool.execute(
      'INSERT INTO albums (title, slug, category, category_label, cover_image, description, location, date_shot, package_name, story, is_featured, sort_order, views, likes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0)',
      [title, slug, category, category_label || '', cover_image || null, description || null, location || null, date_shot || null, package_name || null, story || null, is_featured ? 1 : 0, sort_order]
    )
    return { id: result.insertId, title, slug, category, category_label, cover_image, description, location, date_shot, package_name, story, is_featured, sort_order, views: 0, likes: 0 }
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
