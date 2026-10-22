import { useEffect, useRef, useState } from 'react'
import { useSettings } from '../../context/SettingsContext'

// Color palettes for different particle types
const PALETTES = {
  snow: ['#ffffff', '#f8fafc', '#f1f5f9', '#e0f2fe', '#bae6fd'],
  hearts: ['#f43f5e', '#fb7185', '#fda4af', '#f472b6', '#ec4899', '#e11d48'],
  leaves: ['#ea580c', '#c2410c', '#d97706', '#b45309', '#dc2626', '#f59e0b', '#9a3412'],
  sakura: ['#fbcfe8', '#f472b6', '#fda4af', '#fce7f3', '#f9a8d4'],
  sparkles: ['#fef08a', '#fde047', '#facc15', '#fbbf24', '#ffffff', '#fed7aa'],
  tet: ['#facc15', '#eab308', '#f59e0b', '#e11d48', '#f43f5e', '#dc2626'],
}

// Particle rendering helper functions
function drawSnowflake(ctx, x, y, size, color, alpha, rotation, isCrystal) {
  ctx.save()
  ctx.translate(x, y)
  ctx.globalAlpha = alpha

  if (!isCrystal) {
    // Soft blurred glowing snow dot
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(0, 0, size, 0, Math.PI * 2)
    ctx.fill()
  } else {
    // 6-branched crystal snowflake
    ctx.rotate(rotation)
    ctx.strokeStyle = color
    ctx.lineWidth = Math.max(1, size * 0.22)
    ctx.lineCap = 'round'

    for (let i = 0; i < 6; i++) {
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(0, size)
      // mini branches
      ctx.moveTo(0, size * 0.5)
      ctx.lineTo(size * 0.25, size * 0.7)
      ctx.moveTo(0, size * 0.5)
      ctx.lineTo(-size * 0.25, size * 0.7)
      ctx.stroke()
      ctx.rotate(Math.PI / 3)
    }
  }

  ctx.restore()
}

function drawHeart(ctx, x, y, size, color, alpha, rotation, flip) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.scale(flip, 1)
  ctx.globalAlpha = alpha
  ctx.fillStyle = color

  ctx.beginPath()
  const d = size * 0.6
  ctx.moveTo(0, -d * 0.2)
  ctx.bezierCurveTo(-d * 0.7, -d * 1.1, -d * 1.4, -d * 0.2, -d * 0.5, d * 0.7)
  ctx.lineTo(0, d * 1.2)
  ctx.lineTo(d * 0.5, d * 0.7)
  ctx.bezierCurveTo(d * 1.4, -d * 0.2, d * 0.7, -d * 1.1, 0, -d * 0.2)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}

function drawMapleLeaf(ctx, x, y, size, color, alpha, rotation, flip) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.scale(flip, 1)
  ctx.globalAlpha = alpha
  ctx.fillStyle = color

  ctx.beginPath()
  ctx.moveTo(0, -size)
  ctx.bezierCurveTo(size * 0.25, -size * 0.7, size * 0.65, -size * 0.65, size * 0.6, -size * 0.4)
  ctx.bezierCurveTo(size * 0.4, -size * 0.3, size * 0.85, -size * 0.1, size * 0.75, size * 0.2)
  ctx.bezierCurveTo(size * 0.4, size * 0.25, size * 0.45, size * 0.5, size * 0.1, size * 0.7)
  ctx.lineTo(0, size * 0.95)
  ctx.lineTo(-size * 0.05, size * 0.7)
  ctx.bezierCurveTo(-size * 0.45, size * 0.5, -size * 0.4, size * 0.25, -size * 0.75, size * 0.2)
  ctx.bezierCurveTo(-size * 0.85, -size * 0.1, -size * 0.4, -size * 0.3, -size * 0.6, -size * 0.4)
  ctx.bezierCurveTo(-size * 0.65, -size * 0.65, -size * 0.25, -size * 0.7, 0, -size)
  ctx.closePath()
  ctx.fill()

  // Leaf central vein
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.15)'
  ctx.lineWidth = Math.max(1, size * 0.06)
  ctx.beginPath()
  ctx.moveTo(0, -size * 0.6)
  ctx.lineTo(0, size * 0.8)
  ctx.stroke()

  ctx.restore()
}

function drawSakura(ctx, x, y, size, color, alpha, rotation, flip) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.scale(flip, 1)
  ctx.globalAlpha = alpha
  ctx.fillStyle = color

  ctx.beginPath()
  ctx.moveTo(0, -size)
  ctx.bezierCurveTo(size * 0.5, -size * 0.7, size * 0.6, size * 0.3, 0, size * 0.8)
  ctx.bezierCurveTo(-size * 0.6, size * 0.3, -size * 0.5, -size * 0.7, 0, -size)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}

function drawSparkle(ctx, x, y, size, color, alpha, rotation) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.globalAlpha = alpha

  // 4-pointed diamond star
  ctx.fillStyle = color
  ctx.beginPath()
  for (let i = 0; i < 4; i++) {
    ctx.lineTo(0, size)
    ctx.quadraticCurveTo(0, 0, size * 0.25, 0)
    ctx.rotate(Math.PI / 2)
  }
  ctx.closePath()
  ctx.fill()

  // Inner bright white glow
  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.22, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawBubble(ctx, x, y, size, alpha) {
  ctx.save()
  ctx.globalAlpha = alpha

  // Bubble gradient sheen
  const grad = ctx.createRadialGradient(x - size * 0.3, y - size * 0.3, size * 0.1, x, y, size)
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.5)')
  grad.addColorStop(0.7, 'rgba(219, 234, 254, 0.15)')
  grad.addColorStop(1, 'rgba(191, 219, 254, 0.45)')

  ctx.fillStyle = grad
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.arc(x, y, size, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // Highlight glint
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)'
  ctx.beginPath()
  ctx.arc(x - size * 0.35, y - size * 0.35, size * 0.2, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

function drawPetalFlower(ctx, x, y, size, color, alpha, rotation, flip) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.scale(flip, 1)
  ctx.globalAlpha = alpha

  // 5 petals
  ctx.fillStyle = color
  for (let i = 0; i < 5; i++) {
    ctx.beginPath()
    ctx.rotate((Math.PI * 2) / 5)
    ctx.ellipse(0, size * 0.55, size * 0.35, size * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // Flower pistil center
  ctx.fillStyle = '#fffbeb'
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#f59e0b'
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

export default function WebsiteEffects({
  effectOverride = null,
  densityOverride = null,
  speedOverride = null,
  mobileOverride = null,
  isContainerPreview = false,
  className = '',
}) {
  const { settings } = useSettings() || {}
  const canvasRef = useRef(null)

  // Resolve active settings with prop overrides
  const activeEffect = effectOverride ?? settings?.website_effect ?? 'none'
  const activeDensity = densityOverride ?? settings?.website_effect_density ?? 'medium'
  const activeSpeed = speedOverride ?? settings?.website_effect_speed ?? 'normal'
  const allowMobile = (mobileOverride ?? settings?.website_effect_mobile ?? '1') === '1'

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  // Check user OS reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e) => setPrefersReducedMotion(e.matches)
    mediaQuery.addEventListener?.('change', handleChange)
    return () => mediaQuery.removeEventListener?.('change', handleChange)
  }, [])

  useEffect(() => {
    if (activeEffect === 'none' || prefersReducedMotion) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let isMounted = true
    let width = 0
    let height = 0

    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768
    if (isMobile && !allowMobile && !isContainerPreview) {
      return
    }

    // Determine particle count based on density
    let baseCount = 45
    if (activeDensity === 'low') baseCount = 24
    if (activeDensity === 'high') baseCount = 75
    if (isMobile && !isContainerPreview) {
      baseCount = Math.max(12, Math.floor(baseCount * 0.5))
    }

    // Determine speed factor
    let speedMultiplier = 1
    if (activeSpeed === 'slow') speedMultiplier = 0.65
    if (activeSpeed === 'fast') speedMultiplier = 1.45

    const resize = () => {
      if (!canvas) return
      const parent = isContainerPreview ? canvas.parentElement : null
      width = parent ? parent.clientWidth : window.innerWidth
      height = parent ? parent.clientHeight : window.innerHeight
      const dpr = window.devicePixelRatio || 1

      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    // Palette choice
    const palette = PALETTES[activeEffect] || PALETTES.snow

    // Initialize particles
    const particles = []

    for (let i = 0; i < baseCount; i++) {
      const isCrystal = activeEffect === 'snow' && Math.random() < 0.25
      let size = 4
      if (activeEffect === 'snow') size = isCrystal ? 7 + Math.random() * 6 : 2.5 + Math.random() * 4.5
      else if (activeEffect === 'hearts') size = 11 + Math.random() * 11
      else if (activeEffect === 'leaves') size = 14 + Math.random() * 12
      else if (activeEffect === 'sakura') size = 9 + Math.random() * 9
      else if (activeEffect === 'sparkles') size = 6 + Math.random() * 10
      else if (activeEffect === 'bubbles') size = 12 + Math.random() * 20
      else if (activeEffect === 'tet') size = 11 + Math.random() * 10

      // Falling vy vs floating vy (bubbles float up)
      const baseVy = activeEffect === 'bubbles' 
        ? -(0.8 + Math.random() * 1.4) 
        : activeEffect === 'sparkles'
        ? (Math.random() - 0.5) * 0.8
        : 1.0 + Math.random() * 1.8

      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size,
        baseVy: baseVy * speedMultiplier,
        vy: baseVy * speedMultiplier,
        vx: (Math.random() - 0.5) * 1.2 * speedMultiplier,
        color: palette[Math.floor(Math.random() * palette.length)],
        opacity: 0.4 + Math.random() * 0.55,
        baseOpacity: 0.4 + Math.random() * 0.55,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.04 * speedMultiplier,
        flip: Math.random() * Math.PI,
        vFlip: 0.02 + Math.random() * 0.04,
        swing: Math.random() * Math.PI * 2,
        swingSpeed: 0.02 + Math.random() * 0.03,
        swingAmp: 0.8 + Math.random() * 1.6,
        isCrystal,
        twinklePhase: Math.random() * Math.PI * 2,
      })
    }

    // Animation loop
    const render = () => {
      if (!isMounted) return

      // Pause when browser tab is hidden to save CPU/GPU
      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      ctx.clearRect(0, 0, width, height)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // Physics update
        p.swing += p.swingSpeed
        p.rotation += p.vRot
        p.flip += p.vFlip

        // Horizontal sway
        const horizontalDrift = Math.sin(p.swing) * p.swingAmp + p.vx
        p.x += horizontalDrift
        p.y += p.vy

        // Sparkle twinkling
        if (activeEffect === 'sparkles') {
          p.twinklePhase += 0.05
          p.opacity = p.baseOpacity * (0.4 + 0.6 * Math.sin(p.twinklePhase))
        }

        // Screen wrap
        if (activeEffect === 'bubbles') {
          if (p.y < -p.size * 2) {
            p.y = height + p.size
            p.x = Math.random() * width
          }
        } else {
          if (p.y > height + p.size * 2) {
            p.y = -p.size * 2
            p.x = Math.random() * width
          }
        }

        if (p.x < -p.size * 2) p.x = width + p.size
        else if (p.x > width + p.size * 2) p.x = -p.size

        const flipCos = Math.cos(p.flip)

        // Draw particle based on type
        switch (activeEffect) {
          case 'snow':
            drawSnowflake(ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation, p.isCrystal)
            break
          case 'hearts':
            drawHeart(ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation, flipCos)
            break
          case 'leaves':
            drawMapleLeaf(ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation, flipCos)
            break
          case 'sakura':
            drawSakura(ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation, flipCos)
            break
          case 'sparkles':
            drawSparkle(ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation)
            break
          case 'bubbles':
            drawBubble(ctx, p.x, p.y, p.size, p.opacity)
            break
          case 'tet':
            drawPetalFlower(ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation, flipCos)
            break
          default:
            break
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      isMounted = false
      window.removeEventListener('resize', resize)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [activeEffect, activeDensity, activeSpeed, allowMobile, prefersReducedMotion, isContainerPreview])

  if (activeEffect === 'none' || prefersReducedMotion) {
    return null
  }

  if (isContainerPreview) {
    return (
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 w-full h-full pointer-events-none rounded-2xl ${className}`}
      />
    )
  }

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-40 w-screen h-screen overflow-hidden ${className}`}
      aria-hidden="true"
    />
  )
}
