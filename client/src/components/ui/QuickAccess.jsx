import { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Images,
  Calendar,
  PhoneCall,
  Camera,
  Sparkles,
  Heart,
  Gift,
  FileText,
  MapPin,
  MessageCircle,
  Instagram,
  Star,
  Compass,
  Tag,
  HelpCircle,
  Layers,
  Clock,
  Send,
  BookOpen,
  ShoppingBag,
  Award,
  Video,
  UserCheck,
  Zap,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettings } from '../../context/SettingsContext'

export const QUICK_ACCESS_ICONS = {
  Images: { icon: Images, label: 'Bộ ảnh / Album' },
  Calendar: { icon: Calendar, label: 'Lịch / Đặt lịch' },
  PhoneCall: { icon: PhoneCall, label: 'Điện thoại / Hotline' },
  Camera: { icon: Camera, label: 'Máy ảnh' },
  Sparkles: { icon: Sparkles, label: 'Ngôi sao / Nổi bật' },
  Heart: { icon: Heart, label: 'Trái tim / Yêu thích' },
  Gift: { icon: Gift, label: 'Quà tặng / Khuyến mãi' },
  FileText: { icon: FileText, label: 'Báo giá / Chi tiết' },
  MapPin: { icon: MapPin, label: 'Địa chỉ / Bản đồ' },
  MessageCircle: { icon: MessageCircle, label: 'Tin nhắn / Chat' },
  Instagram: { icon: Instagram, label: 'Instagram' },
  Star: { icon: Star, label: 'Đánh giá / Sao' },
  Compass: { icon: Compass, label: 'Khám phá' },
  Tag: { icon: Tag, label: 'Gói chụp / Thẻ giá' },
  HelpCircle: { icon: HelpCircle, label: 'Hỏi đáp / Trợ giúp' },
  Layers: { icon: Layers, label: 'Concept / Danh mục' },
  Clock: { icon: Clock, label: 'Giờ làm việc' },
  Send: { icon: Send, label: 'Gửi yêu cầu' },
  BookOpen: { icon: BookOpen, label: 'Cẩm nang / Blog' },
  ShoppingBag: { icon: ShoppingBag, label: 'Dịch vụ / Mua sắm' },
  Award: { icon: Award, label: 'Chứng nhận / Uy tín' },
  Video: { icon: Video, label: 'Video / Phim' },
  UserCheck: { icon: UserCheck, label: 'Về chúng tôi' },
  Zap: { icon: Zap, label: 'Truy cập nhanh' },
}

export const hexToRgba = (hex, opacity = 1) => {
  if (!hex) return `rgba(255, 255, 255, ${opacity})`
  if (hex.startsWith('rgba') || hex.startsWith('rgb')) return hex
  let c = hex.replace('#', '')
  if (c.length === 3) {
    c = c.split('').map((x) => x + x).join('')
  }
  const num = parseInt(c, 16)
  if (isNaN(num)) return `rgba(255, 255, 255, ${opacity})`
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `rgba(${r}, ${g}, ${b}, ${opacity})`
}

const fallbackItems = [
  { id: '1', icon: 'Images', label: 'Bộ Sưu Tập Concept', to: '/album', is_active: true },
  { id: '2', icon: 'Calendar', label: 'Đặt Lịch Chụp Ảnh', to: '/contact', is_active: true },
  { id: '3', icon: 'PhoneCall', label: 'Liên Hệ & Tư Vấn', to: '/contact', is_active: true },
]

export default function QuickAccess({ variant = 'floating' }) {
  const { settings } = useSettings()
  const location = useLocation()
  const [hoveredIdx, setHoveredIdx] = useState(null)
  const [isVisible, setIsVisible] = useState(true)
  const [isAtBottom, setIsAtBottom] = useState(false)
  const scrollTimeoutRef = useRef(null)

  const isHeroMode = variant === 'hero'

  const isContactEnabled =
    settings?.page_contact_enabled !== '0' &&
    settings?.page_contact_enabled !== false &&
    settings?.page_contact_enabled !== 0

  // Scroll listener for floating mode only
  useEffect(() => {
    if (isHeroMode) return

    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight
      const totalHeight = document.documentElement.scrollHeight
      const atBottom = totalHeight - scrollPosition <= 120

      setIsAtBottom(atBottom)
      setIsVisible(false)

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const currentScrollPos = window.scrollY + window.innerHeight
        const currentTotalHeight = document.documentElement.scrollHeight
        const isStillBottom = currentTotalHeight - currentScrollPos <= 120

        if (!isStillBottom) {
          setIsVisible(true)
        } else {
          setIsVisible(false)
        }
      }, 250)
    }

    const footerEl = document.querySelector('footer')
    let observer = null
    if (footerEl && window.IntersectionObserver) {
      observer = new IntersectionObserver(
        (entries) => {
          const entry = entries[0]
          if (entry.isIntersecting) {
            setIsAtBottom(true)
            setIsVisible(false)
          } else {
            setIsAtBottom(false)
            setIsVisible(true)
          }
        },
        { rootMargin: '0px 0px 40px 0px', threshold: 0.05 }
      )
      observer.observe(footerEl)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (observer && footerEl) {
        observer.unobserve(footerEl)
      }
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [location.pathname, isHeroMode])

  // Check if disabled in settings
  if (settings?.quick_access_enabled === '0' || settings?.quick_access_enabled === false) {
    return null
  }

  let items = fallbackItems
  if (settings?.quick_access_items) {
    try {
      const parsed = typeof settings.quick_access_items === 'string'
        ? JSON.parse(settings.quick_access_items)
        : settings.quick_access_items
      if (Array.isArray(parsed) && parsed.length > 0) {
        items = parsed
      }
    } catch (e) {
      console.warn('Lỗi đọc dữ liệu Quick Access:', e)
    }
  }

  const activeItems = items.filter((item) => {
    if (item.is_active === false) return false
    if (!isContactEnabled && (item.to?.startsWith('/contact') || item.to === '/contact')) {
      return false
    }
    return true
  })
  if (activeItems.length === 0) return null

  // Custom Colors & Opacity Settings (Normal vs Hover)
  const bgColor = settings?.quick_access_bg_color || '#ffffff'
  const bgOpacity = settings?.quick_access_bg_opacity !== undefined
    ? Number(settings.quick_access_bg_opacity) / 100
    : 0.90
  const hoverBg = settings?.quick_access_hover_bg || '#fff7ed'
  const hoverOpacity = settings?.quick_access_hover_opacity !== undefined
    ? Number(settings.quick_access_hover_opacity) / 100
    : 0.95
  const textColor = settings?.quick_access_text_color || '#0f172a'
  const hoverTextColor = settings?.quick_access_hover_text_color || settings?.quick_access_icon_color || '#ff7a2f'
  const iconColor = settings?.quick_access_icon_color || '#ff7a2f'
  const hoverIconColor = settings?.quick_access_hover_icon_color || iconColor
  const iconBg = settings?.quick_access_icon_bg || 'rgba(255, 122, 47, 0.12)'

  const containerBg = hexToRgba(bgColor, bgOpacity)
  const hoverBgColor = hexToRgba(hoverBg, hoverOpacity)
  const borderColor = hexToRgba(textColor, 0.12)

  const renderContent = () => (
    <div
      style={{
        backgroundColor: containerBg,
        borderColor: borderColor,
      }}
      className="pointer-events-auto backdrop-blur-2xl border rounded-full p-1 sm:p-1.5 shadow-[0_16px_36px_-6px_rgba(0,0,0,0.22),0_0_0_1px_rgba(255,255,255,0.7)_inset,0_2px_4px_rgba(0,0,0,0.03)] transition-all duration-300 max-w-full"
    >
      <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar">
        {activeItems.map((item, idx) => {
          const IconData = QUICK_ACCESS_ICONS[item.icon] || QUICK_ACCESS_ICONS.Zap
          const IconComponent = IconData.icon
          const isExternal =
            item.to?.startsWith('http') ||
            item.to?.startsWith('tel:') ||
            item.to?.startsWith('mailto:')
          const isHovered = hoveredIdx === idx
          const currentItemBg = isHovered ? hoverBgColor : 'transparent'
          const currentItemTextColor = isHovered ? hoverTextColor : textColor
          const currentItemIconColor = isHovered ? hoverIconColor : iconColor
          const currentItemIconBg = isHovered
            ? hexToRgba(hoverIconColor, 0.18)
            : iconBg

          const itemContent = (
            <>
              {/* Soft Round Icon Holder */}
              <div
                style={{
                  backgroundColor: currentItemIconBg,
                  color: currentItemIconColor,
                }}
                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300 ease-out shadow-xs shrink-0 group-hover:scale-110"
              >
                <IconComponent size={15} className="sm:w-[17px] sm:h-[17px]" />
              </div>

              {/* Title Text */}
              <div className="min-w-0 pr-1">
                <h3
                  style={{ color: currentItemTextColor }}
                  className="font-heading text-xs sm:text-[13px] font-semibold transition-colors duration-300 tracking-normal whitespace-nowrap"
                >
                  {item.label}
                </h3>
              </div>
            </>
          )

          const commonClasses =
            'relative group flex items-center justify-center gap-2 sm:gap-2.5 px-3.5 sm:px-4.5 py-1.5 sm:py-2 rounded-full transition-all duration-300 cursor-pointer select-none active:scale-95'

          if (isExternal) {
            return (
              <a
                key={item.id || idx}
                href={item.to}
                target={item.to?.startsWith('http') ? '_blank' : undefined}
                rel={item.to?.startsWith('http') ? 'noopener noreferrer' : undefined}
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                style={{ backgroundColor: currentItemBg }}
                className={commonClasses}
              >
                {itemContent}
              </a>
            )
          }

          return (
            <Link
              key={item.id || idx}
              to={item.to || '/'}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              style={{ backgroundColor: currentItemBg }}
              className={commonClasses}
            >
              {itemContent}
            </Link>
          )
        })}
      </div>
    </div>
  )

  // 1. Hero Mode for PC / Desktop inside Hero Section
  if (isHeroMode) {
    return (
      <div className="select-none inline-flex justify-center">
        {renderContent()}
      </div>
    )
  }

  // 2. Floating Mode for Mobile (or general floating bar)
  return (
    <div className="md:hidden fixed bottom-5 sm:bottom-7 inset-x-0 z-40 flex justify-center pointer-events-none px-3.5 sm:px-6">
      <AnimatePresence>
        {isVisible && !isAtBottom && (
          <motion.div
            initial={{ opacity: 0, y: 28, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 22, scale: 0.92 }}
            transition={{ type: 'spring', damping: 26, stiffness: 280, mass: 0.8 }}
          >
            {renderContent()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}