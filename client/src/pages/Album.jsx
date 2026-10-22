import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Camera,
  ArrowUpRight,
  Search,
  X,
  FolderSearch,
  Heart,
  Eye,
  Flame,
  ArrowUpDown,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { albumsData as defaultAlbums } from '../data/albumsData'
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

export default function Album() {
  const { settings } = useSettings()
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('default') // 'default' | 'likes' | 'views'
  const [likedAlbums, setLikedAlbums] = useState(() => {
    try {
      const raw = localStorage.getItem('qastories_liked_albums')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })
  const [albums, setAlbums] = useState(() => {
    try {
      const cached = localStorage.getItem('qastories_cached_albums_formatted')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return parsed
      }
    } catch {}
    return []
  })
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(() => {
    try {
      const cached = localStorage.getItem('qastories_cached_albums_formatted')
      if (cached) {
        const parsed = JSON.parse(cached)
        if (Array.isArray(parsed) && parsed.length > 0) return false
      }
    } catch {}
    return true
  })

  const handleToggleLike = async (e, albumId) => {
    e.preventDefault()
    e.stopPropagation()
    if (!albumId) return

    const currentlyLiked = likedAlbums.some((id) => String(id) === String(albumId))
    const action = currentlyLiked ? 'unlike' : 'like'
    const newLiked = currentlyLiked
      ? likedAlbums.filter((id) => String(id) !== String(albumId))
      : [...likedAlbums, albumId]

    setLikedAlbums(newLiked)
    try {
      localStorage.setItem('qastories_liked_albums', JSON.stringify(newLiked))
    } catch {}

    const updatedLikes = Math.max(0, (Number(albums.find((a) => String(a.id) === String(albumId))?.likes) || 0) + (currentlyLiked ? -1 : 1))

    setAlbums((prev) =>
      prev.map((a) => {
        if (String(a.id) === String(albumId)) {
          return { ...a, likes: updatedLikes }
        }
        return a
      })
    )

    // Đồng bộ vào localStorage để khi reload không bị quay về 0
    try {
      const raw = localStorage.getItem('qastories_cached_albums')
      if (raw) {
        const list = JSON.parse(raw)
        if (Array.isArray(list)) {
          const updated = list.map((a) =>
            String(a.id) === String(albumId) ? { ...a, likes: updatedLikes } : a
          )
          localStorage.setItem('qastories_cached_albums', JSON.stringify(updated))
        }
      }
      const rawFormatted = localStorage.getItem('qastories_cached_albums_formatted')
      if (rawFormatted) {
        const list = JSON.parse(rawFormatted)
        if (Array.isArray(list)) {
          const updated = list.map((a) =>
            String(a.id) === String(albumId) ? { ...a, likes: updatedLikes } : a
          )
          localStorage.setItem('qastories_cached_albums_formatted', JSON.stringify(updated))
        }
      }
    } catch {}

    try {
      const res = await api.post(`/albums/${albumId}/like`, { action })
      if (res?.success && res?.data?.likes !== undefined) {
        setAlbums((prev) =>
          prev.map((a) => (String(a.id) === String(albumId) ? { ...a, likes: res.data.likes } : a))
        )
      }
    } catch (err) {
      console.warn('Lỗi thả tym album:', err)
    }
  }

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      try {
        setLoading(true)
        const [albumRes, pkgRes] = await Promise.all([
          api.get('/albums', { bypassCache: true }),
          api.get('/packages', { bypassCache: true }),
        ])

        if (!isMounted) return

        if (pkgRes.success && pkgRes.data) {
          const pkgs = Array.isArray(pkgRes.data) ? pkgRes.data : [pkgRes.data]
          setPackages(pkgs)
        }

        if (albumRes.success && albumRes.data && Array.isArray(albumRes.data) && albumRes.data.length > 0) {
          // Format API albums to match frontend structure
          const formatted = albumRes.data.map((item) => ({
            id: item.id,
            slug: item.slug || `album-${item.id}`,
            title: item.title || 'Album Bé',
            category: item.category || 'all',
            categoryLabel: item.category_label || item.categoryLabel || item.category || 'Ngoại cảnh',
            cover: normalizeUrl(item.cover_image || item.cover_url || item.cover),
            desc: item.description || item.desc || item.story || '',
            story: item.story || item.description || item.desc || '',
            date: item.date_shot || item.date || '',
            location: item.location || 'Bình Dương',
            packageName: item.package_name || item.packageName || 'Gói Chụp Nghệ Thuật',
            views: Number(item.views) || 0,
            likes: Number(item.likes) || 0,
            photoCount: item.photo_count !== undefined ? item.photo_count : (Array.isArray(item.photos) ? item.photos.length : 1),
            gallery: (Array.isArray(item.photos) && item.photos.length > 0)
              ? item.photos.map(p => ({
                  id: p.id,
                  src: normalizeUrl(p.url || p.photo_url || p.src || p.photoUrl),
                  title: p.title || item.title,
                  desc: p.description || item.desc || '',
                  likes: Number(p.likes) || 0,
                }))
              : [{ id: 0, src: normalizeUrl(item.cover_image || item.cover_url || item.cover), title: item.title, desc: item.description || item.desc || '', likes: 0 }]
          }))
          setAlbums(formatted)
          try {
            localStorage.setItem('qastories_cached_albums_formatted', JSON.stringify(formatted))
          } catch {}
        } else if (!albums || albums.length === 0) {
          setAlbums(defaultAlbums)
        }
      } catch (err) {
        console.warn('Using local albums data fallback:', err.message)
        if (!albums || albums.length === 0) {
          setAlbums(defaultAlbums)
        }
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchData()
    return () => {
      isMounted = false
    }
  }, [])

  const categories = useMemo(() => {
    const list = [{ id: 'all', label: 'Tất Cả Album' }]
    const seenIds = new Set(['all'])

    // Add categories from system packages
    if (Array.isArray(packages)) {
      packages.forEach((pkg) => {
        if (!pkg) return
        const catId = pkg.slug || `pkg-${pkg.id}`
        if (!seenIds.has(catId)) {
          seenIds.add(catId)
          list.push({ id: catId, label: pkg.name })
        }
      })
    }

    // Add categories present in current albums
    if (Array.isArray(albums)) {
      albums.forEach((alb) => {
        if (alb?.category && !seenIds.has(alb.category)) {
          seenIds.add(alb.category)
          list.push({ id: alb.category, label: alb.categoryLabel || alb.category_label || alb.category })
        }
      })
    }

    return list
  }, [packages, albums])

  const filteredAlbums = useMemo(() => {
    if (!Array.isArray(albums)) return []
    const list = albums.filter((album) => {
      if (!album) return false
      const matchCategory =
        activeTab === 'all' ||
        album.category === activeTab ||
        album.categoryLabel === activeTab

      const query = searchTerm.toLowerCase().trim()
      const titleMatch = (album.title || '').toLowerCase().includes(query)
      const descMatch = (album.desc || '').toLowerCase().includes(query)
      const catMatch = (album.categoryLabel || '').toLowerCase().includes(query)
      const matchSearch = !query || titleMatch || descMatch || catMatch

      return matchCategory && matchSearch
    })

    if (sortBy === 'likes') {
      return [...list].sort((a, b) => (Number(b.likes) || 0) - (Number(a.likes) || 0))
    }
    if (sortBy === 'views') {
      return [...list].sort((a, b) => (Number(b.views) || 0) - (Number(a.views) || 0))
    }
    return list
  }, [albums, activeTab, searchTerm, sortBy])

  const handleClearFilter = () => {
    setActiveTab('all')
    setSearchTerm('')
    setSortBy('default')
  }

  const isContactEnabled =
    settings?.page_contact_enabled !== '0' &&
    settings?.page_contact_enabled !== false &&
    settings?.page_contact_enabled !== 0

  return (
    <div className="pt-20">
      <SEO
        title="Bộ Sưu Tập Concept Nghệ Thuật"
        description="Khám phá các album ảnh sơ sinh newborn, thôi nôi, 100 ngày tuổi và gia đình được thực hiện tỉ mỉ tại QA Stories."
      />

      {/* 1. Header Banner with Search Field */}
      <section className="py-12 sm:py-16 bg-gradient-to-b from-orange-50/60 via-offwhite to-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <span className="section-label inline-flex items-center px-4 py-1.5 rounded-full bg-primary-lighter text-xs">
              {settings?.album_header_label || 'Bộ Sưu Tập Nghệ Thuật'}
            </span>
            <h1 className="section-title mt-3 mb-3">
              {settings?.album_header_title || 'Khoảnh Khắc Của Bé'}{' '}
              {settings?.album_header_title_highlight && (
                <span className="italic text-primary font-normal">
                  {settings.album_header_title_highlight}
                </span>
              )}
            </h1>
            {settings?.album_header_desc && (
              <p className="font-body text-gray-500 text-sm sm:text-base max-w-xl mx-auto leading-relaxed mb-8">
                {settings.album_header_desc}
              </p>
            )}

            {/* Search Input Field */}
            <div className="max-w-xl mx-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none text-gray-400 group-focus-within:text-primary transition-colors">
                <Search size={20} />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm theo tên album, concept hoặc tên bé..."
                className="w-full pl-12 pr-11 py-3.5 sm:py-4 rounded-full bg-white border border-orange-200/90 shadow-md shadow-orange-950/5 font-body text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Xóa tìm kiếm"
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-700 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                    <X size={14} />
                  </div>
                </button>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 2. Filter Tabs Sticky */}
      <section className="py-4 sm:py-5 bg-white/95 backdrop-blur-md border-y border-orange-100/70 sticky top-[68px] z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto py-1 justify-center sm:justify-start flex-wrap sm:flex-nowrap scrollbar-hide no-scrollbar w-full sm:w-auto">
              {categories.map((cat) => {
                const active = activeTab === cat.id
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveTab(cat.id)}
                    className={`px-5 py-2 rounded-full font-body text-xs sm:text-sm whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      active
                        ? 'bg-primary text-white shadow-md shadow-primary/25 font-bold'
                        : 'bg-orange-50/80 text-gray-700 hover:bg-primary-lighter hover:text-primary font-semibold'
                    }`}
                  >
                    {cat.label}
                  </button>
                )
              })}
            </div>

            {/* Result Counter & Sort & Reset */}
            <div className="flex items-center gap-3 text-xs font-semibold text-gray-500 shrink-0 ml-auto flex-wrap">
              {/* Sort selector */}
              <div className="inline-flex items-center gap-1 bg-orange-50/90 rounded-full p-1 border border-orange-200/60">
                <button
                  type="button"
                  onClick={() => setSortBy('default')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    sortBy === 'default'
                      ? 'bg-white text-primary shadow-xs font-bold'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  Mới nhất
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('likes')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    sortBy === 'likes'
                      ? 'bg-rose-500 text-white shadow-xs font-bold'
                      : 'text-gray-600 hover:text-rose-600'
                  }`}
                >
                  <Heart size={12} className={sortBy === 'likes' ? 'fill-white' : ''} />
                  Nhiều tym
                </button>
                <button
                  type="button"
                  onClick={() => setSortBy('views')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    sortBy === 'views'
                      ? 'bg-primary text-white shadow-xs font-bold'
                      : 'text-gray-600 hover:text-primary'
                  }`}
                >
                  <Eye size={12} />
                  Xem nhiều
                </button>
              </div>

              <span>
                Hiển thị <strong className="text-primary">{filteredAlbums.length}</strong> / {albums.length}
              </span>
              {(searchTerm || activeTab !== 'all' || sortBy !== 'default') && (
                <button
                  onClick={handleClearFilter}
                  className="text-primary hover:underline cursor-pointer"
                >
                  Đặt lại
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Albums Grid / Results */}
      <section className="py-16 bg-offwhite min-h-[500px]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredAlbums.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredAlbums.map((album, idx) => {
                const photoDisplayCount = album.photoCount !== undefined ? album.photoCount : (album.gallery?.length || 1)
                return (
                  <motion.div
                    key={album.id || idx}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: idx * 0.05 }}
                  >
                    <Link
                      to={`/album/${album.slug || album.id}`}
                      className="group block h-full select-none"
                    >
                      <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-lg card-hover border border-orange-100/60 bg-white">
                        {/* Image */}
                        <img
                          src={album.cover}
                          alt={album.title}
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            if (!e.target.dataset.triedRetry && album.cover?.startsWith('/uploads/')) {
                              e.target.dataset.triedRetry = 'true'
                              e.target.src = `${album.cover}${album.cover.includes('?') ? '&' : '?'}retry=1`
                            } else {
                              e.target.onerror = null
                              e.target.style.opacity = '0.3'
                            }
                          }}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10 pointer-events-auto">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-white/95 backdrop-blur-md text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                              {album.categoryLabel}
                            </span>
                            {((Number(album.likes) || 0) >= 5 || (Number(album.views) || 0) >= 30) && (
                              <span className="bg-gradient-to-r from-rose-500 to-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm flex items-center gap-1">
                                <Flame size={11} className="fill-white" /> Hot
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Số ảnh */}
                            <span className="bg-black/40 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1.5 rounded-full border border-white/20 flex items-center gap-1 shadow-sm">
                              <Camera size={12} className="text-primary-light" />
                              {photoDisplayCount}
                            </span>

                            {/* Lượt xem */}
                            <span className="bg-black/40 backdrop-blur-md text-white text-xs font-medium px-2.5 py-1.5 rounded-full border border-white/20 flex items-center gap-1 shadow-sm">
                              <Eye size={12} className="text-orange-300" />
                              {album.views || 0}
                            </span>

                            {/* Nút thả tym */}
                            <button
                              type="button"
                              onClick={(e) => handleToggleLike(e, album.id)}
                              className={`backdrop-blur-md text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1 transition-all duration-200 cursor-pointer shadow-sm ${
                                likedAlbums.some((id) => String(id) === String(album.id))
                                  ? 'bg-rose-500 text-white shadow-rose-500/30 scale-105'
                                  : 'bg-black/40 hover:bg-black/60 text-white border border-white/20 hover:scale-105'
                              }`}
                              title={likedAlbums.some((id) => String(id) === String(album.id)) ? 'Bỏ thích album' : 'Thả tim album'}
                            >
                              <Heart
                                size={12}
                                className={`transition-transform duration-200 ${
                                  likedAlbums.some((id) => String(id) === String(album.id)) ? 'fill-white text-white' : 'text-rose-400'
                                }`}
                              />
                              <span>{album.likes || 0}</span>
                            </button>
                          </div>
                        </div>

                        {/* Bottom Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white pointer-events-none">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-body text-primary-light text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                              Xem Chi Tiết Album <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                            </span>
                            <span className="text-white/80 text-[11px] font-medium flex items-center gap-1.5">
                              <span>{album.views || 0} xem</span>
                              <span>•</span>
                              <span>{album.likes || 0} tym</span>
                            </span>
                          </div>
                          <h3 className="font-heading font-bold text-2xl text-white group-hover:text-primary-light transition-colors leading-snug">
                            {album.title}
                          </h3>
                          {album.desc && (
                            <p className="font-body text-white/80 text-sm mt-1.5 line-clamp-2 leading-relaxed">
                              {album.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            /* Empty State when no matches found */
            <div className="py-20 text-center max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-orange-100 text-primary flex items-center justify-center mx-auto mb-5 shadow-sm">
                <FolderSearch size={32} />
              </div>
              <h3 className="font-heading text-2xl font-bold text-gray-900 mb-2">
                Không tìm thấy album nào
              </h3>
              <p className="font-body text-gray-500 text-sm mb-6 leading-relaxed">
                Không có bộ sưu tập nào khớp với từ khóa{' '}
                <strong className="text-gray-900">&ldquo;{searchTerm}&rdquo;</strong> trong danh mục đã chọn.
              </p>
              <button
                type="button"
                onClick={handleClearFilter}
                className="btn-primary inline-flex items-center gap-2 cursor-pointer"
              >
                Xóa Bộ Lọc & Xem Tất Cả
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 4. Booking CTA */}
      {isContactEnabled && (
        <section className="py-20 bg-primary text-center text-white relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 relative z-10">
            <ScrollReveal>
              <h2 className="section-title text-white mb-4">
                Bạn Đã Chọn Được Concept Ưng Ý Cho Bé?
              </h2>
              <p className="font-body text-white/90 text-base mb-8 max-w-xl mx-auto">
                Liên hệ ngay với QA Stories để được tư vấn concept chi tiết, lịch chụp và những ưu đãi hấp dẫn nhất dành riêng cho bé yêu.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <Link
                  to="/contact"
                  className="btn-white text-base px-8 py-3.5 text-primary font-bold shadow-xl"
                >
                  Tư Vấn & Đặt Lịch Ngay <ArrowRight size={16} />
                </Link>
                {settings?.brand_phone && (
                  <a
                    href={`tel:${settings.brand_phone.replace(/\s+/g, '')}`}
                    className="btn-outline border-white text-white hover:bg-white hover:text-primary text-base px-8 py-3.5"
                  >
                    Hotline: {settings.brand_phone}
                  </a>
                )}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}
    </div>
  )
}