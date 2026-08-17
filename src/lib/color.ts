import {
  parseHex, formatHex,
  wcagContrast,
  clampChroma,
  filterDeficiencyProt, filterDeficiencyDeuter, filterDeficiencyTrit,
} from 'culori'

export function hexToRgb(hexStr: string): { r: number; g: number; b: number } | null {
  const c = parseHex(hexStr)
  if (!c) return null
  return { r: Math.round(c.r * 255), g: Math.round(c.g * 255), b: Math.round(c.b * 255) }
}

export function getContrastRatio(a: string, b: string): number {
  return wcagContrast(a, b)
}

export function getLuminance(hexStr: string): number {
  const r = parseInt(hexStr.slice(1, 3), 16) / 255
  const g = parseInt(hexStr.slice(3, 5), 16) / 255
  const b = parseInt(hexStr.slice(5, 7), 16) / 255
  const rs = r <= 0.03928 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4
  const gs = g <= 0.03928 ? g / 12.92 : ((g + 0.055) / 1.055) ** 2.4
  const bs = b <= 0.03928 ? b / 12.92 : ((b + 0.055) / 1.055) ** 2.4
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

export function meetsAA(ratio: number, large?: boolean): boolean {
  return large ? ratio >= 3 : ratio >= 4.5
}

export function meetsAAA(ratio: number, large?: boolean): boolean {
  return large ? ratio >= 4.5 : ratio >= 7
}

export function simulateColorBlindness(hexStr: string, type: string): string {
  const c = parseHex(hexStr)
  if (!c) return hexStr
  let result
  switch (type) {
    case 'protanopia': result = filterDeficiencyProt(5)(c); break
    case 'deuteranopia': result = filterDeficiencyDeuter(5)(c); break
    case 'tritanopia': result = filterDeficiencyTrit(5)(c); break
    case 'achromatopsia': result = grayscale(c); break
    default: return hexStr
  }
  return result ? formatHex(clampChroma(result)) : hexStr
}

function grayscale(c: { r: number; g: number; b: number; mode?: string }): { r: number; g: number; b: number; mode?: string } {
  const gray = 0.2126 * (c.r ?? 0) + 0.7152 * (c.g ?? 0) + 0.0722 * (c.b ?? 0)
  return { ...c, r: gray, g: gray, b: gray }
}

export function generateUUID(): string {
  if (crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16)
  })
}

const textColorCache = new Map<string, string>()
export function getTextColor(hex: string): string {
  const cached = textColorCache.get(hex)
  if (cached) return cached
  if (!hex || hex.length < 7) { textColorCache.set(hex, '#ffffff'); return '#ffffff' }
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) { textColorCache.set(hex, '#ffffff'); return '#ffffff' }
  const result = (r * 0.299 + g * 0.587 + b * 0.114) > 140 ? '#000000' : '#ffffff'
  textColorCache.set(hex, result)
  return result
}
