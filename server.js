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
const uploadsDir = path.join(publicDir, 'uploads')

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
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

// B. Ảnh Uploads người dùng -> Cache 30 ngày kèm stale-while-revalidate
app.use(
  '/uploads',
  express.static(uploadsDir, {
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

// C. Các file tĩnh khác trong public (robots.txt, sitemap.xml, favicon.svg)
app.use(
  express.static(publicDir, {
    etag: true,
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        // Luôn fetch mới nhất cho HTML để cập nhật bản build tức thì
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

// 4. API Routes
app.use('/api', apiRoutes)

// 5. Fallback SPA Routing cho React
app.get('*', (req, res) => {
  const indexPath = path.join(publicDir, 'index.html')
  if (fs.existsSync(indexPath)) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    return res.sendFile(indexPath)
  }
  return res.sendFile(path.join(__dirname, 'views', '404.html'))
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
  }
})

export default app
