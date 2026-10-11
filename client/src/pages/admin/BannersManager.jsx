import { useState, useEffect, useMemo } from 'react'
import {
  Home as HomeIcon,
  Image as ImageIcon,
  Plus,
  Trash2,
  Edit2,
  Eye,
  EyeOff,
  Upload,
  RefreshCw,
  X,
  Layers,
  BookOpen,
  Save,
  CheckCircle2,
  Monitor,
  Smartphone,
} from 'lucide-react'
import api from '../../utils/api'
import { useSettings } from '../../context/SettingsContext'

export default function BannersManager() {
  const { settings, refreshSettings } = useSettings()
  const [activeTab, setActiveTab] = useState('banners') // 'banners' | 'intro'
  const [deviceFilter, setDeviceFilter] = useState('all') // 'all' | 'pc' | 'mobile'

  // --- Banner State ---
  const [banners, setBanners] = useState([])
  const [loadingBanners, setLoadingBanners] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [uploadingMobileBanner, setUploadingMobileBanner] = useState(false)

  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    device_type: 'pc', // 'pc' | 'mobile' | 'all'
    image_url: '',
    image_mobile: '',
    link_url: '',
    button_text: '',
    sort_order: 1,
    is_active: true,
  })

  // --- Intro Section State ---
  const [savingIntro, setSavingIntro] = useState(false)
  const [uploadingIntro, setUploadingIntro] = useState(false)
  const [savedIntroSuccess, setSavedIntroSuccess] = useState(false)

  const [introForm, setIntroForm] = useState({
    home_intro_image: '',
    home_intro_label: '',
    home_intro_title: '',
    home_intro_title_highlight: '',
    home_intro_p1: '',
    home_intro_p2: '',
  })

  const [introFeatures, setIntroFeatures] = useState([
    'Trang phục nhập khẩu mềm mịn cho da bé',
    'Phòng chụp tiệt trùng UV và nhiệt độ lý tưởng',
    'Nhiếp ảnh gia chuyên môn cao & yêu trẻ',
    'Đa dạng concept từ tối giản đến sang trọng',
  ])

  const handleAddFeature = () => {
    setIntroFeatures((prev) => [...prev, ''])
  }

  const handleUpdateFeature = (index, value) => {
    setIntroFeatures((prev) => prev.map((item, i) => (i === index ? value : item)))
  }

  const handleRemoveFeature = (index) => {
    setIntroFeatures((prev) => prev.filter((_, i) => i !== index))
  }

  // Load Banners
  const fetchBanners = async () => {
    try {
      setLoadingBanners(true)
      const res = await api.get('/banners/all')
      if (res.success) {
        setBanners(res.data || [])
      }
    } catch (error) {
      console.warn('Lỗi khi tải banners:', error.message)
    } finally {
      setLoadingBanners(false)
    }
  }

  // Phân loại danh sách banner theo thiết bị
  const pcBanners = useMemo(
    () => banners.filter((b) => b.device_type === 'pc' || b.device_type === 'all' || !b.device_type),
    [banners]
  )
  const mobileBanners = useMemo(
    () => banners.filter((b) => b.device_type === 'mobile' || b.device_type === 'all'),
    [banners]
  )

  const filteredBanners = useMemo(() => {
    if (deviceFilter === 'pc') {
      return banners.filter((b) => b.device_type === 'pc' || b.device_type === 'all' || !b.device_type)
    }
    if (deviceFilter === 'mobile') {
      return banners.filter((b) => b.device_type === 'mobile' || b.device_type === 'all')
    }
    return banners
  }, [banners, deviceFilter])

  // Load Intro Settings
  const syncIntroForm = (data) => {
    let featuresList = [
      'Trang phục nhập khẩu mềm mịn cho da bé',
      'Phòng chụp tiệt trùng UV và nhiệt độ lý tưởng',
      'Nhiếp ảnh gia chuyên môn cao & yêu trẻ',
      'Đa dạng concept từ tối giản đến sang trọng',
    ]

    if (data?.home_intro_features) {
      try {
        const parsed =
          typeof data.home_intro_features === 'string'
            ? JSON.parse(data.home_intro_features)
            : data.home_intro_features
        if (Array.isArray(parsed)) {
          featuresList = parsed
        }
      } catch {
        // use default
      }
    }

    setIntroFeatures(featuresList)

    setIntroForm({
      home_intro_image:
        data?.home_intro_image ||
        'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=900&q=85',
      home_intro_label:
        data?.home_intro_label || `Giới thiệu về ${data?.brand_name || 'QA Stories'}`,
      home_intro_title: data?.home_intro_title || 'Nghệ Thuật Lưu Giữ',
      home_intro_title_highlight: data?.home_intro_title_highlight || 'Những Khoảnh Khắc Đầu Đời',
      home_intro_p1:
        data?.home_intro_p1 ||
        `Tại ${data?.brand_name || 'QA Stories'}, chúng tôi hiểu rằng thời thơ ấu của con trôi qua rất nhanh. Từng ngón tay bé xíu, từng cái ngáp ngủ dễ thương hay nụ cười đầu tiên đều là những báu vật vô giá không thể lặp lại.`,
      home_intro_p2:
        data?.home_intro_p2 ||
        'Với hơn 5 năm kinh nghiệm chuyên sâu trong lĩnh vực nhiếp ảnh trẻ em, chúng tôi tạo dựng một không gian an toàn, ấm áp và phong cách nghệ thuật tinh tế để mỗi bức ảnh không chỉ đẹp mà còn đong đầy cảm xúc yêu thương.',
    })
  }

  useEffect(() => {
    fetchBanners()
  }, [])

  useEffect(() => {
    if (settings) {
      syncIntroForm(settings)
    }
  }, [settings])

  // --- Banner Actions ---
  const handleOpenCreateModal = () => {
    setEditingBanner(null)
    const initialDevice = deviceFilter === 'mobile' ? 'mobile' : 'pc'
    setBannerForm({
      title: '',
      subtitle: '',
      device_type: initialDevice,
      image_url: '',
      image_mobile: '',
      link_url: '',
      button_text: '',
      sort_order: banners.length + 1,
      is_active: true,
    })
    setModalOpen(true)
  }

  const handleOpenEditModal = (b) => {
    setEditingBanner(b)
    setBannerForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      device_type: b.device_type || 'all',
      image_url: b.image_url || '',
      image_mobile: b.image_mobile || '',
      link_url: b.link_url || '',
      button_text: b.button_text || '',
      sort_order: b.sort_order || 0,
      is_active: !!b.is_active,
    })
    setModalOpen(true)
  }

  const handleToggleActive = async (id, currentActive) => {
    try {
      await api.patch(`/banners/${id}/active`, { is_active: !currentActive })
      fetchBanners()
    } catch (error) {
      alert('Không thể cập nhật trạng thái: ' + error.message)
    }
  }

  const handleDeleteBanner = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa banner này?')) return
    try {
      await api.delete(`/banners/${id}`)
      fetchBanners()
    } catch (error) {
      alert('Không thể xóa banner: ' + error.message)
    }
  }

  const handleBannerFileUpload = async (e, field = 'image_url') => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      if (field === 'image_mobile') {
        setUploadingMobileBanner(true)
      } else {
        setUploadingBanner(true)
      }

      const res = await api.uploadPhotos(files, 'banners')
      if (res.success && res.files && res.files[0]) {
        setBannerForm((prev) => ({ ...prev, [field]: res.files[0].url }))
      }
    } catch (error) {
      alert('Tải ảnh thất bại: ' + error.message)
    } finally {
      if (field === 'image_mobile') {
        setUploadingMobileBanner(false)
      } else {
        setUploadingBanner(false)
      }
    }
  }

  const handleBannerSubmit = async (e) => {
    e.preventDefault()
    if (!bannerForm.image_url) {
      alert('Vui lòng chọn hoặc nhập đường dẫn ảnh banner!')
      return
    }

    try {
      if (editingBanner) {
        await api.put(`/banners/${editingBanner.id}`, bannerForm)
      } else {
        await api.post('/banners', bannerForm)
      }
      setModalOpen(false)
      fetchBanners()
    } catch (error) {
      alert('Lỗi: ' + error.message)
    }
  }

  // --- Intro Actions ---
  const handleIntroImageUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setUploadingIntro(true)
      const res = await api.uploadPhotos(files, 'about')
      if (res.success && res.files && res.files[0]) {
        setIntroForm((prev) => ({ ...prev, home_intro_image: res.files[0].url }))
      }
    } catch (error) {
      alert('Tải ảnh thất bại: ' + error.message)
    } finally {
      setUploadingIntro(false)
    }
  }

  const handleSaveIntro = async (e) => {
    e?.preventDefault()
    try {
      setSavingIntro(true)
      setSavedIntroSuccess(false)

      const cleanFeatures = introFeatures.map((f) => f.trim()).filter(Boolean)

      const payload = {
        home_intro_image: introForm.home_intro_image,
        home_intro_label: introForm.home_intro_label,
        home_intro_title: introForm.home_intro_title,
        home_intro_title_highlight: introForm.home_intro_title_highlight,
        home_intro_p1: introForm.home_intro_p1,
        home_intro_p2: introForm.home_intro_p2,
        home_intro_features: JSON.stringify(cleanFeatures),
      }

      await api.post('/settings', payload)
      refreshSettings()
      setSavedIntroSuccess(true)
      setTimeout(() => setSavedIntroSuccess(false), 3000)
    } catch (error) {
      alert('Lỗi khi lưu cài đặt: ' + error.message)
    } finally {
      setSavingIntro(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900 flex items-center gap-2.5">
            <HomeIcon className="text-primary" size={24} />
            Quản Lý Trang Chủ (Home Page)
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Tùy biến Banner Slider (phân tách riêng PC & Mobile) và Section Giới Thiệu
          </p>
        </div>

        {/* Action Buttons depending on active tab */}
        <div className="flex items-center gap-2.5">
          {activeTab === 'banners' ? (
            <>
              <button
                onClick={() => fetchBanners()}
                className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs border border-slate-200 shadow-xs transition-colors cursor-pointer"
                title="Làm mới danh sách"
              >
                <RefreshCw size={15} className={loadingBanners ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-md shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Plus size={16} />
                <span>
                  {deviceFilter === 'mobile'
                    ? 'Thêm Banner Mobile Mới'
                    : deviceFilter === 'pc'
                    ? 'Thêm Banner PC Mới'
                    : 'Thêm Banner Mới'}
                </span>
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={() => refreshSettings()}
                className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs border border-slate-200 shadow-xs transition-colors cursor-pointer"
                title="Làm mới"
              >
                <RefreshCw size={15} />
              </button>
              <button
                type="button"
                onClick={handleSaveIntro}
                disabled={savingIntro}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs shadow-md shadow-primary/25 hover:shadow-primary/40 flex items-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
              >
                <Save size={16} />
                <span>{savingIntro ? 'Đang Lưu...' : 'Lưu Thay Đổi Giới Thiệu'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('banners')}
          className={`pb-3.5 px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'banners'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ImageIcon size={17} />
          <span>Banner & Slider Màn Hình Chính</span>
          <span className="px-2 py-0.5 rounded-full text-[11px] bg-orange-100 text-primary font-mono font-bold">
            {banners.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('intro')}
          className={`pb-3.5 px-4 font-semibold text-xs sm:text-sm flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === 'intro'
              ? 'border-primary text-primary font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen size={17} />
          <span>Section Giới Thiệu (About Intro)</span>
        </button>
      </div>

      {/* ==================== TAB 1: BANNERS ==================== */}
      {activeTab === 'banners' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Sub-Device Selector & Filter Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-2.5 sm:p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => setDeviceFilter('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  deviceFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <Layers size={14} />
                <span>Tất Cả</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
                  {banners.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceFilter('pc')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  deviceFilter === 'pc'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                }`}
              >
                <Monitor size={14} />
                <span>Banner PC / Laptop (Ngang)</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-500 text-white font-mono">
                  {pcBanners.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setDeviceFilter('mobile')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  deviceFilter === 'mobile'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                <Smartphone size={14} />
                <span>Banner Mobile / Di Động (Dọc)</span>
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-purple-500 text-white font-mono">
                  {mobileBanners.length}
                </span>
              </button>
            </div>

            <div className="text-[11px] text-slate-500 font-medium px-2">
              {deviceFilter === 'pc' && '🖥️ Đang hiển thị các banner dành cho máy tính (16:9)'}
              {deviceFilter === 'mobile' && '📱 Đang hiển thị các banner dành riêng cho điện thoại (dọc 9:16 / 4:5)'}
              {deviceFilter === 'all' && '🌐 Hiển thị tất cả cấu hình banner hiện có'}
            </div>
          </div>

          {loadingBanners ? (
            <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span>Đang tải danh sách banner...</span>
            </div>
          ) : filteredBanners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBanners.map((b) => {
                const isMobileBanner = b.device_type === 'mobile'
                const isAllBanner = b.device_type === 'all' || !b.device_type

                return (
                  <div
                    key={b.id}
                    className={`bg-white border rounded-3xl overflow-hidden transition-all duration-300 flex flex-col group shadow-xs ${
                      b.is_active
                        ? 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
                        : 'border-slate-200 opacity-60'
                    }`}
                  >
                    {/* Image Preview Container */}
                    <div
                      className={`relative w-full overflow-hidden flex items-center justify-center ${
                        isMobileBanner
                          ? 'aspect-[9/16] max-h-72 bg-slate-950'
                          : 'aspect-[16/9] bg-slate-100'
                      }`}
                    >
                      <img
                        src={
                          isMobileBanner && b.image_mobile
                            ? b.image_mobile
                            : b.image_url
                        }
                        alt={b.title || 'Banner'}
                        className={`transition-transform duration-500 group-hover:scale-105 ${
                          isMobileBanner
                            ? 'h-full w-auto max-w-full object-contain'
                            : 'w-full h-full object-cover'
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {/* Device Type Badge */}
                          {isMobileBanner ? (
                            <span className="px-2.5 py-0.8 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-purple-600/95 text-white flex items-center gap-1 shadow-xs">
                              <Smartphone size={11} /> Mobile
                            </span>
                          ) : isAllBanner ? (
                            <span className="px-2.5 py-0.8 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-amber-600/95 text-white flex items-center gap-1 shadow-xs">
                              <Layers size={11} /> PC & Mobile
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.8 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-blue-600/95 text-white flex items-center gap-1 shadow-xs">
                              <Monitor size={11} /> PC
                            </span>
                          )}

                          {/* Status Badge */}
                          <span
                            className={`px-2 py-0.8 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                              b.is_active
                                ? 'bg-emerald-500/90 text-white shadow-xs'
                                : 'bg-slate-800/80 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {b.is_active ? 'Hiển Thị' : 'Ẩn'}
                          </span>
                        </div>

                        <span className="px-2 py-0.8 rounded-full text-[10px] font-mono bg-black/60 text-white backdrop-blur-md shrink-0">
                          #{b.sort_order}
                        </span>
                      </div>

                      {/* Banner Text Overlay Preview */}
                      <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
                        <h3 className="font-heading font-bold text-sm text-white line-clamp-1 drop-shadow-sm">
                          {b.title || 'Không có tiêu đề'}
                        </h3>
                        <p className="text-[11px] text-slate-200 line-clamp-1 mt-0.5 drop-shadow-sm">
                          {b.subtitle || 'Không có phụ đề'}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer Actions */}
                    <div className="p-3.5 sm:p-4 bg-white flex items-center justify-between border-t border-slate-100 text-xs mt-auto">
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                        <span>
                          Thứ tự:{' '}
                          <strong className="text-slate-800 font-mono">#{b.sort_order}</strong>
                        </span>
                        {b.image_mobile && b.device_type === 'all' && (
                          <span className="text-purple-600 font-semibold" title="Có riêng ảnh mobile">
                            • Có ảnh Mobile
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(b.id, b.is_active)}
                          title={b.is_active ? 'Ẩn banner' : 'Hiển thị banner'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            b.is_active
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-400'
                          }`}
                        >
                          {b.is_active ? <Eye size={15} /> : <EyeOff size={15} />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(b)}
                          title="Chỉnh sửa banner"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteBanner(b.id)}
                          title="Xóa banner"
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-slate-200/90 rounded-3xl shadow-sm">
              <ImageIcon className="mx-auto text-slate-400 mb-3" size={40} />
              <p className="text-slate-500 text-sm">
                {deviceFilter === 'mobile'
                  ? 'Chưa có banner nào dành riêng cho Mobile.'
                  : deviceFilter === 'pc'
                  ? 'Chưa có banner nào dành cho PC.'
                  : 'Chưa có banner nào được tạo.'}
              </p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-sm cursor-pointer"
              >
                {deviceFilter === 'mobile' ? '+ Thêm Banner Mobile Đầu Tiên' : '+ Tạo Banner Mới'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== TAB 2: INTRO SECTION ==================== */}
      {activeTab === 'intro' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {savedIntroSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 shadow-xs">
              <CheckCircle2 size={16} />
              <span>Đã lưu thành công nội dung Section Giới Thiệu Trang Chủ!</span>
            </div>
          )}

          <form onSubmit={handleSaveIntro} className="space-y-6">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <BookOpen className="text-primary" size={18} />
                  <h2 className="font-heading font-bold text-base text-slate-900">
                    Cấu Hình Section Giới Thiệu Trang Chủ
                  </h2>
                </div>
                <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
                  Khối giới thiệu xuất hiện ngay dưới Banner Slider màn hình chính
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Form Content */}
                <div className="lg:col-span-7 space-y-4 text-xs">
                  {/* Label / Subheading */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1.5">
                      Nhãn Tiêu Đề Nhỏ (Label)
                    </label>
                    <input
                      type="text"
                      value={introForm.home_intro_label}
                      onChange={(e) =>
                        setIntroForm({ ...introForm, home_intro_label: e.target.value })
                      }
                      placeholder="Nhập nhãn giới thiệu..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary text-sm"
                    />
                  </div>

                  {/* Title & Highlight */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1.5">
                        Tiêu Đề Chính (Dòng 1)
                      </label>
                      <input
                        type="text"
                        value={introForm.home_intro_title}
                        onChange={(e) =>
                          setIntroForm({ ...introForm, home_intro_title: e.target.value })
                        }
                        placeholder="Nhập tiêu đề chính..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 font-semibold mb-1.5">
                        Dòng Nhấn Mạnh (Dòng 2 - Màu Cam)
                      </label>
                      <input
                        type="text"
                        value={introForm.home_intro_title_highlight}
                        onChange={(e) =>
                          setIntroForm({
                            ...introForm,
                            home_intro_title_highlight: e.target.value,
                          })
                        }
                        placeholder="Nhập dòng nhấn mạnh..."
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary font-medium text-primary"
                      />
                    </div>
                  </div>

                  {/* Paragraph 1 */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1.5">
                      Đoạn Dẫn Nhập (Paragraph 1)
                    </label>
                    <textarea
                      rows={3}
                      value={introForm.home_intro_p1}
                      onChange={(e) =>
                        setIntroForm({ ...introForm, home_intro_p1: e.target.value })
                      }
                      placeholder="Nhập đoạn văn mở đầu..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary leading-relaxed"
                    />
                  </div>

                  {/* Paragraph 2 */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1.5">
                      Đoạn Chi Tiết (Paragraph 2)
                    </label>
                    <textarea
                      rows={3}
                      value={introForm.home_intro_p2}
                      onChange={(e) =>
                        setIntroForm({ ...introForm, home_intro_p2: e.target.value })
                      }
                      placeholder="Nhập đoạn văn chi tiết..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary leading-relaxed"
                    />
                  </div>

                  {/* Features List */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-slate-700 font-semibold">
                        4 Điểm Nổi Bật / Cam Kết Studio
                      </label>
                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="text-primary hover:text-primary-dark font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={14} /> Thêm Điểm Mới
                      </button>
                    </div>

                    {introFeatures.length > 0 ? (
                      <div className="space-y-2">
                        {introFeatures.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="w-5 text-center font-mono text-slate-400 font-semibold">
                              #{idx + 1}
                            </span>
                            <input
                              type="text"
                              value={feat}
                              onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                              placeholder={`Cam kết hoặc điểm mạnh thứ ${idx + 1}...`}
                              className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 text-xs focus:outline-none focus:border-primary shadow-2xs"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveFeature(idx)}
                              title="Xóa điểm này"
                              className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer shrink-0"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-6 text-center text-slate-400 text-xs border border-dashed border-orange-200 rounded-xl bg-white/50">
                        Chưa có điểm cam kết nào. Bấm nút <strong>"+ Thêm Điểm Mới"</strong> ở trên để thêm.
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Intro Image Uploader & Preview */}
                <div className="lg:col-span-5 space-y-4 text-xs">
                  <label className="block text-slate-700 font-semibold">
                    Ảnh Minh Họa Section Giới Thiệu (Tỷ lệ 4:5)
                  </label>

                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden border-2 border-slate-200 bg-slate-100 shadow-inner group">
                    {introForm.home_intro_image ? (
                      <img
                        src={introForm.home_intro_image}
                        alt="Intro Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400">
                        Chưa có ảnh minh họa
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Dán đường dẫn ảnh hoặc bấm nút tải..."
                      value={introForm.home_intro_image}
                      onChange={(e) =>
                        setIntroForm({ ...introForm, home_intro_image: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary"
                    />

                    <label className="w-full py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-colors font-medium">
                      <Upload size={14} />
                      <span>{uploadingIntro ? 'Đang tải ảnh lên...' : 'Tải Ảnh Mới Từ Máy'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleIntroImageUpload}
                        disabled={uploadingIntro}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingIntro}
                      className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold text-xs shadow-md shadow-primary/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      <Save size={16} />
                      <span>{savingIntro ? 'Đang Lưu...' : 'Lưu Thay Đổi Giới Thiệu'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Modal Add / Edit Banner */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="font-heading font-bold text-xl text-slate-900 mb-1">
              {editingBanner ? 'Chỉnh Sửa Banner' : 'Thêm Banner Slider Mới'}
            </h3>
            <p className="text-slate-500 text-xs mb-6">
              Cấu hình hình ảnh riêng cho máy tính (PC) hoặc thiết bị di động (Mobile)
            </p>

            <form onSubmit={handleBannerSubmit} className="space-y-5 text-xs">
              {/* 1. Device Type Selector */}
              <div>
                <label className="block text-slate-800 font-bold mb-2">
                  Thiết Bị Hiển Thị Áp Dụng:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setBannerForm({ ...bannerForm, device_type: 'pc' })}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      bannerForm.device_type === 'pc'
                        ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-950'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          bannerForm.device_type === 'pc'
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Monitor size={15} />
                      </div>
                      <span className="font-bold text-xs">Máy Tính (PC)</span>
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight">
                      Ảnh ngang tỉ lệ 16:9 (1920x1080)
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBannerForm({ ...bannerForm, device_type: 'mobile' })}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      bannerForm.device_type === 'mobile'
                        ? 'border-purple-500 bg-purple-50/60 ring-2 ring-purple-500/20 text-purple-950'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          bannerForm.device_type === 'mobile'
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Smartphone size={15} />
                      </div>
                      <span className="font-bold text-xs">Di Động (Mobile)</span>
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight">
                      Ảnh dọc tỉ lệ 9:16 (1080x1920) hoặc 4:5
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setBannerForm({ ...bannerForm, device_type: 'all' })}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      bannerForm.device_type === 'all'
                        ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20 text-amber-950'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div
                        className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                          bannerForm.device_type === 'all'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        <Layers size={15} />
                      </div>
                      <span className="font-bold text-xs">Cả PC & Mobile</span>
                    </div>
                    <span className="text-[11px] text-slate-500 leading-tight">
                      Dùng chung cho mọi thiết bị
                    </span>
                  </button>
                </div>
              </div>

              {/* 2. Primary Image (PC or Mobile depending on type) */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-800 font-bold">
                    {bannerForm.device_type === 'mobile'
                      ? '📱 Ảnh Banner Dành Cho Mobile (Khuyến nghị 1080x1920 hoặc 1080x1350)'
                      : bannerForm.device_type === 'pc'
                      ? '🖥️ Ảnh Banner Dành Cho PC (Khuyến nghị 1920x1080 hoặc 2560x1440)'
                      : '🖼️ Ảnh Banner Chính (Khuyến nghị 1920x1080)'}
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">Bắt buộc</span>
                </div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Nhập đường dẫn ảnh hoặc bấm chọn file..."
                    value={bannerForm.image_url}
                    onChange={(e) =>
                      setBannerForm({ ...bannerForm, image_url: e.target.value })
                    }
                    className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary text-xs shadow-2xs"
                  />
                  <label className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors border border-slate-200 font-medium text-xs shadow-2xs">
                    <Upload size={14} />
                    <span>{uploadingBanner ? 'Đang tải...' : 'Tải ảnh lên'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleBannerFileUpload(e, 'image_url')}
                      disabled={uploadingBanner}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preview Image */}
                {bannerForm.image_url && (
                  <div
                    className={`relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center ${
                      bannerForm.device_type === 'mobile'
                        ? 'aspect-[9/16] max-h-64 mx-auto w-auto'
                        : 'aspect-[16/9] w-full'
                    }`}
                  >
                    <img
                      src={bannerForm.image_url}
                      alt="Preview"
                      className={`h-full ${
                        bannerForm.device_type === 'mobile'
                          ? 'w-auto object-contain'
                          : 'w-full object-cover'
                      }`}
                    />
                  </div>
                )}
              </div>

              {/* 3. Optional Mobile Image when "all" is selected */}
              {bannerForm.device_type === 'all' && (
                <div className="p-4 bg-purple-50/50 rounded-2xl border border-purple-200/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-purple-950 font-bold">
                      📱 Ảnh Banner Riêng Cho Mobile (Tùy chọn)
                    </label>
                    <span className="text-[11px] text-purple-600 font-medium">
                      Nếu để trống sẽ dùng ảnh chính ở trên
                    </span>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Dán đường dẫn ảnh dọc riêng cho điện thoại..."
                      value={bannerForm.image_mobile}
                      onChange={(e) =>
                        setBannerForm({ ...bannerForm, image_mobile: e.target.value })
                      }
                      className="flex-1 px-3 py-2 bg-white border border-purple-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-500 text-xs shadow-2xs"
                    />
                    <label className="px-3.5 py-2 bg-white hover:bg-purple-100 text-purple-700 rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors border border-purple-200 font-medium text-xs shadow-2xs">
                      <Upload size={14} />
                      <span>{uploadingMobileBanner ? 'Đang tải...' : 'Tải ảnh mobile'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleBannerFileUpload(e, 'image_mobile')}
                        disabled={uploadingMobileBanner}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {bannerForm.image_mobile && (
                    <div className="relative aspect-[9/16] max-h-56 mx-auto rounded-xl overflow-hidden border border-purple-200 bg-slate-950 flex items-center justify-center">
                      <img
                        src={bannerForm.image_mobile}
                        alt="Mobile Preview"
                        className="h-full w-auto object-contain"
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Title & Subtitle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Tiêu Đề Banner (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập tiêu đề chính..."
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Mô Tả Phụ / Slogan (Tùy chọn)
                  </label>
                  <input
                    type="text"
                    placeholder="Nhập slogan ngắn..."
                    value={bannerForm.subtitle}
                    onChange={(e) =>
                      setBannerForm({ ...bannerForm, subtitle: e.target.value })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary"
                  />
                </div>
              </div>

              {/* Sort order & Active toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Thứ Tự Ưu Tiên (Số nhỏ hơn hiển thị trước)
                  </label>
                  <input
                    type="number"
                    value={bannerForm.sort_order}
                    onChange={(e) =>
                      setBannerForm({
                        ...bannerForm,
                        sort_order: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="pt-5">
                  <label className="flex items-center gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={bannerForm.is_active}
                      onChange={(e) =>
                        setBannerForm({ ...bannerForm, is_active: e.target.checked })
                      }
                      className="w-4 h-4 rounded text-primary focus:ring-primary bg-white border-slate-300"
                    />
                    <span className="text-slate-700 font-semibold">
                      Bật hiển thị ngay trên trang chủ
                    </span>
                  </label>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold shadow-md shadow-primary/25 cursor-pointer"
                >
                  {editingBanner ? 'Cập Nhật Banner' : 'Tạo Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
