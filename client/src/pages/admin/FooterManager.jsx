import { useState, useEffect } from 'react'
import {
  PanelBottom,
  Save,
  CheckCircle2,
  RefreshCw,
  Eye,
  EyeOff,
  Phone,
  Mail,
  MapPin,
  Heart,
  Share2,
  Link as LinkIcon,
  Plus,
  Trash2,
  Sparkles,
  Info,
  Check,
  Layers,
} from 'lucide-react'
import api from '../../utils/api'
import { useSettings } from '../../context/SettingsContext'

const defaultLinks = [
  { label: 'Trang Chủ', to: '/', is_active: true },
  { label: 'Bộ Sưu Tập Album', to: '/album', is_active: true },
  { label: 'Giới Thiệu', to: '/about', is_active: true },
  { label: 'Báo Giá & Đặt Lịch', to: '/contact', is_active: true },
]

export default function FooterManager() {
  const { settings: globalSettings, refreshSettings } = useSettings()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState('columns')

  const [form, setForm] = useState({
    footer_enabled: '1',
    footer_brand_enabled: '1',
    footer_links_enabled: '1',
    footer_contact_enabled: '1',
    footer_social_enabled: '1',
    footer_bottom_enabled: '1',
    footer_custom_title: '',
    footer_custom_slogan: '',
    footer_links_title: 'Khám Phá',
    footer_custom_links: JSON.stringify(defaultLinks),
    footer_contact_title: 'Liên Hệ',
    footer_custom_phone: '',
    footer_custom_email: '',
    footer_custom_address: '',
    footer_custom_maps_url: '',
    footer_copyright_text: '',
    footer_tagline_text: 'Được tạo với ❤️ dành cho những thiên thần nhỏ',
  })

  const [customLinks, setCustomLinks] = useState(defaultLinks)

  const fetchFooterSettings = async () => {
    try {
      setLoading(true)
      const res = await api.get('/settings')
      if (res.success && res.data) {
        setForm((prev) => ({
          ...prev,
          ...res.data,
        }))
        if (res.data.footer_custom_links) {
          try {
            const parsed = typeof res.data.footer_custom_links === 'string'
              ? JSON.parse(res.data.footer_custom_links)
              : res.data.footer_custom_links
            if (Array.isArray(parsed) && parsed.length > 0) {
              setCustomLinks(parsed)
            }
          } catch {
            setCustomLinks(defaultLinks)
          }
        }
      }
    } catch (err) {
      console.warn('Lỗi tải cài đặt footer:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFooterSettings()
  }, [])

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleToggle = (key) => {
    setForm((prev) => ({
      ...prev,
      [key]: prev[key] === '1' ? '0' : '1',
    }))
  }

  // Quản lý custom links
  const handleAddLink = () => {
    setCustomLinks((prev) => [
      ...prev,
      { label: 'Liên kết mới', to: '/', is_active: true },
    ])
  }

  const handleUpdateLink = (index, field, value) => {
    setCustomLinks((prev) => {
      const copy = [...prev]
      copy[index] = { ...copy[index], [field]: value }
      return copy
    })
  }

  const handleDeleteLink = (index) => {
    setCustomLinks((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const payload = {
        ...form,
        footer_custom_links: JSON.stringify(customLinks),
      }
      const res = await api.post('/settings', payload)
      if (res.success) {
        setSavedSuccess(true)
        if (refreshSettings) refreshSettings()
        setTimeout(() => setSavedSuccess(false), 3000)
      } else {
        alert(res.message || 'Lưu cấu hình thất bại')
      }
    } catch (err) {
      alert('Lỗi khi lưu cấu hình: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Đang tải cấu hình Chân trang...</p>
        </div>
      </div>
    )
  }

  const brandName = form.footer_custom_title || globalSettings?.brand_name || 'QA Stories'
  const brandSlogan = form.footer_custom_slogan || globalSettings?.brand_slogan || 'Studio Lưu Giữ Khoảnh Khắc Thiên Thần Của Bé'
  const brandPhone = form.footer_custom_phone || globalSettings?.brand_phone || '0901 234 567'
  const brandEmail = form.footer_custom_email || globalSettings?.brand_email || 'hello@qastories.vn'
  const brandAddress = form.footer_custom_address || globalSettings?.brand_address || '123 Đường ABC, Quận 1, TP. Hồ Chí Minh'

  return (
    <div className="space-y-6 w-full pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 text-white flex items-center justify-center shadow-lg shadow-primary/25 shrink-0">
            <PanelBottom size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 font-heading">Quản Lý Chân Trang (Footer)</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Cấu hình nội dung, bật/tắt các cột, liên kết nhanh và thông tin chân trang website
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {savedSuccess && (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200 text-xs font-semibold animate-fade-in">
              <CheckCircle2 size={15} />
              <span>Đã lưu thành công!</span>
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary-dark hover:to-orange-600 text-white text-xs font-bold shadow-md shadow-primary/25 transition-all duration-200 active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />}
            <span>{saving ? 'Đang Lưu...' : 'Lưu Thay Đổi'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 px-2">
        <button
          onClick={() => setActiveTab('columns')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'columns'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          1. Bật / Tắt Khối Footer
        </button>
        <button
          onClick={() => setActiveTab('content')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'content'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          2. Nội Dung Các Cột
        </button>
        <button
          onClick={() => setActiveTab('preview')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === 'preview'
              ? 'border-primary text-primary'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          3. Xem Trước Trực Quan
        </button>
      </div>

      {/* Tab 1: Toggle Visibility */}
      {activeTab === 'columns' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              key: 'footer_enabled',
              title: 'Hiển thị Toàn Bộ Footer',
              desc: 'Bật/tắt thanh chân trang trên toàn bộ các trang public',
              icon: PanelBottom,
            },
            {
              key: 'footer_brand_enabled',
              title: 'Cột 1: Thương Hiệu & Slogan',
              desc: 'Hiển thị logo, tên studio và câu giới thiệu thương hiệu',
              icon: Sparkles,
            },
            {
              key: 'footer_social_enabled',
              title: 'Nút Mạng Xã Hội',
              desc: 'Hiển thị các icon mạng xã hội có cấu hình URL tại Cài Đặt > Mạng Xã Hội (Facebook, Instagram, Zalo, YouTube, TikTok)',
              icon: Share2,
            },
            {
              key: 'footer_links_enabled',
              title: 'Cột 2: Danh Mục Khám Phá',
              desc: 'Hiển thị danh sách các trang / menu liên kết nhanh',
              icon: LinkIcon,
            },
            {
              key: 'footer_contact_enabled',
              title: 'Cột 3: Thông Tin Liên Hệ',
              desc: 'Hiển thị số điện thoại, email và địa chỉ studio ở chân trang',
              icon: Phone,
            },
            {
              key: 'footer_bottom_enabled',
              title: 'Thanh Bản Quyền Dưới Cùng (Bottom Bar)',
              desc: 'Hiển thị dòng Copyright và câu slogan trái tim cuối trang',
              icon: Heart,
            },
          ].map((item) => {
            const isEnabled = form[item.key] === '1'
            const Icon = item.icon
            return (
              <div
                key={item.key}
                onClick={() => handleToggle(item.key)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer select-none flex items-start justify-between gap-4 ${
                  isEnabled
                    ? 'bg-orange-50/40 border-orange-200/80 shadow-xs'
                    : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isEnabled
                        ? 'bg-primary text-white shadow-md shadow-primary/30'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                </div>

                <div
                  className={`w-12 h-6.5 rounded-full transition-colors relative shrink-0 p-0.5 ${
                    isEnabled ? 'bg-primary' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-5.5 h-5.5 rounded-full bg-white shadow-md transition-transform ${
                      isEnabled ? 'translate-x-5.5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tab 2: Column Contents */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          {/* Col 1: Brand */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              Cột 1: Thông Tin Thương Hiệu & Giới Thiệu Ngắn
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tiêu đề thương hiệu chân trang (Để trống sẽ lấy Tên Studio chung)
                </label>
                <input
                  type="text"
                  value={form.footer_custom_title}
                  onChange={(e) => handleChange('footer_custom_title', e.target.value)}
                  placeholder={globalSettings?.brand_name || 'QA Stories'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Đoạn giới thiệu / Slogan chân trang
                </label>
                <textarea
                  rows={3}
                  value={form.footer_custom_slogan}
                  onChange={(e) => handleChange('footer_custom_slogan', e.target.value)}
                  placeholder={globalSettings?.brand_slogan || 'Chúng tôi tin rằng từng tiếng cười khúc khích...'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Col 2: Custom Links */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                Cột 2: Danh Mục Liên Kết Khám Phá
              </h2>
              <button
                type="button"
                onClick={handleAddLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-primary text-xs font-bold transition-all cursor-pointer"
              >
                <Plus size={14} />
                <span>Thêm liên kết</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tiêu đề cột 2
              </label>
              <input
                type="text"
                value={form.footer_links_title}
                onChange={(e) => handleChange('footer_links_title', e.target.value)}
                placeholder="Khám Phá"
                className="w-full max-w-sm px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-primary"
              />
            </div>

            {/* Link List */}
            <div className="space-y-2.5 pt-2">
              {customLinks.map((link, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-200"
                >
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => handleUpdateLink(idx, 'label', e.target.value)}
                    placeholder="Tên hiển thị..."
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-primary"
                  />
                  <input
                    type="text"
                    value={link.to}
                    onChange={(e) => handleUpdateLink(idx, 'to', e.target.value)}
                    placeholder="Đường dẫn (ví dụ /album, /about, /contact)..."
                    className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:border-primary"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdateLink(idx, 'is_active', !link.is_active)}
                    title={link.is_active ? 'Đang bật' : 'Đang ẩn'}
                    className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                      link.is_active
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                        : 'bg-slate-200 text-slate-400 border-slate-300'
                    }`}
                  >
                    {link.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteLink(idx)}
                    title="Xóa liên kết"
                    className="p-2 rounded-lg bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Col 3: Contact */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              Cột 3: Thông Tin Liên Hệ Chân Trang
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tiêu đề cột 3
                </label>
                <input
                  type="text"
                  value={form.footer_contact_title}
                  onChange={(e) => handleChange('footer_contact_title', e.target.value)}
                  placeholder="Liên Hệ"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Số Hotline hiển thị (Để trống lấy hotline chung)
                </label>
                <input
                  type="text"
                  value={form.footer_custom_phone}
                  onChange={(e) => handleChange('footer_custom_phone', e.target.value)}
                  placeholder={globalSettings?.brand_phone || '0901 234 567'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email hiển thị (Để trống lấy email chung)
                </label>
                <input
                  type="text"
                  value={form.footer_custom_email}
                  onChange={(e) => handleChange('footer_custom_email', e.target.value)}
                  placeholder={globalSettings?.brand_email || 'hello@qastories.vn'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Địa chỉ studio chân trang (Để trống lấy địa chỉ chung)
                </label>
                <input
                  type="text"
                  value={form.footer_custom_address}
                  onChange={(e) => handleChange('footer_custom_address', e.target.value)}
                  placeholder={globalSettings?.brand_address || '123 Đường ABC, Quận 1...'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              Thanh Bản Quyền Dưới Cùng (Bottom Bar)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Đoạn chữ bản quyền Copyright
                </label>
                <input
                  type="text"
                  value={form.footer_copyright_text}
                  onChange={(e) => handleChange('footer_copyright_text', e.target.value)}
                  placeholder={`© ${new Date().getFullYear()} ${globalSettings?.brand_name || 'QA Stories'}. Bảo lưu mọi quyền.`}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Khẩu hiệu / Tagline góc phải
                </label>
                <input
                  type="text"
                  value={form.footer_tagline_text}
                  onChange={(e) => handleChange('footer_tagline_text', e.target.value)}
                  placeholder="Được tạo với ❤️ dành cho những thiên thần nhỏ"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Live Preview */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <Info size={14} />
            <span>Xem trước thời gian thực chân trang theo cấu hình đang thiết lập:</span>
          </div>

          <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-gray-950 text-white p-8 sm:p-10">
            {form.footer_enabled === '0' ? (
              <div className="text-center py-12 text-gray-500 text-sm">
                (Toàn bộ Footer đang được thiết lập Ẩn trên giao diện người dùng)
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                  {/* Col 1 */}
                  {form.footer_brand_enabled === '1' && (
                    <div className="md:col-span-5 space-y-4">
                      <div className="font-heading font-bold text-xl text-white">
                        {brandName}
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                        {brandSlogan}
                      </p>
                      {form.footer_social_enabled === '1' && (
                        <div className="pt-1">
                          {(() => {
                            const activeSocials = [
                              { name: 'Facebook', href: globalSettings?.brand_facebook },
                              { name: 'Instagram', href: globalSettings?.brand_instagram },
                              { name: 'Zalo', href: globalSettings?.brand_zalo },
                              { name: 'YouTube', href: globalSettings?.brand_youtube },
                              { name: 'TikTok', href: globalSettings?.brand_tiktok },
                            ].filter((s) => s.href && String(s.href).trim() !== '' && String(s.href).trim() !== '#')

                            if (activeSocials.length === 0) {
                              return (
                                <p className="text-[11px] text-amber-400/90 italic">
                                  (Chưa có liên kết mạng xã hội nào trong Cài Đặt &gt; Mạng Xã Hội)
                                </p>
                              )
                            }

                            return (
                              <div className="flex flex-wrap items-center gap-2">
                                {activeSocials.map((s) => (
                                  <div
                                    key={s.name}
                                    className="px-2.5 py-1.5 rounded-lg bg-white/10 border border-white/10 flex items-center gap-1.5 text-[10.5px] text-gray-200 font-medium"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    <span>{s.name}</span>
                                  </div>
                                ))}
                              </div>
                            )
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Col 2 */}
                  {form.footer_links_enabled === '1' && (
                    <div className="md:col-span-3 space-y-3">
                      <h4 className="font-heading font-semibold text-sm text-white flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {form.footer_links_title || 'Khám Phá'}
                      </h4>
                      <ul className="space-y-2">
                        {customLinks
                          .filter((l) => l.is_active)
                          .map((l, i) => (
                            <li key={i} className="text-xs text-gray-400 flex items-center gap-1.5">
                              <span className="text-primary text-[10px]">&rarr;</span>
                              <span>{l.label}</span>
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {/* Col 3 */}
                  {form.footer_contact_enabled === '1' && (
                    <div className="md:col-span-4 space-y-3">
                      <h4 className="font-heading font-semibold text-sm text-white flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                        {form.footer_contact_title || 'Liên Hệ'}
                      </h4>
                      <div className="space-y-2.5 text-xs text-gray-300">
                        <div className="flex items-center gap-2">
                          <Phone size={13} className="text-primary" />
                          <span>{brandPhone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Mail size={13} className="text-primary" />
                          <span>{brandEmail}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <MapPin size={13} className="text-primary shrink-0 mt-0.5" />
                          <span>{brandAddress}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Bar */}
                {form.footer_bottom_enabled === '1' && (
                  <div className="border-t border-white/10 pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 gap-2">
                    <div>
                      {form.footer_copyright_text || `© ${new Date().getFullYear()} ${brandName}. Bảo lưu mọi quyền.`}
                    </div>
                    <div>
                      {form.footer_tagline_text}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
