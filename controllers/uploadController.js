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

    // Xử lý tuần tự từng 2 ảnh một để đảm bảo không bị nghẽn CPU/RAM trên VPS
    const processedFiles = []
    const concurrency = 2

    for (let i = 0; i < req.files.length; i += concurrency) {
      const chunk = req.files.slice(i, i + concurrency)
      const chunkResults = await Promise.all(
        chunk.map(async (file) => {
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

          // Nếu file đã được tối ưu WebP từ client và kích thước nhỏ (< 1.5MB), lưu nhanh
          const isClientWebP = file.mimetype === 'image/webp' || file.originalname.toLowerCase().endsWith('.webp')
          const filename = `${uniqueSuffix}.webp`
          const outputPath = path.join(targetDir, filename)

          try {
            const image = sharp(file.buffer)
            const metadata = await image.metadata().catch(() => ({}))

            // Nếu file đã là WebP và kích thước đã chuẩn thì chỉ cần ghi trực tiếp hoặc tối ưu nhẹ
            if (isClientWebP && metadata.width && metadata.width <= maxDimension && metadata.height <= maxDimension && file.size < 1.5 * 1024 * 1024) {
              fs.writeFileSync(outputPath, file.buffer)
              const stat = fs.statSync(outputPath)
              return {
                filename,
                originalname: file.originalname,
                size: stat.size,
                url: `/uploads/${category}/${filename}`,
              }
            }

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
              .webp({ quality, effort: 3 })
              .toFile(outputPath)

            const stat = fs.statSync(outputPath)

            return {
              filename,
              originalname: file.originalname,
              size: stat.size,
              url: `/uploads/${category}/${filename}`,
            }
          } catch (sharpErr) {
            logger.warn(`Sharp optimize fallback cho file ${file.originalname}: ${sharpErr.message}`)
            // Fallback lưu trực tiếp buffer nếu sharp có lỗi bất ngờ
            fs.writeFileSync(outputPath, file.buffer)
            const stat = fs.statSync(outputPath)
            return {
              filename,
              originalname: file.originalname,
              size: stat.size,
              url: `/uploads/${category}/${filename}`,
            }
          }
        })
      )
      processedFiles.push(...chunkResults)
    }

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

