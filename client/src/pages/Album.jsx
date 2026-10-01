import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight,
  Camera,
  ArrowUpRight,
  Search,
  X,
  FolderSearch,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { albumsData as defaultAlbums } from '../data/albumsData'
import { useSettings } from '../context/SettingsContext'
import api from '../utils/api'

export default function Album() {
  const { settings, refreshSettings } = useSettings()
  const [activeTab, setActiveTab] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [albums, setAlbums] = useState(defaultAlbums)
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [albumRes, pkgRes] = await Promise.all([
          api.get('/albums'),
          api.get('/packages'),
        ])

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
            cover: item.cover_image || item.cover_url || item.cover || 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=85',
            desc: item.description || item.desc || item.story || '',
            story: item.story || item.description || item.desc || '',
            date: item.date_shot || item.date || '',
            location: item.location || 'Bình Dương',
            packageName: item.package_name || item.packageName || 'Gói Chụp Nghệ Thuật',
            photoCount: item.photo_count !== undefined ? item.photo_count : (Array.isArray(item.photos) ? item.photos.length : 1),
            gallery: (Array.isArray(item.photos) && item.photos.length > 0)
              ? item.photos.map(p => ({
                  src: p.url || p.photo_url || p.src || p.photoUrl,
                  title: p.title || item.title,
                  desc: p.description || item.desc || ''
                }))
              : [{ src: item.cover_image || item.cover_url || item.cover || 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=85', title: item.title, desc: item.description || item.desc || '' }]
          }))
          setAlbums(formatted)
        }
      } catch (err) {
        console.warn('Using local albums data fallback:', err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
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
    return albums.filter((album) => {
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
  }, [albums, activeTab, searchTerm])

  const handleClearFilter = () => {
    setActiveTab('all')
    setSearchTerm('')
  }

  const isContactEnabled =
    settings?.page_contact_enabled !== '0' &&
    settings?.page_contact_enabled !== false &&
    settings?.page_contact_enabled !== 0

  return (
    <div className="pt-20">
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

            {/* Result Counter & Reset */}
            <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-gray-500 shrink-0 ml-auto">
              <span>
                Hiển thị <strong className="text-primary">{filteredAlbums.length}</strong> / {albums.length} album
              </span>
              {(searchTerm || activeTab !== 'all') && (
                <button
                  onClick={handleClearFilter}
                  className="text-primary hover:underline ml-2 cursor-pointer"
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
                          onError={(e) => {
                            e.target.onerror = null
                            e.target.src = 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=85'
                          }}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

                        {/* Top Badges */}
                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                          <span className="bg-white/95 backdrop-blur-md text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                            {album.categoryLabel}
                          </span>

                          <span className="bg-black/40 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 shadow-sm">
                            <Camera size={13} className="text-primary-light" />
                            {photoDisplayCount} ảnh
                          </span>
                        </div>

                        {/* Bottom Info */}
                        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="font-body text-primary-light text-xs font-bold uppercase tracking-wider flex items-center gap-1">
                              Xem Chi Tiết Album <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
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
                Bố Mẹ Đã Chọn Được Concept Ưng Ý Cho Bé Chưa?
              </h2>
              <p className="font-body text-white/90 text-base sm:text-lg mb-8 max-w-xl mx-auto">
                Hãy liên hệ với chúng tôi để được tư vấn miễn phí về trang phục, bối cảnh và gói chụp phù hợp nhất!
              </p>
              <Link
                to="/contact"
                className="btn-white text-base px-8 py-4 text-primary font-bold shadow-xl inline-flex items-center gap-2"
              >
                Đặt Lịch Tư Vấn Ngay <ArrowRight size={18} />
              </Link>
            </ScrollReveal>
          </div>
        </section>
      )}
    </div>
  )
}