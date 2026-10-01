import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import logger from '../utils/logger.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const uploadBaseDir = path.join(__dirname, '..', 'public', 'uploads')

export const uploadPhotos = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Không có file nào được tải lên.',
      })
    }

    const category = req.body.category || 'general'
    const targetDir = path.join(uploadBaseDir, category)
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
    }

    // Cấu hình kích thước tối đa & chất lượng nén theo danh mục
    let maxDimension = 2048
    let quality = 85

    if (category === 'banners') {
      maxDimension = 2560
      quality = 88
    } else if (category === 'branding' || category === 'about') {
      maxDimension = 1600
      quality = 90
    } else if (category === 'gallery' || category === 'albums') {
      maxDimension = 2048
      quality = 85
    }

    const processedFiles = await Promise.all(
      req.files.map(async (file) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const isSvg = file.mimetype === 'image/svg+xml' || file.originalname.toLowerCase().endsWith('.svg')
        const isGif = file.mimetype === 'image/gif' || file.originalname.toLowerCase().endsWith('.gif')

        // Với SVG hoặc GIF động, lưu trực tiếp không convert
        if (isSvg || isGif) {
          const ext = path.extname(file.originalname).toLowerCase()
          const filename = `${uniqueSuffix}${ext}`
          const outputPath = path.join(targetDir, filename)
          fs.writeFileSync(outputPath, file.buffer)
          const stat = fs.statSync(outputPath)
          return {
            filename,
            originalname: file.originalname,
            size: stat.size,
            url: `/uploads/${category}/${filename}`,
          }
        }

        // Tối ưu ảnh với Sharp: tự động xoay chuẩn theo EXIF, resize không vỡ nét, nén WebP
        const filename = `${uniqueSuffix}.webp`
        const outputPath = path.join(targetDir, filename)

        const image = sharp(file.buffer)
        const metadata = await image.metadata().catch(() => ({}))

        let pipeline = image.rotate() // Auto-rotate EXIF orientation

        if (metadata.width && metadata.height) {
          if (metadata.width > maxDimension || metadata.height > maxDimension) {
            pipeline = pipeline.resize({
              width: metadata.width >= metadata.height ? maxDimension : undefined,
              height: metadata.height > metadata.width ? maxDimension : undefined,
              fit: 'inside',
              withoutEnlargement: true,
            })
          }
        }

        await pipeline
          .webp({ quality, effort: 4 })
          .toFile(outputPath)

        const stat = fs.statSync(outputPath)

        logger.info(
          `[Tối ưu ảnh] ${file.originalname}: ${(file.size / 1024 / 1024).toFixed(2)}MB -> ${(stat.size / 1024).toFixed(1)}KB (Giảm ${Math.round((1 - stat.size / file.size) * 100)}%)`
        )

        return {
          filename,
          originalname: file.originalname,
          size: stat.size,
          url: `/uploads/${category}/${filename}`,
        }
      })
    )

    logger.info(`Tải lên & tối ưu thành công ${processedFiles.length} ảnh vào danh mục '${category}'`)

    return res.json({
      success: true,
      message: `Tải lên và tối ưu thành công ${processedFiles.length} ảnh.`,
      files: processedFiles,
    })
  } catch (error) {
    logger.error('Lỗi tối ưu & upload ảnh: ' + error.message)
    next(error)
  }
}

