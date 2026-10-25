import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { X, Volume2, VolumeX, ExternalLink, Sparkles, ArrowRight } from 'lucide-react'
import api from '../../utils/api'

export default function AdDisplay() {
  const location = useLocation()
  const navigate = useNavigate()

  const [ads, setAds] = useState([])
  const [activePopup, setActivePopup] = useState(null)
  const [popupTimeRemaining, setPopupTimeRemaining] = useState(0)
  const [videoMuted, setVideoMuted] = useState(true)
  const [topBarAd, setTopBarAd] = useState(null)
  const [floatingAd, setFloatingAd] = useState(null)

  const videoRef = useRef(null)
  const popupTimerRef = useRef(null)
  const countdownIntervalRef = useRef(null)

  // Identify current page
  const getCurrentPageKey = (pathname) => {
    if (pathname === '/' || pathname === '') return 'home'
    if (pathname.startsWith('/album')) return 'album'
    if (pathname.startsWith('/about')) return 'about'
    if (pathname.startsWith('/contact')) return 'contact'
    return 'other'
  }

  const currentPage = getCurrentPageKey(location.pathname)

  // Fetch active ads for current page
  useEffect(() => {
    // Don't show ads inside admin panel
    if (location.pathname.startsWith('/admin')) {
      setActivePopup(null)
      setTopBarAd(null)
      setFloatingAd(null)
      return
    }

    let isMounted = true

    async function loadAds() {
      try {
        const res = await api.get(`/advertisements?page=${currentPage}`)
        if (isMounted && res.success && Array.isArray(res.data)) {
          setAds(res.data)
        }
      } catch (err) {
        console.warn('Lỗi khi tải quảng cáo:', err.message)
      }
    }

    loadAds()

    return () => {
      isMounted = false
    }
  }, [location.pathname, currentPage])

  // Process Popups & Placements
  useEffect(() => {
    if (ads.length === 0 || location.pathname.startsWith('/admin')) return

    // 1. Find Top Bar Ad
    const bar = ads.find((a) => a.placement === 'top_bar')
    if (bar) {
      const dismissed = sessionStorage.getItem(`ad_dismissed_${bar.id}`)
      if (!dismissed) setTopBarAd(bar)
    }

    // 2. Find Floating Corner Ad
    const float = ads.find(
      (a) => a.placement === 'floating_bottom_right' || a.placement === 'floating_bottom_left'
    )
    if (float) {
      const dismissed = sessionStorage.getItem(`ad_dismissed_${float.id}`)
      if (!dismissed) setFloatingAd(float)
    }

    // 3. Find and trigger Popup Ad
    const popup = ads.find((a) => a.placement === 'popup')
    if (!popup) return

    // Check frequency rule
    const freq = popup.popup_frequency || 'once_per_session'
    if (freq === 'once_per_session') {
      if (sessionStorage.getItem(`ad_viewed_${popup.id}`)) return
    } else if (freq === 'once_per_day') {
      const lastViewed = localStorage.getItem(`ad_viewed_day_${popup.id}`)
      if (lastViewed) {
        const diff = Date.now() - parseInt(lastViewed, 10)
        if (diff < 24 * 60 * 60 * 1000) return
      }
    }

    // Delay timer
    const delayMs = Math.max(0, (popup.popup_delay || 0) * 1000)
    popupTimerRef.current = setTimeout(() => {
      setActivePopup(popup)

      // Set frequency flags
      if (freq === 'once_per_session') {
        sessionStorage.setItem(`ad_viewed_${popup.id}`, '1')
      } else if (freq === 'once_per_day') {
        localStorage.setItem(`ad_viewed_day_${popup.id}`, Date.now().toString())
      }

      // Track view
      api.post(`/advertisements/${popup.id}/view`).catch(() => {})

      // Duration auto-close countdown
      if (popup.popup_duration > 0) {
        setPopupTimeRemaining(popup.popup_duration)
        countdownIntervalRef.current = setInterval(() => {
          setPopupTimeRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(countdownIntervalRef.current)
              setActivePopup(null)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      }
    }, delayMs)

    return () => {
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current)
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
    }
  }, [ads, location.pathname])

  const handleClosePopup = () => {
    setActivePopup(null)
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current)
  }

  const handleCloseTopBar = () => {
    if (topBarAd) sessionStorage.setItem(`ad_dismissed_${topBarAd.id}`, '1')
    setTopBarAd(null)
  }

  const handleCloseFloating = () => {
    if (floatingAd) sessionStorage.setItem(`ad_dismissed_${floatingAd.id}`, '1')
    setFloatingAd(null)
  }

  const handleClickAd = (ad) => {
    if (!ad) return
    // Track click
    api.post(`/advertisements/${ad.id}/click`).catch(() => {})

    // Navigate or open link
    if (ad.link_url) {
      if (ad.link_url.startsWith('http')) {
        window.open(ad.link_url, '_blank', 'noopener,noreferrer')
      } else {
        navigate(ad.link_url)
      }
    }
    setActivePopup(null)
  }

  return (
    <>
      {/* 1. Top Bar Announcement Banner */}
      {topBarAd && (
        <div className="fixed top-0 inset-x-0 z-50 bg-gradient-to-r from-orange-600 via-primary to-orange-500 text-white text-xs sm:text-sm py-2 px-4 shadow-md flex items-center justify-between gap-3 animate-fade-in">
          <div
            onClick={() => handleClickAd(topBarAd)}
            className="flex-1 flex items-center justify-center gap-2 cursor-pointer text-center font-medium hover:underline truncate"
          >
            <Sparkles size={15} className="shrink-0 text-yellow-300 animate-pulse" />
            <span className="font-bold truncate">{topBarAd.title}</span>
            {topBarAd.description && (
              <span className="hidden md:inline opacity-90 truncate">— {topBarAd.description}</span>
            )}
            {topBarAd.button_text && (
              <span className="ml-2 inline-flex items-center gap-1 bg-white text-primary text-xs px-2.5 py-0.5 rounded-full font-bold shadow-sm shrink-0">
                {topBarAd.button_text} <ArrowRight size={11} />
              </span>
            )}
          </div>
          <button
            onClick={handleCloseTopBar}
            className="p-1 text-white/80 hover:text-white hover:bg-black/10 rounded-lg transition-colors shrink-0"
            title="Đóng thông báo"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* 2. Floating Corner Ad (Bottom Right or Bottom Left) */}
      {floatingAd && (
        <div
          className={`fixed z-40 bottom-24 ${
            floatingAd.placement === 'floating_bottom_left' ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
          } max-w-[280px] sm:max-w-[320px] bg-white rounded-2xl shadow-2xl border border-orange-100 overflow-hidden animate-slide-up`}
        >
          <div className="relative group">
            {/* Close button */}
            <button
              onClick={handleCloseFloating}
              className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors"
            >
              <X size={14} />
            </button>

            {/* Media */}
            <div
              onClick={() => handleClickAd(floatingAd)}
              className="cursor-pointer aspect-video bg-black overflow-hidden"
            >
              {floatingAd.media_type === 'video' ? (
                <video
                  src={floatingAd.media_url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={floatingAd.media_url}
                  alt={floatingAd.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}
            </div>

            {/* Card Content */}
            <div className="p-3.5 space-y-1.5">
              <h5
                onClick={() => handleClickAd(floatingAd)}
                className="font-bold text-gray-900 text-xs sm:text-sm line-clamp-1 hover:text-primary cursor-pointer transition-colors"
              >
                {floatingAd.title}
              </h5>
              {floatingAd.description && (
                <p className="text-gray-500 text-[11px] line-clamp-2 leading-relaxed">
                  {floatingAd.description}
                </p>
              )}
              {floatingAd.button_text && (
                <button
                  onClick={() => handleClickAd(floatingAd)}
                  className="mt-2 w-full py-1.5 px-3 rounded-lg bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-sm transition-all text-center flex items-center justify-center gap-1.5"
                >
                  {floatingAd.button_text} <ArrowRight size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Popup Modal Ad (Center Overlay) */}
      {activePopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
          <div className="relative bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-white/20 animate-scale-in">
            {/* Countdown / Duration Progress Bar */}
            {activePopup.popup_duration > 0 && (
              <div className="absolute top-0 inset-x-0 h-1 bg-orange-100 z-30">
                <div
                  className="h-full bg-primary transition-all duration-1000 ease-linear"
                  style={{
                    width: `${(popupTimeRemaining / activePopup.popup_duration) * 100}%`,
                  }}
                />
              </div>
            )}

            {/* Close Button (X) */}
            <button
              onClick={handleClosePopup}
              className="absolute top-3 right-3 z-30 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black hover:scale-105 transition-all shadow-lg"
              title="Đóng quảng cáo"
            >
              <X size={20} />
            </button>

            {/* Duration Badge */}
            {activePopup.popup_duration > 0 && (
              <div className="absolute top-3 left-3 z-30 px-3 py-1 rounded-full bg-black/60 text-white text-xs font-medium backdrop-blur-md">
                Tự đóng sau: {popupTimeRemaining}s
              </div>
            )}

            {/* Media Area (Image / Video) */}
            <div className="relative aspect-[4/3] bg-black overflow-hidden group">
              {activePopup.media_type === 'video' ? (
                <>
                  <video
                    ref={videoRef}
                    src={activePopup.media_url}
                    autoPlay
                    muted={videoMuted}
                    loop
                    playsInline
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => handleClickAd(activePopup)}
                  />
                  {/* Audio Mute/Unmute toggle button for video */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setVideoMuted(!videoMuted)
                    }}
                    className="absolute bottom-3 right-3 z-20 px-3 py-1.5 rounded-full bg-black/70 text-white text-xs font-medium backdrop-blur-md flex items-center gap-1.5 hover:bg-black transition-colors"
                  >
                    {videoMuted ? (
                      <>
                        <VolumeX size={14} className="text-red-400" /> Bật âm thanh
                      </>
                    ) : (
                      <>
                        <Volume2 size={14} className="text-green-400" /> Tắt âm thanh
                      </>
                    )}
                  </button>
                </>
              ) : (
                <img
                  src={activePopup.media_url}
                  alt={activePopup.title}
                  className="w-full h-full object-cover cursor-pointer group-hover:scale-105 transition-transform duration-500"
                  onClick={() => handleClickAd(activePopup)}
                />
              )}
            </div>

            {/* Content & Call to Action */}
            <div className="p-6 text-center space-y-3.5">
              <h3
                onClick={() => handleClickAd(activePopup)}
                className="font-bold text-gray-900 text-lg sm:text-xl font-heading leading-snug cursor-pointer hover:text-primary transition-colors"
              >
                {activePopup.title}
              </h3>

              {activePopup.description && (
                <p className="text-gray-500 text-sm leading-relaxed max-w-md mx-auto line-clamp-3">
                  {activePopup.description}
                </p>
              )}

              {activePopup.button_text && (
                <div className="pt-2">
                  <button
                    onClick={() => handleClickAd(activePopup)}
                    className="btn-primary !py-3 !px-8 text-sm font-bold rounded-full shadow-lg hover:shadow-primary/40 inline-flex items-center gap-2"
                  >
                    {activePopup.button_text} <ArrowRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
