import { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'

const defaultSettings = {
  brand_name: 'QA Stories',
  brand_slogan: 'Studio Lưu Giữ Khoảnh Khắc Thiên Thần Của Bé',
  brand_logo: '',
  brand_phone: '0901 234 567',
  brand_email: 'hello@qastories.vn',
  brand_address: '123 Đường ABC, Quận 1, TP. Hồ Chí Minh',
  brand_maps_url: 'https://maps.google.com',
  brand_facebook: 'https://facebook.com',
  brand_instagram: 'https://instagram.com',
  brand_youtube: 'https://youtube.com',
  brand_zalo: 'https://zalo.me/0901234567',
  brand_tiktok: 'https://tiktok.com',
  page_home_enabled: '1',
  page_album_enabled: '1',
  page_about_enabled: '1',
  page_contact_enabled: '1',
  album_header_label: 'Bộ Sưu Tập Nghệ Thuật',
  album_header_title: 'Khoảnh Khắc Của Bé',
  album_header_title_highlight: 'Kể Bằng Hình Ảnh',
  album_header_desc: 'Mỗi bức ảnh là một tác phẩm được chăm chút tỉ mỉ, giúp bố mẹ lưu lại trọn vẹn những ký ức đầu đời thiêng liêng nhất của con yêu.',
  about_header_label: 'Lời Ngỏ Từ Trái Tim',
  about_story_title: 'Nhiếp ảnh là cách mình lưu giữ linh hồn của khoảnh khắc.',
  about_story_p1: '',
  about_story_p2: '',
  about_founder_name: 'QA Stories',
  about_founder_role: 'Founder & Photographer',
  about_founder_quote: 'Từng bức ảnh là một tình yêu',
  about_image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=900&q=85',
  about_quote_text: 'Mỗi em bé là một thiên thần nhỏ, mỗi nụ cười là một câu chuyện vô giá được lưu giữ trọn vẹn qua thời gian.',
  about_quote_author: '',
  about_quote_color: '#1f2937',
  about_quote_author_color: '#E06738',
  home_intro_image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=900&q=85',
  home_intro_label: 'Giới thiệu về QA Stories',
  home_intro_title: 'Nghệ Thuật Lưu Giữ',
  home_intro_title_highlight: 'Những Khoảnh Khắc Đầu Đời',
  home_intro_p1: 'Tại QA Stories, chúng tôi hiểu rằng thời thơ ấu của con trôi qua rất nhanh. Từng ngón tay bé xíu, từng cái ngáp ngủ dễ thương hay nụ cười đầu tiên đều là những báu vật vô giá không thể lặp lại.',
  home_intro_p2: 'Với hơn 5 năm kinh nghiệm chuyên sâu trong lĩnh vực nhiếp ảnh trẻ em, chúng tôi tạo dựng một không gian an toàn, ấm áp và phong cách nghệ thuật tinh tế để mỗi bức ảnh không chỉ đẹp mà còn đong đầy cảm xúc yêu thương.',
  home_intro_features: JSON.stringify([
    'Trang phục nhập khẩu mềm mịn cho da bé',
    'Phòng chụp tiệt trùng UV và nhiệt độ lý tưởng',
    'Nhiếp ảnh gia chuyên môn cao & yêu trẻ',
    'Đa dạng concept từ tối giản đến sang trọng',
  ]),
  seo_title: 'QA Stories - Studio Chụp Ảnh Bé & Gia Đình Chuyên Nghiệp',
  seo_description: 'Studio chụp ảnh sơ sinh newborn, thôi nôi, 100 ngày tuổi và gia đình uy tín với phong cách nghệ thuật, ánh sáng tự nhiên.',
  quick_access_enabled: '1',
  quick_access_items: JSON.stringify([
    { id: 'qa-1', label: 'Bộ Sưu Tập Concept', to: '/album', icon: 'Images', is_active: true },
    { id: 'qa-2', label: 'Đặt Lịch Chụp Ảnh', to: '/contact', icon: 'Calendar', is_active: true },
    { id: 'qa-3', label: 'Liên Hệ & Tư Vấn', to: '/contact', icon: 'PhoneCall', is_active: true },
  ]),
}

const SettingsContext = createContext(null)

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const cached = localStorage.getItem('qastories_cached_settings')
      if (cached) {
        return { ...defaultSettings, ...JSON.parse(cached) }
      }
    } catch {
      // Ignore
    }
    return defaultSettings
  })
  const [loading, setLoading] = useState(false)

  // Tự động cập nhật Favicon trình duyệt theo Logo
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const faviconUrl = settings?.brand_logo || '/favicon.svg'
      let link = document.querySelector("link[rel~='icon']")
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.getElementsByTagName('head')[0].appendChild(link)
      }
      link.href = faviconUrl
    }
  }, [settings?.brand_logo])

  const fetchSettings = async () => {
    try {
      const res = await api.get('/settings')
      if (res.success && res.data) {
        setSettings((prev) => {
          const updated = { ...prev, ...res.data }
          try {
            localStorage.setItem('qastories_cached_settings', JSON.stringify(updated))
          } catch {
            // Ignore
          }
          return updated
        })
      }
    } catch (error) {
      console.warn('Sử dụng cấu hình mặc định (API settings không khả dụng):', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const refreshSettings = () => fetchSettings()

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

export default SettingsContext
