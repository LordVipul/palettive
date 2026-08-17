import { parseHex, converter, formatHex } from 'culori'

function fromHsl(h: number, s: number, l: number): string {
  return formatHex({ mode: 'hsl', h: ((h % 360) + 360) % 360, s: Math.max(0.05, Math.min(1, s)), l: Math.max(0.05, Math.min(0.95, l)) })
}

function rand(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function getHslValues(hsl: Record<string, unknown>): { h: number; s: number; l: number } {
  return {
    h: typeof hsl.h === 'number' ? hsl.h : 0,
    s: typeof hsl.s === 'number' ? hsl.s : 0.5,
    l: typeof hsl.l === 'number' ? hsl.l : 0.5,
  }
}

export function generateHarmony(
  baseHex: string,
  rule: string,
  count: number
): string[] {
  const base = parseHex(baseHex)
  if (!base) return Array(count).fill('#666666')
  const hslRaw = converter('hsl')(base)
  if (!hslRaw) return Array(count).fill('#666666')
  const { h, s, l } = getHslValues(hslRaw)
  const results: string[] = [baseHex]

  const vary = (sv: number, lv: number) => [Math.max(0.2, Math.min(1, s + sv)), Math.max(0.15, Math.min(0.9, l + lv))]

  switch (rule) {
    case 'complementary': {
      for (let i = 1; i < count; i++) {
        const [ns, nl] = vary(rand(-0.05, 0.15), rand(-0.05, 0.15))
        results.push(fromHsl(h + (180 / (count - 1)) * i, ns, nl))
      }
      break
    }
    case 'analogous': {
      for (let i = 1; i < count; i++) {
        const [ns, nl] = vary(rand(-0.05, 0.1), rand(-0.05, 0.15))
        results.push(fromHsl(h - 30 + (60 / (count - 1)) * i, ns, nl))
      }
      break
    }
    case 'triadic': {
      for (let i = 1; i < count; i++) {
        const [ns, nl] = vary(rand(-0.05, 0.1), rand(-0.05, 0.1))
        results.push(fromHsl(h + (120 / (count - 1)) * i, ns, nl))
      }
      break
    }
    case 'split-complementary': {
      const offsets = [150, -150, 30, -30, 60]
      for (let i = 0; i < count - 1; i++) {
        const [ns, nl] = vary(rand(-0.05, 0.1), rand(-0.08, 0.12))
        results.push(fromHsl(h + (offsets[i] || 180), ns, nl))
      }
      break
    }
    case 'square': {
      for (let i = 1; i < count; i++) {
        const [ns, nl] = vary(rand(-0.05, 0.1), rand(-0.08, 0.12))
        results.push(fromHsl(h + (90 / (count - 1)) * i, ns, nl))
      }
      break
    }
    case 'monochromatic': {
      for (let i = 1; i < count; i++) {
        const [ns] = vary(rand(-0.05, 0.05), 0)
        const nl = Math.max(0.1, Math.min(0.9, l + (i - Math.floor(count / 2)) * (0.18 / Math.max(1, count - 1))))
        results.push(fromHsl(h, ns, nl))
      }
      break
    }
    case 'random':
    default: {
      for (let i = 1; i < count; i++) {
        results.push(fromHsl(rand(0, 360), rand(0.4, 0.9), rand(0.2, 0.8)))
      }
    }
  }

  return results.slice(0, count)
}

export function generateScaledShades(hex: string, steps: number = 7): string[] {
  const base = parseHex(hex)
  if (!base) return Array(steps).fill('#666666')
  const hslRaw = converter('hsl')(base)
  if (!hslRaw) return Array(steps).fill('#666666')
  const { h, s } = getHslValues(hslRaw)
  const s2 = Math.max(0.3, s)

  const shades: string[] = []
  for (let i = 0; i < steps; i++) {
    const l = 0.08 + (0.84 / (steps - 1)) * i
    shades.push(fromHsl(h, s2, l))
  }
  return shades
}
