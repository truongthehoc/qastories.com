import { useEffect, useRef, useState } from 'react'

export function useIntersectionObserver(options = {}) {
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  const threshold = options.threshold ?? 0.15
  const rootMargin = options.rootMargin ?? '0px'

  useEffect(() => {
    const current = ref.current
    if (!current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(current)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(current)
    return () => {
      if (current) observer.unobserve(current)
      observer.disconnect()
    }
  }, [threshold, rootMargin])

  return [ref, isVisible]
}
