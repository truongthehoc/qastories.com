import logger from '../utils/logger.js'

export const errorHandler = (err, req, res, next) => {
  logger.error(`Unhandled Error: ${err.message}`, err)

  const statusCode = err.statusCode || (err.name === 'MulterError' ? 400 : 500)
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Lỗi máy chủ nội bộ. Vui lòng thử lại sau.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  })
}

export default errorHandler
