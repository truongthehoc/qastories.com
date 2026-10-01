import mysql from 'mysql2/promise'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

async function setupDatabase() {
  console.log('🔄 Đang kết nối tới MySQL server...')

  const host = process.env.DB_HOST || 'localhost'
  const port = parseInt(process.env.DB_PORT || '3306', 10)
  const user = process.env.DB_USER || 'root'
  const password = process.env.DB_PASS || ''
  const dbName = process.env.DB_NAME || 'qastories'

  let connection
  try {
    // 1. Kết nối không cần DB trước
    connection = await mysql.createConnection({
      host,
      port,
      user,
      password,
      multipleStatements: true,
    })

    console.log(`✅ Đã kết nối tới MySQL (${host}:${port}) thành công!`)

    // 2. Đọc file schema.sql
    const schemaPath = path.join(__dirname, 'database', 'schema.sql')
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`Không tìm thấy file schema tại: ${schemaPath}`)
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8')

    // 3. Thực thi các câu lệnh tạo database & bảng
    console.log(`🔄 Đang khởi tạo Database '${dbName}' và các bảng dữ liệu...`)
    await connection.query(schemaSql)

    // Chọn DB
    await connection.query(`USE \`${dbName}\`;`)

    // Đảm bảo nâng cấp cột cho bảng albums nếu đã tồn tại trước đó
    try {
      const [albumCols] = await connection.query(`SHOW COLUMNS FROM albums`)
      const colNames = albumCols.map(c => c.Field)
      if (!colNames.includes('category_label')) {
        await connection.query(`ALTER TABLE albums ADD COLUMN category_label VARCHAR(100) NULL AFTER category`)
      }
      if (!colNames.includes('location')) {
        await connection.query(`ALTER TABLE albums ADD COLUMN location VARCHAR(255) NULL AFTER description`)
      }
      if (!colNames.includes('date_shot')) {
        await connection.query(`ALTER TABLE albums ADD COLUMN date_shot VARCHAR(100) NULL AFTER location`)
      }
      if (!colNames.includes('package_name')) {
        await connection.query(`ALTER TABLE albums ADD COLUMN package_name VARCHAR(255) NULL AFTER date_shot`)
      }
      if (!colNames.includes('story')) {
        await connection.query(`ALTER TABLE albums ADD COLUMN story TEXT NULL AFTER package_name`)
      }
      if (!colNames.includes('is_featured')) {
        await connection.query(`ALTER TABLE albums ADD COLUMN is_featured TINYINT(1) DEFAULT 1 AFTER story`)
      }
      if (!colNames.includes('sort_order')) {
        await connection.query(`ALTER TABLE albums ADD COLUMN sort_order INT DEFAULT 0 AFTER is_featured`)
      }
      if (!colNames.includes('updated_at')) {
        await connection.query(`ALTER TABLE albums ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`)
      }
    } catch (e) {
      // Ignore if table was just created
    }

    // Đảm bảo nâng cấp cột cho bảng photos nếu đã tồn tại trước đó
    try {
      const [photoCols] = await connection.query(`SHOW COLUMNS FROM photos`)
      const pColNames = photoCols.map(c => c.Field)
      if (!pColNames.includes('title')) {
        await connection.query(`ALTER TABLE photos ADD COLUMN title VARCHAR(255) NULL AFTER url`)
      }
      if (!pColNames.includes('description')) {
        await connection.query(`ALTER TABLE photos ADD COLUMN description TEXT NULL AFTER title`)
      }
      if (!pColNames.includes('sort_order')) {
        await connection.query(`ALTER TABLE photos ADD COLUMN sort_order INT DEFAULT 0 AFTER description`)
      }
    } catch (e) {
      // Ignore
    }

    // 4. Seed Admin mặc định
    const [existingAdmins] = await connection.query('SELECT id FROM admins WHERE username = ?', ['admin'])
    if (existingAdmins.length === 0) {
      const passwordHash = await bcrypt.hash('admin@123', 10)
      await connection.query(
        'INSERT INTO admins (username, password_hash, full_name, email, role) VALUES (?, ?, ?, ?, ?)',
        ['admin', passwordHash, 'Quản Trị Viên QA Stories', 'admin@qastories.vn', 'superadmin']
      )
      console.log('👤 [Seed] Đã tạo tài khoản Admin mặc định: (Tài khoản: admin | Mật khẩu: admin@123)')
    }

    // 5. Seed System Settings
    const defaultSettings = [
      { key: 'brand_name', value: 'QA Stories', group: 'branding' },
      { key: 'brand_slogan', value: 'Studio Lưu Giữ Khoảnh Khắc Thiên Thần Của Bé', group: 'branding' },
      { key: 'brand_logo', value: '', group: 'branding' },
      { key: 'brand_phone', value: '0901 234 567', group: 'contact' },
      { key: 'brand_email', value: 'hello@qastories.vn', group: 'contact' },
      { key: 'brand_address', value: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh', group: 'contact' },
      { key: 'brand_maps_url', value: 'https://maps.google.com', group: 'contact' },
      { key: 'brand_facebook', value: 'https://facebook.com', group: 'social' },
      { key: 'brand_instagram', value: 'https://instagram.com', group: 'social' },
      { key: 'brand_youtube', value: 'https://youtube.com', group: 'social' },
      { key: 'brand_zalo', value: 'https://zalo.me/0901234567', group: 'social' },
      { key: 'brand_tiktok', value: 'https://tiktok.com', group: 'social' },
      { key: 'about_story_title', value: 'Nhiếp ảnh là cách mình lưu giữ linh hồn của khoảnh khắc.', group: 'about' },
      { key: 'about_story_p1', value: 'Chào bạn, mình là Min — một người say mê nhiếp ảnh và cái đẹp từ những điều dung dị nhất. Mình hiện đang sống và làm việc tại Bình Dương, chuyên về ảnh em bé, chân dung ngoài trời (ngoại cảnh).', group: 'about' },
      { key: 'about_story_p2', value: 'Đối với mình, mỗi buổi chụp không đơn thuần là một buổi làm việc, mà là cuộc gặp gỡ, trò chuyện và cùng tạo nên những kỷ niệm đẹp qua từng bức ảnh.', group: 'about' },
      { key: 'about_image', value: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=900&q=85', group: 'about' },
      { key: 'seo_title', value: 'QA Stories - Studio Chụp Ảnh Bé & Gia Đình Chuyên Nghiệp', group: 'seo' },
      { key: 'seo_description', value: 'Studio chụp ảnh sơ sinh newborn, thôi nôi, 100 ngày tuổi và gia đình uy tín với phong cách nghệ thuật, ánh sáng tự nhiên.', group: 'seo' },
      { key: 'seo_keywords', value: 'chụp ảnh em bé, chụp ảnh newborn, chụp thôi nôi, studio bé, QA stories', group: 'seo' },
    ]

    for (const setting of defaultSettings) {
      await connection.query(
        'INSERT IGNORE INTO system_settings (setting_key, setting_value, setting_group) VALUES (?, ?, ?)',
        [setting.key, setting.value, setting.group]
      )
    }
    console.log('⚙️ [Seed] Đã khởi tạo cấu hình hệ thống & nhận diện thương hiệu mặc định')

    // 6. Seed Banners
    const [existingBanners] = await connection.query('SELECT id FROM banners LIMIT 1')
    if (existingBanners.length === 0) {
      const banners = [
        {
          title: 'Khoảnh Khắc Đầu Đời Tuyệt Vời',
          subtitle: 'Gói chụp ảnh Newborn & Sơ sinh an toàn, nghệ thuật chuẩn quốc tế',
          image_url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1920&q=85',
          link_url: '/contact',
          button_text: 'Đặt Lịch Ngay',
          sort_order: 1,
        },
        {
          title: 'Nụ Cười Trong Trẻo 100 Ngày Tuổi',
          subtitle: 'Lưu giữ nét ngây thơ và đôi mắt tròn xoe ngơ ngác của bé yêu',
          image_url: 'https://images.unsplash.com/photo-1546015720-b8b30df5aa27?w=1920&q=85',
          link_url: '/album',
          button_text: 'Xem Bộ Sưu Tập',
          sort_order: 2,
        },
        {
          title: 'Gia Đình Là Nơi Tình Yêu Bắt Đầu',
          subtitle: 'Bức tranh hạnh phúc trọn vẹn và sợi dây gắn kết thiêng liêng',
          image_url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1920&q=85',
          link_url: '/contact',
          button_text: 'Tư Vấn Gói Chụp',
          sort_order: 3,
        },
      ]
      for (const b of banners) {
        await connection.query(
          'INSERT INTO banners (title, subtitle, image_url, link_url, button_text, sort_order) VALUES (?, ?, ?, ?, ?, ?)',
          [b.title, b.subtitle, b.image_url, b.link_url, b.button_text, b.sort_order]
        )
      }
      console.log('🖼️ [Seed] Đã tạo 3 Banner Slider trang chủ mẫu')
    }

    // 7. Seed Albums & Photos
    const [existingAlbums] = await connection.query('SELECT id FROM albums LIMIT 1')
    if (existingAlbums.length === 0) {
      const albumsSeed = [
        {
          title: 'Bé Khôi 7 Ngày Tuổi',
          slug: 'be-khoi-7-ngay-tuoi',
          category: 'newborn',
          category_label: 'Sơ Sinh (Newborn)',
          cover_image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1200&q=85',
          description: 'Concept kén ấm áp với tone màu be sữa tự nhiên',
          location: 'QA Stories Studio - Phòng Newborn UV',
          date_shot: 'Tháng 9/2026',
          package_name: 'Gói Chụp Sơ Sinh (Newborn 0 - 30 ngày)',
          story: 'Bộ ảnh sơ sinh của bé Khôi được thực hiện lúc bé vừa tròn 7 ngày tuổi. Với concept kén ngủ phong cách tối giản Bắc Âu, phòng chụp duy trì nhiệt độ ấm áp 28°C cùng ánh sáng tự nhiên dịu nhẹ để giữ trọn những nét ngây thơ, giấc ngủ bình yên đầu đời của con.',
          photos: [
            { url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1600&q=85', title: 'Giấc ngủ kén thiên thần', description: 'Bé Khôi say ngủ trong chiếc khăn len mềm mịn' },
            { url: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=1600&q=85', title: 'Bàn chân nhỏ xinh', description: 'Từng ngón chân bé xíu đáng yêu trong lòng bàn tay bố' },
            { url: 'https://images.unsplash.com/photo-1546015720-b8b30df5aa27?w=1600&q=85', title: 'Chiếc giỏ mây vintage', description: 'Concept giỏ mây mộc mạc cùng hoa khô tự nhiên' },
            { url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1600&q=85', title: 'Vòng tay của mẹ', description: 'Cảm xúc thiêng liêng ấm áp khi mẹ ôm con vào lòng' },
            { url: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=1600&q=85', title: 'Nụ cười trong mơ', description: 'Khoảnh khắc bé hé nụ cười thiên thần lúc say giấc' },
            { url: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=1600&q=85', title: 'Gia đình sum vầy', description: 'Bức tranh hạnh phúc trọn vẹn của cả gia đình' },
          ],
        },
        {
          title: 'Bé An Nhiên Tròn 100 Ngày',
          slug: 'be-an-nhien-tron-100-ngay',
          category: '100days',
          category_label: '100 Ngày Tuổi',
          cover_image: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=1200&q=85',
          description: 'Nụ cười tỏa nắng và ánh mắt trong trẻo biết giao tiếp',
          location: 'QA Stories Studio - Concept Pastel',
          date_shot: 'Tháng 8/2026',
          package_name: 'Gói Chụp 100 Ngày Tuổi',
          story: 'Cột mốc 100 ngày tuổi đánh dấu giai đoạn bé bắt đầu biết lẫy, ngẩng cao đầu và nở những nụ cười tương tác rạng rỡ với bố mẹ. Bộ ảnh sử dụng tone màu pastel tươi sáng, bắt trọn từng biểu cảm đáng yêu và đôi mắt tròn xoe ngơ ngác của bé An Nhiên.',
          photos: [
            { url: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=1600&q=85', title: 'Tập lẫy đầu đời', description: 'Bé An Nhiên tự tin ngẩng đầu cười tươi' },
            { url: 'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1600&q=85', title: 'Đôi mắt thiên thần', description: 'Ánh mắt tò mò nhìn ngắm thế giới xung quanh' },
            { url: 'https://images.unsplash.com/photo-1561583375-5b5a0b8d4a27?w=1600&q=85', title: 'Mũ len quả bông xinh xắn', description: 'Trang phục hữu cơ mềm mịn dịu êm cho làn da bé' },
            { url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1600&q=85', title: 'Khoảnh khắc ngáp ngủ', description: 'Biểu cảm tự nhiên ngộ nghĩnh không thể đáng yêu hơn' },
            { url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1600&q=85', title: 'Cùng mẹ vui đùa', description: 'Tiếng cười giòn tan trong buổi chụp ảnh' },
          ],
        },
        {
          title: 'Tiệc Thôi Nôi Bé Gia Nam',
          slug: 'thoi-noi-be-gia-nam',
          category: '1year',
          category_label: 'Thôi Nôi 1 Tuổi',
          cover_image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&q=85',
          description: 'Bánh kem sinh nhật và những bước chân đầu đời rực rỡ',
          location: 'QA Stories Studio - Concept Smash Cake',
          date_shot: 'Tháng 8/2026',
          package_name: 'Gói Chụp Sinh Nhật Thôi Nôi (1 Tuổi)',
          story: 'Sinh nhật 1 tuổi là dấu mốc quan trọng khi bé chập chững những bước đi đầu đời. Ekip đã chuẩn bị một concept Smash Cake rực rỡ với bóng bay, bánh sinh nhật organic và những đạo cụ đồ chơi an toàn để bé thỏa sức khám phá và bộc lộ tính cách.',
          photos: [
            { url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1600&q=85', title: 'Sinh nhật 1 tuổi rực rỡ', description: 'Bé Gia Nam bên chiếc bánh kem thôi nôi' },
            { url: 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=1600&q=85', title: 'Những bước đi chập chững', description: 'Từng bước chân khám phá không gian tràn ngập niềm vui' },
            { url: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=1600&q=85', title: 'Nghịch ngợm cùng đồ chơi', description: 'Nét tinh nghịch, đáng yêu vô cùng sống động' },
            { url: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=1600&q=85', title: 'Bố mẹ chúc mừng sinh nhật', description: 'Nụ hôn yêu thương trao gửi đến thiên thần nhỏ' },
          ],
        },
        {
          title: 'Gia Đình Anh Tuấn & Chị Hương',
          slug: 'gia-dinh-anh-tuan-chi-huong',
          category: 'family',
          category_label: 'Gia Đình Yêu Thương',
          cover_image: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=1200&q=85',
          description: 'Khoảnh khắc sum vầy ấm áp ngập tràn tình yêu thương',
          location: 'QA Stories Studio - Không gian Gia đình',
          date_shot: 'Tháng 7/2026',
          package_name: 'Gói Chụp Gia Đình Sum Vầy',
          story: 'Không gì quý giá hơn tình cảm gia đình. Buổi chụp diễn ra trong không khí rộn rã tiếng cười, nhiếp ảnh gia bắt trọn từng cái ôm, ánh mắt tự hào của bố mẹ và nụ cười rạng rỡ của con trẻ trong những khung hình vượt thời gian.',
          photos: [
            { url: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=1600&q=85', title: 'Hạnh phúc sum vầy', description: 'Cả gia đình quây quần ấm áp bên nhau' },
            { url: 'https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?w=1600&q=85', title: 'Tình mẫu tử thiêng liêng', description: 'Mẹ dắt tay con đi những bước đầu tiên' },
            { url: 'https://images.unsplash.com/photo-1490135583664-cd89a2cc48a1?w=1600&q=85', title: 'Bố là bờ vai vững chãi', description: 'Khoảnh khắc bố bế con trên vai đầy yêu thương' },
          ],
        },
      ]

      for (let i = 0; i < albumsSeed.length; i++) {
        const a = albumsSeed[i]
        const [albumRes] = await connection.query(
          'INSERT INTO albums (title, slug, category, category_label, cover_image, description, location, date_shot, package_name, story, is_featured, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)',
          [a.title, a.slug, a.category, a.category_label, a.cover_image, a.description, a.location, a.date_shot, a.package_name, a.story, i + 1]
        )
        const albumId = albumRes.insertId

        for (let j = 0; j < a.photos.length; j++) {
          const p = a.photos[j]
          await connection.query(
            'INSERT INTO photos (album_id, filename, original_name, size, url, title, description, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [albumId, `photo-${albumId}-${j + 1}.jpg`, p.title, 500000, p.url, p.title, p.description, j + 1]
          )
        }
      }
      console.log('📸 [Seed] Đã tạo danh sách Albums và Photos ban đầu')
    }

    // 8. Seed Sample Bookings
    const [existingBookings] = await connection.query('SELECT id FROM bookings LIMIT 1')
    if (existingBookings.length === 0) {
      await connection.query(`
        INSERT INTO bookings (name, phone, email, date, service, note, status, created_at) VALUES
        ('Chị Mai Anh', '0987654321', 'maianh@gmail.com', '2026-09-20', 'Gói Chụp Sơ Sinh (Newborn 0 - 30 ngày)', 'Bé dự kiến sinh vào giữa tháng 9, nhờ studio chuẩn bị tone màu be pastel', 'pending', NOW()),
        ('Anh Tuấn Kiệt', '0912345678', 'tuankiet@gmail.com', '2026-09-25', 'Gói Chụp Thôi Nôi & Sinh Nhật (1 Tuổi)', 'Đặt concept Smash Cake cho bé trai', 'confirmed', NOW() - INTERVAL 1 DAY),
        ('Chị Hoàng Yến', '0933445566', 'hoangyen@yahoo.com', '2026-09-18', 'Gói Chụp 100 Ngày Tuổi', 'Bé 100 ngày tuổi rất háu cười, muốn chụp ngoại cảnh sớm', 'completed', NOW() - INTERVAL 3 DAY)
      `)
      console.log('📅 [Seed] Đã tạo 3 lịch hẹn mẫu trong database')
    }

    // 9. Seed Sample Page Views (Analytics)
    const [existingViews] = await connection.query('SELECT id FROM page_views LIMIT 1')
    if (existingViews.length === 0) {
      await connection.query(`
        INSERT INTO page_views (path, title, ip_address, device_type, referer, created_at) VALUES
        ('/', 'Trang Chủ', '127.0.0.1', 'desktop', 'https://google.com', NOW()),
        ('/', 'Trang Chủ', '127.0.0.1', 'mobile', 'https://facebook.com', NOW() - INTERVAL 1 HOUR),
        ('/album', 'Bộ Sưu Tập Album', '127.0.0.1', 'desktop', 'https://qastories.vn/', NOW() - INTERVAL 2 HOUR),
        ('/album/be-khoi-7-ngay-tuoi', 'Album Bé Khôi 7 Ngày Tuổi', '127.0.0.1', 'mobile', 'https://qastories.vn/album', NOW() - INTERVAL 3 HOUR),
        ('/about', 'Giới Thiệu', '127.0.0.1', 'desktop', 'https://qastories.vn/', NOW() - INTERVAL 4 HOUR),
        ('/contact', 'Liên Hệ & Đặt Lịch', '127.0.0.1', 'mobile', 'https://qastories.vn/about', NOW() - INTERVAL 5 HOUR),
        ('/', 'Trang Chủ', '127.0.0.1', 'desktop', 'Direct', NOW() - INTERVAL 1 DAY),
        ('/album', 'Bộ Sưu Tập Album', '127.0.0.1', 'desktop', 'Direct', NOW() - INTERVAL 1 DAY),
        ('/contact', 'Liên Hệ & Đặt Lịch', '127.0.0.1', 'mobile', 'https://google.com', NOW() - INTERVAL 2 DAY)
      `)
      console.log('📈 [Seed] Đã tạo dữ liệu mẫu thống kê truy cập')
    }

    console.log('🎉 ====================================================')
    console.log(`✅ KHỞI TẠO CƠ SỞ DỮ LIỆU '${dbName}' HOÀN TẤT VÀ SẴN SÀNG!`)
    console.log('   - Bảng `admins` (Tài khoản: admin / admin@123)')
    console.log('   - Bảng `banners` (Slider trang chủ)')
    console.log('   - Bảng `bookings` (Quản lý đặt lịch)')
    console.log('   - Bảng `albums` & `photos` (Kho ảnh & Bộ sưu tập)')
    console.log('   - Bảng `system_settings` (Cấu hình & Nhận diện thương hiệu)')
    console.log('   - Bảng `page_views` (Thống kê lưu lượng truy cập)')
    console.log('====================================================')
  } catch (error) {
    console.error('❌ Lỗi khởi tạo cơ sở dữ liệu MySQL:', error.message)
    console.log('💡 Gợi ý: Hãy đảm bảo MySQL Server (XAMPP / Laragon / Docker / MySQL Service) đang BẬT và thông tin trong file .env là chính xác.')
    process.exitCode = 1
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

setupDatabase()
