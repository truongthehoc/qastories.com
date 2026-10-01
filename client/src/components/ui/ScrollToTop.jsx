import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp } from 'lucide-react'

export default function ScrollToTop() {
  const { pathname } = useLocation()
  const [visible, setVisible] = useState(false)

  // Automatically scroll to top on page navigation
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    })
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setVisible(true)
      } else {
        setVisible(false)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={scrollToTop}
          aria-label="Trở về đầu trang"
          initial={{ opacity: 0, scale: 0.5, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: 20 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-6 left-6 sm:bottom-8 sm:left-8 z-50 w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-[#E5C9A1]/90 hover:bg-primary text-white border-2 border-white/80 shadow-xl shadow-amber-900/15 hover:shadow-primary/40 flex items-center justify-center backdrop-blur-md transition-all duration-300 cursor-pointer group active:scale-90"
        >
          <ChevronUp
            size={24}
            className="stroke-[3] group-hover:-translate-y-0.5 transition-transform duration-300"
          />
        </motion.button>
      )}
    </AnimatePresence>
  )
}
