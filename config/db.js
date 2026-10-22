import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'qastories',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

// Tự động kiểm tra và nâng cấp các cột cần thiết cho albums & photos khi máy chủ khởi động
export const ensureDbSchema = async () => {
  try {
    // 1. Kiểm tra bảng albums
    const [albumCols] = await pool.query('SHOW COLUMNS FROM albums')
    const albumFields = albumCols.map((c) => c.Field)

    if (!albumFields.includes('views')) {
      await pool.query('ALTER TABLE albums ADD COLUMN views INT DEFAULT 0 AFTER sort_order')
      console.log('✅ [MySQL Auto-Migration] Đã tự động thêm cột views vào bảng albums!')
    }
    if (!albumFields.includes('likes')) {
      await pool.query('ALTER TABLE albums ADD COLUMN likes INT DEFAULT 0 AFTER views')
      console.log('✅ [MySQL Auto-Migration] Đã tự động thêm cột likes vào bảng albums!')
    }

    // 2. Kiểm tra bảng photos
    const [photoCols] = await pool.query('SHOW COLUMNS FROM photos')
    const photoFields = photoCols.map((c) => c.Field)

    if (!photoFields.includes('likes')) {
      await pool.query('ALTER TABLE photos ADD COLUMN likes INT DEFAULT 0 AFTER sort_order')
      console.log('✅ [MySQL Auto-Migration] Đã tự động thêm cột likes vào bảng photos!')
    }

    // 3. Khởi tạo giá trị mặc định cho hiệu ứng website nếu chưa tồn tại
    await pool.query(`
      INSERT IGNORE INTO system_settings (setting_key, setting_value, setting_group) VALUES
      ('website_effect', 'none', 'effects'),
      ('website_effect_density', 'medium', 'effects'),
      ('website_effect_speed', 'normal', 'effects'),
      ('website_effect_mobile', '1', 'effects')
    `)

    return true
  } catch (error) {
    console.warn(`⚠️ [MySQL Auto-Migration] Lỗi nâng cấp bảng: ${error.message}`)
    return false
  }
}

// Kiểm tra kết nối MySQL khi khởi động và tự động đồng bộ schema
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('✅ [MySQL] Kết nối cơ sở dữ liệu MySQL thành công!')
    connection.release()
    await ensureDbSchema()
    return true
  } catch (error) {
    console.warn(`⚠️ [MySQL] Chưa thể kết nối tới MySQL (${error.message}). Vui lòng kiểm tra file .env hoặc chạy 'npm run setup:db'.`)
    return false
  }
}

export default pool
