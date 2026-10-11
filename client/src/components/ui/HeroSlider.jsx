import { useState, useEffect, useMemo } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import QuickAccess from './QuickAccess'
import api from '../../utils/api'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

function getOptimizedSrc(url, width = 1080) {
  if (!url) return ''
  if (url.includes('images.unsplash.com')) {
    const cleanUrl = url.split('?')[0]
    return `${cleanUrl}?w=${width}&q=75&auto=format`
  }
  return url
}

const defaultSlides = [
  {
    id: 1,
    image_url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1080&q=75&auto=format',
    title: 'QA Stories Newborn Photography 1',
    device_type: 'pc',
  },
  {
    id: 2,
    image_url: 'https://images.unsplash.com/photo-1546015720-b8b30df5aa27?w=1080&q=75&auto=format',
    title: 'QA Stories Baby Photography 2',
    device_type: 'pc',
  },
  {
    id: 3,
    image_url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1080&q=75&auto=format',
    title: 'QA Stories Family Photography 3',
    device_type: 'pc',
  },
]

export default function HeroSlider() {
  const [slides, setSlides] = useState(defaultSlides)
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768
    }
    return false
  })

  // Detect responsive screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    let isMounted = true
    async function loadBanners() {
      try {
        const res = await api.get('/banners')
        if (isMounted && res.success && res.data && res.data.length > 0) {
          setSlides(res.data)
        }
      } catch (err) {
        // Fallback to defaultSlides
      }
    }
    loadBanners()
    return () => {
      isMounted = false
    }
  }, [])

  // Phân tách banner PC và Mobile độc lập hoàn toàn:
  // - Khi truy cập bằng Mobile: Lấy riêng danh sách banner Mobile (device_type === 'mobile')
  // - Khi truy cập bằng PC: Lấy riêng danh sách banner PC (device_type === 'pc')
  const displayedSlides = useMemo(() => {
    if (!slides || slides.length === 0) return defaultSlides

    if (isMobile) {
      // 1. Ưu tiên tuyệt đối danh sách Banner được tạo riêng cho Mobile
      const mobileOnly = slides.filter((s) => s.device_type === 'mobile')
      if (mobileOnly.length > 0) return mobileOnly

      // Fallback nếu chưa có banner mobile nào
      const fallback = slides.filter((s) => s.device_type !== 'mobile')
      return fallback.length > 0 ? fallback : slides
    } else {
      // 1. Ưu tiên danh sách Banner được tạo riêng cho PC
      const pcOnly = slides.filter(
        (s) => s.device_type === 'pc' || s.device_type === 'all' || !s.device_type
      )
      if (pcOnly.length > 0) return pcOnly

      return slides
    }
  }, [slides, isMobile])

  return (
    <section className="relative h-screen w-full overflow-hidden bg-neutral-900 flex flex-col justify-end select-none">
      {/* 1. Fullscreen Background Slideshow */}
      <div className="absolute inset-0 z-0">
        <Swiper
          key={isMobile ? 'mobile-slider' : 'desktop-slider'}
          modules={[Autoplay, EffectFade, Navigation, Pagination]}
          effect="fade"
          speed={1400}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{
            clickable: true,
            el: '.hero-pagination',
            bulletClass: 'hero-bullet',
            bulletActiveClass: 'hero-bullet-active',
          }}
          navigation={{
            prevEl: '.hero-prev-btn',
            nextEl: '.hero-next-btn',
          }}
          loop={displayedSlides.length > 1}
          className="h-full w-full hero-swiper"
        >
          {displayedSlides.map((slide, idx) => {
            const rawUrl = slide.image_url || slide.image
            const isUnsplash = rawUrl?.includes('images.unsplash.com')

            return (
              <SwiperSlide key={slide.id || idx} className="relative h-full w-full">
                <img
                  src={getOptimizedSrc(rawUrl, isMobile ? 800 : 1920)}
                  srcSet={
                    isUnsplash
                      ? `${getOptimizedSrc(rawUrl, 640)} 640w, ${getOptimizedSrc(rawUrl, 1080)} 1080w, ${getOptimizedSrc(rawUrl, 1920)} 1920w`
                      : undefined
                  }
                  sizes="100vw"
                  alt={slide.title || slide.alt || 'QA Stories Baby Photography'}
                  className="w-full h-full object-cover object-center"
                  loading={idx === 0 ? 'eager' : 'lazy'}
                  fetchPriority={idx === 0 ? 'high' : 'low'}
                  decoding="async"
                  width={isMobile ? '800' : '1920'}
                  height={isMobile ? '1200' : '1080'}
                />
                {/* Top gradient for Navbar visibility */}
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
                {/* Soft bottom gradient */}
                <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
              </SwiperSlide>
            )
          })}
        </Swiper>
      </div>

      {/* 2. Custom Navigation Arrow Buttons */}
      <button
        type="button"
        aria-label="Previous Slide"
        className="hero-prev-btn absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/30 hover:bg-primary border border-white/20 hover:border-primary text-white flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-xl group cursor-pointer active:scale-90"
      >
        <ChevronLeft size={24} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>

      <button
        type="button"
        aria-label="Next Slide"
        className="hero-next-btn absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-black/30 hover:bg-primary border border-white/20 hover:border-primary text-white flex items-center justify-center backdrop-blur-md transition-all duration-300 shadow-xl group cursor-pointer active:scale-90"
      >
        <ChevronRight size={24} className="group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* 3. Bottom Controls */}
      <div className="relative z-20 pb-14 sm:pb-18 flex flex-col items-center gap-4">
        {/* Quick Access Bar fixed inside Hero on Desktop */}
        <div className="hidden md:flex justify-center w-full px-4">
          <QuickAccess variant="hero" />
        </div>

        {/* Pagination Dots */}
        <div className="hero-pagination flex items-center justify-center gap-2" />
      </div>
    </section>
  )
}