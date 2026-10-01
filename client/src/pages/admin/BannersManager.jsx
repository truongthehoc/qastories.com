import { useState, useEffect } from 'react'
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
} from 'lucide-react'
import api from '../../utils/api'
import { useSettings } from '../../context/SettingsContext'

export default function BannersManager() {
  const { settings, refreshSettings } = useSettings()
  const [activeTab, setActiveTab] = useState('banners') // 'banners' | 'intro'

  // --- Banner State ---
  const [banners, setBanners] = useState([])
  const [loadingBanners, setLoadingBanners] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState(null)
  const [uploadingBanner, setUploadingBanner] = useState(false)

  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    image_url: '',
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
    setBannerForm({
      title: '',
      subtitle: '',
      image_url: '',
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
      image_url: b.image_url || '',
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

  const handleBannerFileUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setUploadingBanner(true)
      const res = await api.uploadPhotos(files, 'banners')
      if (res.success && res.files && res.files[0]) {
        setBannerForm((prev) => ({ ...prev, image_url: res.files[0].url }))
      }
    } catch (error) {
      alert('Tải ảnh thất bại: ' + error.message)
    } finally {
      setUploadingBanner(false)
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
            Tùy biến Banner Slider và Section Giới Thiệu trên màn hình chính
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
                <span>Thêm Banner Mới</span>
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
          {loadingBanners ? (
            <div className="p-16 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span>Đang tải danh sách banner...</span>
            </div>
          ) : banners.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banners.map((b) => (
                <div
                  key={b.id}
                  className={`bg-white border rounded-3xl overflow-hidden transition-all duration-300 flex flex-col group shadow-xs ${
                    b.is_active
                      ? 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
                      : 'border-slate-200 opacity-60'
                  }`}
                >
                  {/* Image Preview */}
                  <div className="relative aspect-[16/9] w-full bg-slate-100 overflow-hidden">
                    <img
                      src={b.image_url}
                      alt={b.title || 'Banner'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent pointer-events-none" />

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.8 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                          b.is_active
                            ? 'bg-emerald-500/90 text-white shadow-xs'
                            : 'bg-slate-800/80 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {b.is_active ? 'Đang Hiển Thị' : 'Đang Ẩn'}
                      </span>
                      <span className="px-2 py-0.8 rounded-full text-[10px] font-mono bg-black/60 text-white backdrop-blur-md">
                        Thứ tự: #{b.sort_order}
                      </span>
                    </div>

                    {/* Banner Text Overlay Preview */}
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="font-heading font-bold text-sm text-white line-clamp-1 drop-shadow-sm">
                        {b.title || 'Không có tiêu đề'}
                      </h3>
                      <p className="text-[11px] text-slate-200 line-clamp-1 mt-0.5 drop-shadow-sm">
                        {b.subtitle || 'Không có phụ đề'}
                      </p>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-4 bg-white flex items-center justify-between border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <span>
                        Vị trí:{' '}
                        <strong className="text-slate-800 font-mono">#{b.sort_order}</strong>
                      </span>
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
                        title="Chỉnh sửa"
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
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white border border-slate-200/90 rounded-3xl shadow-sm">
              <ImageIcon className="mx-auto text-slate-400 mb-3" size={40} />
              <p className="text-slate-500 text-sm">Chưa có banner nào được tạo.</p>
              <button
                type="button"
                onClick={handleOpenCreateModal}
                className="mt-4 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold shadow-sm cursor-pointer"
              >
                Tạo Banner Đầu Tiên
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
                      placeholder="Nhập thông điệp cốt lõi và ý nghĩa dịch vụ..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary leading-relaxed"
                    />
                  </div>

                  {/* Paragraph 2 */}
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1.5">
                      Đoạn Mô Tả Chi Tiết (Paragraph 2)
                    </label>
                    <textarea
                      rows={3}
                      value={introForm.home_intro_p2}
                      onChange={(e) =>
                        setIntroForm({ ...introForm, home_intro_p2: e.target.value })
                      }
                      placeholder="Nhập kinh nghiệm, sự an tâm và cam kết của studio..."
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary leading-relaxed"
                    />
                  </div>

                  {/* Dynamic Checklist Features */}
                  <div className="p-4 rounded-2xl bg-orange-50/40 border border-orange-200/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-800 font-bold text-xs">
                        <CheckCircle2 size={16} className="text-primary" />
                        <span>Các Điểm Nổi Bật / Cam Kết (Checklist)</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-orange-200/60 text-primary font-mono font-bold">
                          {introFeatures.length}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleAddFeature}
                        className="px-3 py-1.5 rounded-xl bg-white hover:bg-orange-100/60 text-primary font-bold text-xs border border-orange-300/80 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Plus size={14} />
                        <span>Thêm Điểm Mới</span>
                      </button>
                    </div>

                    {introFeatures.length > 0 ? (
                      <div className="space-y-2 pt-1">
                        {introFeatures.map((feat, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-orange-100 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">
                              #{idx + 1}
                            </span>
                            <input
                              type="text"
                              value={feat}
                              onChange={(e) => handleUpdateFeature(idx, e.target.value)}
                              placeholder={`Nhập điểm nổi bật / cam kết thứ ${idx + 1}...`}
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
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar animate-in fade-in zoom-in-95">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1 rounded-xl hover:bg-slate-100 cursor-pointer"
            >
              <X size={20} />
            </button>

            <h3 className="font-heading font-bold text-xl text-slate-900 mb-1">
              {editingBanner ? 'Chỉnh Sửa Banner' : 'Thêm Banner Slider Mới'}
            </h3>
            <p className="text-slate-500 text-xs mb-6">
              Điền thông tin và tải ảnh độ phân giải cao cho slider trang chủ
            </p>

            <form onSubmit={handleBannerSubmit} className="space-y-4 text-xs">
              {/* Image Uploader & URL */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Ảnh Banner (Khuyến nghị 1920x1080 hoặc 2560x1440)
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    required
                    placeholder="Nhập đường dẫn ảnh hoặc tải ảnh từ máy tính..."
                    value={bannerForm.image_url}
                    onChange={(e) =>
                      setBannerForm({ ...bannerForm, image_url: e.target.value })
                    }
                    className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary"
                  />
                  <label className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors border border-slate-200 font-medium">
                    <Upload size={14} />
                    <span>{uploadingBanner ? 'Đang tải...' : 'Chọn file'}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleBannerFileUpload}
                      disabled={uploadingBanner}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Preview Image */}
                {bannerForm.image_url && (
                  <div className="relative aspect-[16/9] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 mt-2">
                    <img
                      src={bannerForm.image_url}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Title & Subtitle */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Tiêu Đề Banner (Tùy chọn)
                </label>
                <input
                  type="text"
                  placeholder="Nhập tiêu đề chính của banner..."
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Mô Tả Phụ / Slogan
                </label>
                <input
                  type="text"
                  placeholder="Nhập phụ đề hoặc thông điệp của banner..."
                  value={bannerForm.subtitle}
                  onChange={(e) =>
                    setBannerForm({ ...bannerForm, subtitle: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary"
                />
              </div>

              {/* Sort order */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
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

              {/* Active Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bannerForm.is_active}
                    onChange={(e) =>
                      setBannerForm({ ...bannerForm, is_active: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-primary focus:ring-primary bg-white border-slate-300"
                  />
                  <span className="text-slate-700 font-medium">
                    Bật hiển thị trên trang chủ ngay
                  </span>
                </label>
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
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white font-semibold shadow-md shadow-primary/25 cursor-pointer"
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
