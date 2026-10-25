import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import compression from 'compression'
import apiRoutes from './routes/index.js'
import errorHandler from './middlewares/errorHandler.js'
import logger from './utils/logger.js'
import { testConnection } from './config/db.js'
import sharp from 'sharp'
import { getCachedBanners } from './utils/bannersCache.js'
import { getSeoForRequest, injectSeoToHtml, serveOgImage } from './utils/seoHelper.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// 1. Gzip / Deflate Compression Middleware (Tối ưu tải mạng 70-85%)
app.use(
  compression({
    level: 6, // Mức cân bằng tối ưu giữa CPU và tỷ lệ nén
    threshold: 1024, // Chỉ nén file > 1KB
    filter: (req, res) => {
      if (req.headers['x-no-compression']) {
        return false
      }
      return compression.filter(req, res)
    },
  })
)

// 2. Global Middlewares
app.use(cors())
app.use(express.json({ limit: '100mb' }))
app.use(express.urlencoded({ extended: true, limit: '100mb' }))

// Performance & Security Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'SAMEORIGIN')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  next()
})

// Logger middleware cho request
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`)
  next()
})

// Phục vụ thư mục static public (Chứa React build và uploads)
const publicDir = path.join(__dirname, 'public')
const defaultUploadsDir = path.join(publicDir, 'uploads')
const customUploadsDir = process.env.UPLOAD_DIR ? path.resolve(process.env.UPLOAD_DIR) : null

// Đảm bảo thư mục uploads tồn tại
if (customUploadsDir && !fs.existsSync(customUploadsDir)) {
  try {
    fs.mkdirSync(customUploadsDir, { recursive: true })
    logger.info(`Đã khởi tạo thư mục uploads tại ổ đĩa riêng: ${customUploadsDir}`)
  } catch (e) {
    logger.warn(`Không thể tạo thư mục UPLOAD_DIR (${customUploadsDir}): ${e.message}`)
  }
}
if (!fs.existsSync(defaultUploadsDir)) {
  try {
    fs.mkdirSync(defaultUploadsDir, { recursive: true })
  } catch (e) {}
}

// Đảm bảo các thư mục con trong uploads luôn tồn tại sẵn sàng nhận file
const requiredUploadDirs = ['branding', 'banners', 'albums', 'about', 'seo', '.cache']
const activeUploadDirs = [customUploadsDir, defaultUploadsDir].filter(Boolean)
for (const base of activeUploadDirs) {
  for (const sub of requiredUploadDirs) {
    const fullSubPath = path.join(base, sub)
    if (!fs.existsSync(fullSubPath)) {
      try {
        fs.mkdirSync(fullSubPath, { recursive: true })
      } catch (e) {}
    }
  }
}

// 3. Static Files with High-Performance HTTP Caching
// A. Assets tĩnh có hash (JS, CSS chunks từ Vite) -> Cache vĩnh viễn 1 năm
app.use(
  '/assets',
  express.static(path.join(publicDir, 'assets'), {
    maxAge: '1y',
    immutable: true,
    etag: true,
  })
)

// B. Dynamic Responsive Image Resizer for mobile (?w=640, ?w=800, ?w=1080)
const imageCacheDir = path.join(publicDir, 'uploads', '.cache')
if (!fs.existsSync(imageCacheDir)) {
  try {
    fs.mkdirSync(imageCacheDir, { recursive: true })
  } catch (e) {}
}

app.use('/uploads', async (req, res, next) => {
  const subPath = decodeURIComponent(req.path).replace(/^\//, '')

  // 1. Tự động phục vụ hoặc tạo ảnh -mobile.webp cho banner trên điện thoại
  if (subPath.includes('-mobile.webp') || subPath.includes('-640.webp')) {
    let targetPath = customUploadsDir ? path.join(customUploadsDir, subPath) : path.join(defaultUploadsDir, subPath)
    if (!fs.existsSync(targetPath) && customUploadsDir && fs.existsSync(path.join(defaultUploadsDir, subPath))) {
      targetPath = path.join(defaultUploadsDir, subPath)
    }

    if (fs.existsSync(targetPath)) {
      res.setHeader('Content-Type', 'image/webp')
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      return res.sendFile(targetPath)
    }

    // Nếu chưa có file -mobile.webp, tự động tìm file ảnh gốc để resize
    const originalSubPath = subPath.replace(/-mobile\.webp$|-640\.webp$/, '')
    const possibleExts = ['.webp', '.jpg', '.jpeg', '.png']
    let originalPath = null

    for (const ext of possibleExts) {
      const candidateSub = `${originalSubPath}${ext}`
      const p1 = customUploadsDir ? path.join(customUploadsDir, candidateSub) : null
      const p2 = path.join(defaultUploadsDir, candidateSub)
      if (p1 && fs.existsSync(p1)) {
        originalPath = p1
        break
      }
      if (fs.existsSync(p2)) {
        originalPath = p2
        break
      }
    }

    if (originalPath && fs.existsSync(originalPath)) {
      try {
        const width = subPath.includes('-640.webp') ? 640 : 800
        const outDir = path.dirname(targetPath)
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true })
        }
        await sharp(originalPath)
          .rotate()
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(targetPath)

        res.setHeader('Content-Type', 'image/webp')
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
        return res.sendFile(targetPath)
      } catch (e) {
        logger.warn(`Lỗi tạo mobile image cho ${subPath}: ${e.message}`)
        // Fallback: Gửi ảnh gốc để đảm bảo giao diện không bao giờ bị mất ảnh
        return res.sendFile(originalPath)
      }
    }
  }

  // 2. Resize ảnh theo tham số query ?w=...
  const widthParam = req.query.w || req.query.width
  if (!widthParam) {
    return next()
  }

  const width = parseInt(widthParam, 10)
  if (isNaN(width) || width <= 0 || width > 2560) {
    return next()
  }

  const ext = path.extname(subPath).toLowerCase()
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(ext)) {
    return next()
  }

  let originalPath = customUploadsDir ? path.join(customUploadsDir, subPath) : null
  if (!originalPath || !fs.existsSync(originalPath)) {
    originalPath = path.join(defaultUploadsDir, subPath)
  }
  if (!fs.existsSync(originalPath)) {
    return next()
  }

  const baseName = path.basename(subPath, ext)
  const relDir = path.dirname(subPath)
  const cachedSubDir = path.join(imageCacheDir, relDir)
  const cachedFileName = `${baseName}-w${width}.webp`
  const cachedFilePath = path.join(cachedSubDir, cachedFileName)

  try {
    if (!fs.existsSync(cachedFilePath)) {
      if (!fs.existsSync(cachedSubDir)) {
        fs.mkdirSync(cachedSubDir, { recursive: true })
      }
      await sharp(originalPath)
        .rotate()
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(cachedFilePath)
    }

    res.setHeader('Content-Type', 'image/webp')
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    return res.sendFile(cachedFilePath)
  } catch (err) {
    logger.warn(`Image resize error for ${subPath}: ${err.message}`)
    return next()
  }
})

// C. Phục vụ file uploads tĩnh nguyên bản
if (customUploadsDir) {
  logger.info(`📁 Kích hoạt phục vụ ảnh từ ổ đĩa riêng: ${customUploadsDir}`)
  app.use(
    '/uploads',
    express.static(customUploadsDir, {
      maxAge: '30d',
      etag: true,
      setHeaders: (res) => {
        res.setHeader(
          'Cache-Control',
          'public, max-age=2592000, stale-while-revalidate=86400'
        )
      },
    })
  )
}

app.use(
  '/uploads',
  express.static(defaultUploadsDir, {
    maxAge: '30d',
    etag: true,
    setHeaders: (res) => {
      res.setHeader(
        'Cache-Control',
        'public, max-age=2592000, stale-while-revalidate=86400'
      )
    },
  })
)

// D. Các file tĩnh khác trong public (robots.txt, sitemap.xml, favicon.svg)
app.use(
  express.static(publicDir, {
    index: false,
    etag: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      } else if (
        filePath.endsWith('.xml') ||
        filePath.endsWith('.txt') ||
        filePath.endsWith('.svg') ||
        filePath.endsWith('.ico')
      ) {
        res.setHeader('Cache-Control', 'public, max-age=86400')
      }
    },
  })
)

// Endpoint phục vụ ảnh Open Graph JPEG chuẩn 1200x630 cho Zalo, Facebook, Telegram
app.get('/og-image.jpg', serveOgImage)

// 4. API Routes
app.use('/api', apiRoutes)

// In-memory cache of built index.html (tự động làm mới khi file index.html thay đổi mtime sau git pull)
let indexHtmlCache = null
let indexHtmlMtime = 0
function getIndexHtml(indexPath) {
  if (!fs.existsSync(indexPath)) return null
  try {
    const stat = fs.statSync(indexPath)
    if (process.env.NODE_ENV === 'production' && indexHtmlCache && indexHtmlMtime === stat.mtimeMs) {
      return indexHtmlCache
    }
    indexHtmlCache = fs.readFileSync(indexPath, 'utf-8')
    indexHtmlMtime = stat.mtimeMs
    return indexHtmlCache
  } catch (e) {
    return null
  }
}

// Chặn không cho request tĩnh bị thiếu trong /uploads hoặc /assets fallback về index.html
app.use((req, res, next) => {
  if (req.path.startsWith('/uploads/') || req.path.startsWith('/assets/')) {
    return res.status(404).end()
  }
  next()
})

// 5. Fallback SPA Routing cho React với Dynamic Server-Side SEO & High-Speed Mobile LCP Injection
app.get('*', async (req, res) => {
  const indexPath = path.join(publicDir, 'index.html')
  const rawHtml = getIndexHtml(indexPath)
  if (!rawHtml) {
    return res.sendFile(path.join(__dirname, 'views', '404.html'))
  }

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')

  try {
    // 1. Tự động trích xuất & tiêm thẻ SEO động theo URL (Open Graph / Zalo / Facebook / Twitter)
    const seoData = await getSeoForRequest(req)
    let html = injectSeoToHtml(rawHtml, seoData)

    // 2. Tối ưu tải trang chủ: FCP & LCP siêu tốc cho cả Mobile và PC
    if (req.path === '/' || req.path === '/index.html') {
      try {
        const banners = await getCachedBanners()
        const ua = req.headers['user-agent'] || ''
        const isMobileReq = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)

        const targetBanner = isMobileReq
          ? (banners.find((b) => b.device_type === 'mobile') || banners.find((b) => b.device_type === 'all') || banners[0])
          : (banners.find((b) => b.device_type === 'pc' || b.device_type === 'all' || !b.device_type) || banners[0])

        const rawHeroUrl = targetBanner
          ? ((isMobileReq && targetBanner.image_mobile) ? targetBanner.image_mobile : (targetBanner.image_url || targetBanner.image))
          : null

        // A. Cập nhật preload link cho ảnh Hero LCP
        if (rawHeroUrl) {
          const preloadTag = `<link rel="preload" as="image" href="${rawHeroUrl}" fetchpriority="high" />`
          if (html.includes('<!-- __HERO_LCP_PRELOAD__ -->')) {
            html = html.replace(
              /<!-- __HERO_LCP_PRELOAD__ -->[\s\S]*?(?=<link rel="stylesheet"|<link rel="preload" as="style"|<script|<\/head>)/i,
              `<!-- __HERO_LCP_PRELOAD__ -->\n    ${preloadTag}\n    `
            )
          }
        }

        // B. Tiêm dữ liệu banner ban đầu loại bỏ waterfall request
        const initialDataScript = `<script>window.__INITIAL_DATA__ = ${JSON.stringify({ banners })};</script>`
        html = html.replace('</head>', `  ${initialDataScript}\n</head>`)

        // C. Tiêm ảnh Hero vào shell HTML để hiển thị tức thì khi nhận byte đầu tiên
        if (rawHeroUrl && html.includes('<!-- __HERO_SHELL_IMAGE__ -->')) {
          const shellImageTag = `<!-- __HERO_SHELL_IMAGE__ -->\n        <img src="${rawHeroUrl}" alt="${targetBanner.title || 'QA Stories Studio'}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center;display:block;" fetchpriority="high" decoding="async" />`
          html = html.replace(
            /<!-- __HERO_SHELL_IMAGE__ -->[\s\S]*?(?=<div style="position:absolute;bottom:0|<script)/i,
            shellImageTag + '\n        '
          )
        }
      } catch (errHero) {
        logger.warn(`Lỗi tối ưu Hero LCP: ${errHero.message}`)
      }
    }

    return res.type('html').send(html)
  } catch (errSeo) {
    logger.warn(`Lỗi tạo SEO HTML: ${errSeo.message}`)
    return res.type('html').send(rawHtml)
  }
})

// Central Error Handler
app.use(errorHandler)

// Khởi động server
app.listen(PORT, async () => {
  console.log('====================================================')
  console.log(`🚀 QA Stories Server running on http://localhost:${PORT}`)
  console.log(`📁 Public folder: ${publicDir}`)
  console.log(`⚡ Gzip/Deflate compression enabled`)
  console.log(`⚡ Optimized HTTP Caching enabled`)
  console.log('====================================================')

  // Kiểm tra kết nối MySQL & Khởi tạo các bảng mở rộng
  const dbOk = await testConnection()
  if (dbOk) {
    try {
      const { Package } = await import('./models/Package.js')
      await Package.ensureTable()
    } catch (e) {
      console.warn('⚠️ Lỗi khởi tạo bảng packages:', e.message)
    }
    try {
      const { Banner } = await import('./models/Banner.js')
      await Banner.ensureColumns()
    } catch (e) {
      console.warn('⚠️ Lỗi nâng cấp bảng banners:', e.message)
    }
  }
})

export default app
