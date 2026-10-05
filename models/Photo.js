import pool from '../config/db.js'

export class Photo {
  static async getByAlbumId(albumId) {
    const [rows] = await pool.execute('SELECT * FROM photos WHERE album_id = ? ORDER BY sort_order ASC, id ASC', [albumId])
    return rows
  }

  static async create({ album_id, filename, original_name, size, url, title, description, sort_order = 0 }) {
    const [result] = await pool.execute(
      'INSERT INTO photos (album_id, filename, original_name, size, url, title, description, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [album_id, filename, original_name || '', size || 0, url, title || null, description || null, sort_order]
    )
    return { id: result.insertId, album_id, filename, original_name, size, url, title, description, sort_order }
  }

  static async createMany(photos = []) {
    if (!photos || photos.length === 0) return []
    const values = []
    const placeholders = photos.map(p => {
      values.push(p.album_id, p.filename || 'photo.webp', p.original_name || '', p.size || 0, p.url, p.title || null, p.description || null, p.sort_order || 0)
      return '(?, ?, ?, ?, ?, ?, ?, ?)'
    }).join(', ')

    await pool.query(
      `INSERT INTO photos (album_id, filename, original_name, size, url, title, description, sort_order) VALUES ${placeholders}`,
      values
    )
    return true
  }

  static async delete(id) {
    const [rows] = await pool.execute('SELECT * FROM photos WHERE id = ?', [id])
    const photo = rows[0] || null
    if (photo) {
      await pool.execute('DELETE FROM photos WHERE id = ?', [id])
    }
    return photo
  }

  static async updateOrder(id, sort_order) {
    await pool.execute('UPDATE photos SET sort_order = ? WHERE id = ?', [sort_order, id])
  }
}

export default Photo
