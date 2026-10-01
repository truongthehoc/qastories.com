import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import api from '../utils/api'

export function usePageTracking() {
  const location = useLocation()

  useEffect(() => {
    // Không track các trang admin để số liệu phản ánh đúng khách hàng
    if (location.pathname.startsWith('/admin')) {
      return
    }

    const titleMap = {
      '/': 'Trang Chủ',
      '/album': 'Bộ Sưu Tập Album',
      '/about': 'Giới Thiệu Studio',
      '/contact': 'Liên Hệ & Đặt Lịch',
    }

    let title = titleMap[location.pathname] || 'QA Stories'
    if (location.pathname.startsWith('/album/')) {
      title = `Album: ${location.pathname.replace('/album/', '')}`
    }

    // Gửi ngầm không chặn UI
    api.post('/analytics/track', {
      path: location.pathname,
      title,
      referer: document.referrer || '',
    }).catch(() => {
      // Bỏ qua lỗi tracking
    })
  }, [location.pathname])
}

export default usePageTracking
