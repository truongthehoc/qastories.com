/**
 * Tiện ích xử lý và chuẩn hóa các liên kết (URLs), đặc biệt là Zalo, Hotline, Mạng Xã Hội
 */

/**
 * Chuẩn hóa số điện thoại: loại bỏ khoảng trắng, dấu gạch ngang, dấu chấm
 * @param {string} phone 
 * @returns {string}
 */
export function cleanPhoneNumber(phone) {
  if (!phone) return ''
  return String(phone).replace(/[\s\-\.\(\)]/g, '')
}

/**
 * Chuẩn hóa đường dẫn Zalo (hỗ trợ nhập SĐT, zalo.me/..., https://zalo.me/...)
 * Đảm bảo luôn trả về link đầy đủ dạng https://zalo.me/...
 * @param {string} input - Chuỗi người dùng nhập (SĐT hoặc URL)
 * @param {string} [fallbackPhone] - SĐT dự phòng nếu input rỗng
 * @returns {string}
 */
export function formatZaloUrl(input, fallbackPhone = '') {
  let val = String(input || '').trim()

  // Nếu không nhập hoặc nhập '#' -> Dùng fallbackPhone
  if (!val || val === '#') {
    const cleanFallback = cleanPhoneNumber(fallbackPhone)
    return cleanFallback ? `https://zalo.me/${cleanFallback}` : ''
  }

  // Xóa các tiền tố lặp thừa dạng https://zalo.me/ hoặc zalo.me/
  val = val.replace(/^(https?:\/\/)?(www\.)?zalo\.me\/(https?:\/\/)?(www\.)?(zalo\.me\/)?/gi, '')

  // Nếu chuỗi còn lại bắt đầu bằng http:// hoặc https:// (vd link nhóm Zalo)
  if (val.startsWith('http://') || val.startsWith('https://')) {
    return val
  }

  // Nếu là số điện thoại hoặc ID Zalo
  const cleanId = val.replace(/[\s\-\.\(\)]/g, '')
  if (cleanId) {
    return `https://zalo.me/${cleanId}`
  }

  const cleanFallback = cleanPhoneNumber(fallbackPhone)
  return cleanFallback ? `https://zalo.me/${cleanFallback}` : ''
}

/**
 * Chuẩn hóa liên kết ngoài (Facebook, Instagram, YouTube, TikTok, Maps...)
 * Tự động thêm https:// nếu người dùng quên nhập giao thức
 * @param {string} url 
 * @returns {string}
 */
export function formatExternalUrl(url) {
  if (!url) return ''
  const trimmed = String(url).trim()
  if (!trimmed || trimmed === '#' || trimmed === '/') return ''

  if (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('sms:')
  ) {
    return trimmed
  }

  // Nếu là đường dẫn nội bộ (bắt đầu bằng /)
  if (trimmed.startsWith('/')) {
    return trimmed
  }

  // Nếu là domain/đường dẫn ngoài
  return `https://${trimmed}`
}

/**
 * Kiểm tra xem một đường dẫn có phải là liên kết ngoài không
 * @param {string} url 
 * @returns {boolean}
 */
export function isExternalUrl(url) {
  if (!url) return false
  const trimmed = String(url).trim().toLowerCase()
  if (!trimmed || trimmed === '#') return false

  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('tel:') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('sms:') ||
    trimmed.startsWith('//') ||
    trimmed.includes('zalo.me') ||
    trimmed.includes('fb.com') ||
    trimmed.includes('m.me') ||
    trimmed.includes('facebook.com') ||
    trimmed.includes('instagram.com') ||
    trimmed.includes('tiktok.com') ||
    trimmed.includes('youtube.com') ||
    trimmed.includes('maps.google') ||
    trimmed.includes('goo.gl')
  )
}
