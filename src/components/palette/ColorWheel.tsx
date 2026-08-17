import { useRef, useEffect, useState, useCallback } from 'react'
import { parseHex, converter, formatHex } from 'culori'

interface Props {
  colors: string[]
  onChange: (hex: string, index: number) => void
}

interface DotPos { x: number; y: number }

export function ColorWheel({ colors, onChange }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const offscreenRef = useRef<HTMLCanvasElement | null>(null)
  const [dragging, setDragging] = useState<number | null>(null)
  const dragThrottle = useRef(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState(220)
  const prevColorsRef = useRef<string[]>([])
  const dotPositionsRef = useRef<Map<number, DotPos>>(new Map())

  const cx = size / 2
  const cy = size / 2
  const radius = size / 2 - 10

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      setSize(Math.min(220, entry.contentRect.width - 32))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  function getDotPos(hex: string): DotPos | null {
    const hsl = hexToHsl(hex)
    if (!hsl) return null
    const rad = ((hsl.h - 90) * Math.PI) / 180
    const dist = (hsl.s / 100) * (radius - 20)
    return { x: cx + Math.cos(rad) * dist, y: cy + Math.sin(rad) * dist }
  }

  function drawDot(ctx: CanvasRenderingContext2D, hex: string, index: number, pos: DotPos) {
    ctx.beginPath()
    ctx.arc(pos.x, pos.y, 10, 0, Math.PI * 2)
    ctx.fillStyle = hex
    ctx.fill()
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 2.5
    ctx.stroke()
    ctx.fillStyle = '#ffffff'
    ctx.font = '10px sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'bottom'
    ctx.fillText(`${index + 1}`, pos.x, pos.y - 14)
  }

  function drawWheelBackground(ctx: CanvasRenderingContext2D) {
    if (!offscreenRef.current) {
      const off = document.createElement('canvas')
      off.width = size
      off.height = size
      offscreenRef.current = off
      const octx = off.getContext('2d')
      if (octx) {
        for (let h = 0; h < 360; h += 2) {
          const rad = (h * Math.PI) / 180
          const x1 = cx + Math.cos(rad) * (radius - 15)
          const y1 = cy + Math.sin(rad) * (radius - 15)
          const x2 = cx + Math.cos(rad) * radius
          const y2 = cy + Math.sin(rad) * radius
          octx.strokeStyle = `hsl(${h}, 100%, 50%)`
          octx.lineWidth = 3
          octx.beginPath()
          octx.moveTo(x1, y1)
          octx.lineTo(x2, y2)
          octx.stroke()
        }
      }
    }
    ctx.drawImage(offscreenRef.current, 0, 0)
  }

  function redrawAllDots(ctx: CanvasRenderingContext2D) {
    dotPositionsRef.current.clear()
    colors.forEach((hex, i) => {
      const pos = getDotPos(hex)
      if (pos) {
        dotPositionsRef.current.set(i, pos)
        drawDot(ctx, hex, i, pos)
      }
    })
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const prev = prevColorsRef.current
    const firstDraw = prev.length === 0
    const sizeChanged = offscreenRef.current?.width !== size

    if (firstDraw || prev.length !== colors.length || sizeChanged) {
      offscreenRef.current = null
      ctx.clearRect(0, 0, size, size)
      drawWheelBackground(ctx)
      redrawAllDots(ctx)
      prevColorsRef.current = [...colors]
      return
    }

    const changedIndices: number[] = []
    for (let i = 0; i < colors.length; i++) {
      if (prev[i] !== colors[i]) changedIndices.push(i)
    }

    if (changedIndices.length === 0) return

    const prevPositions = dotPositionsRef.current
    for (const idx of changedIndices) {
      const oldPos = prevPositions.get(idx)
      if (oldPos) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(oldPos.x, oldPos.y, 12, 0, Math.PI * 2)
        ctx.clip()
        drawWheelBackground(ctx)
        ctx.restore()
      }
      const newPos = getDotPos(colors[idx])
      if (newPos) {
        dotPositionsRef.current.set(idx, newPos)
        drawDot(ctx, colors[idx], idx, newPos)
      }
    }

    prevColorsRef.current = [...colors]
  }, [colors, size])

  function getColorIndexAtPoint(mx: number, my: number): number | null {
    for (let i = colors.length - 1; i >= 0; i--) {
      const hsl = hexToHsl(colors[i])
      if (!hsl) continue
      const rad = ((hsl.h - 90) * Math.PI) / 180
      const dist = (hsl.s / 100) * (radius - 20)
      const x = cx + Math.cos(rad) * dist
      const y = cy + Math.sin(rad) * dist
      const dx = mx - x
      const dy = my - y
      if (dx * dx + dy * dy < 225) return i
    }
    return null
  }

  function getColorFromPosition(mx: number, my: number, original: string) {
    const dx = mx - cx
    const dy = my - cy
    const dist = Math.sqrt(dx * dx + dy * dy)
    const maxDist = radius - 20
    let h = (Math.atan2(dy, dx) * 180) / Math.PI + 90
    h = ((h % 360) + 360) % 360
    const s = Math.min(dist / maxDist, 1) * 100
    const origHsl = hexToHsl(original)
    const l = origHsl ? origHsl.l : 50
    return hslToHex(h, s, l)
  }

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    const idx = getColorIndexAtPoint(mx, my)
    if (idx !== null) setDragging(idx)
  }, [colors, size])

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (dragging === null) return
    const now = Date.now()
    if (now - dragThrottle.current < 12) return
    dragThrottle.current = now
    e.preventDefault()
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top
    onChange(getColorFromPosition(mx, my, colors[dragging]), dragging)
  }, [dragging, onChange, colors])

  function handlePointerUp() {
    setDragging(null)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    const idx = parseInt(e.key) - 1
    if (idx >= 0 && idx < colors.length) {
      const hsl = hexToHsl(colors[idx])
      if (!hsl) return
      let dh = 0, ds = 0
      if (e.key === 'ArrowRight') dh = 5
      else if (e.key === 'ArrowLeft') dh = -5
      else if (e.key === 'ArrowUp') ds = 5
      else if (e.key === 'ArrowDown') ds = -5
      else return
      e.preventDefault()
      onChange(hslToHex(hsl.h + dh, Math.max(0, Math.min(100, hsl.s + ds)), hsl.l), idx)
    }
  }

  return (
    <div ref={containerRef} className="rounded-xl p-4 flex flex-col items-center w-full max-w-[252px] mx-auto" style={{ border: '1px solid var(--color-border)' }}>
      <h3 className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--color-text-secondary)' }}>Color Wheel</h3>
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="cursor-crosshair rounded-full outline-none"
        style={{ touchAction: 'none' }}
        tabIndex={0}
        role="slider"
        aria-label="Color wheel — drag dots or use arrow keys to adjust"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onKeyDown={handleKeyDown}
      />
      <p className="text-xs mt-2" style={{ color: 'var(--color-text-secondary)' }}>
        Drag numbered dots or use arrow keys
      </p>
    </div>
  )
}

function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const parsed = parseHex(hex)
  if (!parsed) return null
  const hsl = converter('hsl')(parsed)
  if (!hsl) return null
  const h = typeof hsl.h === 'number' ? hsl.h : 0
  const s = typeof hsl.s === 'number' ? hsl.s * 100 : 0
  const l = typeof hsl.l === 'number' ? hsl.l * 100 : 0
  return { h, s, l }
}

function hslToHex(h: number, s: number, l: number): string {
  return formatHex({ mode: 'hsl', h: ((h % 360) + 360) % 360, s: Math.max(0, Math.min(100, s)) / 100, l: Math.max(0, Math.min(100, l)) / 100 })
}
