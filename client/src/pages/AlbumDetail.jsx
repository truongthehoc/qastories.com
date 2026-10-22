import { useState, useCallback, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Lightbox from 'yet-another-react-lightbox'
import 'yet-another-react-lightbox/styles.css'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Camera,
  ZoomIn,
  ArrowRight,
  Share2,
  Heart,
  Eye,
  Flame,
} from 'lucide-react'
import { albumsData as defaultAlbums } from '../data/albumsData'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { useSettings } from '../context/SettingsContext'
import SEO from '../components/ui/SEO'
import api from '../utils/api'

function normalizeUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url
  }
  return url.startsWith('/') ? url : `/${url}`
}

function getLikedAlbums() {
  try {
    const raw = localStorage.getItem('qastories_liked_albums')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function getLikedPhotos() {
  try {
    const raw = localStorage.getItem('qastories_liked_photos')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function getInitialAlbum(id) {
  if (!id) return null
  const numId = parseInt(id, 10)

  // 1. Kiểm tra cache album đã format từ trang /album
  try {
    const cachedFormatted = localStorage.getItem('qastories_cached_albums_formatted')
    if (cachedFormatted) {
      const list = JSON.parse(cachedFormatted)
      if (Array.isArray(list)) {
        const found = list.find((a) => a.id === numId || a.slug === id || String(a.id) === id)
        if (found) return found
      }
    }
  } catch {}

  // 2. Kiểm tra cache album gốc từ trang chủ hoặc API
  try {
    const cachedRaw = localStorage.getItem('qastories_cached_albums')
    if (cachedRaw) {
      const list = JSON.parse(cachedRaw)
      if (Array.isArray(list)) {
        const item = list.find((a) => a.id === numId || a.slug === id || String(a.id) === id)
        if (item) {
          const gallery = (item.photos && item.photos.length > 0)
            ? item.photos.map((p) => ({
                id: p.id,
                src: normalizeUrl(p.url || p.photo_url || p.src || p.photoUrl),
                title: p.title || item.title,
                desc: p.description || item.desc || '',
                likes: Number(p.likes) || 0,
              }))
            : [{ id: 0, src: normalizeUrl(item.cover_image || item.cover_url || item.cover), title: item.title, desc: item.description || item.desc || '', likes: 0 }]

          gallery.sort((a, b) => (Number(b.likes) || 0) - (Number(a.likes) || 0))

          return {
            id: item.id,
            slug: item.slug || `album-${item.id}`,
            title: item.title,
            category: item.category,
            categoryLabel: item.category_label || item.categoryLabel || item.category,
            cover: normalizeUrl(item.cover_image || item.cover_url || item.cover),
            desc: item.description || item.desc || item.story || '',
            story: item.story || item.description || item.desc || '',
            date: item.date_shot || item.date || '',
            location: item.location || 'Bình Dương',
            packageName: item.package_name || item.packageName || 'Gói Chụp Nghệ Thuật',
            views: Number(item.views) || 0,
            likes: Number(item.likes) || 0,
            gallery,
          }
        }
      }
    }
  } catch {}

  // 3. Fallback vào defaultAlbums
  const local = defaultAlbums.find(
    (a) => a.id === numId || a.slug === id || String(a.id) === id
  )
  if (local) return local

  return null
}

export default function AlbumDetail() {
  const { settings } = useSettings()
  const { id } = useParams()
  const navigate = useNavigate()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  // Khởi tạo ngay lập tức từ cache nếu có để tránh giật giao diện "Không tìm thấy"
  const [album, setAlbum] = useState(() => getInitialAlbum(id))
  const [loading, setLoading] = useState(() => !getInitialAlbum(id))
  const [likedAlbums, setLikedAlbums] = useState(() => getLikedAlbums())
  const [likedPhotos, setLikedPhotos] = useState(() => getLikedPhotos())

  const isAlbumLiked = album
    ? likedAlbums.some(
        (aId) =>
          String(aId) === String(album.id) ||
          String(aId) === String(album.slug)
      )
    : false
  const isPhotoLiked = (photoId) => likedPhotos.some((pId) => String(pId) === String(photoId))

  // Thả tym / Bỏ tym cho album
  const handleLikeAlbum = async () => {
    if (!album?.id && !album?.slug) return
    const targetId = album.id || album.slug
    const currentlyLiked = isAlbumLiked
    const action = currentlyLiked ? 'unlike' : 'like'
    const newLiked = currentlyLiked
      ? likedAlbums.filter((aId) => String(aId) !== String(album.id) && String(aId) !== String(album.slug))
      : [...likedAlbums, album.id || album.slug]

    setLikedAlbums(newLiked)
    try {
      localStorage.setItem('qastories_liked_albums', JSON.stringify(newLiked))
    } catch {}

    const newLikes = Math.max(0, (Number(album.likes) || 0) + (currentlyLiked ? -1 : 1))

    // Cập nhật giao diện tức thì
    setAlbum((prev) => (prev ? { ...prev, likes: newLikes } : prev))

    // Đồng bộ vào localStorage để khi reload không bị mất số tym
    try {
      const raw = localStorage.getItem('qastories_cached_albums')
      if (raw) {
        const list = JSON.parse(raw)
        if (Array.isArray(list)) {
          const updated = list.map((a) =>
            String(a.id) === String(album.id) || a.slug === album.slug ? { ...a, likes: newLikes } : a
          )
          localStorage.setItem('qastories_cached_albums', JSON.stringify(updated))
        }
      }
      const rawFormatted = localStorage.getItem('qastories_cached_albums_formatted')
      if (rawFormatted) {
        const list = JSON.parse(rawFormatted)
        if (Array.isArray(list)) {
          const updated = list.map((a) =>
            String(a.id) === String(album.id) || a.slug === album.slug ? { ...a, likes: newLikes } : a
          )
          localStorage.setItem('qastories_cached_albums_formatted', JSON.stringify(updated))
        }
      }
    } catch {}

    try {
      const res = await api.post(`/albums/${targetId}/like`, { action })
      if (res?.success && res?.data?.likes !== undefined) {
        setAlbum((prev) => (prev ? { ...prev, likes: res.data.likes } : prev))
      }
    } catch (err) {
      console.warn('Lỗi thả tym album:', err)
    }
  }

  // Thả tym / Bỏ tym cho bức ảnh bất kỳ trong album
  const handleLikePhoto = async (e, photoId) => {
    e.stopPropagation()
    if (!photoId) return

    const currentlyLiked = isPhotoLiked(photoId)
    const action = currentlyLiked ? 'unlike' : 'like'
    const newLiked = currentlyLiked
      ? likedPhotos.filter((pId) => String(pId) !== String(photoId))
      : [...likedPhotos, photoId]

    setLikedPhotos(newLiked)
    try {
      localStorage.setItem('qastories_liked_photos', JSON.stringify(newLiked))
    } catch {}

    // Cập nhật lượt tym của ảnh và tự động xếp thứ tự lại:
    // Tấm hình thuộc album được nhiều tym sẽ được xếp thứ tự tự động lên đầu album
    setAlbum((prev) => {
      if (!prev || !prev.gallery) return prev
      const newGallery = prev.gallery.map((p) => {
        if (String(p.id) === String(photoId)) {
          return {
            ...p,
            likes: Math.max(0, (Number(p.likes) || 0) + (currentlyLiked ? -1 : 1)),
          }
        }
        return p
      })
      // Tự động sắp xếp ảnh nhiều tym lên trước
      newGallery.sort((a, b) => (Number(b.likes) || 0) - (Number(a.likes) || 0))
      return { ...prev, gallery: newGallery }
    })

    try {
      const res = await api.post(`/albums/photos/${photoId}/like`, { action })
      if (res?.success && res?.data?.likes !== undefined) {
        setAlbum((prev) => {
          if (!prev || !prev.gallery) return prev
          const newGallery = prev.gallery.map((p) =>
            String(p.id) === String(photoId) ? { ...p, likes: res.data.likes } : p
          )
          newGallery.sort((a, b) => (Number(b.likes) || 0) - (Number(a.likes) || 0))
          return { ...prev, gallery: newGallery }
        })
      }
    } catch (err) {
      console.warn('Lỗi thả tym ảnh:', err)
    }
  }

  // Đếm số cột theo độ rộng màn hình để phân bổ ảnh theo thứ tự từ trái qua phải, từ trên xuống dưới
  const [colCount, setColCount] = useState(() => {
    if (typeof window === 'undefined') return 3
    if (window.innerWidth < 640) return 1
    if (window.innerWidth < 1024) return 2
    return 3
  })

  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth
      if (w < 640) setColCount(1)
      else if (w < 1024) setColCount(2)
      else setColCount(3)
    }
    updateCols()
    window.addEventListener('resize', updateCols)
    return () => window.removeEventListener('resize', updateCols)
  }, [])

  // Phân chia ảnh vào các cột theo thứ tự giảm dần từ trái qua phải, từ trên xuống dưới
  const galleryColumns = useMemo(() => {
    if (!album?.gallery || !Array.isArray(album.gallery)) return []
    const cols = Array.from({ length: colCount }, () => [])
    album.gallery.forEach((photo, idx) => {
      cols[idx % colCount].push({ photo, originalIndex: idx })
    })
    return cols
  }, [album?.gallery, colCount])

  const [allAlbums, setAllAlbums] = useState(() => {
    try {
      const cached =
        localStorage.getItem('qastories_cached_albums_formatted') ||
        localStorage.getItem('qastories_cached_albums')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((item) => ({
            id: item.id,
            slug: item.slug || `album-${item.id}`,
            title: item.title,
            category: item.category,
            categoryLabel: item.category_label || item.categoryLabel || item.category,
            cover: normalizeUrl(item.cover_image || item.cover_url || item.cover),
            desc: item.description || item.desc || item.story || '',
          }))
        }
      }
    } catch {}
    return []
  })

  // Scroll to top và đồng bộ album mới khi đổi id
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
    const initial = getInitialAlbum(id)
    if (initial) {
      setAlbum(initial)
      setLoading(false)
    } else {
      setLoading(true)
    }
  }, [id])

  const formatDateDisplay = (dateVal) => {
    if (!dateVal) return ''
    const iso = String(dateVal).match(/^(\d{4})-(\d{2})-(\d{2})/)
    if (iso) {
      const [, y, m, d] = iso
      return `${d}/${m}/${y}`
    }
    return dateVal
  }

  // Fetch dynamic album data from API
  useEffect(() => {
    let isMounted = true
    const fetchDetail = async () => {
      try {
        const [detailRes, listRes] = await Promise.all([
          api.get(`/albums/detail/${id}`, { bypassCache: true }),
          api.get('/albums', { bypassCache: true }),
        ])

        if (!isMounted) return

        if (listRes.success && listRes.data && listRes.data.length > 0) {
          setAllAlbums(
            listRes.data.map((item) => ({
              id: item.id,
              slug: item.slug || `album-${item.id}`,
              title: item.title,
              category: item.category,
              categoryLabel: item.category_label || item.categoryLabel || item.category,
              cover: normalizeUrl(item.cover_image || item.cover_url || item.cover),
              desc: item.description || item.desc || item.story || '',
            }))
          )
        }

        if (detailRes.success && detailRes.data) {
          const item = detailRes.data
          const gallery = (item.photos && item.photos.length > 0)
            ? item.photos.map((p) => ({
                id: p.id,
                src: normalizeUrl(p.url || p.photo_url || p.src || p.photoUrl),
                title: p.title || item.title,
                desc: p.description || item.desc || '',
                likes: Number(p.likes) || 0,
              }))
            : [{ id: 0, src: normalizeUrl(item.cover_image || item.cover_url || item.cover), title: item.title, desc: item.description || item.desc || '', likes: 0 }]

          // Tấm hình thuộc album được nhiều tym sẽ được xếp thứ tự tự động lên đầu album
          gallery.sort((a, b) => (Number(b.likes) || 0) - (Number(a.likes) || 0))

          const formatted = {
            id: item.id,
            slug: item.slug || `album-${item.id}`,
            title: item.title,
            category: item.category,
            categoryLabel: item.category_label || item.categoryLabel || item.category,
            cover: normalizeUrl(item.cover_image || item.cover_url || item.cover),
            desc: item.description || item.desc || item.story || '',
            story: item.story || item.description || item.desc || '',
            date: formatDateDisplay(item.date_shot) || item.date || '',
            location: item.location || 'Bình Dương',
            packageName: item.package_name || item.packageName || 'Gói Chụp Nghệ Thuật',
            views: Number(item.views) || 0,
            likes: Number(item.likes) || 0,
            gallery,
          }
          setAlbum(formatted)

          // Đồng bộ vào cache để các trang khác và reload không bao giờ bị hiển thị 0
          try {
            const raw = localStorage.getItem('qastories_cached_albums')
            if (raw) {
              const list = JSON.parse(raw)
              if (Array.isArray(list)) {
                const idx = list.findIndex((a) => String(a.id) === String(item.id) || a.slug === item.slug)
                if (idx !== -1) {
                  list[idx] = { ...list[idx], views: formatted.views, likes: formatted.likes }
                  localStorage.setItem('qastories_cached_albums', JSON.stringify(list))
                }
              }
            }
            const rawFormatted = localStorage.getItem('qastories_cached_albums_formatted')
            if (rawFormatted) {
              const list = JSON.parse(rawFormatted)
              if (Array.isArray(list)) {
                const idx = list.findIndex((a) => String(a.id) === String(item.id) || a.slug === item.slug)
                if (idx !== -1) {
                  list[idx] = { ...list[idx], views: formatted.views, likes: formatted.likes }
                  localStorage.setItem('qastories_cached_albums_formatted', JSON.stringify(list))
                }
              }
            }
          } catch {}
        }
      } catch (err) {
        // Fallback to local
        const local = getInitialAlbum(id)
        if (local && isMounted) setAlbum(local)
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchDetail()
    return () => {
      isMounted = false
    }
  }, [id])

  const handleOpenLightbox = useCallback((index) => {
    setLightboxIndex(index)
    setLightboxOpen(true)
  }, [])

  if (loading && !album) {
    return (
      <div className="pt-32 pb-24 min-h-[70vh] flex flex-col items-center justify-center text-center px-4 bg-offwhite/40">
        <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <p className="font-body text-gray-500 text-sm">Đang tải thông tin album...</p>
      </div>
    )
  }

  if (!album) {
    return (
      <div className="pt-32 pb-24 min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="font-heading text-3xl font-bold text-gray-900 mb-4">
          Không tìm thấy album này
        </h2>
        <p className="font-body text-gray-500 mb-8 max-w-md">
          Album bạn đang tìm kiếm có thể đã được cập nhật hoặc không tồn tại.
        </p>
        <Link to="/album" className="btn-primary">
          <ArrowLeft size={18} /> Quay lại danh sách bộ sưu tập
        </Link>
      </div>
    )
  }

  // Related albums (excluding current)
  const sourceAlbums = allAlbums.length > 0 ? allAlbums : defaultAlbums
  const relatedAlbums = sourceAlbums
    .filter((a) => a.id !== album.id && a.slug !== album.slug)
    .slice(0, 3)

  const lightboxSlides = album.gallery.map((photo) => ({
    src: photo.src,
    title: photo.title,
    description: photo.desc,
  }))

  return (
    <div className="pt-20 bg-offwhite/40 min-h-screen">
      <SEO
        title={`${album.title} - ${album.categoryLabel || 'Bộ Sưu Tập'}`}
        description={album.desc || album.story || `Xem chi tiết bộ sưu tập ${album.title} tại QA Stories Studio.`}
        image={album.cover || album.gallery?.[0]?.src}
        type="article"
      />

      {/* 1. Unified Compact Header */}
      <section className="bg-white border-b border-orange-100/70 pt-4 pb-5 sm:pb-6 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Top Bar: Back & Breadcrumb */}
          <div className="flex items-center justify-between gap-3 text-xs text-gray-400 mb-3 sm:mb-4 pb-2.5 border-b border-gray-100">
            <button
              onClick={() => navigate('/album')}
              className="inline-flex items-center gap-1.5 font-semibold text-gray-600 hover:text-primary transition-colors cursor-pointer"
            >
              <ArrowLeft size={15} /> Quay Lại Bộ Sưu Tập
            </button>

            <div className="hidden sm:flex items-center gap-1.5 overflow-hidden truncate">
              <Link to="/" className="hover:text-primary transition-colors">
                Trang Chủ
              </Link>
              <span>/</span>
              <Link to="/album" className="hover:text-primary transition-colors">
                Bộ Sưu Tập
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium truncate">{album.title}</span>
            </div>
          </div>

          {/* Main Info Row: Left = Title, Tag & Story, Right = CTAs */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1.5">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-orange-100 text-primary text-xs font-bold uppercase tracking-wider">
                  {album.categoryLabel}
                </span>
                {album.date && (
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-medium">
                    <Calendar size={13} className="text-primary" /> {album.date}
                  </span>
                )}
                {album.location && (
                  <span className="hidden sm:inline-flex items-center gap-1 text-xs text-gray-500 font-medium">
                    <MapPin size={13} className="text-primary" /> {album.location}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-medium">
                  <Camera size={13} className="text-primary" /> {album.gallery.length} ảnh
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-medium">
                  <Eye size={13} className="text-primary" /> {album.views || 0} lượt xem
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-gray-500 font-medium">
                  <Heart size={13} className="text-rose-500 fill-rose-500" /> {album.likes || 0} lượt thích
                </span>
              </div>

              <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-tight leading-tight">
                {album.title}
              </h1>

              {(album.story || album.desc) && (
                <p className="font-body text-gray-600 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
                  {album.story || album.desc}
                </p>
              )}
            </div>

            {/* Action CTAs */}
            <div className="flex items-center gap-2.5 shrink-0 self-start md:self-center">
              {/* Thả tym Album */}
              <button
                type="button"
                onClick={handleLikeAlbum}
                className={`btn-outline py-2 px-3 sm:px-4 text-xs sm:text-sm inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap transition-all duration-200 ${
                  isAlbumLiked
                    ? 'bg-rose-50 text-rose-600 border-rose-300 font-bold hover:bg-rose-100 shadow-xs'
                    : 'bg-white text-gray-700 hover:text-rose-600 hover:border-rose-300'
                }`}
                title={isAlbumLiked ? 'Bỏ thích album' : 'Thả tim album này'}
              >
                <Heart
                  size={15}
                  className={`transition-transform duration-200 ${
                    isAlbumLiked ? 'fill-rose-500 text-rose-500 scale-110' : 'text-rose-500'
                  }`}
                />
                <span>{isAlbumLiked ? 'Đã Thích' : 'Thả Tim'}</span>
                <span className="ml-0.5 px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[11px] font-bold">
                  {album.likes || 0}
                </span>
              </button>

              {settings?.page_contact_enabled !== '0' &&
                settings?.page_contact_enabled !== false &&
                settings?.page_contact_enabled !== 0 && (
                  <Link
                    to={`/contact?service=${encodeURIComponent(album.packageName || album.title || '')}`}
                    className="btn-primary py-2 px-4 sm:px-5 text-xs sm:text-sm shadow-md shadow-primary/20 whitespace-nowrap"
                  >
                    Đặt Lịch Concept Này <ArrowRight size={15} />
                  </Link>
                )}
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: album.title,
                      text: album.desc,
                      url: window.location.href,
                    })
                  } else {
                    navigator.clipboard.writeText(window.location.href)
                    alert('Đã sao chép liên kết album!')
                  }
                }}
                className="btn-outline py-2 px-3 text-xs sm:text-sm inline-flex items-center gap-1.5 cursor-pointer bg-white whitespace-nowrap"
                title="Chia sẻ album"
              >
                <Share2 size={15} /> <span className="hidden sm:inline">Chia Sẻ</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Photo Gallery Grid */}
      <section className="py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Gallery Masonry - Sắp xếp giảm dần từ trái qua phải, từ trên xuống dưới */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
            {galleryColumns.map((colPhotos, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-6 sm:gap-8">
                {colPhotos.map(({ photo, originalIndex }) => (
                  <motion.div
                    key={`${photo.src || ''}_${originalIndex}`}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '50px' }}
                    transition={{ duration: 0.5, delay: colIdx * 0.08 }}
                    onClick={() => handleOpenLightbox(originalIndex)}
                    className="group relative rounded-3xl overflow-hidden shadow-md bg-white border border-orange-100/70 card-hover cursor-pointer"
                  >
                    <div className="overflow-hidden bg-gray-100">
                      <img
                        src={photo.src}
                        alt={photo.title || album.title}
                        onError={(e) => {
                          e.target.onerror = null
                          if (!e.target.dataset.retried) {
                            e.target.dataset.retried = 'true'
                            const cleanSrc = photo.src.split('?')[0]
                            e.target.src = `${cleanSrc}?t=${Date.now()}`
                          }
                        }}
                        className="w-full h-auto block transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                    </div>

                    {/* Top 1 Most Liked Badge */}
                    {originalIndex === 0 && (Number(photo.likes) || 0) > 0 && (
                      <div className="absolute top-3 left-3 z-20 pointer-events-none">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/95 text-white backdrop-blur-md shadow-md border border-amber-300/40">
                          👑 Top 1 Tym
                        </span>
                      </div>
                    )}

                    {/* Thả tym cho bức ảnh bất kỳ trong album */}
                    {photo.id ? (
                      <button
                        type="button"
                        onClick={(e) => handleLikePhoto(e, photo.id)}
                        className={`absolute top-3 right-3 z-20 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md transition-all duration-200 cursor-pointer shadow-md ${
                          isPhotoLiked(photo.id)
                            ? 'bg-rose-500 text-white shadow-rose-500/30 scale-105'
                            : 'bg-black/45 hover:bg-black/65 text-white border border-white/25 hover:scale-105'
                        }`}
                        title={isPhotoLiked(photo.id) ? 'Bỏ tym bức ảnh này' : 'Thả tym cho bức ảnh này'}
                      >
                        <Heart
                          size={13}
                          className={`transition-transform duration-200 ${
                            isPhotoLiked(photo.id) ? 'fill-white text-white scale-110' : 'text-rose-400'
                          }`}
                        />
                        <span>{photo.likes || 0}</span>
                      </button>
                    ) : null}

                    {/* Hover overlay with zoom icon */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-5 sm:p-6 pointer-events-none">
                      <div className="self-end">
                        <div className="w-10 h-10 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-lg">
                          <ZoomIn size={20} />
                        </div>
                      </div>

                      {(photo.title || photo.desc) && (
                        <div>
                          {photo.title && (
                            <h3 className="font-heading font-bold text-white text-base sm:text-lg leading-snug line-clamp-1">
                              {photo.title}
                            </h3>
                          )}
                          {photo.desc && (
                            <p className="font-body text-white/80 text-xs mt-1 line-clamp-2">
                              {photo.desc}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. Related Albums Carousel / Grid */}
      {relatedAlbums.length > 0 && (
        <section className="py-16 bg-white border-t border-orange-100/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-10">
              <div>
                <span className="section-label">Gợi ý khám phá</span>
                <h2 className="section-title mt-1">
                  Các Bộ Sưu Tập Khác
                </h2>
              </div>
              <Link to="/album" className="btn-outline py-2.5 px-5 text-xs sm:text-sm">
                Xem Tất Cả <ArrowRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedAlbums.map((rel) => (
                <Link
                  key={rel.id}
                  to={`/album/${rel.slug || rel.id}`}
                  className="group block h-full select-none"
                >
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-lg card-hover border border-orange-100/60 bg-gray-100">
                    <img
                      src={rel.cover}
                      alt={rel.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute top-4 left-4">
                      <span className="bg-white/95 backdrop-blur-md text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                        {rel.categoryLabel}
                      </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <h3 className="font-heading font-bold text-white text-xl group-hover:text-primary-light transition-colors">
                        {rel.title}
                      </h3>
                      <p className="font-body text-white/80 text-xs mt-1 line-clamp-1">
                        {rel.desc}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Lightbox full-screen viewer */}
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        index={lightboxIndex}
        slides={lightboxSlides}
      />
    </div>
  )
}
