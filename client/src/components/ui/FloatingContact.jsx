import { useState, useEffect, useRef } from 'react'
import { Phone, MessageCircle, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettings } from '../../context/SettingsContext'

export default function FloatingContact() {
  const { settings } = useSettings()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef(null)

  // Click outside to collapse
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  const phone = settings?.brand_phone || '0901 234 567'
  const rawPhone = phone.replace(/\s+/g, '')
  const zaloUrl = settings?.brand_zalo || `https://zalo.me/${rawPhone}`
  const messengerUrl = settings?.brand_facebook
    ? settings.brand_facebook.includes('m.me')
      ? settings.brand_facebook
      : 'https://m.me/qastories'
    : 'https://m.me/qastories'

  const contactButtons = [
    {
      id: 'hotline',
      label: `Hotline: ${phone}`,
      shortLabel: 'Hotline',
      href: `tel:${rawPhone}`,
      bgClass: 'bg-emerald-500 hover:bg-emerald-600 text-white',
      badgeBg: 'bg-emerald-950/80 border-emerald-500/30 text-emerald-100',
      icon: (
        <Phone
          size={20}
          className="stroke-[2.5] text-white group-hover:scale-110 transition-transform duration-300"
        />
      ),
    },
    {
      id: 'messenger',
      label: 'Chat Messenger',
      shortLabel: 'Messenger',
      href: messengerUrl,
      bgClass: 'bg-[#0084FF] hover:bg-[#0073e6] text-white',
      badgeBg: 'bg-blue-950/80 border-blue-500/30 text-blue-100',
      icon: (
        <svg
          viewBox="0 0 24 24"
          className="w-5 h-5 fill-white group-hover:scale-110 transition-transform duration-300"
        >
          <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.91 1.455 5.513 3.735 7.183V22l3.418-1.876c.895.247 1.847.382 2.847.382 5.523 0 10-4.145 10-9.248C22 6.145 17.523 2 12 2zm1.066 12.443l-2.617-2.793-5.109 2.793 5.617-5.962 2.68 2.793 5.045-2.793-5.616 5.962z" />
        </svg>
      ),
    },
    {
      id: 'zalo',
      label: 'Tư Vấn Qua Zalo',
      shortLabel: 'Zalo',
      href: zaloUrl,
      bgClass: 'bg-[#0068FF] hover:bg-[#0052cc] text-white',
      badgeBg: 'bg-sky-950/80 border-sky-500/30 text-sky-100',
      icon: (
        <div className="border-[2px] border-white rounded-full px-1.5 py-0.5 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
          <span className="text-[10.5px] font-black text-white tracking-tighter leading-none">
            Zalo
          </span>
        </div>
      ),
    },
  ]

  return (
    <div
      ref={containerRef}
      className="fixed bottom-22 right-4 sm:bottom-8 sm:right-8 z-50 flex flex-col items-end gap-3 select-none"
    >
      {/* Expanded Sub-Buttons */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.85 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="flex flex-col items-end gap-2.5 mb-1"
          >
            {contactButtons.map((btn, index) => (
              <motion.a
                key={btn.id}
                href={btn.href}
                target={btn.href.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                aria-label={btn.label}
                initial={{ opacity: 0, x: 20, scale: 0.7 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 20, scale: 0.7 }}
                transition={{
                  duration: 0.25,
                  delay: (contactButtons.length - 1 - index) * 0.05,
                  ease: 'easeOut',
                }}
                className="group flex items-center gap-2.5 cursor-pointer"
              >
                {/* Text Label Pill */}
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md border shadow-lg transition-all duration-300 group-hover:scale-105 ${btn.badgeBg}`}
                >
                  {btn.label}
                </span>

                {/* Round Icon Button */}
                <div
                  className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full ${btn.bgClass} border-2 border-white/90 shadow-xl flex items-center justify-center transition-all duration-300 active:scale-90 group-hover:shadow-2xl`}
                >
                  {btn.icon}
                </div>
              </motion.a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Collapsible Trigger Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={isOpen ? 'Thu gọn liên hệ' : 'Mở menu liên hệ'}
        aria-expanded={isOpen}
        whileTap={{ scale: 0.9 }}
        className="relative group w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-[#d4a366] via-[#E5C9A1] to-[#ff9852] text-white border-2 border-white/90 shadow-2xl shadow-amber-950/30 flex items-center justify-center backdrop-blur-md transition-all duration-300 cursor-pointer hover:shadow-orange-500/30 hover:scale-105"
      >
        {/* Pulse glow animation when collapsed */}
        {!isOpen && (
          <>
            <span className="absolute -inset-1 rounded-full bg-orange-400/40 animate-ping pointer-events-none opacity-75" />
            <span className="absolute -inset-2 rounded-full bg-amber-300/20 animate-pulse pointer-events-none" />
          </>
        )}

        {/* Animated Icon Transition */}
        <AnimatePresence mode="wait" initial={false}>
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={24} className="stroke-[2.5] text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="chat"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="relative flex items-center justify-center"
            >
              <MessageCircle size={24} className="stroke-[2.2] text-white fill-white/20" />
              <Sparkles
                size={12}
                className="absolute -top-1 -right-1 text-yellow-100 fill-yellow-200 animate-bounce"
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tooltip on Desktop hover when collapsed */}
        {!isOpen && (
          <span className="absolute right-full mr-3.5 px-3 py-1.5 rounded-xl bg-gray-900/90 text-white text-xs font-semibold whitespace-nowrap shadow-lg backdrop-blur-sm opacity-0 -translate-x-2 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden sm:block">
            Liên hệ tư vấn
            <span className="absolute top-1/2 -right-1 -translate-y-1/2 border-4 border-transparent border-l-gray-900/90" />
          </span>
        )}
      </motion.button>
    </div>
  )
}
