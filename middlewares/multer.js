import multer from 'multer'
import path from 'path'

const storage = multer.memoryStorage()

const fileFilter = (req, file, cb) => {
  const allowedExts = /\.(jpe?g|png|webp|avif|gif|svg)$/i
  const isImageMime = /^image\//i.test(file.mimetype)

  if (isImageMime || allowedExts.test(path.extname(file.originalname).toLowerCase())) {
    cb(null, true)
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (JPG, PNG, WebP, AVIF, GIF, SVG)'))
  }
}

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // Cho phép tới 50MB để tiếp nhận ảnh chất lượng cao
    files: 50, // Hỗ trợ tải lên tới 50 ảnh cùng lúc
  },
})

export default upload
