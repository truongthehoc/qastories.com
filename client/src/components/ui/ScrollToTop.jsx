import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
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
      setVisible(window.scrollY > 300)
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

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Trở về đầu trang"
      className="fixed bottom-[72px] left-3 sm:bottom-8 sm:left-8 z-50 w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-[#E5C9A1]/75 hover:bg-primary text-white border border-white/70 shadow-md hover:shadow-lg shadow-amber-900/10 flex items-center justify-center backdrop-blur-md opacity-75 hover:opacity-100 transition-all duration-300 cursor-pointer group active:scale-90 animate-fade-in"
    >
      <ChevronUp
        size={18}
        className="stroke-[3] group-hover:-translate-y-0.5 transition-transform duration-300 sm:w-[22px] sm:h-[22px]"
      />
    </button>
  )
}
