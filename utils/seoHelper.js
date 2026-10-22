import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import Setting from '../models/Setting.js'
import pool from '../config/db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const publicDir = path.join(rootDir, 'public')
const defaultUploadsDir = path.join(publicDir, 'uploads')
const customUploadsDir = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : null

let settingsCache = null
let settingsLastFetched = 0
const SETTINGS_CACHE_TTL = 30 * 1000 // 30s TTL in memory

export async function getCachedSettings() {
  const now = Date.now()
  if (settingsCache && now - settingsLastFetched < SETTINGS_CACHE_TTL) {
    return settingsCache
  }
  try {
    const settings = await Setting.getAll()
    settingsCache = settings || {}
    settingsLastFetched = now
    return settingsCache
  } catch (err) {
    return settingsCache || {}
  }
}

export function invalidateSettingsCache() {
  settingsCache = null
  settingsLastFetched = 0
  // Dọn dẹp cache ảnh share nếu có
  const ogCacheFile = path.join(defaultUploadsDir, '.cache', 'og-share-default.jpg')
  if (fs.existsSync(ogCacheFile)) {
    try {
      fs.unlinkSync(ogCacheFile)
    } catch (e) {}
  }
}

/**
 * Trả về absolute URL hợp lệ cho ảnh
 */
export function makeAbsoluteUrl(url, baseUrl) {
  if (!url) return null
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  }
  const cleanPath = url.startsWith('/') ? url : `/${url}`
  return `${baseUrl}${cleanPath}`
}

/**
 * Lấy metadata SEO phù hợp cho từng URL request
 */
export async function getSeoForRequest(req) {
  const settings = await getCachedSettings()

  // 1. Tự động xác định domain & protocol linh hoạt theo request thực tế
  let protocol = req.headers['x-forwarded-proto'] || req.protocol || 'https'
  if (Array.isArray(protocol)) protocol = protocol[0]
  if (protocol.includes(',')) protocol = protocol.split(',')[0].trim()

  const host = req.get('host') || 'qastories.com'
  
  let baseUrl = ''
  if (settings.site_url && settings.site_url.trim().startsWith('http')) {
    baseUrl = settings.site_url.trim().replace(/\/+$/, '')
  } else {
    baseUrl = `${protocol}://${host}`.replace(/\/+$/, '')
  }

  const currentPath = req.path || '/'
  const canonicalUrl = `${baseUrl}${currentPath === '/' ? '' : currentPath}`

  const brandName = settings.brand_name || 'QA Stories'
  const defaultTitle = settings.seo_title || `${brandName} - Studio Chụp Ảnh Bé & Gia Đình Chuyên Nghiệp`
  const defaultDesc =
    settings.seo_description ||
    'Studio chụp ảnh sơ sinh newborn, thôi nôi, 100 ngày tuổi và gia đình uy tín với phong cách nghệ thuật, ánh sáng tự nhiên.'
  const keywords = settings.seo_keywords || 'chụp ảnh em bé, chụp ảnh newborn, chụp thôi nôi, studio bé, QA stories'

  // Mặc định ảnh trang chủ dùng endpoint ảnh JPEG 1200x630 siêu chuẩn:
  let image = `${baseUrl}/og-image.jpg`
  let imageType = 'image/jpeg'
  let ogType = 'website'
  let title = defaultTitle
  let description = defaultDesc

  // Phân tích đường dẫn để tạo SEO chuẩn từng trang
  if (currentPath.startsWith('/album/') && currentPath.length > 7) {
    const slugOrId = decodeURIComponent(currentPath.slice(7)).trim()
    try {
      const isNum = !isNaN(slugOrId) && !isNaN(parseFloat(slugOrId))
      const [rows] = await pool.query(
        'SELECT id, title, slug, cover_image, description, story FROM albums WHERE slug = ? OR id = ? LIMIT 1',
        [slugOrId, isNum ? Number(slugOrId) : 0]
      )
      if (rows && rows[0]) {
        const album = rows[0]
        title = `${album.title} | ${brandName}`
        if (album.description || album.story) {
          description = (album.description || album.story).replace(/<[^>]*>?/gm, '').slice(0, 200).trim()
        }
        if (album.cover_image) {
          image = makeAbsoluteUrl(album.cover_image, baseUrl)
          if (image.endsWith('.webp')) imageType = 'image/webp'
          else if (image.endsWith('.png')) imageType = 'image/png'
        }
        ogType = 'article'
      }
    } catch (e) {}
  } else if (currentPath === '/album' || currentPath === '/album/') {
    title = `${settings.album_header_title || 'Bộ Sưu Tập'} - ${settings.album_header_title_highlight || 'Khoảnh Khắc Của Bé'} | ${brandName}`
    description = settings.album_header_desc || defaultDesc
  } else if (currentPath === '/about' || currentPath === '/about/') {
    title = `Về Chúng Tôi | ${brandName}`
    description = settings.about_story_p1 || defaultDesc
    if (settings.about_image) {
      image = makeAbsoluteUrl(settings.about_image, baseUrl)
      if (image.endsWith('.webp')) imageType = 'image/webp'
      else if (image.endsWith('.png')) imageType = 'image/png'
    }
  } else if (currentPath === '/contact' || currentPath === '/contact/') {
    title = `Liên Hệ & Đặt Lịch Chụp Ảnh | ${brandName}`
    description = `Liên hệ đặt lịch chụp ảnh em bé, newborn, thôi nôi tại ${brandName}. Địa chỉ: ${settings.brand_address || 'TP. Hồ Chí Minh'}. Hotline: ${settings.brand_phone || ''}`.trim()
  }

  return {
    title,
    description,
    keywords,
    brandName,
    url: canonicalUrl,
    image,
    imageType,
    ogType,
    baseUrl,
  }
}

/**
 * Tiêm hoặc thay thế toàn bộ thẻ SEO trong chuỗi HTML
 */
export function injectSeoToHtml(rawHtml, seo) {
  if (!rawHtml) return rawHtml

  let html = rawHtml

  // 1. Title
  if (html.includes('<title>')) {
    html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeHtml(seo.title)}</title>`)
  }

  // 2. Meta title & description
  if (/name=["']title["']/i.test(html)) {
    html = html.replace(
      /<meta\s+name=["']title["'][^>]*>/i,
      `<meta name="title" content="${escapeHtml(seo.title)}" />`
    )
  }
  if (/name=["']description["']/i.test(html)) {
    html = html.replace(
      /<meta\s+name=["']description["'][^>]*>/i,
      `<meta name="description" content="${escapeHtml(seo.description)}" />`
    )
  }

  // 3. Meta keywords & author
  if (/name=["']keywords["']/i.test(html)) {
    html = html.replace(
      /<meta\s+name=["']keywords["'][^>]*>/i,
      `<meta name="keywords" content="${escapeHtml(seo.keywords)}" />`
    )
  }
  if (/name=["']author["']/i.test(html)) {
    html = html.replace(
      /<meta\s+name=["']author["'][^>]*>/i,
      `<meta name="author" content="${escapeHtml(seo.brandName)}" />`
    )
  }

  // 4. Canonical link
  if (/rel=["']canonical["']/i.test(html)) {
    html = html.replace(
      /<link\s+rel=["']canonical["'][^>]*>/i,
      `<link rel="canonical" href="${escapeHtml(seo.url)}" />`
    )
  }

  // 5. Open Graph Meta Tags (Facebook, Zalo, Viber, Telegram...)
  const replaceOrAppendOg = (property, content) => {
    const regex = new RegExp(`<meta\\s+property=["']${property}["'][^>]*>`, 'i')
    const newTag = `<meta property="${property}" content="${escapeHtml(content)}" />`
    if (regex.test(html)) {
      html = html.replace(regex, newTag)
    } else {
      html = html.replace('</head>', `    ${newTag}\n  </head>`)
    }
  }

  replaceOrAppendOg('og:type', seo.ogType)
  replaceOrAppendOg('og:url', seo.url)
  replaceOrAppendOg('og:site_name', seo.brandName)
  replaceOrAppendOg('og:title', seo.title)
  replaceOrAppendOg('og:description', seo.description)
  replaceOrAppendOg('og:image', seo.image)
  replaceOrAppendOg('og:image:secure_url', seo.image)
  replaceOrAppendOg('og:image:width', '1200')
  replaceOrAppendOg('og:image:height', '630')
  replaceOrAppendOg('og:image:type', seo.imageType)
  replaceOrAppendOg('og:image:alt', seo.title)
  replaceOrAppendOg('og:locale', 'vi_VN')

  // 6. Twitter Cards
  const replaceOrAppendTwitter = (name, content) => {
    const regex = new RegExp(`<meta\\s+name=["']${name}["'][^>]*>`, 'i')
    const newTag = `<meta name="${name}" content="${escapeHtml(content)}" />`
    if (regex.test(html)) {
      html = html.replace(regex, newTag)
    } else {
      html = html.replace('</head>', `    ${newTag}\n  </head>`)
    }
  }

  replaceOrAppendTwitter('twitter:card', 'summary_large_image')
  replaceOrAppendTwitter('twitter:url', seo.url)
  replaceOrAppendTwitter('twitter:title', seo.title)
  replaceOrAppendTwitter('twitter:description', seo.description)
  replaceOrAppendTwitter('twitter:image', seo.image)
  replaceOrAppendTwitter('twitter:image:alt', seo.title)

  // 7. Cập nhật schema.org URL nếu có
  html = html.replace(/"url":\s*"https?:\/\/[^"]+"/i, `"url": "${escapeHtml(seo.baseUrl)}"`)
  html = html.replace(/"name":\s*"QA Stories Studio"/i, `"name": "${escapeHtml(seo.brandName)} Studio"`)
  html = html.replace(/"image":\s*"https?:\/\/[^"]+"/i, `"image": "${escapeHtml(seo.image)}"`)

  return html
}

/**
 * Xử lý yêu cầu ảnh đại diện Open Graph chuẩn 1200x630 JPEG cho Zalo/Facebook/Telegram
 */
export async function serveOgImage(req, res) {
  const cacheDir = path.join(defaultUploadsDir, '.cache')
  if (!fs.existsSync(cacheDir)) {
    try {
      fs.mkdirSync(cacheDir, { recursive: true })
    } catch (e) {}
  }
  const cachedImagePath = path.join(cacheDir, 'og-share-default.jpg')

  // Nếu file cache đã có và nhỏ hơn 24 giờ, trả về ngay
  if (fs.existsSync(cachedImagePath)) {
    try {
      const stat = fs.statSync(cachedImagePath)
      const age = Date.now() - stat.mtimeMs
      if (age < 24 * 60 * 60 * 1000) {
        res.setHeader('Content-Type', 'image/jpeg')
        res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
        return res.sendFile(cachedImagePath)
      }
    } catch (e) {}
  }

  try {
    const settings = await getCachedSettings()
    let candidatePath = null

    // 1. Kiểm tra ảnh seo_image
    if (settings.seo_image) {
      candidatePath = resolveLocalImagePath(settings.seo_image)
    }

    // 2. Kiểm tra banner đầu tiên
    if (!candidatePath || !fs.existsSync(candidatePath)) {
      try {
        const [banners] = await pool.query(
          'SELECT image_url FROM banners WHERE is_active = 1 ORDER BY sort_order ASC, id ASC LIMIT 1'
        )
        if (banners && banners[0] && banners[0].image_url) {
          candidatePath = resolveLocalImagePath(banners[0].image_url)
        }
      } catch (e) {}
    }

    // 3. Kiểm tra logo hoặc avatar
    if (!candidatePath || !fs.existsSync(candidatePath)) {
      if (settings.brand_logo) {
        candidatePath = resolveLocalImagePath(settings.brand_logo)
      }
    }

    // Nếu tìm thấy ảnh nguồn, resize và convert sang JPEG 1200x630
    if (candidatePath && fs.existsSync(candidatePath)) {
      await sharp(candidatePath)
        .rotate()
        .resize(1200, 630, { fit: 'cover', position: 'center' })
        .jpeg({ quality: 88, mozjpeg: true })
        .toFile(cachedImagePath)

      res.setHeader('Content-Type', 'image/jpeg')
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
      return res.sendFile(cachedImagePath)
    }

    // Nếu không có bất kỳ ảnh nào, tạo ảnh banner nền canvas nghệ thuật
    const studioName = settings.brand_name || 'QA Stories'
    const slogan = settings.brand_slogan || 'Studio Chụp Ảnh Em Bé & Gia Đình Nghệ Thuật'
    const svgOverlay = `
      <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#1A1817"/>
            <stop offset="50%" stop-color="#2D2825"/>
            <stop offset="100%" stop-color="#141312"/>
          </linearGradient>
          <linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#FF7A2F"/>
            <stop offset="100%" stop-color="#FFA86B"/>
          </linearGradient>
        </defs>
        <rect width="1200" height="630" fill="url(#bg)"/>
        <rect x="40" y="40" width="1120" height="550" rx="24" fill="none" stroke="rgba(255, 122, 47, 0.25)" stroke-width="2"/>
        <text x="600" y="270" text-anchor="middle" fill="url(#gold)" font-family="serif, 'Playfair Display', Georgia" font-size="72" font-weight="bold" letter-spacing="4">${escapeSvg(studioName)}</text>
        <text x="600" y="340" text-anchor="middle" fill="#FFFFFF" font-family="'Nunito', sans-serif" font-size="28" font-weight="600" letter-spacing="2">${escapeSvg(slogan)}</text>
        <text x="600" y="410" text-anchor="middle" fill="#A8A29E" font-family="'Nunito', sans-serif" font-size="20">Newborn • Thôi Nôi • Em Bé • Gia Đình</text>
      </svg>
    `

    await sharp(Buffer.from(svgOverlay))
      .jpeg({ quality: 90 })
      .toFile(cachedImagePath)

    res.setHeader('Content-Type', 'image/jpeg')
    res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800')
    return res.sendFile(cachedImagePath)
  } catch (error) {
    console.error('Lỗi tạo ảnh Open Graph:', error.message)
    res.status(500).end()
  }
}

function resolveLocalImagePath(imageUrl) {
  if (!imageUrl) return null
  const sub = imageUrl.replace(/^https?:\/\/[^\/]+/, '').replace(/^\/uploads\//, '').replace(/^\//, '')
  const p1 = customUploadsDir ? path.join(customUploadsDir, sub) : null
  const p2 = path.join(defaultUploadsDir, sub)
  const p3 = path.join(publicDir, sub)

  if (p1 && fs.existsSync(p1)) return p1
  if (fs.existsSync(p2)) return p2
  if (fs.existsSync(p3)) return p3
  return null
}

function escapeHtml(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeSvg(str) {
  if (!str) return ''
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
