import { useState, useEffect, useMemo } from 'react'
import {
  Zap,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Save,
  RotateCcw,
  CheckCircle2,
  Eye,
  EyeOff,
  Sparkles,
  X,
  Search,
  Link as LinkIcon,
  Globe,
  Layers,
  PhoneCall,
  Calendar,
  Images,
  ExternalLink,
  Palette,
  Sliders,
  PaintBucket,
  Droplets,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Check,
  HelpCircle,
  FileText,
  Heart,
  MessageCircle,
  MapPin,
  Camera,
  Star,
  Gift,
  Share2,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'
import { QUICK_ACCESS_ICONS, hexToRgba } from '../../components/ui/QuickAccess'
import api from '../../utils/api'

const DEFAULT_ITEMS = [
  { id: 'qa-1', icon: 'Images', label: 'Bộ Sưu Tập Concept', to: '/album', is_active: true },
  { id: 'qa-2', icon: 'Calendar', label: 'Đặt Lịch Chụp Ảnh', to: '/contact', is_active: true },
  { id: 'qa-3', icon: 'PhoneCall', label: 'Liên Hệ & Tư Vấn', to: '/contact', is_active: true },
]

const COLOR_PRESETS = [
  {
    id: 'light-clean',
    name: 'Sáng Tinh Tế',
    desc: 'Kính mờ trắng nhẹ nhàng, thanh lịch',
    dotBg: '#ffffff',
    dotHover: '#ea580c',
    bg: '#ffffff',
    bgOp: 85,
    hoverBg: '#fff7ed',
    hoverOp: 100,
    text: '#0f172a',
    hoverText: '#ea580c',
    icon: '#ff7a2f',
    hoverIcon: '#ea580c',
    iconBg: 'rgba(255, 122, 47, 0.12)',
  },
  {
    id: 'dark-luxury',
    name: 'Kính Tối Sang Trọng',
    desc: 'Nền kính đen mờ cao cấp, chữ trắng sáng',
    dotBg: '#0f172a',
    dotHover: '#ff7a2f',
    bg: '#0f172a',
    bgOp: 80,
    hoverBg: '#1e293b',
    hoverOp: 95,
    text: '#ffffff',
    hoverText: '#ff7a2f',
    icon: '#ff7a2f',
    hoverIcon: '#ff7a2f',
    iconBg: 'rgba(255, 122, 47, 0.2)',
  },
  {
    id: 'warm-beige',
    name: 'Be Studio Ấm Áp',
    desc: 'Tone be kem ấm áp đặc trưng của QA Stories',
    dotBg: '#faf5ee',
    dotHover: '#d97706',
    bg: '#faf5ee',
    bgOp: 92,
    hoverBg: '#f5ece0',
    hoverOp: 100,
    text: '#292524',
    hoverText: '#d97706',
    icon: '#d97706',
    hoverIcon: '#d97706',
    iconBg: 'rgba(217, 119, 6, 0.12)',
  },
  {
    id: 'orange-vibrant',
    name: 'Cam Nổi Bật',
    desc: 'Hiệu ứng hover chuyển sang cam thương hiệu',
    dotBg: '#ffffff',
    dotHover: '#ff7a2f',
    bg: '#ffffff',
    bgOp: 90,
    hoverBg: '#ff7a2f',
    hoverOp: 100,
    text: '#0f172a',
    hoverText: '#ffffff',
    icon: '#ff7a2f',
    hoverIcon: '#ffffff',
    iconBg: 'rgba(255, 122, 47, 0.12)',
  },
  {
    id: 'oled-gold',
    name: 'Đen OLED & Kim',
    desc: 'Tone đen tương phản cao với vàng ánh kim',
    dotBg: '#000000',
    dotHover: '#fbbf24',
    bg: '#000000',
    bgOp: 90,
    hoverBg: '#18181b',
    hoverOp: 100,
    text: '#ffffff',
    hoverText: '#fbbf24',
    icon: '#fbbf24',
    hoverIcon: '#fbbf24',
    iconBg: 'rgba(251, 191, 36, 0.15)',
  },
]

const PREVIEW_BACKGROUNDS = [
  {
    id: 'dark-slider',
    name: 'Slider Tối',
    url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1200&q=85',
    overlay: 'bg-black/50',
  },
  {
    id: 'light-baby',
    name: 'Slider Sáng',
    url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200&q=85',
    overlay: 'bg-slate-900/30',
  },
  {
    id: 'warm-studio',
    name: 'Studio Ấm',
    url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1200&q=85',
    overlay: 'bg-stone-900/40',
  },
  {
    id: 'solid-slate',
    name: 'Nền Đen Tuyền',
    url: '',
    overlay: 'bg-slate-950',
  },
]

export default function QuickAccessManager() {
  const { settings, refreshSettings } = useSettings()

  const [enabled, setEnabled] = useState(true)
  const [items, setItems] = useState(DEFAULT_ITEMS)
  const [saving, setSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [systemAlbums, setSystemAlbums] = useState([])

  // Styling Customization State
  const [bgColor, setBgColor] = useState('#ffffff')
  const [bgOpacity, setBgOpacity] = useState(85)
  const [hoverBg, setHoverBg] = useState('#fff7ed')
  const [hoverOpacity, setHoverOpacity] = useState(100)
  const [textColor, setTextColor] = useState('#0f172a')
  const [hoverTextColor, setHoverTextColor] = useState('#ea580c')
  const [iconColor, setIconColor] = useState('#ff7a2f')
  const [hoverIconColor, setHoverIconColor] = useState('#ff7a2f')
  const [iconBg, setIconBg] = useState('rgba(255, 122, 47, 0.12)')
  
  // Style Tab State ('normal' or 'hover') & Collapsible State (collapsed by default)
  const [activeStyleTab, setActiveStyleTab] = useState('normal')
  const [colorCustomizerOpen, setColorCustomizerOpen] = useState(false)

  // Preview State
  const [previewHoveredIdx, setPreviewHoveredIdx] = useState(null)
  const [previewBg, setPreviewBg] = useState(PREVIEW_BACKGROUNDS[0])
  const [previewDevice, setPreviewDevice] = useState('desktop') // 'desktop' | 'mobile'

  // Modal State
  const [modalOpen, setModalOpen] = useState(false)
  const [editingIndex, setEditingIndex] = useState(null)
  const [iconSearch, setIconSearch] = useState('')
  const [formData, setFormData] = useState({
    id: '',
    label: '',
    to: '/contact',
    icon: 'Sparkles',
    is_active: true,
  })

  // Load albums from system
  useEffect(() => {
    const fetchAlbums = async () => {
      try {
        const res = await api.get('/albums')
        if (res.success && res.data) {
          setSystemAlbums(res.data || [])
        }
      } catch (err) {
        console.warn('Lỗi tải danh sách albums cho quick access:', err.message)
      }
    }
    fetchAlbums()
  }, [])

  // Load from settings
  useEffect(() => {
    if (settings) {
      if (settings.quick_access_enabled !== undefined) {
        setEnabled(settings.quick_access_enabled === '1' || settings.quick_access_enabled === true)
      }
      if (settings.quick_access_bg_color) {
        setBgColor(settings.quick_access_bg_color)
      }
      if (settings.quick_access_bg_opacity !== undefined) {
        setBgOpacity(Number(settings.quick_access_bg_opacity))
      }
      if (settings.quick_access_hover_bg) {
        setHoverBg(settings.quick_access_hover_bg)
      }
      if (settings.quick_access_hover_opacity !== undefined) {
        setHoverOpacity(Number(settings.quick_access_hover_opacity))
      }
      if (settings.quick_access_text_color) {
        setTextColor(settings.quick_access_text_color)
      }
      if (settings.quick_access_hover_text_color) {
        setHoverTextColor(settings.quick_access_hover_text_color)
      }
      if (settings.quick_access_icon_color) {
        setIconColor(settings.quick_access_icon_color)
      }
      if (settings.quick_access_hover_icon_color) {
        setHoverIconColor(settings.quick_access_hover_icon_color)
      } else if (settings.quick_access_icon_color) {
        setHoverIconColor(settings.quick_access_icon_color)
      }
      if (settings.quick_access_icon_bg) {
        setIconBg(settings.quick_access_icon_bg)
      }
      if (settings.quick_access_items) {
        try {
          const parsed = typeof settings.quick_access_items === 'string'
            ? JSON.parse(settings.quick_access_items)
            : settings.quick_access_items
          if (Array.isArray(parsed) && parsed.length > 0) {
            setItems(parsed)
          }
        } catch (e) {
          console.warn('Lỗi đọc quick_access_items:', e)
        }
      }
    }
  }, [settings])

  // Handlers for Items
  const handleOpenCreateModal = () => {
    setEditingIndex(null)
    setIconSearch('')
    setFormData({
      id: `qa-${Date.now()}`,
      label: '',
      to: '/contact',
      icon: 'Sparkles',
      is_active: true,
    })
    setModalOpen(true)
  }

  const handleOpenEditModal = (item, idx) => {
    setEditingIndex(idx)
    setIconSearch('')
    setFormData({
      id: item.id || `qa-${idx}`,
      label: item.label || '',
      to: item.to || '/contact',
      icon: item.icon || 'Sparkles',
      is_active: item.is_active !== false,
    })
    setModalOpen(true)
  }

  const handleModalSubmit = (e) => {
    e.preventDefault()
    if (!formData.label.trim()) {
      alert('Vui lòng nhập tên / tiêu đề phím tắt!')
      return
    }
    if (!formData.to.trim()) {
      alert('Vui lòng nhập đường dẫn liên kết!')
      return
    }

    if (editingIndex !== null) {
      const updated = [...items]
      updated[editingIndex] = { ...formData }
      setItems(updated)
    } else {
      setItems([...items, { ...formData }])
    }
    setModalOpen(false)
  }

  const handleDeleteItem = (idx) => {
    if (items.length <= 1) {
      if (!window.confirm('Bạn đang xóa nút cuối cùng. Bạn có chắc muốn tiếp tục?')) return
    } else {
      if (!window.confirm('Bạn có chắc muốn xóa phím tắt này?')) return
    }
    setItems(items.filter((_, i) => i !== idx))
  }

  const handleMoveUp = (idx) => {
    if (idx === 0) return
    const updated = [...items]
    const temp = updated[idx - 1]
    updated[idx - 1] = updated[idx]
    updated[idx] = temp
    setItems(updated)
  }

  const handleMoveDown = (idx) => {
    if (idx === items.length - 1) return
    const updated = [...items]
    const temp = updated[idx + 1]
    updated[idx + 1] = updated[idx]
    updated[idx] = temp
    setItems(updated)
  }

  const handleToggleItemActive = (idx) => {
    const updated = [...items]
    updated[idx].is_active = !updated[idx].is_active
    setItems(updated)
  }

  const handleResetDefaults = () => {
    if (window.confirm('Khôi phục danh sách phím tắt và màu sắc về mặc định?')) {
      setItems(DEFAULT_ITEMS)
      setEnabled(true)
      setBgColor('#ffffff')
      setBgOpacity(85)
      setHoverBg('#fff7ed')
      setHoverOpacity(100)
      setTextColor('#0f172a')
      setHoverTextColor('#ea580c')
      setIconColor('#ff7a2f')
      setHoverIconColor('#ff7a2f')
      setIconBg('rgba(255, 122, 47, 0.12)')
    }
  }

  const handleSaveAll = async () => {
    try {
      setSaving(true)
      const payload = {
        quick_access_enabled: enabled ? '1' : '0',
        quick_access_items: JSON.stringify(items),
        quick_access_bg_color: bgColor,
        quick_access_bg_opacity: String(bgOpacity),
        quick_access_hover_bg: hoverBg,
        quick_access_hover_opacity: String(hoverOpacity),
        quick_access_text_color: textColor,
        quick_access_hover_text_color: hoverTextColor,
        quick_access_icon_color: iconColor,
        quick_access_hover_icon_color: hoverIconColor,
        quick_access_icon_bg: iconBg,
      }
      const res = await api.post('/settings', payload)
      if (res.success) {
        await refreshSettings()
        setSaveSuccess(true)
        setTimeout(() => setSaveSuccess(false), 3000)
      } else {
        alert('Lưu thất bại: ' + (res.message || 'Lỗi không xác định'))
      }
    } catch (error) {
      alert('Lỗi lưu cấu hình: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  // Filter icons for icon picker
  const filteredIconKeys = useMemo(() => {
    return Object.keys(QUICK_ACCESS_ICONS).filter((key) => {
      const data = QUICK_ACCESS_ICONS[key]
      const q = iconSearch.toLowerCase()
      return key.toLowerCase().includes(q) || data.label.toLowerCase().includes(q)
    })
  }, [iconSearch])

  // System Destinations (Pages, Categories, Specific Albums, Home Sections, Contact Actions)
  const phone = settings?.contact_phone || '0901234567'
  const zalo = settings?.contact_zalo || phone

  const systemDestinations = useMemo(() => {
    return [
      {
        group: '📄 Các Trang Chính Hệ Thống',
        options: [
          { label: 'Bộ Sưu Tập Concept (/album)', url: '/album', icon: 'Images', defaultLabel: 'Bộ Sưu Tập Concept' },
          { label: 'Đặt Lịch Chụp / Liên Hệ (/contact)', url: '/contact', icon: 'Calendar', defaultLabel: 'Đặt Lịch Chụp' },
          { label: 'Giới Thiệu Studio QA Stories (/about)', url: '/about', icon: 'Heart', defaultLabel: 'Về QA Stories' },
          { label: 'Trang Chủ Website (/)', url: '/', icon: 'Camera', defaultLabel: 'Trang Chủ' },
        ],
      },
      {
        group: '🎀 Danh Mục Concept Chụp',
        options: [
          { label: 'Concept Sơ Sinh Newborn (/album?category=newborn)', url: '/album?category=newborn', icon: 'Sparkles', defaultLabel: 'Concept Sơ Sinh' },
          { label: 'Concept 100 Ngày Tuổi (/album?category=100days)', url: '/album?category=100days', icon: 'Star', defaultLabel: '100 Ngày Tuổi' },
          { label: 'Concept Thôi Nôi 1 Tuổi (/album?category=1year)', url: '/album?category=1year', icon: 'Gift', defaultLabel: 'Thôi Nôi 1 Tuổi' },
          { label: 'Concept Gia Đình Yêu Thương (/album?category=family)', url: '/album?category=family', icon: 'Heart', defaultLabel: 'Ảnh Gia Đình' },
        ],
      },
      ...(systemAlbums && systemAlbums.length > 0
        ? [
            {
              group: '📸 Album Ảnh Thực Tế Trên Hệ Thống',
              options: systemAlbums.slice(0, 20).map((a) => ({
                label: `Album: ${a.title} (/album/${a.slug})`,
                url: `/album/${a.slug}`,
                icon: 'Images',
                defaultLabel: a.title,
              })),
            },
          ]
        : []),
      {
        group: '📌 Các Mục Nổi Bật Trên Trang Chủ',
        options: [
          { label: 'Bảng Giá & Gói Dịch Vụ (/#pricing)', url: '/#pricing', icon: 'FileText', defaultLabel: 'Bảng Giá Dịch Vụ' },
          { label: 'Quy Trình Thực Hiện Bộ Ảnh (/#process)', url: '/#process', icon: 'Layers', defaultLabel: 'Quy Trình Chụp' },
          { label: 'Đánh Giá Của Khách Hàng (/#reviews)', url: '/#reviews', icon: 'Star', defaultLabel: 'Đánh Giá Khách Hàng' },
          { label: 'Hỏi Đáp Thường Gặp FAQ (/#faq)', url: '/#faq', icon: 'HelpCircle', defaultLabel: 'Hỏi Đáp FAQ' },
          { label: 'Form Đăng Ký Đặt Lịch Nhanh (/#booking-form)', url: '/#booking-form', icon: 'Calendar', defaultLabel: 'Đặt Lịch Ngay' },
        ],
      },
      {
        group: '📞 Liên Hệ & Hành Động Trực Tiếp',
        options: [
          { label: `Gọi Hotline Trực Tiếp (tel:${phone})`, url: `tel:${phone}`, icon: 'PhoneCall', defaultLabel: 'Gọi Hotline' },
          { label: `Nhắn Tin Zalo Tư Vấn (https://zalo.me/${zalo})`, url: `https://zalo.me/${zalo}`, icon: 'MessageCircle', defaultLabel: 'Chat Zalo' },
          ...(settings?.social_facebook
            ? [{ label: 'Facebook Fanpage Studio', url: settings.social_facebook, icon: 'Share2', defaultLabel: 'Facebook Fanpage' }]
            : []),
          ...(settings?.google_maps_url
            ? [{ label: 'Chỉ Đường Google Maps Đến Studio', url: settings.google_maps_url, icon: 'MapPin', defaultLabel: 'Địa Chỉ Studio' }]
            : []),
        ],
      },
    ]
  }, [systemAlbums, phone, zalo, settings])

  const activeItemsCount = items.filter((i) => i.is_active !== false).length

  return (
    <div className="space-y-6 max-w-[1700px] mx-auto pb-12">
      {/* Top Header Bar */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-primary shadow-xs">
              <Zap size={20} className="fill-primary/20" />
            </div>
            <h1 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
              Cấu Hình Phím Tắt Nhanh (Quick Access)
            </h1>
            <span
              className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border transition-all ${
                enabled
                  ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                  : 'bg-slate-100 text-slate-500 border-slate-200'
              }`}
            >
              {enabled ? `● Đang Bật (${activeItemsCount} nút)` : '○ Đang Tắt'}
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm pl-0 sm:pl-11">
            Tùy biến thanh lối tắt nổi bật trên ảnh slider trang chủ: màu sắc, độ trong suốt kính mờ và các nút hành động.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 self-start md:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 shadow-xs transition-colors flex items-center gap-1.5"
            title="Khôi phục màu sắc và danh sách nút mặc định"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">Khôi Phục Mặc Định</span>
          </button>
          
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-primary-dark text-xs font-semibold border border-orange-200 shadow-xs transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Thêm Nút Mới</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-md shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : saveSuccess ? (
              <CheckCircle2 size={16} className="text-white" />
            ) : (
              <Save size={16} />
            )}
            <span>{saving ? 'Đang Lưu...' : saveSuccess ? 'Đã Lưu Thành Công!' : 'Lưu Thay Đổi'}</span>
          </button>
        </div>
      </div>

      {/* 2-Column Responsive Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* ================= LEFT COLUMN: SETTINGS & BUTTONS (Col 7 / 12) ================= */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: Master Enable Switch */}
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/60 flex items-center justify-center text-amber-600 shrink-0">
                <Sun size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-bold text-base text-slate-900">Hiển Thị Trên Trang Chủ</h3>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      enabled ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {enabled ? 'KÍCH HOẠT' : 'TẠM TẮT'}
                  </span>
                </div>
                <p className="text-slate-500 text-xs mt-0.5">
                  Bật/tắt thanh truy cập nhanh overlay trên hero banner trang chủ
                </p>
              </div>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={enabled}
              onClick={() => setEnabled(!enabled)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                enabled ? 'bg-primary' : 'bg-slate-300 hover:bg-slate-400'
              }`}
            >
              <span className="sr-only">Bật hoặc tắt Quick Access</span>
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md transition duration-200 ease-in-out ${
                  enabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Card 2: Button Items Manager (PRIMARY FOCUS) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-primary shadow-xs">
                  <Layers size={18} />
                </div>
                <div>
                  <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900 flex items-center gap-2">
                    Danh Sách Nút Phím Tắt
                    <span className="text-xs font-mono font-bold bg-orange-100/70 text-primary-dark px-2 py-0.5 rounded-full border border-orange-200/60">
                      {items.length} nút
                    </span>
                  </h2>
                  <p className="text-slate-500 text-xs">Sắp xếp thứ tự, điều chỉnh nhãn tiêu đề và liên kết từng nút</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-md shadow-primary/20 flex items-center gap-1.5 transition-all"
              >
                <Plus size={15} />
                <span>Thêm Nút</span>
              </button>
            </div>

            {/* Items List */}
            <div className="space-y-2.5">
              {items.map((item, idx) => {
                const IconData = QUICK_ACCESS_ICONS[item.icon] || QUICK_ACCESS_ICONS.Zap
                const IconComponent = IconData.icon

                // Check destination tag label
                let destTag = 'Liên kết'
                let destTagColor = 'bg-slate-100 text-slate-600'
                if (item.to?.startsWith('tel:')) {
                  destTag = 'Hotline'
                  destTagColor = 'bg-rose-50 text-rose-600 border border-rose-200'
                } else if (item.to?.includes('zalo.me')) {
                  destTag = 'Zalo'
                  destTagColor = 'bg-blue-50 text-blue-600 border border-blue-200'
                } else if (item.to?.startsWith('/#')) {
                  destTag = 'Trang chủ section'
                  destTagColor = 'bg-purple-50 text-purple-600 border border-purple-200'
                } else if (item.to?.startsWith('/album')) {
                  destTag = 'Album Concept'
                  destTagColor = 'bg-amber-50 text-amber-700 border border-amber-200'
                } else if (item.to?.startsWith('/contact')) {
                  destTag = 'Đặt lịch'
                  destTagColor = 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }

                return (
                  <div
                    key={item.id || idx}
                    className={`border rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all duration-200 shadow-2xs ${
                      item.is_active !== false
                        ? 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                        : 'border-slate-200 opacity-60 bg-slate-50/80'
                    }`}
                  >
                    {/* Left info */}
                    <div className="flex items-center gap-3 min-w-0">
                      {/* Move controls */}
                      <div className="flex flex-col gap-1 shrink-0">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveUp(idx)}
                          className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-slate-100 transition-colors"
                          title="Di chuyển lên trước"
                        >
                          <ArrowUp size={12} />
                        </button>
                        <button
                          type="button"
                          disabled={idx === items.length - 1}
                          onClick={() => handleMoveDown(idx)}
                          className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 disabled:opacity-30 disabled:hover:bg-slate-100 transition-colors"
                          title="Di chuyển xuống sau"
                        >
                          <ArrowDown size={12} />
                        </button>
                      </div>

                      {/* Icon preview */}
                      <div className="w-10 h-10 rounded-xl bg-orange-50/80 border border-orange-200/80 flex items-center justify-center text-primary shrink-0 shadow-2xs">
                        <IconComponent size={18} />
                      </div>

                      {/* Text detail */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-heading font-bold text-sm text-slate-900 truncate">
                            {item.label || '(Chưa có tiêu đề)'}
                          </h4>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                            #{idx + 1}
                          </span>
                          <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${destTagColor} shrink-0`}>
                            {destTag}
                          </span>
                          {item.is_active === false && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200 shrink-0">
                              Đang ẩn
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-0.5">
                          <LinkIcon size={11} className="text-slate-400 shrink-0" />
                          <span className="text-slate-500 font-mono text-[11px] truncate max-w-[200px] sm:max-w-xs md:max-w-sm">
                            {item.to || '/'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center justify-end gap-1.5 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleToggleItemActive(idx)}
                        title={item.is_active !== false ? 'Ẩn nút này' : 'Bật nút này'}
                        className={`p-2 rounded-xl transition-colors ${
                          item.is_active !== false
                            ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {item.is_active !== false ? <Eye size={15} /> : <EyeOff size={15} />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(item, idx)}
                        title="Chỉnh sửa nút"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200 transition-colors"
                      >
                        <Edit2 size={15} />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(idx)}
                        title="Xóa nút"
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Card 3: Collapsible Appearance & Styling Studio (Mặc định thu gọn) */}
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden transition-all duration-300">
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => setColorCustomizerOpen(!colorCustomizerOpen)}
              className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-primary shrink-0 shadow-xs">
                  <Palette size={18} />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-heading font-bold text-base sm:text-lg text-slate-900">
                      Tùy Chỉnh Màu Sắc & Hiệu Ứng Kính (Glassmorphism)
                    </h2>
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      {colorCustomizerOpen ? 'Đang mở' : 'Mặc định thu gọn'}
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs truncate mt-0.5">
                    Màu nền, độ trong suốt kính mờ, màu chữ và màu biểu tượng khi thường hoặc khi rê chuột
                  </p>
                </div>
              </div>

              {/* Preview dots & toggle chevron */}
              <div className="flex items-center gap-3 shrink-0">
                {/* Mini Color Dots Preview */}
                <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80">
                  <span
                    style={{ backgroundColor: bgColor }}
                    title={`Nền thường: ${bgColor}`}
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                  />
                  <span
                    style={{ backgroundColor: textColor }}
                    title={`Chữ thường: ${textColor}`}
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                  />
                  <span
                    style={{ backgroundColor: iconColor }}
                    title={`Icon thường: ${iconColor}`}
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                  />
                  <span className="text-slate-300 text-xs">/</span>
                  <span
                    style={{ backgroundColor: hoverBg }}
                    title={`Nền hover: ${hoverBg}`}
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                  />
                  <span
                    style={{ backgroundColor: hoverTextColor }}
                    title={`Chữ hover: ${hoverTextColor}`}
                    className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                  />
                </div>

                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
                  {colorCustomizerOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
              </div>
            </button>

            {/* Accordion Body Content */}
            {colorCustomizerOpen && (
              <div className="p-5 sm:p-6 pt-0 sm:pt-0 space-y-6 border-t border-slate-100 animate-in fade-in-50 duration-200">
                {/* 1-Click Preset Badges */}
                <div className="pt-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                    Bộ Màu Mẫu Có Sẵn (1-Click)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                    {COLOR_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => {
                          setBgColor(preset.bg)
                          setBgOpacity(preset.bgOp)
                          setHoverBg(preset.hoverBg)
                          setHoverOpacity(preset.hoverOp)
                          setTextColor(preset.text)
                          setHoverTextColor(preset.hoverText)
                          setIconColor(preset.icon)
                          setHoverIconColor(preset.hoverIcon || preset.icon)
                          setIconBg(preset.iconBg)
                        }}
                        className="group p-2 rounded-xl bg-slate-50 hover:bg-orange-50/50 border border-slate-200/80 hover:border-orange-200 text-left transition-all flex flex-col justify-between"
                      >
                        <div className="flex items-center justify-between gap-1 mb-1.5">
                          <span className="text-[11px] font-bold text-slate-800 group-hover:text-primary transition-colors truncate">
                            {preset.name}
                          </span>
                          <div className="flex items-center -space-x-1 shrink-0">
                            <span
                              style={{ backgroundColor: preset.dotBg }}
                              className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                            />
                            <span
                              style={{ backgroundColor: preset.dotHover }}
                              className="w-3.5 h-3.5 rounded-full border border-white shadow-2xs"
                            />
                          </div>
                        </div>
                        <span className="text-[10px] text-slate-600 line-clamp-1 leading-snug">
                          {preset.desc}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Normal vs Hover State Tabs */}
                <div className="space-y-4">
                  <div className="flex items-center p-1 bg-slate-100/80 rounded-xl border border-slate-200/70">
                    <button
                      type="button"
                      onClick={() => setActiveStyleTab('normal')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        activeStyleTab === 'normal'
                          ? 'bg-white text-slate-900 shadow-xs border border-slate-200/60'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Sun size={15} className={activeStyleTab === 'normal' ? 'text-amber-500' : 'text-slate-400'} />
                      <span>1. Trạng Thái Thường (Mặc Định)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveStyleTab('hover')}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                        activeStyleTab === 'hover'
                          ? 'bg-white text-primary shadow-xs border border-slate-200/60'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Sparkles size={15} className={activeStyleTab === 'hover' ? 'text-primary' : 'text-slate-400'} />
                      <span>2. Trạng Thái Khi Đưa Chuột (Hover)</span>
                    </button>
                  </div>

                  {/* TAB 1: NORMAL STATE */}
                  {activeStyleTab === 'normal' && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-4 animate-in fade-in-50 duration-200">
                      {/* Background Color & Opacity */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Background Color */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-700">Màu Nền Khối (Background):</label>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <div className="relative">
                              <input
                                type="color"
                                value={bgColor.startsWith('#') && bgColor.length === 7 ? bgColor : '#ffffff'}
                                onChange={(e) => setBgColor(e.target.value)}
                                className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0 shadow-xs"
                              />
                            </div>
                            <input
                              type="text"
                              value={bgColor}
                              onChange={(e) => setBgColor(e.target.value)}
                              placeholder="Nhập mã màu HEX..."
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:border-primary shadow-2xs"
                            />
                          </div>
                          {/* Swatches */}
                          <div className="flex items-center gap-1.5 pt-1">
                            {[
                              { label: 'Trắng', hex: '#ffffff' },
                              { label: 'Slate', hex: '#0f172a' },
                              { label: 'Đen', hex: '#000000' },
                              { label: 'Be Studio', hex: '#faf5ee' },
                              { label: 'Xám', hex: '#f1f5f9' },
                              { label: 'Cam Nhạt', hex: '#fff7ed' },
                            ].map((swatch) => (
                              <button
                                key={swatch.hex}
                                type="button"
                                title={swatch.label}
                                onClick={() => setBgColor(swatch.hex)}
                                style={{ backgroundColor: swatch.hex }}
                                className={`w-6 h-6 rounded-lg border transition-all ${
                                  bgColor.toLowerCase() === swatch.hex.toLowerCase()
                                    ? 'ring-2 ring-primary ring-offset-1 scale-110 border-primary'
                                    : 'border-slate-300 hover:scale-105'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Background Opacity */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                              <Sliders size={13} className="text-primary" />
                              Độ Trong Suốt Nền:
                            </label>
                            <span className="text-xs font-mono font-bold text-primary bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                              {bgOpacity}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={bgOpacity}
                            onChange={(e) => setBgOpacity(Number(e.target.value))}
                            className="w-full accent-primary cursor-pointer h-2 bg-slate-200 rounded-lg mt-2"
                          />
                          <div className="flex items-center justify-between gap-1 pt-1">
                            {[20, 50, 75, 85, 95, 100].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => setBgOpacity(pct)}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors flex-1 text-center ${
                                  bgOpacity === pct
                                    ? 'bg-primary text-white font-bold'
                                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                                }`}
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Text Color & Icon Color */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-200/60">
                        <div>
                          <span className="text-xs font-semibold text-slate-700 block mb-1.5">Màu Chữ Mặc Định:</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={textColor.startsWith('#') && textColor.length === 7 ? textColor : '#0f172a'}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0 shadow-xs"
                            />
                            <input
                              type="text"
                              value={textColor}
                              onChange={(e) => setTextColor(e.target.value)}
                              className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>

                        <div>
                          <span className="text-xs font-semibold text-slate-700 block mb-1.5">Màu Biểu Tượng (Icon):</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={iconColor.startsWith('#') && iconColor.length === 7 ? iconColor : '#ff7a2f'}
                              onChange={(e) => {
                                const val = e.target.value
                                setIconColor(val)
                                setIconBg(hexToRgba(val, 0.14))
                              }}
                              className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0 shadow-xs"
                            />
                            <input
                              type="text"
                              value={iconColor}
                              onChange={(e) => {
                                const val = e.target.value
                                setIconColor(val)
                                if (val.startsWith('#') && (val.length === 4 || val.length === 7)) {
                                  setIconBg(hexToRgba(val, 0.14))
                                }
                              }}
                              className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-primary"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: HOVER STATE */}
                  {activeStyleTab === 'hover' && (
                    <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/40 border border-orange-200/80 space-y-4 animate-in fade-in-50 duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Hover Background Color */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-700">Màu Nền Nút Khi Hover:</label>
                          </div>
                          <div className="flex items-center gap-2.5">
                            <input
                              type="color"
                              value={hoverBg.startsWith('#') && hoverBg.length === 7 ? hoverBg : '#fff7ed'}
                              onChange={(e) => setHoverBg(e.target.value)}
                              className="w-10 h-10 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0 shadow-xs"
                            />
                            <input
                              type="text"
                              value={hoverBg}
                              onChange={(e) => setHoverBg(e.target.value)}
                              placeholder="Nhập mã màu HEX..."
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 font-mono text-xs focus:outline-none focus:border-primary shadow-2xs"
                            />
                          </div>
                          {/* Hover Quick Swatches */}
                          <div className="flex items-center gap-1.5 pt-1">
                            {[
                              { label: 'Cam Nhạt', hex: '#fff7ed' },
                              { label: 'Cam Đậm', hex: '#ff7a2f' },
                              { label: 'Trắng Sáng', hex: '#ffffff' },
                              { label: 'Xám Tối', hex: '#1e293b' },
                              { label: 'Be Đậm', hex: '#f5ece0' },
                              { label: 'Đen OLED', hex: '#18181b' },
                            ].map((swatch) => (
                              <button
                                key={swatch.hex}
                                type="button"
                                title={swatch.label}
                                onClick={() => setHoverBg(swatch.hex)}
                                style={{ backgroundColor: swatch.hex }}
                                className={`w-6 h-6 rounded-lg border transition-all ${
                                  hoverBg.toLowerCase() === swatch.hex.toLowerCase()
                                    ? 'ring-2 ring-primary ring-offset-1 scale-110 border-primary'
                                    : 'border-slate-300 hover:scale-105'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Hover Background Opacity */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                              <Sliders size={13} className="text-primary" />
                              Độ Trong Suốt Khi Hover:
                            </label>
                            <span className="text-xs font-mono font-bold text-primary bg-white px-2 py-0.5 rounded-md border border-orange-200">
                              {hoverOpacity}%
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={hoverOpacity}
                            onChange={(e) => setHoverOpacity(Number(e.target.value))}
                            className="w-full accent-primary cursor-pointer h-2 bg-slate-200 rounded-lg mt-2"
                          />
                          <div className="flex items-center justify-between gap-1 pt-1">
                            {[30, 60, 80, 90, 95, 100].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => setHoverOpacity(pct)}
                                className={`px-1.5 py-0.5 rounded text-[10px] font-mono transition-colors flex-1 text-center ${
                                  hoverOpacity === pct
                                    ? 'bg-primary text-white font-bold'
                                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                                }`}
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Hover Text Color & Hover Icon Color */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-orange-200/60">
                        {/* Hover Text Color */}
                        <div>
                          <span className="text-xs font-semibold text-slate-700 block mb-1.5">Màu Chữ Khi Hover:</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={hoverTextColor.startsWith('#') && hoverTextColor.length === 7 ? hoverTextColor : '#ea580c'}
                              onChange={(e) => setHoverTextColor(e.target.value)}
                              className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0 shadow-xs"
                            />
                            <input
                              type="text"
                              value={hoverTextColor}
                              onChange={(e) => setHoverTextColor(e.target.value)}
                              className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-primary"
                            />
                          </div>
                          {/* Hover text swatches */}
                          <div className="flex items-center gap-1.5 pt-2">
                            {[
                              { label: 'Cam Studio', hex: '#ea580c' },
                              { label: 'Trắng Tinh', hex: '#ffffff' },
                              { label: 'Đen Slate', hex: '#0f172a' },
                              { label: 'Vàng Kim', hex: '#fbbf24' },
                              { label: 'Hồng Đỏ', hex: '#e11d48' },
                            ].map((swatch) => (
                              <button
                                key={swatch.hex}
                                type="button"
                                title={swatch.label}
                                onClick={() => setHoverTextColor(swatch.hex)}
                                style={{ backgroundColor: swatch.hex }}
                                className={`w-5 h-5 rounded-md border transition-all ${
                                  hoverTextColor.toLowerCase() === swatch.hex.toLowerCase()
                                    ? 'ring-2 ring-primary ring-offset-1 scale-110 border-primary'
                                    : 'border-slate-300 hover:scale-105'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Hover Icon Color */}
                        <div>
                          <span className="text-xs font-semibold text-slate-700 block mb-1.5">Màu Biểu Tượng (Icon) Khi Hover:</span>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={hoverIconColor.startsWith('#') && hoverIconColor.length === 7 ? hoverIconColor : '#ff7a2f'}
                              onChange={(e) => setHoverIconColor(e.target.value)}
                              className="w-8 h-8 rounded-lg border border-slate-300 cursor-pointer p-0.5 bg-white shrink-0 shadow-xs"
                            />
                            <input
                              type="text"
                              value={hoverIconColor}
                              onChange={(e) => setHoverIconColor(e.target.value)}
                              className="flex-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 font-mono text-xs focus:outline-none focus:border-primary"
                            />
                          </div>
                          {/* Hover icon swatches */}
                          <div className="flex items-center gap-1.5 pt-2">
                            {[
                              { label: 'Cam Studio', hex: '#ff7a2f' },
                              { label: 'Cam Đậm', hex: '#ea580c' },
                              { label: 'Trắng Tinh', hex: '#ffffff' },
                              { label: 'Vàng Kim', hex: '#fbbf24' },
                              { label: 'Be Kem', hex: '#d97706' },
                            ].map((swatch) => (
                              <button
                                key={swatch.hex}
                                type="button"
                                title={swatch.label}
                                onClick={() => setHoverIconColor(swatch.hex)}
                                style={{ backgroundColor: swatch.hex }}
                                className={`w-5 h-5 rounded-md border transition-all ${
                                  hoverIconColor.toLowerCase() === swatch.hex.toLowerCase()
                                    ? 'ring-2 ring-primary ring-offset-1 scale-110 border-primary'
                                    : 'border-slate-300 hover:scale-105'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ================= RIGHT COLUMN: STICKY LIVE PREVIEW (Col 5 / 12) ================= */}
        <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
          
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 shadow-sm space-y-4">
            
            {/* Live Preview Header */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <h3 className="font-heading font-bold text-sm sm:text-base text-slate-900">
                  Xem Trước Trực Tiếp (Live Preview)
                </h3>
              </div>

              {/* Viewport switch (Desktop vs Mobile simulation) */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-slate-600">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-md transition-all ${
                    previewDevice === 'desktop' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Giao diện máy tính / Màn hình rộng"
                >
                  <Monitor size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-md transition-all ${
                    previewDevice === 'mobile' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-400 hover:text-slate-700'
                  }`}
                  title="Giao diện điện thoại"
                >
                  <Smartphone size={14} />
                </button>
              </div>
            </div>

            {/* Background Simulator Switcher */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>Thử nghiệm với nền Slider:</span>
                <span className="text-primary font-semibold">{previewBg.name}</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {PREVIEW_BACKGROUNDS.map((bg) => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setPreviewBg(bg)}
                    className={`px-2 py-1.5 rounded-lg text-[10px] font-medium border text-center transition-all truncate ${
                      previewBg.id === bg.id
                        ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {bg.name}
                  </button>
                ))}
              </div>
            </div>

            {/* The Actual Simulated Hero Screen */}
            <div
              className={`relative rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex flex-col items-center justify-center transition-all duration-300 ${
                previewDevice === 'mobile'
                  ? 'max-w-[320px] mx-auto min-h-[360px] p-4 py-8'
                  : 'w-full min-h-[260px] p-5 sm:p-7'
              }`}
            >
              {/* Background Image & Overlay */}
              {previewBg.url ? (
                <div
                  className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                  style={{ backgroundImage: `url(${previewBg.url})` }}
                />
              ) : null}
              <div className={`absolute inset-0 ${previewBg.overlay} transition-all duration-500`} />

              {/* Slider Dummy Content */}
              <div className="relative z-10 text-center mb-6 pointer-events-none">
                <span className="text-[10px] uppercase font-bold tracking-widest text-white/70 block mb-1">
                  QA Stories Studio
                </span>
                <h4 className="font-heading font-bold text-white text-base sm:text-lg drop-shadow-md">
                  Khoảnh Khắc Đẹp Tự Nhiên
                </h4>
              </div>

              {/* Quick Access Bar Component Preview */}
              {!enabled ? (
                <div className="relative z-10 py-4 px-6 rounded-xl bg-black/70 border border-white/10 text-slate-300 text-xs text-center backdrop-blur-md max-w-xs">
                  <EyeOff size={18} className="mx-auto text-slate-400 mb-1.5" />
                  Thanh Quick Access đang được <strong>TẮT</strong> — sẽ không hiển thị trên trang chủ.
                </div>
              ) : items.filter((i) => i.is_active !== false).length === 0 ? (
                <div className="relative z-10 py-4 px-6 rounded-xl bg-black/70 border border-white/10 text-amber-300 text-xs text-center backdrop-blur-md max-w-xs">
                  Chưa có phím tắt nào được kích hoạt hiển thị.
                </div>
              ) : (
                <div className="relative z-10 w-full flex justify-center">
                  <div
                    style={{
                      backgroundColor: hexToRgba(bgColor, bgOpacity / 100),
                      borderColor: hexToRgba(textColor, 0.12),
                    }}
                    className="backdrop-blur-2xl border rounded-full p-1 sm:p-1.5 shadow-[0_16px_36px_-6px_rgba(0,0,0,0.25),0_0_0_1px_rgba(255,255,255,0.7)_inset] transition-all duration-300 max-w-full"
                  >
                    <div className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar">
                      {items
                        .filter((item) => item.is_active !== false)
                        .map((item, idx) => {
                          const IconData = QUICK_ACCESS_ICONS[item.icon] || QUICK_ACCESS_ICONS.Zap
                          const IconComponent = IconData.icon
                          const isHovered = previewHoveredIdx === idx
                          const itemBg = isHovered ? hexToRgba(hoverBg, hoverOpacity / 100) : 'transparent'
                          const itemText = isHovered ? hoverTextColor : textColor
                          const currentItemIconColor = isHovered ? hoverIconColor : iconColor
                          const currentItemIconBg = isHovered ? hexToRgba(hoverIconColor, 0.18) : iconBg

                          return (
                            <div
                              key={item.id || idx}
                              onMouseEnter={() => setPreviewHoveredIdx(idx)}
                              onMouseLeave={() => setPreviewHoveredIdx(null)}
                              style={{ backgroundColor: itemBg }}
                              className="flex items-center justify-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all duration-300 cursor-pointer group"
                            >
                              <div
                                style={{
                                  backgroundColor: currentItemIconBg,
                                  color: currentItemIconColor,
                                }}
                                className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all shadow-2xs shrink-0 group-hover:scale-110"
                              >
                                <IconComponent size={14} className="sm:w-[16px] sm:h-[16px]" />
                              </div>
                              <span
                                style={{ color: itemText }}
                                className="font-heading text-xs sm:text-[13px] font-semibold transition-colors truncate pr-1"
                              >
                                {item.label || 'Chưa đặt tên'}
                              </span>
                            </div>
                          )
                        })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Tips & Status */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1 text-[11px] text-slate-400">
                <Sparkles size={13} className="text-amber-500" />
                Rê chuột vào thanh trên để thử hiệu ứng
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                {activeItemsCount} / {items.length} nút hiển thị
              </span>
            </div>

            {/* Sticky Save Button Panel */}
            <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={saving}
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-md shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : saveSuccess ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <Save size={16} />
                )}
                <span>{saving ? 'Đang Lưu...' : saveSuccess ? 'Đã Lưu Thay Đổi!' : 'Lưu Ngay Cấu Hình'}</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ================= MODAL ADD / EDIT ITEM ================= */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-primary">
                {editingIndex !== null ? <Edit2 size={18} /> : <Plus size={18} />}
              </div>
              <div>
                <h3 className="font-heading font-bold text-lg sm:text-xl text-slate-900">
                  {editingIndex !== null ? 'Chỉnh Sửa Phím Tắt' : 'Thêm Phím Tắt Mới'}
                </h3>
                <p className="text-slate-500 text-xs">
                  Cấu hình nhãn tên, đường dẫn điều hướng và biểu tượng nút
                </p>
              </div>
            </div>

            <form onSubmit={handleModalSubmit} className="space-y-4 text-xs mt-5">
              {/* Label */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Tên / Tiêu Đề Nút <span className="text-primary">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nhập tên hiển thị của nút..."
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:bg-white focus:outline-none focus:border-primary shadow-2xs"
                />
              </div>

              {/* Destination URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-700 font-semibold">
                    Đường Dẫn Liên Kết (URL) <span className="text-primary">*</span>
                  </label>
                  <span className="text-[11px] text-slate-500">
                    Chọn nhanh từ hệ thống hoặc gõ URL
                  </span>
                </div>

                {/* System Pages / Sections Dropdown Selector */}
                <div className="mb-2">
                  <div className="relative">
                    <select
                      onChange={(e) => {
                        const val = e.target.value
                        if (!val) return
                        const found = [
                          ...systemDestinations.flatMap((g) => g.options),
                        ].find((opt) => opt.url === val)

                        setFormData((prev) => ({
                          ...prev,
                          to: val,
                          label: prev.label ? prev.label : (found?.defaultLabel || prev.label),
                          icon: found?.icon && QUICK_ACCESS_ICONS[found.icon] ? found.icon : prev.icon,
                        }))
                      }}
                      className="w-full px-3.5 py-2.5 bg-orange-50/70 hover:bg-orange-50 border border-orange-200 rounded-xl text-slate-800 text-xs font-medium focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer transition-colors shadow-2xs"
                      defaultValue=""
                    >
                      <option value="" disabled>
                        ⚡ Chọn nhanh trang / mục trên hệ thống QA Stories...
                      </option>

                      {systemDestinations.map((group) => (
                        <optgroup key={group.group} label={group.group}>
                          {group.options.map((opt) => (
                            <option key={opt.url} value={opt.url}>
                              {opt.label}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Direct URL Input */}
                <div className="relative mb-2">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <LinkIcon size={14} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Nhập đường dẫn trang, số điện thoại hoặc liên kết..."
                    value={formData.to}
                    onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 font-mono text-xs focus:bg-white focus:outline-none focus:border-primary shadow-2xs"
                  />
                </div>

                {/* Quick Selection Pills */}
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  <span className="text-slate-400 text-[11px] self-center mr-1">Phổ biến:</span>
                  {[
                    { label: 'Bộ Sưu Tập (/album)', url: '/album', icon: 'Images', name: 'Bộ Sưu Tập Concept' },
                    { label: 'Đặt Lịch (/contact)', url: '/contact', icon: 'Calendar', name: 'Đặt Lịch Chụp' },
                    { label: 'Giới Thiệu (/about)', url: '/about', icon: 'Heart', name: 'Về QA Stories' },
                    { label: 'Bảng Giá (/#pricing)', url: '/#pricing', icon: 'FileText', name: 'Bảng Giá Dịch Vụ' },
                    ...(settings?.contact_phone
                      ? [{ label: `Hotline (${settings.contact_phone})`, url: `tel:${settings.contact_phone}`, icon: 'PhoneCall', name: 'Gọi Hotline' }]
                      : []),
                    ...(settings?.contact_zalo
                      ? [{ label: 'Zalo Chat', url: `https://zalo.me/${settings.contact_zalo}`, icon: 'MessageCircle', name: 'Chat Zalo' }]
                      : []),
                  ].map((sug) => (
                    <button
                      key={sug.url}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          to: sug.url,
                          label: prev.label || sug.name,
                          icon: prev.icon === 'Sparkles' ? sug.icon : prev.icon,
                        }))
                      }
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border transition-all ${
                        formData.to === sug.url
                          ? 'bg-primary text-white border-primary font-semibold shadow-xs'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      {sug.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Icon Picker */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-slate-700 font-semibold">Chọn Biểu Tượng (Icon)</label>
                  <span className="text-[11px] text-primary font-semibold">
                    Đang chọn: {QUICK_ACCESS_ICONS[formData.icon]?.label || formData.icon}
                  </span>
                </div>

                {/* Search Icon */}
                <div className="relative mb-2.5">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm biểu tượng icon..."
                    value={iconSearch}
                    onChange={(e) => setIconSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:bg-white focus:outline-none focus:border-primary shadow-2xs"
                  />
                  {iconSearch && (
                    <button
                      type="button"
                      onClick={() => setIconSearch('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {/* Icon Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1.5 bg-slate-50 border border-slate-200 rounded-xl">
                  {filteredIconKeys.map((key) => {
                    const IconObj = QUICK_ACCESS_ICONS[key]
                    const IconComp = IconObj.icon
                    const isSelected = formData.icon === key

                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: key })}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-center group ${
                          isSelected
                            ? 'bg-primary text-white border-primary shadow-sm font-semibold'
                            : 'bg-white hover:bg-orange-50 text-slate-700 hover:text-primary border-slate-200/80 shadow-2xs'
                        }`}
                      >
                        <IconComp size={18} className={isSelected ? 'text-white' : 'text-slate-500 group-hover:text-primary'} />
                        <span className="text-[10px] leading-tight truncate w-full">
                          {IconObj.label.split('/')[0].trim()}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Status Toggle */}
              <div className="pt-2">
                <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <div>
                    <span className="text-slate-800 font-semibold block text-xs">Trạng Thái Hiển Thị</span>
                    <span className="text-slate-500 text-[11px] block">
                      {formData.is_active ? 'Kích hoạt hiển thị phím tắt này trên thanh' : 'Tạm ẩn phím tắt này'}
                    </span>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={formData.is_active}
                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formData.is_active ? 'bg-primary' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition duration-200 ease-in-out ${
                        formData.is_active ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold shadow-md shadow-primary/25 transition-all"
                >
                  {editingIndex !== null ? 'Cập Nhật Nút' : 'Thêm Vào Danh Sách'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

