import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import HeroSlider from '../components/ui/HeroSlider'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { useSettings } from '../context/SettingsContext'
import SEO from '../components/ui/SEO'
import api from '../utils/api'

import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const defaultFeaturedAlbums = [
  {
    id: 1,
    slug: 'so-sinh-nghe-thuat',
    title: 'Sơ Sinh Nghệ Thuật (Newborn)',
    desc: 'Những giấc mơ đầu đời dịu dàng và thuần khiết nhất của bé yêu.',
    image: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=85',
    count: '48 bức ảnh',
    tag: 'Sơ Sinh',
  },
  {
    id: 2,
    slug: 'ky-niem-100-ngay-tuoi',
    title: 'Kỷ Niệm 100 Ngày Tuổi',
    desc: 'Lưu giữ nụ cười chúm chím và ánh mắt tò mò với thế giới xung quanh.',
    image: 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&q=85',
    count: '36 bức ảnh',
    tag: '100 Ngày',
  },
  {
    id: 3,
    slug: 'thoi-noi-sinh-nhat-1-tuoi',
    title: 'Thôi Nôi & Sinh Nhật 1 Tuổi',
    desc: 'Dấu mốc kỳ diệu khi bé chập chững bước đi và đón tuổi mới rực rỡ.',
    image: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=800&q=85',
    count: '52 bức ảnh',
    tag: '1 Tuổi',
  },
  {
    id: 4,
    slug: 'gia-dinh-yeu-thuong',
    title: 'Gia Đình Yêu Thương',
    desc: 'Sợi dây gắn kết vô giá giữa bố mẹ và thiên thần nhỏ của mình.',
    image: 'https://images.unsplash.com/photo-1476703993599-0035a21b17a9?w=800&q=85',
    count: '60 bức ảnh',
    tag: 'Gia Đình',
  },
  {
    id: 5,
    slug: 'concept-luxury-hoang-gia',
    title: 'Concept Luxury Hoàng Gia',
    desc: 'Tone màu ấm áp, sang trọng với trang phục & đạo cụ cao cấp.',
    image: 'https://images.unsplash.com/photo-1546015720-b8b30df5aa27?w=800&q=85',
    count: '42 bức ảnh',
    tag: 'Premium',
  },
  {
    id: 6,
    slug: 'ngoai-canh-tu-nhien',
    title: 'Ngoại Cảnh Tự Nhiên',
    desc: 'Không gian ngập tràn ánh nắng và khoảnh khắc vui đùa chân thật.',
    image: 'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=800&q=85',
    count: '38 bức ảnh',
    tag: 'Ngoại Cảnh',
  },
]

export default function Home() {
  const { settings } = useSettings()
  const [albums, setAlbums] = useState([])

  useEffect(() => {
    let isMounted = true
    const fetchAlbums = async () => {
      try {
        const res = await api.get('/albums')
        if (isMounted && res.success && res.data && res.data.length > 0) {
          setAlbums(res.data)
        }
      } catch (err) {
        console.warn('Lỗi tải albums trang chủ:', err.message)
      }
    }
    fetchAlbums()
    return () => {
      isMounted = false
    }
  }, [])

  const displayAlbums = useMemo(() => {
    if (!albums || albums.length === 0) return defaultFeaturedAlbums
    const featured = albums.filter((a) => a.is_featured)
    const list = featured.length > 0 ? featured : albums
    return list.map((a) => ({
      id: a.id,
      slug: a.slug || String(a.id),
      title: a.title,
      desc: a.description || a.story || 'Khoảnh khắc tuyệt vời được ghi lại trọn vẹn tại QA Stories Studio.',
      image: a.cover_image || a.cover_url || 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=800&q=85',
      count: `${a.photo_count || 0} bức ảnh`,
      tag: a.category_label || a.category || 'Nổi Bật',
    }))
  }, [albums])

  // Dynamic Intro Section Settings
  const siteName = settings?.brand_name || settings?.site_name || 'QA Stories'
  const introImage = settings?.home_intro_image || 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=900&q=85'
  const introLabel = settings?.home_intro_label || `Giới thiệu về ${siteName}`
  const introTitle = settings?.home_intro_title || 'Nghệ Thuật Lưu Giữ'
  const introTitleHighlight = settings?.home_intro_title_highlight || 'Những Khoảnh Khắc Đầu Đời'
  const introP1 = settings?.home_intro_p1 || `Tại ${siteName}, chúng tôi hiểu rằng thời thơ ấu của con trôi qua rất nhanh. Từng ngón tay bé xíu, từng cái ngáp ngủ dễ thương hay nụ cười đầu tiên đều là những báu vật vô giá không thể lặp lại.`
  const introP2 = settings?.home_intro_p2 || 'Với hơn 5 năm kinh nghiệm chuyên sâu trong lĩnh vực nhiếp ảnh trẻ em, chúng tôi tạo dựng một không gian an toàn, ấm áp và phong cách nghệ thuật tinh tế để mỗi bức ảnh không chỉ đẹp mà còn đong đầy cảm xúc yêu thương.'

  let introFeatures = [
    'Trang phục nhập khẩu mềm mịn cho da bé',
    'Phòng chụp tiệt trùng UV và nhiệt độ lý tưởng',
    'Nhiếp ảnh gia chuyên môn cao & yêu trẻ',
    'Đa dạng concept từ tối giản đến sang trọng',
  ]
  if (settings?.home_intro_features) {
    try {
      const parsed = typeof settings.home_intro_features === 'string' ? JSON.parse(settings.home_intro_features) : settings.home_intro_features
      if (Array.isArray(parsed) && parsed.length > 0) {
        introFeatures = parsed.filter(Boolean)
      }
    } catch {
      // ignore JSON parse error
    }
  }

  const isAboutEnabled =
    settings?.page_about_enabled !== '0' &&
    settings?.page_about_enabled !== false &&
    settings?.page_about_enabled !== 0

  const isContactEnabled =
    settings?.page_contact_enabled !== '0' &&
    settings?.page_contact_enabled !== false &&
    settings?.page_contact_enabled !== 0

  return (
    <div className="overflow-hidden">
      <SEO
        title={settings?.seo_title || 'QA Stories | Studio Chụp Ảnh Em Bé & Gia Đình Nghệ Thuật'}
        description={settings?.seo_description}
        image={introImage}
      />

      {/* 1. Hero Banner with Integrated Quick Access */}
      <HeroSlider />

      {/* 2. Intro Section */}
      {isAboutEnabled && (
        <section className="py-14 sm:py-20 lg:py-28 bg-offwhite relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
              {/* Left Image Collage - Hidden on Mobile */}
              <div className="hidden lg:block lg:col-span-6">
                <ScrollReveal direction="right">
                  <div className="relative">
                    {/* Main large image */}
                    <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border-4 border-white bg-orange-50">
                      <img
                        src={introImage}
                        alt={`${siteName} Baby Photography`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        width="600"
                        height="750"
                      />
                    </div>
                  </div>
                </ScrollReveal>
              </div>

              {/* Right Intro Text */}
              <div className="lg:col-span-6">
                <ScrollReveal direction="left" delay={0.2}>
                  <div>
                    <span className="section-label flex items-center gap-2">
                      <span className="w-6 h-0.5 bg-primary" /> {introLabel}
                    </span>
                    
                    <h2 className="section-title mt-3 mb-5">
                      {introTitle}{' '}
                      {introTitleHighlight && (
                        <span className="block italic text-primary font-normal mt-0.5">
                          {introTitleHighlight}
                        </span>
                      )}
                    </h2>

                    <p className="section-subtitle mb-6 whitespace-pre-line">
                      {introP1}
                    </p>

                    {introP2 && (
                      <p className="font-body text-gray-600 text-base leading-relaxed mb-8 whitespace-pre-line">
                        {introP2}
                      </p>
                    )}

                    {introFeatures.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
                        {introFeatures.map((item, idx) => (
                          <div key={idx} className="flex items-start gap-2.5">
                            <CheckCircle size={17} className="text-primary mt-0.5 shrink-0" />
                            <span className="font-body text-sm font-medium text-gray-700">{item}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-4">
                      <Link to="/about" className="btn-primary">
                        Tìm Hiểu Thêm Về Chúng Tôi <ArrowRight size={16} />
                      </Link>
                      {isContactEnabled && (
                        <Link to="/contact" className="btn-outline">
                          Đặt Lịch Chụp Ngay
                        </Link>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Featured Albums Carousel */}
      <section className="py-28 bg-offwhite border-t border-orange-100/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div>
                <span className="section-label">Tác phẩm tiêu biểu</span>
                <h2 className="section-title mt-3">
                  Bộ Sưu Tập{' '}
                  <span className="italic text-primary font-normal">Nổi Bật Nhất</span>
                </h2>
                <p className="section-subtitle max-w-xl">
                  Mỗi album là một câu chuyện riêng biệt, khắc họa những cảm xúc chân thực và ngọt ngào nhất.
                </p>
              </div>

              {/* Navigation & See All Controls */}
              <div className="flex items-center gap-4 self-start md:self-end">
                {/* Manual Navigation Arrow Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Previous Albums"
                    className="album-prev-btn w-11 h-11 rounded-full border border-orange-200 bg-white hover:bg-primary text-gray-700 hover:text-white hover:border-primary shadow-sm flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-90"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    type="button"
                    aria-label="Next Albums"
                    className="album-next-btn w-11 h-11 rounded-full border border-orange-200 bg-white hover:bg-primary text-gray-700 hover:text-white hover:border-primary shadow-sm flex items-center justify-center transition-all duration-300 cursor-pointer active:scale-90"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>

                <Link to="/album" className="btn-primary shrink-0">
                  Xem Tất Cả Album <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </ScrollReveal>

          {/* Swiper Slider with 3 cards & Autoplay */}
          <ScrollReveal delay={0.2}>
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              spaceBetween={28}
              slidesPerView={1}
              breakpoints={{
                640: {
                  slidesPerView: 2,
                  spaceBetween: 24,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 28,
                },
              }}
              autoplay={{
                delay: 3500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              loop={true}
              speed={800}
              navigation={{
                prevEl: '.album-prev-btn',
                nextEl: '.album-next-btn',
              }}
              pagination={{
                clickable: true,
                el: '.album-pagination',
                bulletClass: 'hero-bullet',
                bulletActiveClass: 'hero-bullet-active',
              }}
              className="album-swiper pb-10"
            >
              {displayAlbums.map((album) => (
                <SwiperSlide key={album.id} className="h-auto">
                  <Link to={`/album/${album.slug || album.id}`} className="group block h-full select-none">
                    <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-lg card-hover border border-orange-100/50 bg-gray-100">
                      <img
                        src={album.image}
                        alt={album.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                        width="400"
                        height="500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                      
                      {/* Tag top */}
                      <div className="absolute top-4 left-4">
                        <span className="bg-white/95 backdrop-blur-md text-gray-900 text-xs font-semibold px-3 py-1.5 rounded-full shadow-sm">
                          {album.tag}
                        </span>
                      </div>

                      {/* Bottom Info */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="font-body text-primary-light text-xs font-semibold uppercase tracking-wider mb-1">
                          {album.count}
                        </div>
                        <h3 className="font-heading font-bold text-white text-2xl group-hover:text-primary-light transition-colors leading-snug">
                          {album.title}
                        </h3>
                        <p className="font-body text-white/80 text-sm mt-2 line-clamp-2 leading-relaxed">
                          {album.desc}
                        </p>
                      </div>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Pagination Dots */}
            <div className="album-pagination flex items-center justify-center gap-2 mt-4" />
          </ScrollReveal>
        </div>
      </section>

      {/* 4. Call to Action */}
      {isContactEnabled && (
        <section className="py-24 bg-gradient-to-r from-primary to-primary-dark relative overflow-hidden text-white">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
          
          <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <ScrollReveal>
              <span className="inline-block font-body text-primary-lighter text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full bg-white/10 mb-5 border border-white/20">
                Đặt lịch hôm nay - Giữ trọn yêu thương
              </span>
              
              <h2 className="section-title text-white mb-6">
                Hãy Để Chúng Tôi Kể Câu Chuyện{' '}
                <span className="italic font-normal text-primary-light block sm:inline">
                  Của Thiên Thần Nhỏ
                </span>
              </h2>

              <p className="font-body text-white/90 text-base sm:text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                Mỗi khoảnh khắc chỉ đến một lần trong đời. Hãy để <span className="whitespace-nowrap">QA Stories</span> cùng bạn lưu giữ những ký ức ngọt ngào nhất của con ngay hôm nay.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/contact"
                  className="btn-white w-full sm:w-auto text-base px-9 py-4 text-primary font-bold shadow-2xl"
                >
                  Đặt Lịch Chụp & Nhận Ưu Đãi <ArrowRight size={18} />
                </Link>
                <a
                  href={`tel:${(settings?.brand_phone || '0901234567').replace(/\s+/g, '')}`}
                  className="btn-outline border-white text-white hover:bg-white hover:text-primary w-full sm:w-auto text-base px-8 py-4"
                >
                  Hotline: {settings?.brand_phone || '0901 234 567'}
                </a>
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}
    </div>
  )
}