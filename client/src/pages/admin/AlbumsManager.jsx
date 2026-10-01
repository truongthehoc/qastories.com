import { useState, useEffect, useMemo } from 'react'
import {
  Images,
  Plus,
  Trash2,
  Edit2,
  Upload,
  RefreshCw,
  X,
  Camera,
  MapPin,
  Calendar,
  Layers,
  Sparkles,
  Eye,
  FileImage,
  Search,
  List,
  LayoutGrid,
  ExternalLink,
  CalendarRange,
  Clock,
  Star,
  Tag,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react'
import api from '../../utils/api'
import { useSettings } from '../../context/SettingsContext'

export default function AlbumsManager() {
  const { settings, refreshSettings } = useSettings()
  const [albums, setAlbums] = useState([])
  const [systemPackages, setSystemPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Header Banner Modal State
  const [headerModalOpen, setHeaderModalOpen] = useState(false)
  const [headerForm, setHeaderForm] = useState({
    album_header_label: '',
    album_header_title: '',
    album_header_title_highlight: '',
    album_header_desc: '',
  })
  const [headerSaving, setHeaderSaving] = useState(false)
  const [headerSaved, setHeaderSaved] = useState(false)

  useEffect(() => {
    if (settings) {
      setHeaderForm({
        album_header_label: settings.album_header_label ?? 'Bộ Sưu Tập Nghệ Thuật',
        album_header_title: settings.album_header_title ?? 'Khoảnh Khắc Của Bé',
        album_header_title_highlight: settings.album_header_title_highlight ?? 'Kể Bằng Hình Ảnh',
        album_header_desc: settings.album_header_desc ?? 'Mỗi bức ảnh là một tác phẩm được chăm chút tỉ mỉ, giúp bố mẹ lưu lại trọn vẹn những ký ức đầu đời thiêng liêng nhất của con yêu.',
      })
    }
  }, [settings])

  const handleSaveHeader = async (e) => {
    e.preventDefault()
    try {
      setHeaderSaving(true)
      setHeaderSaved(false)
      await api.post('/settings', headerForm)
      refreshSettings?.()
      setHeaderSaved(true)
      setTimeout(() => {
        setHeaderSaved(false)
        setHeaderModalOpen(false)
      }, 1200)
    } catch (err) {
      alert('Lỗi lưu cấu hình: ' + err.message)
    } finally {
      setHeaderSaving(false)
    }
  }

  // Search & Date Range Filters & View Mode
  const [searchQuery, setSearchQuery] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [viewMode, setViewMode] = useState('list') // 'list' (default) | 'grid'

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Dynamic Categories loaded from system packages
  const categories = useMemo(() => {
    const list = [{ id: 'all', label: 'Tất Cả Album' }]
    const seenIds = new Set(['all'])

    systemPackages.forEach((pkg) => {
      const catId = pkg.slug || `pkg-${pkg.id}`
      if (!seenIds.has(catId)) {
        seenIds.add(catId)
        list.push({
          id: catId,
          label: pkg.name,
          price: pkg.price,
          packageName: pkg.name,
        })
      }
    })

    albums.forEach((alb) => {
      if (alb.category && !seenIds.has(alb.category)) {
        seenIds.add(alb.category)
        list.push({
          id: alb.category,
          label: alb.category_label || alb.category,
          packageName: alb.package_name || alb.category_label || alb.category,
        })
      }
    })

    if (list.length === 1) {
      list.push({ id: 'general', label: 'Gói Chụp Nghệ Thuật', packageName: 'Gói Chụp Nghệ Thuật' })
    }

    return list
  }, [systemPackages, albums])

  // Date formatting helpers
  const toDateInputValue = (val) => {
    if (!val) return ''
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val
    const dmy = val.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
    if (dmy) {
      const [, d, m, y] = dmy
      return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
    }
    const my = val.match(/(\d{1,2})\/(\d{4})/)
    if (my) {
      const [, m, y] = my
      return `${y}-${m.padStart(2, '0')}-01`
    }
    const parsed = new Date(val)
    if (!isNaN(parsed.getTime())) {
      return parsed.toISOString().split('T')[0]
    }
    return ''
  }

  const formatDateDisplay = (dateVal, fallbackStr = '') => {
    if (fallbackStr && fallbackStr.trim()) return fallbackStr
    if (!dateVal) return '—'
    const iso = String(dateVal).match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (iso) {
      const [, y, m, d] = iso
      return `${d}/${m}/${y}`
    }
    const d = new Date(dateVal)
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
    }
    return dateVal
  }

  // Album Modal
  const [albumModalOpen, setAlbumModalOpen] = useState(false)
  const [editingAlbum, setEditingAlbum] = useState(null)
  const [coverUploading, setCoverUploading] = useState(false)
  const [customPackageMode, setCustomPackageMode] = useState(false)
  const [albumForm, setAlbumForm] = useState({
    title: '',
    slug: '',
    category: '',
    category_label: '',
    cover_image: '',
    description: '',
    location: 'QA Stories Studio',
    date_shot: new Date().toISOString().split('T')[0],
    package_name: '',
    story: '',
    is_featured: true,
    sort_order: 1,
  })

  // Photos Gallery Manager Modal
  const [galleryModalOpen, setGalleryModalOpen] = useState(false)
  const [currentAlbum, setCurrentAlbum] = useState(null)
  const [photosUploading, setPhotosUploading] = useState(false)

  const fetchAlbums = async () => {
    try {
      setLoading(true)
      const [albumRes, pkgRes] = await Promise.all([
        api.get('/albums'),
        api.get('/packages'),
      ])
      if (albumRes.success) {
        setAlbums(albumRes.data || [])
      }
      if (pkgRes.success && pkgRes.data) {
        setSystemPackages(pkgRes.data || [])
      }
    } catch (error) {
      console.warn('Lỗi khi tải dữ liệu albums/packages:', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlbums()
  }, [])

  // Handle Escape key & body scroll lock for Drawers
  useEffect(() => {
    const isAnyDrawerOpen = albumModalOpen || galleryModalOpen
    if (isAnyDrawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (galleryModalOpen) setGalleryModalOpen(false)
        else if (albumModalOpen) setAlbumModalOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [albumModalOpen, galleryModalOpen])

  // Auto-generate slug from title
  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
  }

  const handleTitleChange = (val) => {
    setAlbumForm((prev) => ({
      ...prev,
      title: val,
      slug: !editingAlbum ? generateSlug(val) : prev.slug,
    }))
  }

  const handleOpenCreateModal = () => {
    const firstPkg = systemPackages[0]
    const defaultCatId = firstPkg ? (firstPkg.slug || `pkg-${firstPkg.id}`) : (categories.filter(c => c.id !== 'all')[0]?.id || '')
    const defaultCatLabel = firstPkg ? firstPkg.name : (categories.filter(c => c.id !== 'all')[0]?.label || '')
    const defaultPkgName = firstPkg ? firstPkg.name : defaultCatLabel

    setEditingAlbum(null)
    setCustomPackageMode(false)
    setAlbumForm({
      title: '',
      slug: '',
      category: defaultCatId,
      category_label: defaultCatLabel,
      cover_image: '',
      description: '',
      location: 'QA Stories Studio',
      date_shot: new Date().toISOString().split('T')[0],
      package_name: defaultPkgName,
      story: '',
      is_featured: true,
      sort_order: albums.length + 1,
    })
    setAlbumModalOpen(true)
  }

  const handleOpenEditModal = (a) => {
    setEditingAlbum(a)
    setCustomPackageMode(false)
    setAlbumForm({
      title: a.title || '',
      slug: a.slug || '',
      category: a.category || (systemPackages[0]?.slug || ''),
      category_label: a.category_label || '',
      cover_image: a.cover_image || '',
      description: a.description || '',
      location: a.location || '',
      date_shot: toDateInputValue(a.date_shot) || a.date_shot || '',
      package_name: a.package_name || '',
      story: a.story || '',
      is_featured: !!a.is_featured,
      sort_order: a.sort_order || 0,
    })
    setAlbumModalOpen(true)
  }

  const handleCoverUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    try {
      setCoverUploading(true)
      const res = await api.uploadPhotos(files, 'albums')
      if (res.success && res.files && res.files[0]) {
        setAlbumForm((prev) => ({ ...prev, cover_image: res.files[0].url }))
      }
    } catch (error) {
      alert('Tải ảnh bìa thất bại: ' + error.message)
    } finally {
      setCoverUploading(false)
    }
  }

  const handleAlbumSubmit = async (e) => {
    e.preventDefault()
    if (!albumForm.title || !albumForm.slug) {
      alert('Vui lòng nhập tên album và đường dẫn slug')
      return
    }

    try {
      const catObj = categories.find((c) => c.id === albumForm.category)
      const payload = {
        ...albumForm,
        category_label: catObj?.label || albumForm.category_label,
      }

      if (editingAlbum) {
        await api.put(`/albums/${editingAlbum.id}`, payload)
      } else {
        await api.post('/albums', payload)
      }
      setAlbumModalOpen(false)
      fetchAlbums()
    } catch (error) {
      alert('Lỗi: ' + error.message)
    }
  }

  const handleDeleteAlbum = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa toàn bộ album này cùng các ảnh bên trong?')) return
    try {
      await api.delete(`/albums/${id}`)
      fetchAlbums()
    } catch (error) {
      alert('Không thể xóa album: ' + error.message)
    }
  }

  const handleToggleFeatured = async (album) => {
    try {
      const nextFeatured = !album.is_featured ? 1 : 0
      // Optimistic update
      setAlbums((prev) =>
        prev.map((a) => (a.id === album.id ? { ...a, is_featured: nextFeatured } : a))
      )
      await api.put(`/albums/${album.id}`, {
        ...album,
        is_featured: nextFeatured,
      })
    } catch (err) {
      alert('Không thể thay đổi trạng thái nổi bật: ' + err.message)
      fetchAlbums()
    }
  }

  // --- Photo Gallery Manager ---
  const handleOpenGalleryModal = async (album) => {
    try {
      const res = await api.get(`/albums/admin/${album.id}`)
      if (res.success && res.data) {
        setCurrentAlbum(res.data)
        setGalleryModalOpen(true)
      }
    } catch (error) {
      alert('Không thể tải ảnh album: ' + error.message)
    }
  }

  const handleMultiPhotoUpload = async (e) => {
    const files = e.target.files
    if (!files || files.length === 0 || !currentAlbum) return

    try {
      setPhotosUploading(true)
      const res = await api.uploadPhotos(files, 'gallery')
      if (res.success && res.files) {
        // Add each photo to album in db
        for (let i = 0; i < res.files.length; i++) {
          const file = res.files[i]
          await api.post(`/albums/${currentAlbum.id}/photos`, {
            filename: file.filename,
            original_name: file.originalname,
            size: file.size,
            url: file.url,
            title: file.originalname.replace(/\.[^/.]+$/, ''),
            description: '',
            sort_order: (currentAlbum.photos?.length || 0) + i + 1,
          })
        }
        // Refresh modal photos
        const updatedAlbumRes = await api.get(`/albums/admin/${currentAlbum.id}`)
        if (updatedAlbumRes.success) {
          setCurrentAlbum(updatedAlbumRes.data)
        }
        fetchAlbums()
      }
    } catch (error) {
      alert('Lỗi khi tải ảnh lên: ' + error.message)
    } finally {
      setPhotosUploading(false)
    }
  }

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Xóa ảnh này khỏi album?')) return
    try {
      await api.delete(`/albums/photos/${photoId}`)
      if (currentAlbum) {
        setCurrentAlbum((prev) => ({
          ...prev,
          photos: prev.photos.filter((p) => p.id !== photoId),
        }))
      }
      fetchAlbums()
    } catch (error) {
      alert('Không thể xóa ảnh: ' + error.message)
    }
  }

  // Helper to extract comparable YYYY-MM-DD from album
  const getAlbumFilterDate = (album) => {
    if (album.created_at) {
      const d = new Date(album.created_at)
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0]
      }
    }
    if (album.date_shot) {
      const isoMatch = album.date_shot.match(/(\d{4})-(\d{2})-(\d{2})/)
      if (isoMatch) return isoMatch[0]

      const dmyMatch = album.date_shot.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
      if (dmyMatch) {
        const [, day, month, year] = dmyMatch
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
      }

      const myMatch = album.date_shot.match(/(\d{1,2})\/(\d{4})/)
      if (myMatch) {
        const [, month, year] = myMatch
        return `${year}-${month.padStart(2, '0')}-01`
      }
    }
    return null
  }

  // Filtered Albums
  const filteredAlbums = useMemo(() => {
    return albums.filter((a) => {
      // 1. Category Filter
      if (selectedCategory !== 'all' && a.category !== selectedCategory) {
        return false
      }

      // 2. Search Query Filter (Title, Slug, Description, Location, Package Name)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const titleMatch = (a.title || '').toLowerCase().includes(q)
        const slugMatch = (a.slug || '').toLowerCase().includes(q)
        const descMatch = (a.description || '').toLowerCase().includes(q)
        const locMatch = (a.location || '').toLowerCase().includes(q)
        const pkgMatch = (a.package_name || '').toLowerCase().includes(q)
        if (!titleMatch && !slugMatch && !descMatch && !locMatch && !pkgMatch) {
          return false
        }
      }

      // 3. Date Range Filter (startDate & endDate)
      const albumDate = getAlbumFilterDate(a)
      if (startDate) {
        if (!albumDate || albumDate < startDate) {
          return false
        }
      }
      if (endDate) {
        if (!albumDate || albumDate > endDate) {
          return false
        }
      }

      return true
    })
  }, [albums, selectedCategory, searchQuery, startDate, endDate])

  const hasActiveFilters = searchQuery.trim() !== '' || startDate !== '' || endDate !== '' || selectedCategory !== 'all'

  const handleResetFilters = () => {
    setSearchQuery('')
    setStartDate('')
    setEndDate('')
    setSelectedCategory('all')
  }

  // Reset page to 1 when filters or items per page change
  useEffect(() => {
    setCurrentPage(1)
  }, [selectedCategory, searchQuery, startDate, endDate, itemsPerPage])

  // Pagination calculation
  const totalItems = filteredAlbums.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  const safeCurrentPage = Math.min(Math.max(currentPage, 1), totalPages)
  const startIndex = (safeCurrentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

  const paginatedAlbums = useMemo(() => {
    return filteredAlbums.slice(startIndex, endIndex)
  }, [filteredAlbums, startIndex, endIndex])

  const getPageNumbers = () => {
    const pages = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (safeCurrentPage > 3) {
        pages.push('...')
      }
      const start = Math.max(2, safeCurrentPage - 1)
      const end = Math.min(totalPages - 1, safeCurrentPage + 1)
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      if (safeCurrentPage < totalPages - 2) {
        pages.push('...')
      }
      pages.push(totalPages)
    }
    return pages
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-primary shadow-xs">
              <Images size={20} className="text-primary" />
            </div>
            <h1 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
              Quản Lý Bộ Sưu Tập & Kho Ảnh
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 text-primary-dark border border-orange-200/70">
              Tổng {albums.length} album
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm pl-0 sm:pl-11">
            Quản lý concept, tải nhiều ảnh cùng lúc, tìm kiếm theo tên và lọc theo khoảng thời gian chụp.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => fetchAlbums()}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Làm Mới</span>
          </button>
          <button
            type="button"
            onClick={() => setHeaderModalOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Chỉnh sửa banner và lời tựa đầu trang Bộ Sưu Tập"
          >
            <SlidersHorizontal size={15} className="text-primary" />
            <span>Cấu Hình Banner Đầu Trang</span>
          </button>
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-md shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            <span>Tạo Album Mới</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 shadow-xs space-y-4">
        
        {/* Row 1: Search Box & Date Range Filter & View Mode Switcher */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          
          {/* Search Box */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo tên album, bé, concept, slug, địa điểm..."
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Date Range: From Date -> To Date */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-50/80 p-1.5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-1.5 pl-2 text-slate-500 text-xs">
              <CalendarRange size={14} className="text-primary" />
              <span className="font-semibold text-slate-600 hidden sm:inline">Thời gian:</span>
            </div>

            {/* Start Date */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400 pl-1">Từ</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-primary shadow-2xs"
                title="Lọc từ ngày"
              />
            </div>

            {/* End Date */}
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-slate-400">Đến</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:border-primary shadow-2xs"
                title="Lọc đến ngày"
              />
            </div>

            {(startDate || endDate) && (
              <button
                type="button"
                onClick={() => {
                  setStartDate('')
                  setEndDate('')
                }}
                className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-600 text-[11px] font-medium transition-colors"
                title="Xóa bộ lọc ngày"
              >
                Xóa ngày
              </button>
            )}
          </div>

          {/* View Mode Switcher (List vs Grid) */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 self-end lg:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Chuyển sang dạng danh sách"
            >
              <List size={15} />
              <span>Danh Sách</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Chuyển sang dạng lưới ảnh"
            >
              <LayoutGrid size={15} />
              <span>Lưới Ảnh</span>
            </button>
          </div>
        </div>

        {/* Row 2: Category Pills & Result Summary */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
            {categories.map((c) => {
              const active = selectedCategory === c.id
              const count = c.id === 'all' ? albums.length : albums.filter((a) => a.category === c.id).length
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedCategory(c.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-primary text-white font-semibold shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <span>{c.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      active ? 'bg-white/20 text-white font-bold' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Result Count and Clear Filters */}
          <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
            <span>
              Hiển thị <strong className="text-slate-800">{filteredAlbums.length}</strong> / {albums.length} album
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-primary hover:text-primary-dark font-medium underline ml-1"
              >
                Đặt lại bộ lọc
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content: List View or Grid View */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 text-xs flex flex-col items-center gap-3 bg-white border border-slate-200/90 rounded-3xl shadow-xs">
          <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span>Đang tải danh sách album...</span>
        </div>
      ) : filteredAlbums.length > 0 ? (
        viewMode === 'list' ? (
          /* ================= LIST VIEW (DẠNG DANH SÁCH MẶC ĐỊNH) ================= */
          <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    <th className="py-3.5 px-4 w-12 text-center">STT</th>
                    <th className="py-3.5 px-4 min-w-[280px]">Thông Tin Album & Concept</th>
                    <th className="py-3.5 px-4 min-w-[150px]">Danh Mục</th>
                    <th className="py-3.5 px-4 min-w-[150px]">Thời Gian & Địa Điểm</th>
                    <th className="py-3.5 px-4 text-center min-w-[110px]">Số Lượng Ảnh</th>
                    <th className="py-3.5 px-4 text-center min-w-[100px]">Nổi Bật</th>
                    <th className="py-3.5 px-4 text-right min-w-[170px]">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {paginatedAlbums.map((a, idx) => {
                    // Badge color for category
                    let catBadgeClass = 'bg-slate-100 text-slate-700 border-slate-200'
                    if (a.category === 'newborn') catBadgeClass = 'bg-rose-50 text-rose-600 border-rose-200'
                    else if (a.category === '100days') catBadgeClass = 'bg-amber-50 text-amber-700 border-amber-200'
                    else if (a.category === '1year') catBadgeClass = 'bg-orange-50 text-primary-dark border-orange-200'
                    else if (a.category === 'family') catBadgeClass = 'bg-indigo-50 text-indigo-700 border-indigo-200'

                    return (
                      <tr
                        key={a.id}
                        className="hover:bg-slate-50/70 transition-colors group"
                      >
                        {/* 1. STT */}
                        <td className="py-4 px-4 text-center font-mono text-slate-400 font-medium">
                          #{startIndex + idx + 1}
                        </td>

                        {/* 2. Album Cover & Info */}
                        <td className="py-4 px-4">
                          <div className="flex items-start gap-3.5">
                            {/* Thumbnail */}
                            <div
                              onClick={() => handleOpenGalleryModal(a)}
                              className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 cursor-pointer group/thumb shadow-2xs"
                              title="Bấm để mở kho ảnh"
                            >
                              <img
                                src={a.cover_image || 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&q=80'}
                                alt={a.title}
                                className="w-full h-full object-cover group-hover/thumb:scale-110 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Camera size={18} />
                              </div>
                            </div>

                            {/* Details */}
                            <div className="min-w-0 space-y-1">
                              <h3
                                onClick={() => handleOpenEditModal(a)}
                                className="font-heading font-bold text-sm sm:text-base text-slate-900 hover:text-primary transition-colors cursor-pointer line-clamp-1"
                              >
                                {a.title}
                              </h3>

                              <div className="flex items-center gap-2 text-slate-500 text-[11px]">
                                <span className="font-mono text-slate-400">/album/{a.slug}</span>
                                <a
                                  href={`/album/${a.slug}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-slate-400 hover:text-primary transition-colors"
                                  title="Xem trang album trên website"
                                >
                                  <ExternalLink size={12} />
                                </a>
                              </div>

                              {a.description && (
                                <p className="text-slate-500 text-xs line-clamp-1 leading-relaxed max-w-md">
                                  {a.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* 3. Category */}
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${catBadgeClass}`}>
                            <Tag size={11} />
                            {a.category_label || a.category}
                          </span>
                          {a.package_name && (
                            <div className="text-[11px] text-slate-400 truncate max-w-[150px] mt-1" title={a.package_name}>
                              {a.package_name}
                            </div>
                          )}
                        </td>

                        {/* 4. Time & Location */}
                        <td className="py-4 px-4 text-slate-600">
                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1.5 font-medium text-slate-800">
                              <Calendar size={13} className="text-primary shrink-0" />
                              <span>{a.date_shot || formatDateDisplay(a.created_at)}</span>
                            </div>
                            {a.location && (
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate max-w-[180px]">
                                <MapPin size={12} className="text-slate-400 shrink-0" />
                                <span>{a.location}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        {/* 5. Photo Count */}
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleOpenGalleryModal(a)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-primary-dark border border-orange-200/80 font-bold transition-all shadow-2xs"
                            title="Bấm để xem và tải ảnh lên"
                          >
                            <Camera size={13} className="text-primary" />
                            <span>{a.photo_count || 0} ảnh</span>
                          </button>
                        </td>

                        {/* 6. Featured Toggle Button */}
                        <td className="py-4 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleFeatured(a)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border transition-all cursor-pointer ${
                              a.is_featured
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-300 shadow-2xs'
                                : 'bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 border-slate-200'
                            }`}
                            title={a.is_featured ? 'Đang nổi bật (Bấm để tắt)' : 'Chưa nổi bật (Bấm để bật)'}
                          >
                            <Star
                              size={12}
                              className={a.is_featured ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}
                            />
                            <span>{a.is_featured ? 'Nổi bật' : 'Tắt'}</span>
                          </button>
                        </td>

                        {/* 7. Action Buttons */}
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenGalleryModal(a)}
                              className="p-2 rounded-xl bg-orange-50 hover:bg-orange-100 text-primary border border-orange-200/70 transition-colors"
                              title="Quản lý ảnh trong album"
                            >
                              <Camera size={15} />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(a)}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                              title="Chỉnh sửa thông tin album"
                            >
                              <Edit2 size={15} />
                            </button>

                            <a
                              href={`/album/${a.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                              title="Xem album trên website"
                            >
                              <ExternalLink size={15} />
                            </a>

                            <button
                              type="button"
                              onClick={() => handleDeleteAlbum(a.id)}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                              title="Xóa album"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* ================= GRID VIEW (DẠNG LƯỚI ẢNH) ================= */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedAlbums.map((a) => (
              <div
                key={a.id}
                className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col group"
              >
                {/* Cover Image */}
                <div className="relative aspect-[4/3] w-full bg-slate-100 overflow-hidden">
                  <img
                    src={a.cover_image || 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=85'}
                    alt={a.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent pointer-events-none" />

                  {/* Badge Category & Photo Count & Featured */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-black/60 text-orange-300 border border-orange-400/30 backdrop-blur-md">
                      {a.category_label || a.category}
                    </span>
                    <div className="flex items-center gap-1.5 pointer-events-auto">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleFeatured(a)
                        }}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md flex items-center gap-1 border transition-all cursor-pointer ${
                          a.is_featured
                            ? 'bg-amber-500 text-white border-amber-400 shadow-xs'
                            : 'bg-black/60 text-slate-300 border-white/20 hover:bg-black/80 hover:text-white'
                        }`}
                        title={a.is_featured ? 'Đang nổi bật (Bấm để tắt)' : 'Chưa nổi bật (Bấm để bật)'}
                      >
                        <Star size={11} className={a.is_featured ? 'fill-white text-white' : 'text-slate-300'} />
                        {a.is_featured ? 'Nổi bật' : 'Tắt'}
                      </button>
                      <span className="px-2 py-1 rounded-full text-[10px] font-mono bg-black/60 text-slate-200 backdrop-blur-md flex items-center gap-1">
                        <FileImage size={11} className="text-primary" />
                        {a.photo_count || 0} ảnh
                      </span>
                    </div>
                  </div>

                  {/* Bottom Title inside Image */}
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="font-heading font-bold text-base text-white line-clamp-1">{a.title}</h3>
                    <div className="flex items-center gap-3 text-[11px] text-slate-200 mt-1">
                      {a.date_shot && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} className="text-slate-300" /> {formatDateDisplay(a.date_shot)}
                        </span>
                      )}
                      {a.location && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin size={12} className="text-slate-300" /> {a.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Description & Action buttons */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {a.description || 'Chưa có mô tả concept cho album này.'}
                  </p>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => handleOpenGalleryModal(a)}
                      className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-primary border border-orange-200/70 font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Camera size={14} />
                      <span>Quản Lý Ảnh ({a.photo_count || 0})</span>
                    </button>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditModal(a)}
                        title="Sửa album"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <a
                        href={`/album/${a.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                        title="Xem trang album"
                      >
                        <ExternalLink size={14} />
                      </a>
                      <button
                        onClick={() => handleDeleteAlbum(a.id)}
                        title="Xóa album"
                        className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        /* Empty State */
        <div className="text-center py-20 bg-white border border-slate-200/90 rounded-3xl shadow-xs">
          <Images className="mx-auto text-slate-300 mb-3" size={48} />
          <h4 className="font-heading font-bold text-base text-slate-800">Không tìm thấy album nào</h4>
          <p className="text-slate-500 text-xs mt-1 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'Không có album nào khớp với từ khóa tìm kiếm hoặc khoảng thời gian bạn đã chọn.'
              : 'Hiện chưa có album nào trong danh mục này.'}
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition-colors"
              >
                Xóa Bộ Lọc
              </button>
            )}
            <button
              onClick={handleOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-md shadow-primary/25"
            >
              Tạo Album Mới
            </button>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {!loading && filteredAlbums.length > 0 && (
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Summary and Items per page */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
            <span>
              Hiển thị <strong className="text-slate-800 font-semibold">{totalItems > 0 ? startIndex + 1 : 0}</strong> -{' '}
              <strong className="text-slate-800 font-semibold">{endIndex}</strong> trên tổng số{' '}
              <strong className="text-slate-800 font-semibold">{totalItems}</strong> album
            </span>

            <div className="flex items-center gap-1.5 pl-3 border-l border-slate-200">
              <span className="text-slate-400">Mỗi trang:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 font-medium focus:outline-none focus:border-primary cursor-pointer shadow-2xs"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Right: Page Navigation Buttons */}
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              {/* First Page */}
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                disabled={safeCurrentPage === 1}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Trang đầu"
              >
                <ChevronsLeft size={16} />
              </button>

              {/* Prev Page */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Trang trước"
              >
                <ChevronLeft size={16} />
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-1 mx-1">
                {getPageNumbers().map((p, pIdx) =>
                  p === '...' ? (
                    <span key={`dots-${pIdx}`} className="px-2 text-xs text-slate-400">
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentPage(p)}
                      className={`min-w-[34px] h-8 px-2.5 rounded-xl text-xs font-semibold transition-all ${
                        safeCurrentPage === p
                          ? 'bg-primary text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  )
                )}
              </div>

              {/* Next Page */}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Trang tiếp"
              >
                <ChevronRight size={16} />
              </button>

              {/* Last Page */}
              <button
                type="button"
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Trang cuối"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Drawer: Create / Edit Album (Trượt từ phải qua) */}
      {albumModalOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setAlbumModalOpen(false)}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-xl sm:max-w-2xl bg-white h-full shadow-2xl z-10 flex flex-col transform transition-transform duration-300 ease-out animate-in slide-in-from-right">
            {/* Drawer Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold">
                  <Images size={14} />
                  <span>{editingAlbum ? 'Chỉnh Sửa Dữ Liệu' : 'Khởi Tạo Concept Mới'}</span>
                </div>
                <h3 className="font-heading font-bold text-lg sm:text-xl text-slate-900">
                  {editingAlbum ? 'Chỉnh Sửa Album' : 'Tạo Album Ảnh Mới'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAlbumModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Đóng bảng trượt (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar space-y-5">
              <form id="album-form" onSubmit={handleAlbumSubmit} className="space-y-4 text-xs">
                {/* 1. Featured Toggle & Sort Order (Đưa lên đầu trang) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-3 border-b border-slate-100">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1.5">Thứ Tự Sắp Xếp</label>
                    <input
                      type="number"
                      value={albumForm.sort_order}
                      onChange={(e) => setAlbumForm({ ...albumForm, sort_order: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary text-xs font-mono"
                    />
                  </div>

                  <div className="flex items-end pb-0.5">
                    <label className="relative flex items-center gap-3 p-2.5 rounded-xl bg-orange-50/60 hover:bg-orange-50 border border-orange-200/80 cursor-pointer w-full transition-colors">
                      <input
                        type="checkbox"
                        checked={albumForm.is_featured}
                        onChange={(e) => setAlbumForm({ ...albumForm, is_featured: e.target.checked })}
                        className="w-4 h-4 rounded text-primary focus:ring-primary border-slate-300 cursor-pointer accent-primary"
                      />
                      <div className="flex items-center gap-1.5">
                        <Star size={14} className={albumForm.is_featured ? 'fill-amber-500 text-amber-500' : 'text-slate-400'} />
                        <span className="text-xs font-semibold text-slate-800">
                          Đánh dấu Album Nổi Bật
                        </span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1.5">Tên Album / Tên Bé</label>
                    <input
                      type="text"
                      required
                      placeholder="Nhập tên album hoặc tên bé..."
                      value={albumForm.title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-semibold mb-1.5">Đường Dẫn Slug Tự Động</label>
                    <input
                      type="text"
                      required
                      placeholder="Nhập đường dẫn slug..."
                      value={albumForm.slug}
                      onChange={(e) => setAlbumForm({ ...albumForm, slug: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-mono placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1.5">
                      Danh Mục Chụp (Gói Dịch Vụ) <span className="text-primary">*</span>
                    </label>
                    <select
                      value={albumForm.category}
                      onChange={(e) => {
                        const sel = categories.find((c) => c.id === e.target.value)
                        setAlbumForm({
                          ...albumForm,
                          category: e.target.value,
                          category_label: sel?.label || e.target.value,
                          package_name: customPackageMode ? albumForm.package_name : (sel?.packageName || sel?.label || albumForm.package_name),
                        })
                      }}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary text-xs sm:text-sm font-medium"
                    >
                      {categories
                        .filter((c) => c.id !== 'all')
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.label} {c.price && Number(c.price) > 0 ? `(${Number(c.price).toLocaleString('vi-VN')}đ)` : ''}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-slate-700 font-semibold">Tên Gói Dịch Vụ Áp Dụng</label>
                      <button
                        type="button"
                        onClick={() => setCustomPackageMode(!customPackageMode)}
                        className="text-[11px] text-primary hover:text-primary-dark font-medium underline"
                      >
                        {customPackageMode ? '← Chọn từ danh mục' : '+ Tự nhập tên khác'}
                      </button>
                    </div>

                    {!customPackageMode && systemPackages.length > 0 ? (
                      <select
                        value={albumForm.package_name}
                        onChange={(e) => {
                          if (e.target.value === '__custom__') {
                            setCustomPackageMode(true)
                          } else {
                            setAlbumForm({ ...albumForm, package_name: e.target.value })
                          }
                        }}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary text-xs sm:text-sm font-medium"
                      >
                        <option value="">-- Chọn gói dịch vụ --</option>
                        {systemPackages.map((p) => (
                          <option key={p.id} value={p.name}>
                            {p.name} {p.price && Number(p.price) > 0 ? `(${Number(p.price).toLocaleString('vi-VN')}đ)` : ''}
                          </option>
                        ))}
                        <option value="__custom__">✍️ Tự nhập gói khác...</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        placeholder="Nhập tên gói dịch vụ áp dụng..."
                        value={albumForm.package_name}
                        onChange={(e) => setAlbumForm({ ...albumForm, package_name: e.target.value })}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary text-xs sm:text-sm"
                      />
                    )}
                  </div>
                </div>

                {/* Cover Image */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">Ảnh Bìa Đại Diện Album</label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Nhập đường dẫn ảnh hoặc tải ảnh từ thiết bị..."
                      value={albumForm.cover_image}
                      onChange={(e) => setAlbumForm({ ...albumForm, cover_image: e.target.value })}
                      className="flex-1 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary text-xs"
                    />
                    <label className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl cursor-pointer flex items-center gap-1.5 shrink-0 transition-colors">
                      <Upload size={14} />
                      <span>{coverUploading ? 'Đang tải...' : 'Tải ảnh bìa'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleCoverUpload}
                        disabled={coverUploading}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {albumForm.cover_image && (
                    <div className="relative aspect-[16/9] max-h-48 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                      <img src={albumForm.cover_image} alt="Cover Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                {/* Location & Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1.5">Địa Điểm Thực Hiện</label>
                    <input
                      type="text"
                      placeholder="Nhập địa điểm thực hiện buổi chụp..."
                      value={albumForm.location}
                      onChange={(e) => setAlbumForm({ ...albumForm, location: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary text-xs sm:text-sm"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-slate-700 font-semibold">
                        Thời Gian Chụp <span className="text-primary">*</span>
                      </label>
                      {albumForm.date_shot && (
                        <span className="text-[11px] font-semibold text-primary">
                          {formatDateDisplay(albumForm.date_shot)}
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      required
                      value={toDateInputValue(albumForm.date_shot)}
                      onChange={(e) => setAlbumForm({ ...albumForm, date_shot: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary text-xs sm:text-sm font-medium cursor-pointer"
                    />
                  </div>
                </div>

                {/* Description & Story */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">Mô Tả Ngắn Concept</label>
                  <input
                    type="text"
                    placeholder="Nhập mô tả ngắn về concept..."
                    value={albumForm.description}
                    onChange={(e) => setAlbumForm({ ...albumForm, description: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary text-xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">Câu Chuyện Buổi Chụp (Story)</label>
                  <textarea
                    rows={4}
                    placeholder="Nhập câu chuyện, cảm xúc và thông điệp của bộ ảnh..."
                    value={albumForm.story}
                    onChange={(e) => setAlbumForm({ ...albumForm, story: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary text-xs leading-relaxed"
                  />
                </div>
              </form>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setAlbumModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                form="album-form"
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-md shadow-primary/25 transition-all"
              >
                {editingAlbum ? 'Lưu Thay Đổi' : 'Tạo Album Mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drawer: Photo Gallery Manager (Trượt từ phải qua) */}
      {galleryModalOpen && currentAlbum && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setGalleryModalOpen(false)}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-2xl sm:max-w-3xl md:max-w-4xl bg-white h-full shadow-2xl z-10 flex flex-col transform transition-transform duration-300 ease-out animate-in slide-in-from-right">
            {/* Drawer Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="space-y-0.5 min-w-0 pr-4">
                <div className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold">
                  <Camera size={14} />
                  <span>Kho Thư Viện Ảnh Album</span>
                </div>
                <h3 className="font-heading font-bold text-lg sm:text-xl text-slate-900 truncate">
                  {currentAlbum.title}
                </h3>
                <p className="text-slate-500 text-xs mt-0.5">
                  Tổng số <strong className="text-slate-800">{currentAlbum.photos?.length || 0}</strong> bức ảnh trong album này
                </p>
              </div>

              <div className="flex items-center gap-2.5 shrink-0">
                <label className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold cursor-pointer shadow-md shadow-primary/25 flex items-center gap-1.5 transition-all">
                  <Upload size={14} />
                  <span className="hidden sm:inline">{photosUploading ? 'Đang tải lên...' : 'Tải Thêm Ảnh'}</span>
                  <span className="sm:hidden">Tải Ảnh</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleMultiPhotoUpload}
                    disabled={photosUploading}
                    className="hidden"
                  />
                </label>

                <button
                  type="button"
                  onClick={() => setGalleryModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                  title="Đóng (Esc)"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar">
              {currentAlbum.photos && currentAlbum.photos.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {currentAlbum.photos.map((p, idx) => (
                    <div
                      key={p.id}
                      className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden group relative flex flex-col shadow-2xs hover:shadow-xs transition-shadow"
                    >
                      <div className="relative aspect-square w-full bg-slate-100 overflow-hidden">
                        <img
                          src={p.url}
                          alt={p.title || `Photo ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleDeletePhoto(p.id)}
                          title="Xóa ảnh này"
                          className="absolute top-2 right-2 p-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white opacity-0 group-hover:opacity-100 transition-all shadow-md"
                        >
                          <Trash2 size={13} />
                        </button>
                        <span className="absolute bottom-2 left-2 text-[10px] font-mono bg-black/60 px-1.5 py-0.5 rounded text-white backdrop-blur-sm">
                          #{idx + 1}
                        </span>
                      </div>
                      <div className="p-2 text-[11px] bg-white truncate text-slate-700 border-t border-slate-200/60 font-medium">
                        {p.title || 'Ảnh không tên'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-24 bg-slate-50/70 rounded-2xl border border-dashed border-slate-300">
                  <FileImage className="mx-auto text-slate-400 mb-2" size={40} />
                  <p className="text-slate-600 text-xs font-semibold">Album chưa có bức ảnh nào.</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Tải lên các bức ảnh concept đẹp nhất cho album này.</p>
                  <label className="mt-4 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold cursor-pointer shadow-md shadow-primary/25 transition-all">
                    <Upload size={14} />
                    <span>Tải Lên Ảnh Ngay</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleMultiPhotoUpload}
                      disabled={photosUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Drawer Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-between shrink-0">
              <div className="text-xs text-slate-500">
                Hiển thị {currentAlbum.photos?.length || 0} ảnh
              </div>
              <button
                type="button"
                onClick={() => setGalleryModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200 shadow-2xs transition-colors cursor-pointer"
              >
                Đóng Bảng Trượt
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CẤU HÌNH BANNER ĐẦU TRANG BỘ SƯU TẬP (/album) */}
      {/* ========================================================= */}
      {headerModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl relative my-auto animate-in fade-in zoom-in-95">
            {/* Close Button */}
            <button
              onClick={() => setHeaderModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Đóng"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 text-white flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
                <SlidersHorizontal size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Cấu Hình Banner Đầu Trang Bộ Sưu Tập</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Chỉnh sửa nhãn phụ, tiêu đề chính, chữ nổi bật và lời tựa hiển thị trên trang <span className="font-mono text-primary font-semibold">/album</span>
                </p>
              </div>
            </div>

            {/* Success Alert */}
            {headerSaved && (
              <div className="mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                <span>Đã lưu thành công! Giao diện trang Bộ Sưu Tập đã được cập nhật.</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSaveHeader} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Nhãn Phụ (Badge / Tag Đầu Trang)
                </label>
                <input
                  type="text"
                  value={headerForm.album_header_label ?? ''}
                  onChange={(e) => setHeaderForm({ ...headerForm, album_header_label: e.target.value })}
                  placeholder="Nhập nhãn phụ..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary text-xs sm:text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">Tiêu Đề Chính</label>
                  <input
                    type="text"
                    value={headerForm.album_header_title ?? ''}
                    onChange={(e) => setHeaderForm({ ...headerForm, album_header_title: e.target.value })}
                    placeholder="Nhập tiêu đề chính..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary text-xs sm:text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Phần Chữ Nhấn Mạnh (Màu Cam / Nghiêng)
                  </label>
                  <input
                    type="text"
                    value={headerForm.album_header_title_highlight ?? ''}
                    onChange={(e) => setHeaderForm({ ...headerForm, album_header_title_highlight: e.target.value })}
                    placeholder="Nhập chữ nhấn mạnh..."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary text-xs sm:text-sm font-semibold text-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1.5">
                  Mô Tả / Lời Dẫn Dưới Tiêu Đề
                </label>
                <textarea
                  rows={3}
                  value={headerForm.album_header_desc ?? ''}
                  onChange={(e) => setHeaderForm({ ...headerForm, album_header_desc: e.target.value })}
                  placeholder="Nhập đoạn văn mô tả..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary leading-relaxed text-xs"
                />
              </div>

              {/* Live Preview Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-b from-orange-50/60 via-white to-white border border-orange-200/70 text-center shadow-xs">
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2">Xem trước hiển thị</div>
                <span className="inline-flex items-center px-3 py-0.5 rounded-full bg-orange-100/80 text-primary text-[10px] font-semibold uppercase tracking-wider mb-1.5">
                  {headerForm.album_header_label || 'Bộ Sưu Tập Nghệ Thuật'}
                </span>
                <h3 className="font-heading font-bold text-base text-slate-900">
                  {headerForm.album_header_title || 'Khoảnh Khắc Của Bé'}{' '}
                  {headerForm.album_header_title_highlight && (
                    <span className="italic text-primary font-normal">
                      {headerForm.album_header_title_highlight}
                    </span>
                  )}
                </h3>
                {headerForm.album_header_desc && (
                  <p className="font-body text-slate-500 text-xs mt-1 max-w-md mx-auto leading-relaxed">
                    {headerForm.album_header_desc}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setHeaderModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={headerSaving}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>{headerSaving ? 'Đang Lưu...' : 'Lưu Thay Đổi'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
