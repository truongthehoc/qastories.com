import { useState, useEffect } from 'react'
import {
  UserCheck,
  Save,
  Upload,
  RefreshCw,
  BookOpen,
  Quote,
  Palette,
  Eye,
  CheckCircle2,
} from 'lucide-react'
import api from '../../utils/api'
import { useSettings } from '../../context/SettingsContext'

export default function AboutManager() {
  const { refreshSettings } = useSettings()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const [form, setForm] = useState({
    about_header_label: '',
    about_story_title: '',
    about_story_p1: '',
    about_story_p2: '',
    about_image: '',
    about_founder_name: '',
    about_founder_role: '',
    about_founder_quote: '',
    about_founder_avatar: '',
    about_quote_text: '',
    about_quote_author: '',
    about_quote_color: '#1f2937',
    about_quote_author_color: '#E06738',
    about_stat_clients: '500+',
    about_stat_experience: '8+',
    about_stat_satisfaction: '99%',
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
      console.warn('Lỗi khi tải thông tin giới thiệu:', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  const handleImageUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setUploading(true)
      const res = await api.uploadPhotos(files, 'about')
      if (res.success && res.files && res.files[0]) {
        setForm((prev) => ({ ...prev, about_image: res.files[0].url }))
      }
    } catch (error) {
      alert('Tải ảnh thất bại: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleAvatarUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setAvatarUploading(true)
      const res = await api.uploadPhotos(files, 'branding')
      if (res.success && res.files && res.files[0]) {
        setForm((prev) => ({ ...prev, about_founder_avatar: res.files[0].url }))
      }
    } catch (error) {
      alert('Tải ảnh đại diện thất bại: ' + error.message)
    } finally {
      setAvatarUploading(false)
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900 flex items-center gap-2.5">
            <UserCheck className="text-primary" size={24} />
            Quản Lý Nội Dung Giới Thiệu (About Us)
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Chỉnh sửa câu chuyện người sáng lập, thông điệp studio và ảnh đại diện
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
            <span>{saving ? 'Đang Lưu...' : 'Lưu Thay Đổi Giới Thiệu'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 shadow-xs">
          <CheckCircle2 size={16} />
          <span>Đã lưu thành công nội dung giới thiệu! Trang công khai đã được cập nhật đồng bộ.</span>
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Story Section */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-5 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <BookOpen className="text-primary" size={18} />
            <h2 className="font-heading font-bold text-base text-slate-900">Câu Chuyện & Lời Ngỏ Của Photographer</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Story Text */}
            <div className="lg:col-span-8 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1.5">Nhãn Phụ (Tag Đầu Trang)</label>
                  <input
                    type="text"
                    value={form.about_header_label ?? ''}
                    onChange={(e) => setForm({ ...form, about_header_label: e.target.value })}
                    placeholder="Nhập nhãn phụ..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary text-sm"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1.5">Tiêu Đề Lời Ngỏ</label>
                  <input
                    type="text"
                    value={form.about_story_title ?? ''}
                    onChange={(e) => setForm({ ...form, about_story_title: e.target.value })}
                    placeholder="Nhập tiêu đề hoặc thông điệp chính của studio..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-700 font-semibold">
                    Đoạn Văn 1 (Giới thiệu bản thân & địa điểm)
                  </label>
                  <span className="text-[11px] text-slate-400 font-normal">Không bắt buộc</span>
                </div>
                <textarea
                  rows={4}
                  value={form.about_story_p1 ?? ''}
                  onChange={(e) => setForm({ ...form, about_story_p1: e.target.value })}
                  placeholder="Nhập nội dung giới thiệu bản thân, phong cách chụp và địa điểm studio (để trống nếu không muốn hiển thị)..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary leading-relaxed text-xs"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-slate-700 font-semibold">
                    Đoạn Văn 2 (Tâm huyết & thông điệp)
                  </label>
                  <span className="text-[11px] text-slate-400 font-normal">Không bắt buộc</span>
                </div>
                <textarea
                  rows={3}
                  value={form.about_story_p2 ?? ''}
                  onChange={(e) => setForm({ ...form, about_story_p2: e.target.value })}
                  placeholder="Nhập tâm huyết làm nghề, sự tận tâm và cam kết chất lượng (để trống nếu không muốn hiển thị)..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary leading-relaxed text-xs"
                />
              </div>

              {/* Founder / Author Card Info */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-800 font-bold text-xs">Cấu Hình Card Tác Giả / Founder</span>
                  <span className="text-[11px] text-primary font-medium">Hiển thị thẻ chữ ký tác giả</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-xs">Tên Người Chụp (Founder)</label>
                    <input
                      type="text"
                      value={form.about_founder_name ?? ''}
                      onChange={(e) => setForm({ ...form, about_founder_name: e.target.value })}
                      placeholder="Nhập tên người chụp..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-xs">Chức Danh</label>
                    <input
                      type="text"
                      value={form.about_founder_role ?? ''}
                      onChange={(e) => setForm({ ...form, about_founder_role: e.target.value })}
                      placeholder="VD: Founder & Photographer..."
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1 text-xs">Thông Điệp Trong Card</label>
                    <input
                      type="text"
                      value={form.about_founder_quote ?? ''}
                      onChange={(e) => setForm({ ...form, about_founder_quote: e.target.value })}
                      placeholder="VD: Từng bức ảnh là một tình yêu"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-primary text-xs"
                    />
                  </div>
                </div>

                {/* Avatar Upload for Founder */}
                <div className="p-3.5 rounded-xl bg-white border border-orange-200/70 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-slate-800 font-bold text-xs">Ảnh Đại Diện (Avatar Tròn của Founder)</label>
                    <span className="text-[10px] text-slate-400">Nếu trống sẽ dùng ảnh chân dung</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {/* Round Avatar Preview */}
                    <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-primary bg-orange-50 shadow-xs shrink-0">
                      {form.about_founder_avatar || form.about_image ? (
                        <img
                          src={form.about_founder_avatar || form.about_image}
                          alt="Avatar Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                          No Avatar
                        </div>
                      )}
                    </div>

                    {/* Input & Upload Button */}
                    <div className="flex-1 w-full space-y-2">
                      <input
                        type="text"
                        placeholder="Nhập đường dẫn avatar hoặc bấm nút tải ảnh..."
                        value={form.about_founder_avatar || ''}
                        onChange={(e) => setForm({ ...form, about_founder_avatar: e.target.value })}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary"
                      />

                      <div className="flex items-center gap-2">
                        <label className="py-1.5 px-3 bg-white hover:bg-orange-100/60 text-primary border border-orange-200 rounded-xl cursor-pointer flex items-center gap-1.5 transition-colors font-semibold text-xs shadow-2xs">
                          <Upload size={13} />
                          <span>{avatarUploading ? 'Đang tải avatar...' : 'Tải Avatar Mới'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarUpload}
                            disabled={avatarUploading}
                            className="hidden"
                          />
                        </label>
                        {form.about_founder_avatar && (
                          <button
                            type="button"
                            onClick={() => setForm({ ...form, about_founder_avatar: '' })}
                            className="text-[11px] text-slate-400 hover:text-rose-600 underline cursor-pointer"
                          >
                            Xóa avatar riêng
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Live Preview */}
                <div className="pt-1">
                  <span className="text-[11px] text-slate-500 font-semibold block mb-1.5">Xem trước hiển thị Card Tác Giả:</span>
                  <div className="p-3.5 rounded-2xl bg-white border border-orange-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/30 ring-offset-1 bg-orange-100 shrink-0">
                        {form.about_founder_avatar || form.about_image ? (
                          <img src={form.about_founder_avatar || form.about_image} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">Avatar</div>
                        )}
                      </div>
                      <div>
                        <div className="font-heading font-bold text-gray-900 text-sm">{form.about_founder_name || 'Tên Tác Giả'}</div>
                        <div className="text-[11px] text-primary font-semibold">{form.about_founder_role || 'Chức Danh'}</div>
                      </div>
                    </div>

                    {form.about_founder_quote ? (
                      <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium italic border-t sm:border-t-0 sm:border-l border-orange-100 pt-2 sm:pt-0 sm:pl-3">
                        <Quote size={12} className="text-primary-light shrink-0" />
                        <span>{form.about_founder_quote}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">(Không hiển thị trích dẫn card tác giả)</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile / Story Image */}
            <div className="lg:col-span-4 space-y-3 text-xs">
              <label className="block text-slate-700 font-semibold">Ảnh Chân Dung / Studio</label>
              
              <div className="relative aspect-[4/5] rounded-2xl overflow-hidden border border-slate-200 bg-slate-100">
                {form.about_image ? (
                  <img src={form.about_image} alt="Founder Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400">Chưa có ảnh</div>
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Nhập đường dẫn ảnh hoặc tải ảnh từ thiết bị..."
                  value={form.about_image}
                  onChange={(e) => setForm({ ...form, about_image: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary"
                />

                <label className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors font-medium">
                  <Upload size={14} />
                  <span>{uploading ? 'Đang tải...' : 'Tải Ảnh Mới Từ Máy'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Manifesto Quote & Color Customization Section */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Quote className="text-primary" size={18} />
              <h2 className="font-heading font-bold text-base text-slate-900">
                Câu Danh Ngôn / Trích Dẫn Ý Nghĩa (Manifesto Quote)
              </h2>
            </div>
            <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
              Hiển thị dạng dải nghệ thuật giữa trang Giới Thiệu
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Form Controls */}
            <div className="lg:col-span-7 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">Nội Dung Trích Dẫn</label>
                <textarea
                  rows={3}
                  value={form.about_quote_text || ''}
                  onChange={(e) => setForm({ ...form, about_quote_text: e.target.value })}
                  placeholder="Nhập câu danh ngôn, triết lý hoặc châm ngôn nghệ thuật của studio..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary leading-relaxed font-heading italic text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Tác Giả / Tên Ký Tên Dưới Trích Dẫn
                </label>
                <input
                  type="text"
                  value={form.about_quote_author || ''}
                  onChange={(e) => setForm({ ...form, about_quote_author: e.target.value })}
                  placeholder="Để trống sẽ tự động hiển thị theo Tên Thương Hiệu (site_name)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>

              {/* Color Customizations */}
              <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 space-y-4">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                  <Palette size={15} className="text-primary" />
                  <span>Tùy Chỉnh Màu Sắc Chữ</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Quote Text Color */}
                  <div className="space-y-2">
                    <label className="block text-slate-600 font-semibold text-[11px]">
                      Màu Chữ Trích Dẫn
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.about_quote_color || '#1f2937'}
                        onChange={(e) => setForm({ ...form, about_quote_color: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-slate-300 p-0.5 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={form.about_quote_color || '#1f2937'}
                        onChange={(e) => setForm({ ...form, about_quote_color: e.target.value })}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-mono uppercase"
                      />
                    </div>
                    {/* Preset color pills */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {[
                        { label: 'Đen than', val: '#111827' },
                        { label: 'Xám đậm', val: '#374151' },
                        { label: 'Nâu đất', val: '#78350F' },
                        { label: 'Cam gạch', val: '#C2410C' },
                        { label: 'Xanh navy', val: '#1E3A8A' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setForm({ ...form, about_quote_color: item.val })}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium border border-slate-200 hover:border-slate-400 bg-white text-slate-700 cursor-pointer transition-colors"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Author / Brand Line Color */}
                  <div className="space-y-2">
                    <label className="block text-slate-600 font-semibold text-[11px]">
                      Màu Chữ Tác Giả / Thương Hiệu
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={form.about_quote_author_color || '#E06738'}
                        onChange={(e) => setForm({ ...form, about_quote_author_color: e.target.value })}
                        className="w-9 h-9 rounded-lg border border-slate-300 p-0.5 cursor-pointer shrink-0"
                      />
                      <input
                        type="text"
                        value={form.about_quote_author_color || '#E06738'}
                        onChange={(e) => setForm({ ...form, about_quote_author_color: e.target.value })}
                        className="flex-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-mono uppercase"
                      />
                    </div>
                    {/* Preset color pills */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {[
                        { label: 'Cam Brand', val: '#E06738' },
                        { label: 'Cam Cháy', val: '#C95326' },
                        { label: 'Đỏ Đô', val: '#991B1B' },
                        { label: 'Vàng Đất', val: '#D97706' },
                        { label: 'Xám Đen', val: '#374151' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          type="button"
                          onClick={() => setForm({ ...form, about_quote_author_color: item.val })}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium border border-slate-200 hover:border-slate-400 bg-white text-slate-700 cursor-pointer transition-colors"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Live Preview Box */}
            <div className="lg:col-span-5 space-y-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                <Eye size={14} className="text-primary" />
                <span>Xem Trước Hiển Thị Thực Tế (Live Preview)</span>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-r from-orange-50/70 via-white to-orange-50/70 border border-orange-200/70 text-center shadow-inner relative flex flex-col items-center justify-center min-h-[220px]">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-primary flex items-center justify-center mb-2 shadow-2xs">
                  <Quote size={15} />
                </div>
                <p
                  className="font-heading italic text-sm sm:text-base leading-relaxed font-normal whitespace-pre-line transition-colors"
                  style={{ color: form.about_quote_color || '#1f2937' }}
                >
                  &ldquo;
                  {form.about_quote_text ||
                    'Mỗi em bé là một thiên thần nhỏ, mỗi nụ cười là một câu chuyện vô giá được lưu giữ trọn vẹn qua thời gian.'}
                  &rdquo;
                </p>
                <span
                  className="font-body text-[11px] font-bold uppercase tracking-widest mt-2 block transition-colors"
                  style={{ color: form.about_quote_author_color || '#E06738' }}
                >
                  — {form.about_quote_author || 'QA STORIES'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
