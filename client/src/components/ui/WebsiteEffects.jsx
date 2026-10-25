import { useEffect, useRef, useState } from 'react'
import { useSettings } from '../../context/SettingsContext'

// Color palettes for different particle types
const PALETTES = {
  snow: ['#ffffff', '#f8fafc', '#f1f5f9', '#e0f2fe', '#bae6fd'],
  hearts: ['#f43f5e', '#fb7185', '#fda4af', '#f472b6', '#ec4899', '#e11d48'],
  leaves: ['#ea580c', '#c2410c', '#d97706', '#b45309', '#dc2626', '#f59e0b', '#9a3412'],
  sakura: ['#fbcfe8', '#f472b6', '#fda4af', '#fce7f3', '#f9a8d4'],
  sparkles: ['#fef08a', '#fde047', '#facc15', '#fbbf24', '#ffffff', '#fed7aa'],
  bubbles: ['rgba(255, 255, 255, 0.85)', 'rgba(224, 242, 254, 0.85)', 'rgba(253, 230, 138, 0.85)', 'rgba(244, 114, 182, 0.75)'],
  tet: ['#facc15', '#eab308', '#f59e0b', '#e11d48', '#f43f5e', '#dc2626'],
}

// Particle rendering helper functions
function drawSnowflake(ctx, x, y, size, color, alpha, rotation, isCrystal) {
  ctx.save()
  ctx.translate(x, y)
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha))

  if (!isCrystal) {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(0, 0, size, 0, Math.PI * 2)
    ctx.fill()
  } else {
    ctx.rotate(rotation)
    ctx.strokeStyle = color
    ctx.lineWidth = Math.max(1, size * 0.22)
    ctx.lineCap = 'round'

    for (let i = 0; i < 6; i++) {
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(0, size)
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
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
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
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
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
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha))
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
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha))

  ctx.fillStyle = color
  ctx.beginPath()
  for (let i = 0; i < 4; i++) {
    ctx.lineTo(0, size)
    ctx.quadraticCurveTo(0, 0, size * 0.25, 0)
    ctx.rotate(Math.PI / 2)
  }
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = '#ffffff'
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.25, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

// Soap Bubble with realistic iridescent sheen and elastic wobble
function drawBubble(ctx, x, y, size, alpha, wobbleX = 1, wobbleY = 1, angle = 0) {
  ctx.save()
  ctx.translate(x, y)
  if (angle) ctx.rotate(angle)
  ctx.scale(wobbleX, wobbleY)
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha))

  // Bubble gradient sheen with iridescent hues
  const grad = ctx.createRadialGradient(-size * 0.35, -size * 0.35, size * 0.05, 0, 0, size)
  grad.addColorStop(0, 'rgba(255, 255, 255, 0.85)')
  grad.addColorStop(0.35, 'rgba(224, 242, 254, 0.35)')
  grad.addColorStop(0.7, 'rgba(254, 205, 211, 0.3)')
  grad.addColorStop(0.9, 'rgba(253, 230, 138, 0.35)')
  grad.addColorStop(1, 'rgba(191, 219, 254, 0.65)')

  ctx.fillStyle = grad
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.lineWidth = Math.max(1.2, size * 0.05)
  ctx.beginPath()
  ctx.arc(0, 0, size, 0, Math.PI * 2)
  ctx.fill()
  ctx.stroke()

  // Inner glint arc for soap film reflection
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
  ctx.lineWidth = Math.max(1.2, size * 0.08)
  ctx.beginPath()
  ctx.arc(0, 0, size * 0.78, -Math.PI * 0.75, -Math.PI * 0.25)
  ctx.stroke()

  // Primary highlight glint spot
  ctx.fillStyle = 'rgba(255, 255, 255, 0.98)'
  ctx.beginPath()
  ctx.arc(-size * 0.38, -size * 0.38, size * 0.2, 0, Math.PI * 2)
  ctx.fill()

  // Secondary soft glint bottom-right
  ctx.fillStyle = 'rgba(255, 255, 255, 0.7)'
  ctx.beginPath()
  ctx.arc(size * 0.35, size * 0.35, size * 0.12, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

// Bubble pop burst effect: expanding ring + dispersing micro-droplets
function drawPopBurst(ctx, x, y, size, progress) {
  ctx.save()
  ctx.translate(x, y)
  const alpha = Math.max(0, 1 - progress)

  // Expanding shimmer shockwave ring
  ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`
  ctx.lineWidth = Math.max(1.5, (1 - progress) * 3)
  ctx.beginPath()
  ctx.arc(0, 0, size * (0.8 + progress * 1.1), 0, Math.PI * 2)
  ctx.stroke()

  // Second soft colored halo
  ctx.strokeStyle = `rgba(224, 242, 254, ${alpha * 0.6})`
  ctx.lineWidth = Math.max(1, (1 - progress) * 2)
  ctx.beginPath()
  ctx.arc(0, 0, size * (1.1 + progress * 0.8), 0, Math.PI * 2)
  ctx.stroke()

  // Dispersing splash droplets
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI * 2) / 8 + progress * 0.5
    const dist = size * (0.7 + progress * 1.8)
    const dropX = Math.cos(angle) * dist
    const dropY = Math.sin(angle) * dist
    const dropSize = Math.max(0.8, size * 0.16 * (1 - progress))

    ctx.fillStyle = i % 2 === 0 ? `rgba(255, 255, 255, ${alpha})` : `rgba(219, 234, 254, ${alpha * 0.9})`
    ctx.beginPath()
    ctx.arc(dropX, dropY, dropSize, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.restore()
}

function drawPetalFlower(ctx, x, y, size, color, alpha, rotation, flip) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.scale(flip, 1)
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha))

  ctx.fillStyle = color
  for (let i = 0; i < 5; i++) {
    ctx.beginPath()
    ctx.rotate((Math.PI * 2) / 5)
    ctx.ellipse(0, size * 0.55, size * 0.35, size * 0.5, 0, 0, Math.PI * 2)
    ctx.fill()
  }

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

  // Resolve active settings with prop overrides - default to bubbles if not specified
  const rawEffect = effectOverride ?? settings?.website_effect
  const activeEffect = (rawEffect === 'none' || !rawEffect) ? 'bubbles' : rawEffect
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
    if (prefersReducedMotion) return

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
    let baseCount = 36
    if (activeDensity === 'low') baseCount = 20
    if (activeDensity === 'high') baseCount = 60
    if (isMobile && !isContainerPreview) {
      baseCount = Math.max(14, Math.floor(baseCount * 0.5))
    }

    // Determine speed factor
    let speedMultiplier = 1
    if (activeSpeed === 'slow') speedMultiplier = 0.65
    if (activeSpeed === 'fast') speedMultiplier = 1.45

    const resize = () => {
      if (!canvas) return
      const parent = isContainerPreview ? canvas.parentElement : null
      width = Math.max(50, (parent ? parent.clientWidth : window.innerWidth) || 300)
      height = Math.max(50, (parent ? parent.clientHeight : window.innerHeight) || 200)
      const dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = width * dpr
      canvas.height = height * dpr
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    resize()
    window.addEventListener('resize', resize)

    // Mouse tracking state
    const mouse = {
      x: -9999,
      y: -9999,
      prevX: -9999,
      prevY: -9999,
      vx: 0,
      vy: 0,
      speed: 0,
      active: false,
      lastMoveTime: 0,
    }

    // Interactive cursor trail and pop splash particles
    const trailParticles = []
    const burstParticles = []

    const updatePointer = (clientX, clientY) => {
      const now = performance.now()
      if (mouse.prevX !== -9999) {
        const dt = Math.max(16, now - mouse.lastMoveTime)
        const rawVx = ((clientX - mouse.prevX) / dt) * 16
        const rawVy = ((clientY - mouse.prevY) / dt) * 16
        mouse.vx = Math.max(-25, Math.min(25, rawVx))
        mouse.vy = Math.max(-25, Math.min(25, rawVy))
        mouse.speed = Math.hypot(mouse.vx, mouse.vy)
      }
      mouse.prevX = clientX
      mouse.prevY = clientY
      mouse.x = clientX
      mouse.y = clientY
      mouse.active = true
      mouse.lastMoveTime = now

      // Generate prominent interactive trail particles directly from cursor
      if (trailParticles.length < 45 && Math.random() < 0.8) {
        const spread = (Math.random() - 0.5) * 16
        trailParticles.push({
          x: clientX + spread,
          y: clientY + spread,
          vx: (Math.random() - 0.5) * 1.5 + mouse.vx * 0.12,
          vy: - (0.8 + Math.random() * 1.8),
          size: activeEffect === 'bubbles' ? 5 + Math.random() * 10 : 3 + Math.random() * 6,
          alpha: 0.9,
          color: activeEffect === 'bubbles' ? 'rgba(255, 255, 255, 0.9)' : '#FFB267',
          rotation: Math.random() * Math.PI * 2,
          type: activeEffect === 'bubbles' ? 'bubble' : 'sparkle',
        })
      }
    }

    const onPointerMove = (e) => {
      updatePointer(e.clientX, e.clientY)
    }

    const onTouchMove = (e) => {
      if (e.touches && e.touches[0]) {
        updatePointer(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    const onPointerLeave = () => {
      mouse.active = false
      mouse.vx = 0
      mouse.vy = 0
      mouse.speed = 0
    }

    const triggerBurstAt = (px, py) => {
      // 1. Instantly pop any bubble close to click/tap
      for (const p of particles) {
        if (!p.isPopping) {
          const dist = Math.hypot(p.x - px, p.y - py)
          if (dist < p.size + 90) {
            p.isPopping = true
            p.popProgress = 0
          }
        }
      }

      // 2. Spawn a vivid burst of floating bubbles / sparkles on click
      const burstCount = 14
      for (let i = 0; i < burstCount; i++) {
        const angle = (i * Math.PI * 2) / burstCount + Math.random() * 0.3
        const speed = 2.5 + Math.random() * 5.5
        burstParticles.push({
          x: px,
          y: py,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 1.2,
          size: activeEffect === 'bubbles' ? 6 + Math.random() * 12 : 4 + Math.random() * 6,
          alpha: 1,
          decay: 0.02 + Math.random() * 0.015,
          color: activeEffect === 'bubbles' ? 'rgba(255, 255, 255, 0.95)' : '#FF9C45',
          rotation: Math.random() * Math.PI * 2,
          type: activeEffect === 'bubbles' ? 'bubble' : 'sparkle',
        })
      }
    }

    const onPointerDown = (e) => {
      triggerBurstAt(e.clientX, e.clientY)
    }

    const onTouchStart = (e) => {
      if (e.touches && e.touches[0]) {
        triggerBurstAt(e.touches[0].clientX, e.touches[0].clientY)
      }
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('mousemove', onPointerMove, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: true })
    window.addEventListener('pointerleave', onPointerLeave, { passive: true })
    window.addEventListener('pointerdown', onPointerDown, { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })

    // Palette choice
    const palette = PALETTES[activeEffect] || PALETTES.bubbles

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
      else if (activeEffect === 'bubbles') size = 16 + Math.random() * 24
      else if (activeEffect === 'tet') size = 11 + Math.random() * 10

      // Falling vy vs floating vy (bubbles float up)
      const baseVy = activeEffect === 'bubbles' 
        ? -(0.9 + Math.random() * 1.5) 
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
        opacity: 0.5 + Math.random() * 0.45,
        baseOpacity: 0.5 + Math.random() * 0.45,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.04 * speedMultiplier,
        flip: Math.random() * Math.PI,
        vFlip: 0.02 + Math.random() * 0.04,
        swing: Math.random() * Math.PI * 2,
        swingSpeed: 0.02 + Math.random() * 0.03,
        swingAmp: 0.8 + Math.random() * 1.6,
        isCrystal,
        twinklePhase: Math.random() * Math.PI * 2,
        // Dynamic mouse interactivity states
        wobbleX: 1,
        wobbleY: 1,
        wobbleAngle: 0,
        isPopping: false,
        popProgress: 0,
      })
    }

    // Animation loop
    const render = () => {
      if (!isMounted) return

      if (document.hidden) {
        animationFrameId = requestAnimationFrame(render)
        return
      }

      ctx.clearRect(0, 0, width, height)

      // Friction on mouse velocity
      mouse.vx *= 0.88
      mouse.vy *= 0.88

      // 1. Render and update Main Ambient Particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]

        // A. Handle Popping Bubble State
        if (p.isPopping) {
          p.popProgress += 0.075
          drawPopBurst(ctx, p.x, p.y, p.size, p.popProgress)

          if (p.popProgress >= 1) {
            // Respawn bubble at bottom
            p.isPopping = false
            p.popProgress = 0
            p.y = height + p.size * 2
            p.x = Math.random() * width
            p.vx = (Math.random() - 0.5) * 1.2 * speedMultiplier
            p.vy = p.baseVy
            p.wobbleX = 1
            p.wobbleY = 1
          }
          continue
        }

        // B. Mouse Physics & Interactive Repulsion
        if (mouse.active) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const dist = Math.hypot(dx, dy)
          const influenceRadius = Math.max(140, p.size * 4.5)

          if (dist < influenceRadius && dist > 0) {
            const nx = dx / dist
            const ny = dy / dist
            const force = Math.pow(1 - dist / influenceRadius, 1.2) * 6.5 * speedMultiplier

            // Dynamic fluid push away from mouse
            p.vx += nx * force * 0.9 + mouse.vx * 0.15
            p.vy += ny * force * 0.9 + mouse.vy * 0.15

            // Touch pop when cursor hits the bubble
            if (activeEffect === 'bubbles') {
              if (dist < p.size + 24 || (dist < p.size + 40 && mouse.speed > 5)) {
                // Direct cursor contact or swift swipe pops the bubble!
                p.isPopping = true
                p.popProgress = 0
                continue
              } else {
                // Organic wobble along repulsion axis
                p.wobbleX = 1 + force * 0.15 * Math.sin(p.swing * 3)
                p.wobbleY = 1 - force * 0.1 * Math.sin(p.swing * 3)
                p.wobbleAngle = Math.atan2(ny, nx)
              }
            }
          }
        }

        // Return physics smoothly towards baseline
        p.vx *= 0.93
        p.vy = p.vy * 0.92 + p.baseVy * 0.08
        p.wobbleX += (1 - p.wobbleX) * 0.12
        p.wobbleY += (1 - p.wobbleY) * 0.12

        // Oscillations
        p.swing += p.swingSpeed
        p.rotation += p.vRot
        p.flip += p.vFlip

        const horizontalDrift = Math.sin(p.swing) * p.swingAmp + p.vx
        p.x += horizontalDrift
        p.y += p.vy

        // Sparkle twinkling
        if (activeEffect === 'sparkles') {
          p.twinklePhase += 0.05
          p.opacity = p.baseOpacity * (0.4 + 0.6 * Math.sin(p.twinklePhase))
        }

        // Screen wrapping
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

        // Draw active particle
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
            drawBubble(ctx, p.x, p.y, p.size, p.opacity, p.wobbleX, p.wobbleY, p.wobbleAngle)
            break
          case 'tet':
            drawPetalFlower(ctx, p.x, p.y, p.size, p.color, p.opacity, p.rotation, flipCos)
            break
          default:
            drawBubble(ctx, p.x, p.y, p.size, p.opacity, p.wobbleX, p.wobbleY, p.wobbleAngle)
            break
        }
      }

      // 2. Render and update Interactive Mouse Trail Particles
      for (let i = trailParticles.length - 1; i >= 0; i--) {
        const tp = trailParticles[i]
        tp.x += tp.vx
        tp.y += tp.vy
        tp.alpha -= 0.02

        if (tp.alpha <= 0) {
          trailParticles.splice(i, 1)
          continue
        }

        if (tp.type === 'bubble') {
          drawBubble(ctx, tp.x, tp.y, tp.size, tp.alpha)
        } else {
          drawSparkle(ctx, tp.x, tp.y, tp.size, tp.color, tp.alpha, tp.rotation)
        }
      }

      // 3. Render and update Click Burst Particles
      for (let i = burstParticles.length - 1; i >= 0; i--) {
        const bp = burstParticles[i]
        bp.x += bp.vx
        bp.y += bp.vy
        bp.vx *= 0.94
        bp.vy *= 0.94
        bp.vy += 0.08 // mild gravity
        bp.alpha -= bp.decay

        if (bp.alpha <= 0) {
          burstParticles.splice(i, 1)
          continue
        }

        if (bp.type === 'bubble') {
          drawBubble(ctx, bp.x, bp.y, bp.size, bp.alpha)
        } else {
          drawSparkle(ctx, bp.x, bp.y, bp.size, bp.color, bp.alpha, bp.rotation)
        }
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      isMounted = false
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('mousemove', onPointerMove)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('pointerleave', onPointerLeave)
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('touchstart', onTouchStart)
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
    }
  }, [activeEffect, activeDensity, activeSpeed, allowMobile, prefersReducedMotion, isContainerPreview])

  if (prefersReducedMotion) {
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
