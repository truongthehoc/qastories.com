import { useState, useEffect } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, EffectFade, Navigation, Pagination } from 'swiper/modules'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import QuickAccess from './QuickAccess'
import api from '../../utils/api'
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const defaultSlides = [
  {
    id: 1,
    image_url: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1920&q=85',
    title: 'QA Stories Newborn Photography 1',
  },
  {
    id: 2,
    image_url: 'https://images.unsplash.com/photo-1546015720-b8b30df5aa27?w=1920&q=85',
    title: 'QA Stories Baby Photography 2',
  },
  {
    id: 3,
    image_url: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1920&q=85',
    title: 'QA Stories Family Photography 3',
  },
]

export default function HeroSlider() {
  const [slides, setSlides] = useState(defaultSlides)

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

  return (
    <section className="relative h-screen w-full overflow-hidden bg-neutral-900 flex flex-col justify-end select-none">
      {/* 1. Fullscreen Background Slideshow */}
      <div className="absolute inset-0 z-0">
        <Swiper
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
          loop
          className="h-full w-full hero-swiper"
        >
          {slides.map((slide, idx) => (
            <SwiperSlide key={slide.id || idx} className="relative h-full w-full">
              <img
                src={slide.image_url || slide.image}
                alt={slide.title || slide.alt || 'QA Stories Baby Photography'}
                className="w-full h-full object-cover"
                loading={idx === 0 ? 'eager' : 'lazy'}
                fetchPriority={idx === 0 ? 'high' : 'auto'}
                decoding="async"
              />
              {/* Top gradient for Navbar visibility */}
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
              {/* Soft bottom gradient */}
              <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </SwiperSlide>
          ))}
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