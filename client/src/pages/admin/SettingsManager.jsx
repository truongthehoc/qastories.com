import { useState, useEffect } from 'react'
import {
  SlidersHorizontal,
  Save,
  Upload,
  RefreshCw,
  Camera,
  Phone,
  Share2,
  Search,
  CheckCircle2,
  Sparkles,
  MapPin,
  Mail,
  Globe,
  Images,
  Eye,
  EyeOff,
  BookOpen,
  Home,
  UserCheck,
  CalendarCheck2,
  Check,
  X,
  ShieldAlert,
  Layers,
  ExternalLink,
  ImageIcon,
} from 'lucide-react'
import api from '../../utils/api'
import { useSettings } from '../../context/SettingsContext'

export default function SettingsManager() {
  const { refreshSettings } = useSettings()
  const [activeTab, setActiveTab] = useState('branding')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingSeoImage, setUploadingSeoImage] = useState(false)
  const [previewImgError, setPreviewImgError] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  // Tự động reset trạng thái lỗi ảnh khi người dùng đổi link ảnh
  useEffect(() => {
    setPreviewImgError(false)
  }, [form?.seo_image])

  const [form, setForm] = useState({
    site_url: 'https://qastories.com',
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
    seo_title: 'QA Stories - Studio Chụp Ảnh Bé & Gia Đình Chuyên Nghiệp',
    seo_description: 'Studio chụp ảnh sơ sinh newborn, thôi nôi, 100 ngày tuổi và gia đình uy tín với phong cách nghệ thuật, ánh sáng tự nhiên.',
    seo_keywords: 'chụp ảnh em bé, chụp ảnh newborn, chụp thôi nôi, studio bé, QA stories',
    seo_image: '',
    album_header_label: 'Bộ Sưu Tập Nghệ Thuật',
    album_header_title: 'Khoảnh Khắc Của Bé',
    album_header_title_highlight: 'Kể Bằng Hình Ảnh',
    album_header_desc: 'Mỗi bức ảnh là một tác phẩm được chăm chút tỉ mỉ, giúp bố mẹ lưu lại trọn vẹn những ký ức đầu đời thiêng liêng nhất của con yêu.',
    page_home_enabled: '1',
    page_album_enabled: '1',
    page_about_enabled: '1',
    page_contact_enabled: '1',
  })

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const res = await api.get('/settings')
      if (res.success && res.data) {
        setForm((prev) => ({
          ...prev,
          ...res.data,
        }))
      }
    } catch (error) {
      console.warn('Lỗi khi tải cấu hình:', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleLogoUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setUploadingLogo(true)
      const res = await api.uploadPhotos(files, 'branding')
      if (res.success && res.files && res.files[0]) {
        setForm((prev) => ({ ...prev, brand_logo: res.files[0].url }))
      }
    } catch (error) {
      alert('Tải logo thất bại: ' + error.message)
    } finally {
      setUploadingLogo(false)
    }
  }

  const handleSeoImageUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setUploadingSeoImage(true)
      const res = await api.uploadPhotos(files, 'branding')
      if (res.success && res.files && res.files[0]) {
        setForm((prev) => ({ ...prev, seo_image: res.files[0].url }))
      }
    } catch (error) {
      alert('Tải ảnh đại diện SEO thất bại: ' + error.message)
    } finally {
      setUploadingSeoImage(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setSaving(true)
      setSavedSuccess(false)
      await api.post('/settings', form)
      refreshSettings()
      setSavedSuccess(true)
      setTimeout(() => setSavedSuccess(false), 3000)
    } catch (error) {
      alert('Lỗi khi lưu cài đặt: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const tabs = [
    { id: 'branding', label: 'Thương Hiệu & Logo', icon: Camera },
    { id: 'pages_visibility', label: 'Bật / Tắt Hiển Thị Trang', icon: Layers },
    { id: 'album_header', label: 'Tiêu Đề Trang Bộ Sưu Tập', icon: Images },
    { id: 'contact', label: 'Thông Tin Liên Hệ', icon: Phone },
    { id: 'social', label: 'Mạng Xã Hội', icon: Share2 },
    { id: 'seo', label: 'Cấu Hình SEO', icon: Search },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900 flex items-center gap-2.5">
            <SlidersHorizontal className="text-primary" size={24} />
            Cài Đặt Hệ Thống & Nhận Diện Thương Hiệu
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Quản lý tên studio, logo, số điện thoại, địa chỉ, mạng xã hội và thẻ meta SEO website
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => fetchSettings()}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs text-xs transition-colors cursor-pointer"
            title="Làm mới"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs shadow-md shadow-primary/25 hover:shadow-primary/40 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save size={16} />
            <span>{saving ? 'Đang Lưu...' : 'Lưu Thay Đổi Cài Đặt'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} />
          <span>Đã lưu cài đặt thành công! Toàn bộ website đã áp dụng thông tin mới.</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const active = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                active
                  ? 'bg-primary text-white font-semibold shadow-md shadow-primary/25'
                  : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 shadow-xs'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Tab 1: Branding */}
        {activeTab === 'branding' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Camera className="text-primary" size={18} />
              <h2 className="font-heading font-bold text-base text-slate-900">Nhận Diện Thương Hiệu</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">Tên Thương Hiệu (Studio Name)</label>
                  <input
                    type="text"
                    required
                    value={form.brand_name || ''}
                    onChange={(e) => setForm({ ...form, brand_name: e.target.value })}
                    placeholder="Nhập tên thương hiệu studio..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-semibold text-sm focus:bg-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">Slogan / Khẩu Hiệu</label>
                  <input
                    type="text"
                    value={form.brand_slogan || ''}
                    onChange={(e) => setForm({ ...form, brand_slogan: e.target.value })}
                    placeholder="Nhập câu slogan hoặc khẩu hiệu thương hiệu..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Logo Upload */}
              <div className="space-y-3">
                <label className="block text-slate-700 font-semibold">Logo Thương Hiệu (PNG / WebP nền trong suốt)</label>
                
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center p-2 shrink-0 overflow-hidden shadow-2xs">
                    {form.brand_logo ? (
                      <img src={form.brand_logo} alt="Logo" className="max-h-full object-contain" />
                    ) : (
                      <Camera size={24} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <input
                      type="text"
                      placeholder="Nhập đường dẫn URL logo hoặc tải file..."
                      value={form.brand_logo || ''}
                      onChange={(e) => setForm({ ...form, brand_logo: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-[11px] placeholder-slate-400 focus:outline-none focus:border-primary"
                    />
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl cursor-pointer text-[11px] font-medium transition-colors">
                      <Upload size={13} />
                      <span>{uploadingLogo ? 'Đang tải...' : 'Tải file logo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoUpload}
                        disabled={uploadingLogo}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab: Pages Visibility Management */}
        {activeTab === 'pages_visibility' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Layers className="text-primary" size={20} />
                <div>
                  <h2 className="font-heading font-bold text-base text-slate-900">
                    Bật / Tắt Hiển Thị Các Trang Website
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Quản lý cho phép hoặc tạm ẩn bất kỳ trang nào khỏi thanh điều hướng (Menu Navbar), chân trang (Footer) và khóa truy cập
                  </p>
                </div>
              </div>
            </div>

            {/* Helper Info Banner */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start gap-3 text-xs text-amber-800">
              <EyeOff className="text-amber-600 shrink-0 mt-0.5" size={17} />
              <div className="space-y-1">
                <p className="font-semibold">Cơ chế hoạt động khi tắt (Disable) một trang:</p>
                <ul className="list-disc list-inside text-slate-600 space-y-0.5 text-[11px]">
                  <li>Đường link trang đó sẽ <b>tự động ẩn</b> khỏi Menu chính trên Navbar và danh sách liên kết Footer.</li>
                  <li>Nếu khách truy cập trực tiếp bằng đường dẫn URL, hệ thống sẽ hiển thị giao diện <b>thông báo trang đang tạm đóng / bảo trì</b> một cách lịch sự, có nút về trang chủ và hotline.</li>
                </ul>
              </div>
            </div>

            {/* Pages Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {[
                {
                  key: 'page_home_enabled',
                  name: 'Trang Chủ',
                  url: '/',
                  icon: Home,
                  desc: 'Trang bìa chính, giới thiệu tổng quan, slider ảnh nghệ thuật và đánh giá',
                },
                {
                  key: 'page_album_enabled',
                  name: 'Bộ Sưu Tập (Album)',
                  url: '/album',
                  icon: Images,
                  desc: 'Danh mục kho ảnh nghệ thuật, concept sơ sinh, thôi nôi, ngoại cảnh và chi tiết album',
                },
                {
                  key: 'page_about_enabled',
                  name: 'Giới Thiệu Studio (About Us)',
                  url: '/about',
                  icon: UserCheck,
                  desc: 'Trang câu chuyện người sáng lập, triết lý nhiếp ảnh và tâm huyết làm nghề',
                },
                {
                  key: 'page_contact_enabled',
                  name: 'Liên Hệ & Đặt Lịch (Contact)',
                  url: '/contact',
                  icon: CalendarCheck2,
                  desc: 'Form gửi yêu cầu đặt lịch hẹn, số hotline, Zalo và bản đồ địa chỉ studio',
                },
              ].map((p) => {
                const Icon = p.icon
                const isEnabled = form[p.key] !== '0' && form[p.key] !== false && form[p.key] !== 0

                return (
                  <div
                    key={p.key}
                    className={`p-5 rounded-2xl border transition-all duration-200 flex flex-col justify-between gap-4 ${
                      isEnabled
                        ? 'bg-white border-slate-200/90 shadow-2xs hover:border-primary/40'
                        : 'bg-slate-50/80 border-dashed border-slate-300 opacity-80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-2xs ${
                              isEnabled
                                ? 'bg-primary/10 text-primary border border-primary/20'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            <Icon size={18} />
                          </div>
                          <div>
                            <div className="font-heading font-bold text-sm text-slate-900">{p.name}</div>
                            <div className="text-[11px] font-mono text-slate-400">{p.url}</div>
                          </div>
                        </div>

                        {/* Status Badge */}
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                            isEnabled
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
                            }`}
                          />
                          {isEnabled ? 'Đang Hiển Thị' : 'Đã Tạm Ẩn'}
                        </span>
                      </div>

                      <p className="text-slate-500 text-xs leading-relaxed mt-2">{p.desc}</p>
                    </div>

                    {/* Toggle Control */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] font-semibold text-slate-600">
                        {isEnabled ? 'Cho phép truy cập công khai' : 'Khóa truy cập trang này'}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          setForm((prev) => ({
                            ...prev,
                            [p.key]: isEnabled ? '0' : '1',
                          }))
                        }
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          isEnabled ? 'bg-primary' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                            isEnabled ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tab: Album Header & Banner */}
        {activeTab === 'album_header' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Images className="text-primary" size={18} />
                <h2 className="font-heading font-bold text-base text-slate-900">
                  Cấu Hình Tiêu Đề & Giới Thiệu Trang Bộ Sưu Tập (/album)
                </h2>
              </div>
              <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                Hiển thị ở phần đầu trang Bộ Sưu Tập ảnh
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form Controls */}
              <div className="lg:col-span-7 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Nhãn Phụ (Badge / Tag Đầu Trang)
                  </label>
                  <input
                    type="text"
                    value={form.album_header_label ?? ''}
                    onChange={(e) => setForm({ ...form, album_header_label: e.target.value })}
                    placeholder="Nhập nhãn phụ..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary text-sm"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1.5">Tiêu Đề Chính</label>
                    <input
                      type="text"
                      value={form.album_header_title ?? ''}
                      onChange={(e) => setForm({ ...form, album_header_title: e.target.value })}
                      placeholder="Nhập tiêu đề chính..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1.5">
                      Phần Chữ Nhấn Mạnh (Màu Cam / Chữ Nghiêng)
                    </label>
                    <input
                      type="text"
                      value={form.album_header_title_highlight ?? ''}
                      onChange={(e) => setForm({ ...form, album_header_title_highlight: e.target.value })}
                      placeholder="Nhập chữ nhấn mạnh..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary text-sm font-semibold text-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Đoạn Văn Mô Tả / Lời Dẫn Dưới Tiêu Đề
                  </label>
                  <textarea
                    rows={4}
                    value={form.album_header_desc ?? ''}
                    onChange={(e) => setForm({ ...form, album_header_desc: e.target.value })}
                    placeholder="Nhập đoạn văn mô tả..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary leading-relaxed"
                  />
                </div>
              </div>

              {/* Live Preview Box */}
              <div className="lg:col-span-5 space-y-2">
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                  <Eye size={14} className="text-primary" />
                  <span>Xem Trước Banner Trang Album (Live Preview)</span>
                </div>

                <div className="p-6 rounded-2xl bg-gradient-to-b from-orange-50/60 via-white to-white border border-orange-200/70 text-center shadow-xs flex flex-col items-center justify-center min-h-[240px]">
                  <span className="inline-flex items-center px-3.5 py-1 rounded-full bg-orange-100/80 text-primary text-[11px] font-semibold uppercase tracking-wider mb-2">
                    {form.album_header_label || 'Bộ Sưu Tập Nghệ Thuật'}
                  </span>
                  <h3 className="font-heading font-bold text-lg text-slate-900 mt-1 mb-2">
                    {form.album_header_title || 'Khoảnh Khắc Của Bé'}{' '}
                    {form.album_header_title_highlight && (
                      <span className="italic text-primary font-normal">
                        {form.album_header_title_highlight}
                      </span>
                    )}
                  </h3>
                  <p className="font-body text-slate-500 text-xs leading-relaxed max-w-sm">
                    {form.album_header_desc ||
                      'Mỗi bức ảnh là một tác phẩm được chăm chút tỉ mỉ, giúp bố mẹ lưu lại trọn vẹn những ký ức đầu đời thiêng liêng nhất của con yêu.'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Contact Info */}
        {activeTab === 'contact' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Phone className="text-primary" size={18} />
              <h2 className="font-heading font-bold text-base text-slate-900">Thông Tin Liên Hệ & Địa Điểm</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Hotline / Số Điện Thoại Đặt Lịch</label>
                <input
                  type="text"
                  required
                  value={form.brand_phone || ''}
                  onChange={(e) => setForm({ ...form, brand_phone: e.target.value })}
                  placeholder="Nhập số điện thoại hotline..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Email Studio</label>
                <input
                  type="email"
                  value={form.brand_email || ''}
                  onChange={(e) => setForm({ ...form, brand_email: e.target.value })}
                  placeholder="Nhập địa chỉ email liên hệ..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1.5">Địa Chỉ Trực Tiếp Studio</label>
                <input
                  type="text"
                  value={form.brand_address || ''}
                  onChange={(e) => setForm({ ...form, brand_address: e.target.value })}
                  placeholder="Nhập địa chỉ trụ sở studio..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-slate-700 font-semibold mb-1.5">Liên Kết Google Maps (Chỉ đường)</label>
                <input
                  type="text"
                  value={form.brand_maps_url || ''}
                  onChange={(e) => setForm({ ...form, brand_maps_url: e.target.value })}
                  placeholder="Nhập đường dẫn Google Maps..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Social Media */}
        {activeTab === 'social' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Share2 className="text-primary" size={18} />
              <h2 className="font-heading font-bold text-base text-slate-900">Liên Kết Các Mạng Xã Hội</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Facebook Fanpage URL</label>
                <input
                  type="text"
                  value={form.brand_facebook || ''}
                  onChange={(e) => setForm({ ...form, brand_facebook: e.target.value })}
                  placeholder="Nhập đường dẫn trang Facebook..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Instagram Profile URL</label>
                <input
                  type="text"
                  value={form.brand_instagram || ''}
                  onChange={(e) => setForm({ ...form, brand_instagram: e.target.value })}
                  placeholder="Nhập đường dẫn trang Instagram..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Zalo Chat (Số điện thoại hoặc link zalo.me)
                </label>
                <input
                  type="text"
                  value={form.brand_zalo || ''}
                  onChange={(e) => setForm({ ...form, brand_zalo: e.target.value })}
                  placeholder="VD: 0901234567 hoặc https://zalo.me/0901234567"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary"
                />
                <p className="text-xs text-slate-400 mt-1">
                  Có thể nhập số điện thoại (vd: <code>0901234567</code>) hoặc đường dẫn (vd: <code>https://zalo.me/0901234567</code>).
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Kênh YouTube</label>
                <input
                  type="text"
                  value={form.brand_youtube || ''}
                  onChange={(e) => setForm({ ...form, brand_youtube: e.target.value })}
                  placeholder="Nhập đường dẫn kênh YouTube..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Kênh TikTok</label>
                <input
                  type="text"
                  value={form.brand_tiktok || ''}
                  onChange={(e) => setForm({ ...form, brand_tiktok: e.target.value })}
                  placeholder="Nhập đường dẫn kênh TikTok..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: SEO Metadata & Social Share Cards */}
        {activeTab === 'seo' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
              <div className="flex items-center gap-2.5">
                <Search className="text-primary" size={20} />
                <div>
                  <h2 className="font-heading font-bold text-base text-slate-900">
                    Cấu Hình SEO & Hiển Thị Khi Chia Sẻ Link (Zalo, Facebook, Tin Nhắn...)
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Khi copy link <span className="font-semibold text-primary">qastories.com</span> gửi đi, hệ thống sẽ tự động hiển thị thẻ xem trước (Rich Preview) với thông tin dưới đây.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Cột trái: Form cấu hình */}
              <div className="lg:col-span-7 space-y-4 text-xs">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5 flex items-center justify-between">
                    <span>Tên Miền Website Chính Thức (Domain / Canonical URL)</span>
                    <span className="text-[10px] text-slate-400 font-normal">Bắt buộc để Zalo/Facebook nhận diện đúng</span>
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
                    <input
                      type="url"
                      value={form.site_url || ''}
                      onChange={(e) => setForm({ ...form, site_url: e.target.value })}
                      placeholder="https://qastories.com"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary font-medium"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Ví dụ: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">https://qastories.com</code> (Không để dấu / ở cuối)
                  </p>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Thẻ Tiêu Đề Mặc Định (Meta Title)
                  </label>
                  <input
                    type="text"
                    value={form.seo_title || ''}
                    onChange={(e) => setForm({ ...form, seo_title: e.target.value })}
                    placeholder="QA Stories - Studio Chụp Ảnh Bé & Gia Đình Chuyên Nghiệp"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary font-semibold"
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                    <span>Tiêu đề lớn in đậm trên thanh trình duyệt & thẻ chia sẻ mạng xã hội</span>
                    <span>{(form.seo_title || '').length}/65 ký tự khuyến nghị</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Thẻ Mô Tả Tìm Kiếm & Chia Sẻ (Meta Description)
                  </label>
                  <textarea
                    rows={3}
                    value={form.seo_description || ''}
                    onChange={(e) => setForm({ ...form, seo_description: e.target.value })}
                    placeholder="Nhập đoạn mô tả ngắn gọn, hấp dẫn về studio..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary leading-relaxed"
                  />
                  <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                    <span>Đoạn mô tả ngắn hiển thị bên dưới tiêu đề khi chia sẻ link</span>
                    <span>{(form.seo_description || '').length}/160 ký tự khuyến nghị</span>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Từ Khóa SEO (Keywords, cách nhau bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    value={form.seo_keywords || ''}
                    onChange={(e) => setForm({ ...form, seo_keywords: e.target.value })}
                    placeholder="chụp ảnh em bé, chụp ảnh newborn, chụp thôi nôi, studio bé, QA stories"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary"
                  />
                </div>

                {/* Ảnh đại diện chia sẻ (OG Image) */}
                <div className="pt-2">
                  <label className="block text-slate-700 font-semibold mb-1.5 flex items-center justify-between">
                    <span>Ảnh Đại Diện Khi Chia Sẻ Link (Social Share / Open Graph Image)</span>
                    <span className="text-[10px] text-amber-600 font-medium">Khuyến nghị: 1200 x 630 px</span>
                  </label>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="text"
                        value={form.seo_image || ''}
                        onChange={(e) => setForm({ ...form, seo_image: e.target.value })}
                        placeholder="Đường dẫn ảnh đại diện hoặc tải file bên dưới..."
                        className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] text-slate-900 focus:outline-none focus:border-primary"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-primary hover:bg-primary-dark text-white rounded-xl cursor-pointer text-xs font-semibold shadow-xs transition-colors shrink-0">
                        <Upload size={13} />
                        <span>{uploadingSeoImage ? 'Đang tải...' : 'Tải Ảnh Mới'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleSeoImageUpload}
                          disabled={uploadingSeoImage}
                          className="hidden"
                        />
                      </label>
                      {form.seo_image && (
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, seo_image: '' })}
                          className="p-2 text-slate-400 hover:text-red-500 rounded-xl border border-slate-200 hover:bg-white transition-colors"
                          title="Xóa để dùng banner mặc định"
                        >
                          <X size={15} />
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      💡 Nếu để trống, hệ thống sẽ tự động dùng <strong>Banner trang chủ đầu tiên</strong> và tự động chuẩn hóa sang định dạng ảnh 1200x630 chất lượng cao để hiển thị đẹp mắt trên mọi thiết bị.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cột phải: Khung xem trước trực quan (Live Social Share Card Preview) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-primary" />
                    Mô Phỏng Hiển Thị Trên Zalo & Facebook
                  </span>
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-semibold border border-emerald-200">
                    Xem trước trực quan
                  </span>
                </div>

                {/* Social Card Mockup */}
                <div className="bg-slate-50 p-3 sm:p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="bg-white rounded-xl overflow-hidden border border-slate-200/90 shadow-sm transition-all hover:shadow-md">
                    {/* Hình ảnh Card */}
                    <div className="relative aspect-[1.91/1] w-full bg-slate-100 overflow-hidden flex items-center justify-center">
                      {form.seo_image && !previewImgError ? (
                        <img
                          key={form.seo_image}
                          src={form.seo_image}
                          alt="SEO Preview"
                          className="w-full h-full object-cover"
                          loading="eager"
                          onError={() => setPreviewImgError(true)}
                          onLoad={() => setPreviewImgError(false)}
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-stone-900 via-stone-800 to-stone-950 flex flex-col items-center justify-center text-center p-4 relative select-none">
                          <div className="absolute inset-3 border border-primary/20 rounded-xl pointer-events-none"></div>
                          <Camera size={28} className="text-primary mb-1.5 opacity-90" />
                          <span className="font-heading font-bold text-white text-base tracking-wider">
                            {form.brand_name || 'QA Stories'}
                          </span>
                          <span className="text-stone-300 text-[10px] mt-0.5 max-w-[80%] truncate">
                            {form.brand_slogan || 'Studio Chụp Ảnh Em Bé & Gia Đình'}
                          </span>
                          {previewImgError && (
                            <span className="text-amber-400 text-[9px] mt-1 bg-black/40 px-2 py-0.5 rounded">
                              (Đang hiển thị banner mặc định)
                            </span>
                          )}
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-xs text-white text-[9px] px-2 py-0.5 rounded font-mono font-medium z-10">
                        1200 x 630
                      </div>
                      {form.seo_image && !previewImgError && (
                        <a
                          href={form.seo_image}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute bottom-2 right-2 bg-black/70 hover:bg-black text-white text-[9px] px-2 py-1 rounded-md font-medium z-10 flex items-center gap-1 transition-colors"
                          title="Xem ảnh gốc ở tab mới"
                        >
                          <ExternalLink size={10} />
                          <span>Xem ảnh</span>
                        </a>
                      )}
                    </div>

                    {/* Nội dung Card */}
                    <div className="p-3.5 space-y-1 bg-white">
                      <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 truncate">
                        {(form.site_url || 'qastories.com').replace(/^https?:\/\//, '').replace(/\/.*$/, '')}
                      </div>
                      <div className="font-bold text-slate-900 text-xs line-clamp-1 leading-snug">
                        {form.seo_title || 'QA Stories - Studio Chụp Ảnh Bé & Gia Đình'}
                      </div>
                      <div className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                        {form.seo_description || 'Studio chụp ảnh sơ sinh newborn, thôi nôi, 100 ngày tuổi và gia đình uy tín với phong cách nghệ thuật, ánh sáng tự nhiên.'}
                      </div>
                    </div>
                  </div>

                  {/* Hướng dẫn xóa cache */}
                  <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[11px] text-amber-900 space-y-1.5 leading-relaxed">
                    <div className="font-bold flex items-center gap-1.5 text-amber-800">
                      <span>⚠️ Lưu ý về bộ nhớ đệm (Cache) của Zalo / Facebook:</span>
                    </div>
                    <p className="text-[10.5px]">
                      Khi bạn đã gửi link một lần trước đó, Zalo và Facebook sẽ lưu lại kết quả cũ trong vài ngày.
                    </p>
                    <div className="pt-1 flex flex-wrap items-center gap-2">
                      <a
                        href={`https://developers.facebook.com/tools/debug/?q=${encodeURIComponent(form.site_url || 'https://qastories.com')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-amber-300 rounded-lg text-[10px] font-semibold text-slate-800 transition-colors shadow-2xs"
                      >
                        <ExternalLink size={11} />
                        <span>Xóa Cache Facebook (Debug Tool)</span>
                      </a>
                    </div>
                    <p className="text-[10px] text-slate-500 pt-0.5">
                      💬 <strong>Mẹo kiểm tra nhanh trên Zalo:</strong> Sau khi lưu, hãy thử gửi kèm tham số mới như: <code className="bg-amber-100/70 px-1 py-0.5 rounded text-amber-950 font-mono">{(form.site_url || 'https://qastories.com').replace(/\/$/, '')}/?v=1</code> để Zalo lập tức tải card mới!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs shadow-md shadow-primary/25 hover:shadow-primary/40 flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Save size={16} />
            <span>{saving ? 'Đang Lưu Cài Đặt...' : 'Lưu Thay Đổi Cài Đặt'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
