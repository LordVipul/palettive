import type { Palette } from '../types'

const SAVED_KEY = 'palettive-saved'
const FAVORITE_COLORS_KEY = 'palettive-favorite-colors'

let registeredBeforeUnload = false
export function registerBeforeUnload() {
  if (registeredBeforeUnload) return
  window.addEventListener('beforeunload', flushSavePalettes)
  registeredBeforeUnload = true
}

export function loadSavedPalettes(): Palette[] {
  try {
    const raw = localStorage.getItem(SAVED_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

const pendingSave = { palettes: null as Palette[] | null, timer: null as ReturnType<typeof setTimeout> | null }

export function savePalettes(palettes: Palette[]): void {
  if (pendingSave.timer) clearTimeout(pendingSave.timer)
  pendingSave.palettes = palettes
  pendingSave.timer = setTimeout(() => {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(pendingSave.palettes))
      pendingSave.timer = null
    } catch (e) {
      console.error('[storage] Failed to save palettes:', e)
    }
  }, 500)
}

export function flushSavePalettes(): void {
  if (pendingSave.timer) {
    clearTimeout(pendingSave.timer)
    pendingSave.timer = null
  }
  if (pendingSave.palettes) {
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(pendingSave.palettes))
    } catch (e) {
      console.error('[storage] Failed to save palettes:', e)
    }
  }
}

export function loadFavoriteColors(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITE_COLORS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

let favTimer: ReturnType<typeof setTimeout> | null = null
export function saveFavoriteColors(colors: string[]): void {
  if (favTimer) clearTimeout(favTimer)
  favTimer = setTimeout(() => {
    try { localStorage.setItem(FAVORITE_COLORS_KEY, JSON.stringify(colors)) } catch {}
  }, 300)
}

export function exportPaletteJson(palette: Palette): string {
  return JSON.stringify(palette, null, 2)
}

export function importPaletteJson(json: string): Palette | null {
  try {
    const data = JSON.parse(json)
    if (!data.colors || !Array.isArray(data.colors)) return null
    const colors = data.colors.map((c: unknown) => {
      if (typeof c === 'string') return { hex: c, locked: false }
      if (c && typeof c === 'object' && 'hex' in (c as Record<string, unknown>)) {
        const h = (c as Record<string, unknown>).hex
        return { hex: typeof h === 'string' ? h : '', locked: (c as Record<string, unknown>).locked === true }
      }
      return null
    }).filter((c: { hex: string; locked: boolean } | null): c is { hex: string; locked: boolean } =>
      c !== null && /^#[0-9a-f]{6}$/i.test(c.hex)
    )
    if (colors.length === 0) return null
    return {
      id: data.id || crypto.randomUUID(),
      name: data.name || 'Imported Palette',
      colors,
      tags: data.tags || [],
      collection: typeof data.collection === 'string' ? data.collection : undefined,
      createdAt: data.createdAt || Date.now(),
      updatedAt: Date.now(),
    }
  } catch {
    return null
  }
}

export function downloadJson(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
