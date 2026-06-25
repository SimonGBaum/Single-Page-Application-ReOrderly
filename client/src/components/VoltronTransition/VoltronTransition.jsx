import { useEffect, useReducer, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import './VoltronTransition.css'

const TOTAL_MS    = 1800
const TRAIL_END   = 600
const BURST_START = 400
const BURST_END   = 700
const CANVAS_STOP = 750

const CORNER_TRAILS = [
  { color: '#CC0000', sx: 0, sy: 0 }, // Red    — top-left
  { color: '#007A00', sx: 1, sy: 0 }, // Green  — top-right  (sx/sy 1 = 100% of dimension)
  { color: '#0040CC', sx: 0, sy: 1 }, // Blue   — bottom-left
  { color: '#F5C300', sx: 1, sy: 1 }, // Yellow — bottom-right
]

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

function lerp(a, b, t) {
  return a + (b - a) * t
}

function runAnimation(canvas) {
  const ctx = canvas.getContext('2d')
  const W   = canvas.width
  const H   = canvas.height
  const cx  = W / 2
  const cy  = H / 2

  const start = performance.now()
  let rafId   = null

  function tick(now) {
    const t = now - start

    if (t < CANVAS_STOP) {
      ctx.clearRect(0, 0, W, H)

      for (const trail of CORNER_TRAILS) {
        const progress = Math.min(1, Math.max(0, t / TRAIL_END))
        if (progress <= 0) continue

        const startX   = trail.sx * W
        const startY   = trail.sy * H
        const tipX     = lerp(startX, cx, progress)
        const tipY     = lerp(startY, cy, progress)
        const tailProg = Math.max(0, progress - 0.28)
        const tailX    = lerp(startX, cx, tailProg)
        const tailY    = lerp(startY, cy, tailProg)

        const grad = ctx.createLinearGradient(tailX, tailY, tipX, tipY)
        grad.addColorStop(0, hexToRgba(trail.color, 0))
        grad.addColorStop(1, hexToRgba(trail.color, 1))

        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(tipX, tipY)
        ctx.strokeStyle = grad
        ctx.lineWidth   = 3
        ctx.lineCap     = 'round'
        ctx.stroke()
      }

      if (t >= BURST_START && t <= BURST_END) {
        const bp     = (t - BURST_START) / (BURST_END - BURST_START)
        const radius = bp < 0.5 ? lerp(0, 40, bp * 2) : lerp(40, 0, (bp - 0.5) * 2)
        const alpha  = bp < 0.5 ? lerp(0, 1, bp * 2) : lerp(1, 0, (bp - 0.5) * 2)

        ctx.beginPath()
        ctx.arc(cx, cy, radius, 0, Math.PI * 2)
        ctx.strokeStyle = hexToRgba('#C9A84C', alpha)
        ctx.lineWidth   = 2
        ctx.stroke()

        ctx.beginPath()
        ctx.arc(cx, cy, radius * 0.6, 0, Math.PI * 2)
        ctx.strokeStyle = hexToRgba('#111111', alpha * 0.8)
        ctx.lineWidth   = 1.5
        ctx.stroke()
      }
    }

    if (t < TOTAL_MS) {
      rafId = requestAnimationFrame(tick)
    }
  }

  rafId = requestAnimationFrame(tick)
  return () => { if (rafId) cancelAnimationFrame(rafId) }
}

function transitionReducer(state, action) {
  switch (action.type) {
    case 'START': return { running: true }
    case 'STOP':  return { running: false }
    default:      return state
  }
}

// Vertical nudges (px) per letter in "ReOrderly" — kept fixed so the stagger looks consistent
const LETTER_OFFSETS = [-5, 6, 4, -6, 5, -4, 6, -5, 4]

export default function VoltronTransition() {
  const location  = useLocation()
  const prevPath  = useRef(location.pathname)
  const [state, dispatch] = useReducer(transitionReducer, { running: false })
  const canvasRef = useRef(null)
  const cancelRef = useRef(null)
  const timerRef  = useRef(null)

  useEffect(() => {
    if (location.pathname === prevPath.current) return
    prevPath.current = location.pathname
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dispatch({ type: 'START' })
    }
  }, [location.pathname])

  useEffect(() => {
    if (!state.running) return

    const canvas = canvasRef.current
    if (!canvas) return

    canvas.width  = window.innerWidth
    canvas.height = window.innerHeight

    cancelRef.current = runAnimation(canvas)
    timerRef.current  = setTimeout(() => dispatch({ type: 'STOP' }), TOTAL_MS)

    return () => {
      if (cancelRef.current) cancelRef.current()
      clearTimeout(timerRef.current)
    }
  }, [state.running])

  if (!state.running) return null

  return (
    <div className="vt-overlay" aria-hidden="true">
      <canvas ref={canvasRef} className="vt-canvas" />
      <div className="vt-wordmark">
        {'ReOrderly'.split('').map((char, i) => (
          <span key={i} className="vt-letter" style={{ top: `${LETTER_OFFSETS[i]}px` }}>
            {char}
          </span>
        ))}
      </div>
    </div>
  )
}
