import mysql from 'mysql2/promise'
import dotenv from 'dotenv'

dotenv.config()

async function cleanTestData() {
  console.log('🔄 Đang kết nối tới MySQL để dọn dẹp dữ liệu test...')

  const host = process.env.DB_HOST || 'localhost'
  const port = parseInt(process.env.DB_PORT || '3306', 10)
  const user = process.env.DB_USER || 'root'
  const password = process.env.DB_PASS || ''
  const dbName = process.env.DB_NAME || 'qastories'

  try {
    const connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      database: dbName,
      multipleStatements: true,
    })

    console.log(`✅ Kết nối thành công! Đang xóa toàn bộ dữ liệu test...`)

    // Tắt kiểm tra khóa ngoại tạm thời để xóa sạch dữ liệu
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;')

    await connection.query('TRUNCATE TABLE bookings;')
    console.log('  ✓ Đã xóa dữ liệu lịch hẹn (bookings)')

    await connection.query('TRUNCATE TABLE photos;')
    console.log('  ✓ Đã xóa danh sách ảnh (photos)')

    await connection.query('TRUNCATE TABLE albums;')
    console.log('  ✓ Đã xóa danh sách albums')

    await connection.query('TRUNCATE TABLE packages;')
    console.log('  ✓ Đã xóa danh sách gói chụp (packages)')

    await connection.query('TRUNCATE TABLE banners;')
    console.log('  ✓ Đã xóa danh sách banner (banners)')

    await connection.query('TRUNCATE TABLE page_views;')
    console.log('  ✓ Đã xóa thống kê lượt xem test (page_views)')

    // Bật lại kiểm tra khóa ngoại
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;')

    console.log('\n🎉 DỌN DẸP HOÀN TẤT!')
    console.log('🛡️ Tài khoản Quản trị viên (admins) và Cấu hình hệ thống (system_settings) vẫn được giữ nguyên an toàn 100%.')

    await connection.end()
    process.exit(0)
  } catch (error) {
    console.error('❌ Lỗi dọn dẹp database:', error.message)
    process.exit(1)
  }
}

cleanTestData()
