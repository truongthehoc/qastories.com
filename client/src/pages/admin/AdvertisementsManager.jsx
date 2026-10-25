import { useState, useEffect, useMemo } from 'react'
import {
  Megaphone,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Upload,
  RefreshCw,
  X,
  Play,
  Video,
  Image as ImageIcon,
  Clock,
  Layers,
  Calendar,
  ExternalLink,
  Sliders,
  CheckCircle2,
  AlertCircle,
  MousePointerClick,
  Sparkles,
} from 'lucide-react'
import api from '../../utils/api'

export default function AdvertisementsManager() {
  const [ads, setAds] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [previewAd, setPreviewAd] = useState(null)
  const [editingAd, setEditingAd] = useState(null)
  const [uploadingMedia, setUploadingMedia] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState(null)

  // Filters
  const [search, setSearch] = useState('')
  const [filterPlacement, setFilterPlacement] = useState('all')
  const [filterType, setFilterType] = useState('all')

  const [form, setForm] = useState({
    title: '',
    description: '',
    media_type: 'image', // 'image' | 'video'
    media_url: '',
    media_thumbnail: '',
    link_url: '/contact',
    button_text: 'Nhận Ưu Đãi Ngay',
    placement: 'popup', // 'popup' | 'top_bar' | 'floating_bottom_right' | 'floating_bottom_left' | 'in_page'
    target_pages: 'all', // 'all' | 'home' | 'album' | 'about' | 'contact'
    popup_delay: 3,
    popup_duration: 0,
    popup_frequency: 'once_per_session', // 'always' | 'once_per_session' | 'once_per_day'
    start_date: '',
    end_date: '',
    sort_order: 0,
    is_active: 1,
  })

  const fetchAds = async () => {
    try {
      setLoading(true)
      const res = await api.get('/advertisements/all')
      if (res.success) {
        setAds(res.data || [])
      }
    } catch (err) {
      console.warn('Lỗi khi tải danh sách quảng cáo:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAds()
  }, [])

  const handleOpenCreate = () => {
    setEditingAd(null)
    setForm({
      title: '',
      description: '',
      media_type: 'image',
      media_url: '',
      media_thumbnail: '',
      link_url: '/contact',
      button_text: 'Nhận Ưu Đãi Ngay',
      placement: 'popup',
      target_pages: 'all',
      popup_delay: 3,
      popup_duration: 0,
      popup_frequency: 'once_per_session',
      start_date: '',
      end_date: '',
      sort_order: ads.length ? Math.max(...ads.map((a) => a.sort_order || 0)) + 1 : 0,
      is_active: 1,
    })
    setModalOpen(true)
  }

  const handleOpenEdit = (ad) => {
    setEditingAd(ad)
    setForm({
      title: ad.title || '',
      description: ad.description || '',
      media_type: ad.media_type || 'image',
      media_url: ad.media_url || '',
      media_thumbnail: ad.media_thumbnail || '',
      link_url: ad.link_url || '',
      button_text: ad.button_text || 'Xem Ngay',
      placement: ad.placement || 'popup',
      target_pages: ad.target_pages || 'all',
      popup_delay: ad.popup_delay !== undefined ? ad.popup_delay : 3,
      popup_duration: ad.popup_duration !== undefined ? ad.popup_duration : 0,
      popup_frequency: ad.popup_frequency || 'once_per_session',
      start_date: ad.start_date ? ad.start_date.slice(0, 16) : '',
      end_date: ad.end_date ? ad.end_date.slice(0, 16) : '',
      sort_order: ad.sort_order || 0,
      is_active: ad.is_active ? 1 : 0,
    })
    setModalOpen(true)
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.name)
    const formData = new FormData()
    formData.append('photos', file)
    formData.append('category', 'banners')

    try {
      setUploadingMedia(true)
      const res = await api.post('/upload', formData)
      if (res.success && res.data && res.data.length > 0) {
        const uploadedUrl = res.data[0].url
        setForm((prev) => ({
          ...prev,
          media_url: uploadedUrl,
          media_type: isVideo ? 'video' : 'image',
        }))
      } else {
        alert(res.message || 'Tải file thất bại')
      }
    } catch (err) {
      alert('Lỗi tải file: ' + err.message)
    } finally {
      setUploadingMedia(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      alert('Vui lòng nhập tiêu đề quảng cáo')
      return
    }
    if (!form.media_url.trim()) {
      alert('Vui lòng tải lên hoặc dán link hình ảnh/video')
      return
    }

    try {
      setSaving(true)
      const payload = {
        ...form,
        popup_delay: parseInt(form.popup_delay, 10) || 0,
        popup_duration: parseInt(form.popup_duration, 10) || 0,
        sort_order: parseInt(form.sort_order, 10) || 0,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : null,
        end_date: form.end_date ? new Date(form.end_date).toISOString() : null,
      }

      if (editingAd) {
        await api.put(`/advertisements/${editingAd.id}`, payload)
      } else {
        await api.post('/advertisements', payload)
      }

      setModalOpen(false)
      fetchAds()
    } catch (err) {
      alert('Lỗi lưu quảng cáo: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (id) => {
    try {
      await api.patch(`/advertisements/${id}/active`)
      setAds((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_active: a.is_active ? 0 : 1 } : a))
      )
    } catch (err) {
      alert('Lỗi cập nhật trạng thái: ' + err.message)
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.delete(`/advertisements/${id}`)
      setAds((prev) => prev.filter((a) => a.id !== id))
      setDeleteConfirmId(null)
    } catch (err) {
      alert('Lỗi khi xóa quảng cáo: ' + err.message)
    }
  }

  // Filtered ads
  const filteredAds = useMemo(() => {
    return ads.filter((ad) => {
      const matchSearch =
        ad.title?.toLowerCase().includes(search.toLowerCase()) ||
        ad.description?.toLowerCase().includes(search.toLowerCase())
      const matchPlacement = filterPlacement === 'all' || ad.placement === filterPlacement
      const matchType = filterType === 'all' || ad.media_type === filterType
      return matchSearch && matchPlacement && matchType
    })
  }, [ads, search, filterPlacement, filterType])

  // Stats
  const activeCount = ads.filter((a) => a.is_active).length
  const popupCount = ads.filter((a) => a.placement === 'popup').length
  const totalViews = ads.reduce((acc, a) => acc + (a.views_count || 0), 0)
  const totalClicks = ads.reduce((acc, a) => acc + (a.clicks_count || 0), 0)

  const placementLabel = {
    popup: '🌟 Popup Modal (Giữa màn hình)',
    top_bar: '🔔 Top Bar (Thanh trên đầu)',
    floating_bottom_right: '🎈 Nổi góc phải dưới',
    floating_bottom_left: '🎈 Nổi góc trái dưới',
    in_page: '📰 Banner chèn trong trang',
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 admin-scope">
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-orange-100 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-orange-100 text-primary rounded-xl">
              <Megaphone size={24} />
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight font-heading">
              Quản Lý Quảng Cáo & Popup
            </h1>
          </div>
          <p className="text-gray-500 text-sm mt-1.5 ml-12">
            Tạo chiến dịch banner, khuyến mãi, popup hình ảnh hoặc video với thời gian hiển thị linh hoạt.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchAds}
            className="p-2.5 text-gray-500 hover:text-primary hover:bg-orange-50 border border-gray-200 rounded-xl transition-all"
            title="Tải lại danh sách"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="btn-primary !px-5 !py-2.5 text-sm inline-flex items-center gap-2 rounded-xl font-medium shadow-md hover:shadow-orange-200"
          >
            <Plus size={18} /> Thêm Quảng Cáo Mới
          </button>
        </div>
      </div>

      {/* 2. Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-primary flex items-center justify-center shrink-0">
            <Megaphone size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{ads.length}</div>
            <div className="text-xs text-gray-500 font-medium">Tổng số chiến dịch</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{activeCount}</div>
            <div className="text-xs text-gray-500 font-medium">Đang kích hoạt</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Sparkles size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">{popupCount}</div>
            <div className="text-xs text-gray-500 font-medium">Dạng Popup Modal</div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-orange-100 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <MousePointerClick size={22} />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900">
              {totalClicks} <span className="text-xs text-gray-400 font-normal">/ {totalViews} xem</span>
            </div>
            <div className="text-xs text-gray-500 font-medium">Lượt click quan tâm</div>
          </div>
        </div>
      </div>

      {/* 3. Filters & Controls */}
      <div className="bg-white p-4 rounded-2xl border border-orange-100 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Tìm kiếm theo tiêu đề hoặc nội dung..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterPlacement}
            onChange={(e) => setFilterPlacement(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-primary"
          >
            <option value="all">Tất cả vị trí</option>
            <option value="popup">Popup Modal</option>
            <option value="top_bar">Top Bar đầu trang</option>
            <option value="floating_bottom_right">Nổi góc phải</option>
            <option value="floating_bottom_left">Nổi góc trái</option>
            <option value="in_page">Banner trong trang</option>
          </select>

          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-primary"
          >
            <option value="all">Tất cả định dạng</option>
            <option value="image">Hình ảnh</option>
            <option value="video">Video</option>
          </select>
        </div>
      </div>

      {/* 4. Advertisement List */}
      {loading ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-orange-100">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">Đang tải danh sách quảng cáo...</p>
        </div>
      ) : filteredAds.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-orange-100">
          <div className="w-16 h-16 bg-orange-50 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <Megaphone size={28} />
          </div>
          <h3 className="text-base font-semibold text-gray-800">Chưa có quảng cáo nào</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-sm mx-auto">
            Bấm nút "Thêm Quảng Cáo Mới" ở góc trên để tạo popup thông báo hoặc banner khuyến mãi.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAds.map((ad) => {
            const isVideo = ad.media_type === 'video'
            return (
              <div
                key={ad.id}
                className="bg-white rounded-2xl border border-orange-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow"
              >
                {/* Media Preview Box */}
                <div className="relative aspect-video bg-gray-900 overflow-hidden group">
                  {isVideo ? (
                    <video
                      src={ad.media_url}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                      onMouseEnter={(e) => e.target.play().catch(() => {})}
                      onMouseLeave={(e) => e.target.pause()}
                    />
                  ) : (
                    <img
                      src={ad.media_url}
                      alt={ad.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}

                  {/* Media Type Badge */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium">
                    {isVideo ? <Video size={13} className="text-blue-400" /> : <ImageIcon size={13} className="text-green-400" />}
                    <span>{isVideo ? 'Video' : 'Hình ảnh'}</span>
                  </div>

                  {/* Active Status Badge */}
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => handleToggleActive(ad.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm transition-all ${
                        ad.is_active
                          ? 'bg-green-500/90 text-white hover:bg-green-600'
                          : 'bg-gray-800/80 text-gray-300 hover:bg-gray-800'
                      }`}
                    >
                      {ad.is_active ? 'Đang bật' : 'Tạm dừng'}
                    </button>
                  </div>

                  {/* Quick Preview Hover Button */}
                  <button
                    onClick={() => setPreviewAd(ad)}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 text-white font-medium text-sm transition-opacity"
                  >
                    <Eye size={18} /> Xem trước
                  </button>
                </div>

                {/* Content Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-medium text-primary mb-1.5">
                      <Layers size={13} />
                      <span>{placementLabel[ad.placement] || ad.placement}</span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-base line-clamp-1">{ad.title}</h3>
                    {ad.description && (
                      <p className="text-gray-500 text-xs mt-1 line-clamp-2 leading-relaxed">
                        {ad.description}
                      </p>
                    )}
                  </div>

                  {/* Popup Timing Specs */}
                  {ad.placement === 'popup' && (
                    <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-100/60 text-xs text-gray-600 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} className="text-primary" /> Độ trễ xuất hiện:
                        </span>
                        <strong className="text-gray-900 font-semibold">{ad.popup_delay}s</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Clock size={12} className="text-primary" /> Tự động đóng:
                        </span>
                        <strong className="text-gray-900 font-semibold">
                          {ad.popup_duration > 0 ? `${ad.popup_duration}s` : 'Không tự đóng'}
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* Footer Meta & Actions */}
                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-xs text-gray-400 flex items-center gap-3">
                      <span>👁️ {ad.views_count || 0}</span>
                      <span>🖱️ {ad.clicks_count || 0} click</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(ad)}
                        className="p-2 text-gray-500 hover:text-primary hover:bg-orange-50 rounded-lg transition-colors"
                        title="Chỉnh sửa"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(ad.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 5. Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-orange-100 overflow-hidden my-8">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-orange-50/50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 text-primary rounded-xl">
                  <Megaphone size={20} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">
                  {editingAd ? 'Chỉnh Sửa Chiến Dịch Quảng Cáo' : 'Tạo Chiến Dịch Quảng Cáo Mới'}
                </h3>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
              {/* Tiêu đề & Mô tả */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Tiêu Đề Quảng Cáo <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Ưu đãi chụp ảnh thôi nôi giảm 20% trong tháng này!"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Mô Tả Ngắn / Lời Kêu Gọi
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Mô tả quyền lợi hoặc thể lệ chương trình khuyến mãi..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>
              </div>

              {/* Media Type & Upload */}
              <div className="p-4 bg-orange-50/40 rounded-2xl border border-orange-100 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Định Dạng Đa Phương Tiện <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-orange-200 text-xs">
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, media_type: 'image' })}
                      className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                        form.media_type === 'image'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-600 hover:text-primary'
                      }`}
                    >
                      <ImageIcon size={14} /> Hình Ảnh
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm({ ...form, media_type: 'video' })}
                      className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 transition-all ${
                        form.media_type === 'video'
                          ? 'bg-primary text-white shadow-sm'
                          : 'text-gray-600 hover:text-primary'
                      }`}
                    >
                      <Video size={14} /> Video (MP4)
                    </button>
                  </div>
                </div>

                {/* File Upload & URL Field */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="flex-1 cursor-pointer">
                      <div className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-orange-200 hover:border-primary bg-white text-center transition-all flex items-center justify-center gap-2 text-sm text-gray-600 font-medium">
                        <Upload size={18} className="text-primary" />
                        {uploadingMedia ? 'Đang tải file lên...' : `Tải lên file ${form.media_type === 'video' ? 'Video (MP4, WebM)' : 'Ảnh (JPG, PNG, WebP)'}`}
                      </div>
                      <input
                        type="file"
                        accept={form.media_type === 'video' ? 'video/mp4,video/webm,video/quicktime' : 'image/*'}
                        onChange={handleFileUpload}
                        className="hidden"
                        disabled={uploadingMedia}
                      />
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Hoặc dán trực tiếp đường dẫn URL hình ảnh / video..."
                      value={form.media_url}
                      onChange={(e) => setForm({ ...form, media_url: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary pr-10"
                    />
                    {form.media_url && (
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, media_url: '' })}
                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                      >
                        <X size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Media Live Preview in Form */}
                {form.media_url && (
                  <div className="rounded-xl overflow-hidden aspect-video bg-black/90 max-h-48 flex items-center justify-center border border-gray-200 relative">
                    {form.media_type === 'video' ? (
                      <video
                        src={form.media_url}
                        controls
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img
                        src={form.media_url}
                        alt="Xem trước"
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                )}
              </div>

              {/* Vị trí đặt quảng cáo (Placement) */}
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  Vị Trí & Cách Xuất Hiện Trên Website <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'popup', label: '🌟 Popup Modal', desc: 'Hộp thoại nổi bật đập vào mắt ở giữa màn hình' },
                    { id: 'top_bar', label: '🔔 Top Bar', desc: 'Thanh thông báo mỏng chạy trên cùng website' },
                    { id: 'floating_bottom_right', label: '🎈 Nổi góc phải dưới', desc: 'Thẻ nổi nhỏ gọn cạnh nút liên hệ' },
                    { id: 'in_page', label: '📰 Banner trang chủ', desc: 'Hiển thị chèn giữa các phần nội dung' },
                  ].map((p) => (
                    <label
                      key={p.id}
                      className={`p-3.5 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                        form.placement === p.id
                          ? 'border-primary bg-orange-50/50 ring-2 ring-primary/20'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-sm text-gray-900">{p.label}</span>
                        <input
                          type="radio"
                          name="placement"
                          value={p.id}
                          checked={form.placement === p.id}
                          onChange={(e) => setForm({ ...form, placement: e.target.value })}
                          className="text-primary focus:ring-primary"
                        />
                      </div>
                      <span className="text-xs text-gray-500 leading-relaxed">{p.desc}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Popup Specific Settings */}
              {form.placement === 'popup' && (
                <div className="p-4 bg-purple-50/40 rounded-2xl border border-purple-100 space-y-4">
                  <div className="flex items-center gap-2 text-purple-900 font-semibold text-sm">
                    <Clock size={16} /> Cài Đặt Thời Gian & Tần Suất Cho Popup
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Độ Trễ Xuất Hiện (giây)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="120"
                        value={form.popup_delay}
                        onChange={(e) => setForm({ ...form, popup_delay: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                        placeholder="VD: 3 (3 giây sau khi vào trang)"
                      />
                      <span className="text-[11px] text-gray-500 mt-1 block">
                        Khách vào trang sau X giây thì popup mới bung ra (0 = tức thì).
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Tự Động Đóng Sau (giây)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="300"
                        value={form.popup_duration}
                        onChange={(e) => setForm({ ...form, popup_duration: e.target.value })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                        placeholder="VD: 0 (không tự đóng)"
                      />
                      <span className="text-[11px] text-gray-500 mt-1 block">
                        Nhập 0 nếu muốn khách tự bấm nút X để đóng.
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                      Tần Suất Xuất Hiện Với Khách Hàng
                    </label>
                    <select
                      value={form.popup_frequency}
                      onChange={(e) => setForm({ ...form, popup_frequency: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-primary"
                    >
                      <option value="once_per_session">Chỉ 1 lần mỗi phiên duyệt web (Khuyên dùng - không phiền khách)</option>
                      <option value="once_per_day">Chỉ 1 lần mỗi ngày (1 lần / 24h)</option>
                      <option value="always">Luôn xuất hiện mỗi lần tải lại trang</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Nút hành động & Đường dẫn liên kết */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Chữ Trên Nút Kêu Gọi (CTA)
                  </label>
                  <input
                    type="text"
                    value={form.button_text}
                    onChange={(e) => setForm({ ...form, button_text: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                    placeholder="VD: Đặt Lịch Ngay / Xem Chi Tiết"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Đường Dẫn Khi Click (URL)
                  </label>
                  <input
                    type="text"
                    value={form.link_url}
                    onChange={(e) => setForm({ ...form, link_url: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                    placeholder="VD: /contact hoặc link fanpage/zalo"
                  />
                </div>
              </div>

              {/* Trang hiển thị */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Áp Dụng Cho Trang
                  </label>
                  <select
                    value={form.target_pages}
                    onChange={(e) => setForm({ ...form, target_pages: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-primary"
                  >
                    <option value="all">Tất cả các trang</option>
                    <option value="home">Chỉ trang chủ</option>
                    <option value="album">Chỉ trang Album & Chi tiết</option>
                    <option value="about">Chỉ trang Giới thiệu</option>
                    <option value="contact">Chỉ trang Đặt lịch & Liên hệ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                    Trạng Thái Kích Hoạt
                  </label>
                  <select
                    value={form.is_active}
                    onChange={(e) => setForm({ ...form, is_active: parseInt(e.target.value, 10) })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm bg-white focus:outline-none focus:border-primary"
                  >
                    <option value={1}>Bật (Hiển thị tới khách hàng)</option>
                    <option value={0}>Tạm dừng (Ẩn)</option>
                  </select>
                </div>
              </div>

              {/* Lịch chạy chiến dịch */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Ngày Bắt Đầu (Tùy chọn)
                  </label>
                  <input
                    type="datetime-local"
                    value={form.start_date}
                    onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Ngày Kết Thúc (Tùy chọn)
                  </label>
                  <input
                    type="datetime-local"
                    value={form.end_date}
                    onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Submit Action */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-600 font-medium text-sm hover:bg-gray-50 transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={saving || uploadingMedia}
                  className="btn-primary !px-6 !py-2.5 text-sm font-semibold rounded-xl shadow-md disabled:opacity-50"
                >
                  {saving ? 'Đang lưu...' : editingAd ? 'Lưu Thay Đổi' : 'Tạo Quảng Cáo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Live Preview Modal for Admin */}
      {previewAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md">
          <div className="relative bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-white/20 animate-scale-in">
            <button
              onClick={() => setPreviewAd(null)}
              className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <X size={18} />
            </button>

            <div className="relative aspect-[4/3] bg-black">
              {previewAd.media_type === 'video' ? (
                <video
                  src={previewAd.media_url}
                  autoPlay
                  controls
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={previewAd.media_url}
                  alt={previewAd.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            <div className="p-6 text-center space-y-3">
              <h4 className="font-bold text-gray-900 text-lg leading-snug">{previewAd.title}</h4>
              {previewAd.description && (
                <p className="text-gray-500 text-sm leading-relaxed">{previewAd.description}</p>
              )}
              {previewAd.button_text && (
                <div className="pt-2">
                  <span className="btn-primary !py-2.5 !px-6 text-sm inline-block rounded-full shadow-lg">
                    {previewAd.button_text}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 7. Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-gray-100">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-base">Xác nhận xóa quảng cáo?</h4>
              <p className="text-gray-500 text-xs mt-1">
                Chiến dịch này sẽ bị xóa hoàn toàn khỏi hệ thống và không thể khôi phục.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Hủy Bỏ
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-5 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 shadow-sm"
              >
                Xóa Vĩnh Viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
