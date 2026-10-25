import multer from 'multer'
import path from 'path'

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowedImageExts = /\.(jpe?g|png|webp|avif|gif|svg)$/i
  const allowedVideoExts = /\.(mp4|webm|mov|ogg|m4v)$/i
  const isImage = /^image\//i.test(file.mimetype) || allowedImageExts.test(path.extname(file.originalname).toLowerCase())
  const isVideo = /^video\//i.test(file.mimetype) || allowedVideoExts.test(path.extname(file.originalname).toLowerCase())

  if (isImage || isVideo) {
    cb(null, true)
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (JPG, PNG, WebP, GIF) hoặc video (MP4, WebM, MOV)'))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // Hỗ trợ tới 100MB cho cả ảnh chất lượng cao và video quảng cáo
    files: 100,
  },
})

export default upload
