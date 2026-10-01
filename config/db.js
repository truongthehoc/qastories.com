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

// Kiểm tra kết nối MySQL khi khởi động
export const testConnection = async () => {
  try {
    const connection = await pool.getConnection()
    console.log('✅ [MySQL] Kết nối cơ sở dữ liệu MySQL thành công!')
    connection.release()
    return true
  } catch (error) {
    console.warn(`⚠️ [MySQL] Chưa thể kết nối tới MySQL (${error.message}). Vui lòng kiểm tra file .env hoặc chạy 'npm run setup:db'.`)
    return false
  }
}

export default pool
