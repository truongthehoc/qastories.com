import pool from '../config/db.js'

export class Analytics {
  static async recordPageView({ path, title = '', ip_address = '', user_agent = '', device_type = 'desktop', referer = '' }) {
    try {
      await pool.execute(
        'INSERT INTO page_views (path, title, ip_address, user_agent, device_type, referer) VALUES (?, ?, ?, ?, ?, ?)',
        [path, title, ip_address, user_agent, device_type, referer]
      )
      return true
    } catch (e) {
      console.warn('Could not record page view:', e.message)
      return false
    }
  }

  static async getOverview() {
    const [[totalViews]] = await pool.query('SELECT COUNT(*) as count FROM page_views')
    const [[todayViews]] = await pool.query('SELECT COUNT(*) as count FROM page_views WHERE DATE(created_at) = CURDATE()')
    const [[weekViews]] = await pool.query('SELECT COUNT(*) as count FROM page_views WHERE created_at >= NOW() - INTERVAL 7 DAY')
    const [[monthViews]] = await pool.query('SELECT COUNT(*) as count FROM page_views WHERE created_at >= NOW() - INTERVAL 30 DAY')

    const [[totalBookings]] = await pool.query('SELECT COUNT(*) as count FROM bookings')
    const [[pendingBookings]] = await pool.query("SELECT COUNT(*) as count FROM bookings WHERE status = 'pending'")

    const [[totalAlbums]] = await pool.query('SELECT COUNT(*) as count FROM albums')
    const [[totalPhotos]] = await pool.query('SELECT COUNT(*) as count FROM photos')

    return {
      totalViews: totalViews?.count || 0,
      todayViews: todayViews?.count || 0,
      weekViews: weekViews?.count || 0,
      monthViews: monthViews?.count || 0,
      totalBookings: totalBookings?.count || 0,
      pendingBookings: pendingBookings?.count || 0,
      totalAlbums: totalAlbums?.count || 0,
      totalPhotos: totalPhotos?.count || 0,
    }
  }

  static async getDailyTraffic(days = 14) {
    const [rows] = await pool.query(`
      SELECT 
        DATE_FORMAT(created_at, '%Y-%m-%d') as date,
        COUNT(*) as views,
        COUNT(DISTINCT ip_address) as unique_visitors
      FROM page_views
      WHERE created_at >= NOW() - INTERVAL ? DAY
      GROUP BY DATE_FORMAT(created_at, '%Y-%m-%d')
      ORDER BY date ASC
    `, [Number(days)])
    return rows
  }

  static async getTopPages(limit = 10) {
    const [rows] = await pool.query(`
      SELECT 
        path,
        MAX(title) as title,
        COUNT(*) as views,
        COUNT(DISTINCT ip_address) as unique_visitors
      FROM page_views
      GROUP BY path
      ORDER BY views DESC
      LIMIT ?
    `, [Number(limit)])
    return rows
  }

  static async getDeviceBreakdown() {
    const [rows] = await pool.query(`
      SELECT 
        device_type,
        COUNT(*) as count
      FROM page_views
      GROUP BY device_type
    `)
    return rows
  }

  static async getRecentLogs(limit = 20) {
    const [rows] = await pool.query(`
      SELECT * FROM page_views ORDER BY created_at DESC LIMIT ?
    `, [Number(limit)])
    return rows
  }
}

export default Analytics
