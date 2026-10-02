import { useState, useCallback, useEffect } from 'react'
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
} from 'lucide-react'
import { albumsData as defaultAlbums } from '../data/albumsData'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { useSettings } from '../context/SettingsContext'
import SEO from '../components/ui/SEO'
import api from '../utils/api'

export default function AlbumDetail() {
  const { settings } = useSettings()
  const { id } = useParams()
  const navigate = useNavigate()
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const [album, setAlbum] = useState(() => {
    return defaultAlbums.find(
      (a) => a.id === parseInt(id, 10) || a.slug === id
    ) || null
  })

  const [allAlbums, setAllAlbums] = useState([])

  // Scroll to top on load or id change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
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
          api.get(`/albums/detail/${id}`),
          api.get('/albums'),
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
              cover: item.cover_image || item.cover_url || item.cover,
              desc: item.description || item.desc || item.story || '',
            }))
          )
        }

        if (detailRes.success && detailRes.data) {
          const item = detailRes.data
          const formatted = {
            id: item.id,
            slug: item.slug || `album-${item.id}`,
            title: item.title,
            category: item.category,
            categoryLabel: item.category_label || item.categoryLabel || item.category,
            cover: item.cover_image || item.cover_url || item.cover,
            desc: item.description || item.desc || item.story || '',
            story: item.story || item.description || item.desc || '',
            date: formatDateDisplay(item.date_shot) || item.date || '',
            location: item.location || 'Bình Dương',
            packageName: item.package_name || item.packageName || 'Gói Chụp Nghệ Thuật',
            gallery: (item.photos && item.photos.length > 0)
              ? item.photos.map(p => ({
                  src: p.url || p.photo_url || p.src || p.photoUrl,
                  title: p.title || item.title,
                  desc: p.description || item.desc || ''
                }))
              : [{ src: item.cover_image || item.cover_url || item.cover, title: item.title, desc: item.description || item.desc || '' }]
          }
          setAlbum(formatted)
        }
      } catch (err) {
        // Fallback to local defaultAlbums
        const local = defaultAlbums.find(
          (a) => a.id === parseInt(id, 10) || a.slug === id
        )
        if (local && isMounted) setAlbum(local)
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
          {/* Masonry / Grid Gallery */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {album.gallery.map((photo, index) => (
              <motion.div
                key={photo.title + index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                onClick={() => handleOpenLightbox(index)}
                className="group relative rounded-3xl overflow-hidden shadow-md bg-white border border-orange-100/70 card-hover cursor-pointer"
              >
                <div className="aspect-[4/5] overflow-hidden bg-gray-100">
                  <img
                    src={photo.src}
                    alt={photo.title}
                    onError={(e) => {
                      e.target.onerror = null
                      e.target.src = 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=85'
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    decoding="async"
                  />
                </div>

                {/* Hover overlay with zoom icon */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-between p-6">
                  <div className="self-end">
                    <div className="w-10 h-10 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-lg">
                      <ZoomIn size={20} />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-heading font-bold text-white text-lg leading-snug">
                      {photo.title}
                    </h3>
                    <p className="font-body text-white/80 text-xs mt-1">
                      {photo.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
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
