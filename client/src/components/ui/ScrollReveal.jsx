import { useIntersectionObserver } from '../../hooks/useIntersectionObserver'

export function ScrollReveal({ children, delay = 0, direction = 'up', className = '' }) {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 })

  const getTransform = () => {
    if (isVisible) return 'none'
    switch (direction) {
      case 'up':
        return 'translate3d(0, 24px, 0)'
      case 'down':
        return 'translate3d(0, -24px, 0)'
      case 'left':
        return 'translate3d(24px, 0, 0)'
      case 'right':
        return 'translate3d(-24px, 0, 0)'
      default:
        return 'none'
    }
  }

  return (
    <div
      ref={ref}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: getTransform(),
        transition: `opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`,
        willChange: isVisible ? 'auto' : 'opacity, transform',
      }}
      className={className}
    >
      {children}
    </div>
  )
}
