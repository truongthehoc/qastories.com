import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, Camera, Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSettings } from '../../context/SettingsContext'

const navLinks = [
  { path: '/', label: 'Trang Chủ' },
  { path: '/album', label: 'Bộ Sưu Tập' },
  { path: '/about', label: 'Giới Thiệu' },
  { path: '/contact', label: 'Liên Hệ & Đặt Lịch' },
]

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()
  const { settings } = useSettings()

  const closeMenu = () => {
    setIsOpen(false)
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Luôn đóng menu khi route thay đổi
  useEffect(() => {
    setIsOpen(false)
  }, [location.pathname, location.search, location.hash])

  // Khóa cuộn trang khi menu mobile đang mở
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  // Đóng khi nhấn ESC hoặc màn hình co giãn lớn hơn 768px
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  const isHome = location.pathname === '/'

  const isPageEnabled = (path) => {
    if (!settings) return true
    if (path === '/') return settings.page_home_enabled !== '0' && settings.page_home_enabled !== false && settings.page_home_enabled !== 0
    if (path === '/album') return settings.page_album_enabled !== '0' && settings.page_album_enabled !== false && settings.page_album_enabled !== 0
    if (path === '/about') return settings.page_about_enabled !== '0' && settings.page_about_enabled !== false && settings.page_about_enabled !== 0
    if (path === '/contact') return settings.page_contact_enabled !== '0' && settings.page_contact_enabled !== false && settings.page_contact_enabled !== 0
    return true
  }

  const visibleNavLinks = navLinks.filter((link) => isPageEnabled(link.path))
  const contactEnabled = isPageEnabled('/contact')
  const isHeaderWhite = scrolled || !isHome || isOpen

  return (
    <>
      <header
        style={{
          backgroundColor: isHeaderWhite ? '#ffffff' : undefined,
          backgroundImage: isHeaderWhite ? 'none' : undefined,
        }}
        className={`fixed top-0 left-0 right-0 z-50 h-[68px] flex items-center transition-colors duration-200 ${
          isHeaderWhite
            ? 'bg-white shadow-xs border-b border-gray-100'
            : 'bg-gradient-to-b from-black/70 via-black/30 to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" onClick={closeMenu} className="flex items-center gap-3 group">
              {settings?.brand_logo ? (
                <img
                  src={settings.brand_logo}
                  alt={settings?.brand_name || 'QA Stories'}
                  className="h-10 w-auto max-w-[140px] object-contain group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform duration-300">
                  <Camera size={20} className="text-white" />
                </div>
              )}
              <span
                className={`font-heading font-bold text-2xl tracking-tight transition-colors duration-200 ${
                  isHeaderWhite ? 'text-gray-900' : 'text-white'
                }`}
              >
                {settings?.brand_name || 'QA Stories'}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8 font-mulish">
              {visibleNavLinks.map((link) => {
                const active = location.pathname === link.path
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`text-sm font-semibold relative transition-colors duration-300 py-1 ${
                      active
                        ? 'text-primary'
                        : isHeaderWhite
                        ? 'text-gray-700 hover:text-primary'
                        : 'text-white/90 hover:text-white'
                    }`}
                  >
                    {link.label}
                    {active && (
                      <motion.div
                        layoutId="navUnderline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                      />
                    )}
                  </Link>
                )
              })}
              {contactEnabled && (
                <Link
                  to="/contact"
                  className="btn-primary text-xs px-5 py-2.5 shadow-md shadow-primary/25 hover:shadow-primary/40 font-mulish font-bold"
                >
                  Đặt Lịch Ngay
                </Link>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              aria-label={isOpen ? 'Đóng menu' : 'Mở menu'}
              className={`md:hidden p-2.5 rounded-xl transition-all duration-200 active:scale-90 cursor-pointer ${
                isHeaderWhite
                  ? 'text-primary bg-orange-50 hover:bg-orange-100'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              {isOpen ? <X size={24} className="stroke-[2.5]" /> : <Menu size={24} className="stroke-[2.5]" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu (Direct conditional render - Closes instantly without freezing during lazy load) */}
        {isOpen && (
          <div
            style={{ backgroundColor: '#ffffff', backgroundImage: 'none' }}
            className="md:hidden absolute top-[68px] left-0 right-0 w-full bg-white border-b border-gray-100 shadow-2xl px-6 py-6 flex flex-col items-center justify-center text-center space-y-4 z-50 font-mulish animate-fade-in"
          >
            {/* Nav Links: Direct Link with instant close */}
            <div className="w-full max-w-[280px] mx-auto flex flex-col divide-y divide-gray-100">
              {visibleNavLinks.map((link) => {
                const active = location.pathname === link.path
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => {
                      closeMenu()
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className={`w-full block py-3.5 text-center font-mulish text-[16px] tracking-normal transition-colors duration-200 cursor-pointer select-none active:scale-95 ${
                      active
                        ? 'text-primary font-bold'
                        : 'text-gray-700 hover:text-primary active:text-primary font-normal'
                    }`}
                  >
                    <span>{link.label}</span>
                  </Link>
                )
              })}
            </div>

            {/* Action Link: Đặt Lịch Tư Vấn */}
            {contactEnabled && (
              <div className="pt-2 w-full flex justify-center font-mulish">
                <Link
                  to="/contact"
                  onClick={() => {
                    closeMenu()
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  className="inline-flex items-center justify-center gap-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-primary border-b border-gray-200 hover:border-primary pb-1 transition-colors cursor-pointer select-none"
                >
                  <Phone size={13} />
                  <span>Đặt lịch tư vấn trực tuyến</span>
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Backdrop overlay */}
      {isOpen && (
        <div
          onClick={closeMenu}
          className="md:hidden fixed inset-0 top-[68px] bg-black/40 backdrop-blur-xs z-40 transition-opacity duration-200 animate-fade-in"
        />
      )}
    </>
  )
}