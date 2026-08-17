import { create } from 'zustand'
import { parseHex, converter, formatHex } from 'culori'
import type { Palette, PaletteColor, HarmonyRule } from '../types'
import { generateHarmony } from '../lib/harmony'
import { generateUUID } from '../lib/color'
import { loadSavedPalettes, savePalettes, registerBeforeUnload } from '../lib/storage'

const DARK_KEY = 'palettive-dark'

function getInitialDark(): boolean {
  try {
    const stored = localStorage.getItem(DARK_KEY)
    if (stored !== null) return stored === 'true'
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

interface PaletteState {
  currentColors: PaletteColor[]
  paletteSize: number
  harmonyRule: HarmonyRule
  intensity: number
  savedPalettes: Palette[]
  activePaletteId: string | null
  darkMode: boolean
  colorBlindness: string
  history: PaletteColor[][]
  historyIndex: number

  setColors: (colors: PaletteColor[]) => void
  setColor: (index: number, hex: string) => void
  toggleLock: (index: number) => void
  removeColor: (index: number) => void
  addColor: () => void
  setPaletteSize: (size: number) => void
  setHarmonyRule: (rule: HarmonyRule) => void
  setIntensity: (val: number) => void
  generatePalette: () => void
  reorderColors: (from: number, to: number) => void
  undo: () => void
  redo: () => void

  saveCurrentPalette: (name: string, tags?: string[]) => void
  importPalette: (palette: Palette) => void
  deletePalette: (id: string) => void
  loadPalette: (id: string) => void
  updatePalette: (id: string, data: Partial<Palette>) => void

  toggleDarkMode: () => void
  setColorBlindness: (type: string) => void
}

function randomHex(): string {
  return '#' + Array.from({ length: 6 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
}

function generateInitialColors(size: number): PaletteColor[] {
  return Array.from({ length: size }, () => ({ hex: randomHex(), locked: false }))
}

const HISTORY_LIMIT = 50
let historyDebounceTimer: ReturnType<typeof setTimeout> | null = null
let historyPendingSnapshot: PaletteColor[] | null = null

function sameColors(a: PaletteColor[], b: PaletteColor[]): boolean {
  if (a.length !== b.length) return false
  for (let i = 0; i < a.length; i++) {
    if (a[i].hex !== b[i].hex || a[i].locked !== b[i].locked) return false
  }
  return true
}

function pushHistoryEntry(history: PaletteColor[][], historyIndex: number, snapshot: PaletteColor[]): { history: PaletteColor[][]; historyIndex: number } {
  const prev = history[historyIndex - 1]
  if (prev && sameColors(prev, snapshot)) return { history, historyIndex }
  const next = [...history.slice(0, historyIndex), snapshot]
  if (next.length > HISTORY_LIMIT) next.shift()
  return { history: next, historyIndex: next.length }
}

const initialDark = getInitialDark()
if (initialDark) document.documentElement.classList.add('dark')
else document.documentElement.classList.remove('dark')

const initialColors = generateInitialColors(5)

registerBeforeUnload()

export const usePaletteStore = create<PaletteState>((set, get) => {
  function commitPendingHistory() {
    if (historyDebounceTimer) { clearTimeout(historyDebounceTimer); historyDebounceTimer = null }
    if (!historyPendingSnapshot) return
    const snapshot = historyPendingSnapshot
    historyPendingSnapshot = null
    set((s) => ({ ...pushHistoryEntry(s.history, s.historyIndex, snapshot) }))
  }

  function recordHistoryImmediate(snapshot: PaletteColor[]) {
    commitPendingHistory()
    set((s) => ({ ...pushHistoryEntry(s.history, s.historyIndex, snapshot) }))
  }

  function recordHistoryDebounced(snapshot: PaletteColor[]) {
    if (historyDebounceTimer) clearTimeout(historyDebounceTimer)
    if (!historyPendingSnapshot) historyPendingSnapshot = snapshot
    historyDebounceTimer = setTimeout(() => {
      historyDebounceTimer = null
      if (!historyPendingSnapshot) return
      const pending = historyPendingSnapshot
      historyPendingSnapshot = null
      set((s) => ({ ...pushHistoryEntry(s.history, s.historyIndex, pending) }))
    }, 400)
  }

  return {
  currentColors: initialColors,
  paletteSize: 5,
  harmonyRule: 'complementary',
  intensity: 0.85,
  savedPalettes: loadSavedPalettes(),
  activePaletteId: null,
  darkMode: initialDark,
  colorBlindness: 'none',
  history: [],
  historyIndex: 0,

  setColors: (colors) => {
    recordHistoryImmediate(get().currentColors.map((c) => ({ ...c })))
    set({ currentColors: colors })
  },

  setColor: (index, hex) => {
    recordHistoryDebounced(get().currentColors.map((c) => ({ ...c })))
    set((s) => {
      const colors = [...s.currentColors]
      if (colors[index]) colors[index] = { ...colors[index], hex }
      return { currentColors: colors }
    })
  },

  toggleLock: (index) => {
    recordHistoryImmediate(get().currentColors.map((c) => ({ ...c })))
    set((s) => {
      const colors = [...s.currentColors]
      if (colors[index]) colors[index] = { ...colors[index], locked: !colors[index].locked }
      return { currentColors: colors }
    })
  },

  removeColor: (index) => {
    if (get().currentColors.length <= 3) return
    recordHistoryImmediate(get().currentColors.map((c) => ({ ...c })))
    set((s) => {
      const colors = s.currentColors.filter((_, i) => i !== index)
      return { currentColors: colors, paletteSize: colors.length }
    })
  },

  addColor: () => {
    if (get().currentColors.length >= 9) return
    recordHistoryImmediate(get().currentColors.map((c) => ({ ...c })))
    set((s) => {
      const colors = [...s.currentColors, { hex: randomHex(), locked: false }]
      return { currentColors: colors, paletteSize: colors.length }
    })
  },

  setPaletteSize: (size) => {
    if (get().currentColors.length === size) return
    recordHistoryImmediate(get().currentColors.map((c) => ({ ...c })))
    set((s) => {
      const colors = [...s.currentColors]
      while (colors.length < size) colors.push({ hex: randomHex(), locked: false })
      while (colors.length > size) {
        const idx = colors.length - 1
        if (colors[idx].locked) {
          const unlockedIdx = colors.slice(0, idx).findIndex((c) => !c.locked)
          if (unlockedIdx === -1) break
          colors.splice(unlockedIdx, 1)
        } else {
          colors.pop()
        }
      }
      return { currentColors: colors, paletteSize: colors.length }
    })
  },

  setHarmonyRule: (rule) => set({ harmonyRule: rule }),
  setIntensity: (val) => set({ intensity: val }),

  generatePalette: () => {
    const colors = get().currentColors
    if (!colors.some((c) => !c.locked)) return
    recordHistoryImmediate(colors.map((c) => ({ ...c })))
    set((s) => {
      const locked = s.currentColors.filter((c) => c.locked)
      const unlockedIndices = s.currentColors
        .map((c, i) => (c.locked ? -1 : i))
        .filter((i) => i >= 0)

      if (unlockedIndices.length === 0) return {}

      const base = locked.length > 0
        ? locked[Math.floor(Math.random() * locked.length)].hex
        : randomHex()

      const extraCount = s.currentColors.length + locked.length * 2
      const generated = generateHarmony(base, s.harmonyRule, extraCount)
      const intensity = Math.max(0.2, Math.min(1, s.intensity * (0.9 + Math.random() * 0.2)))

      const lockedColors = locked.map((c) => c.hex)
      const lockedHslCache = new Map<string, Record<string, unknown> | null>()
      for (const h of lockedColors) {
        const parsed = parseHex(h)
        lockedHslCache.set(h, parsed ? converter('hsl')(parsed) ?? null : null)
      }
      let genIdx = 1
      const generatedWithoutBase = generated.slice(1)
      const colors = s.currentColors.map((c, i) => {
        if (c.locked) return c

        let raw = generatedWithoutBase[genIdx % generatedWithoutBase.length] || randomHex()
        genIdx++
        let attempts = 0
        while (attempts < 8) {
          const tooClose = lockedColors.some((lockedHex) => {
            const parsed = parseHex(raw)
            if (!parsed) return true
            const a = converter('hsl')(parsed)
            const b = lockedHslCache.get(lockedHex) ?? null
            if (!a || !b) return true
            const ah = typeof a.h === 'number' ? a.h : 0
            const bh = typeof b.h === 'number' ? b.h : 0
            const as = typeof a.s === 'number' ? a.s : 0.5
            const bs = typeof b.s === 'number' ? b.s : 0.5
            const al = typeof a.l === 'number' ? a.l : 0.5
            const bl = typeof b.l === 'number' ? b.l : 0.5
            const dh = Math.abs(ah - bh)
            const hDist = Math.min(dh, 360 - dh) / 180
            const sDist = Math.abs(as - bs)
            const lDist = Math.abs(al - bl)
            return hDist * 0.5 + sDist * 0.25 + lDist * 0.25 < 0.25
          })
          if (!tooClose) break
          raw = generatedWithoutBase[genIdx % generatedWithoutBase.length] || randomHex()
          genIdx++
          attempts++
        }
        if (attempts >= 8) {
          const parsed = parseHex(raw)
          const hsl = parsed ? converter('hsl')(parsed) : null
          if (hsl) {
            const hh = typeof hsl.h === 'number' ? hsl.h : 0
            const hs = typeof hsl.s === 'number' ? hsl.s : 0.5
            const hl = typeof hsl.l === 'number' ? hsl.l : 0.5
            raw = formatHex({ mode: 'hsl' as const, h: (hh + 60 * (i + 1)) % 360, s: hs, l: hl } as Record<string, unknown>)
            const fallbackParsed = parseHex(raw)
            const fallbackHsl = fallbackParsed ? converter('hsl')(fallbackParsed) : null
            if (fallbackHsl && lockedColors.length > 0) {
              const fh = typeof fallbackHsl.h === 'number' ? fallbackHsl.h : 0
              const fs = typeof fallbackHsl.s === 'number' ? fallbackHsl.s : 0.5
              const fl = typeof fallbackHsl.l === 'number' ? fallbackHsl.l : 0.5
              const stillTooClose = lockedColors.some((lockedHex) => {
                const b = lockedHslCache.get(lockedHex) ?? null
                if (!b) return true
                const bh = typeof b.h === 'number' ? b.h : 0
                const bs = typeof b.s === 'number' ? b.s : 0.5
                const bl = typeof b.l === 'number' ? b.l : 0.5
                const dh = Math.abs(fh - bh)
                const hDist = Math.min(dh, 360 - dh) / 180
                const sDist = Math.abs(fs - bs)
                const lDist = Math.abs(fl - bl)
                return hDist * 0.5 + sDist * 0.25 + lDist * 0.25 < 0.25
              })
              if (stillTooClose) {
                raw = formatHex({ mode: 'hsl' as const, h: (fh + 180) % 360, s: fs, l: fl } as Record<string, unknown>)
              }
            }
          }
        }

        if (intensity >= 1) return { ...c, hex: raw }
        const parsed = parseHex(raw)
        const hsl = parsed ? converter('hsl')(parsed) : null
        if (!hsl) return { ...c, hex: raw }
        const si = (typeof hsl.s === 'number' ? hsl.s : 0.5) * (0.5 + 0.5 * intensity)
        return { ...c, hex: formatHex({ mode: 'hsl' as const, h: typeof hsl.h === 'number' ? hsl.h : 0, s: Math.max(0.05, Math.min(1, si)), l: Math.max(0.05, Math.min(0.95, typeof hsl.l === 'number' ? hsl.l : 0.5)) } as Record<string, unknown>) }
      })

      return { currentColors: colors }
    })
  },

  reorderColors: (from, to) => {
    recordHistoryDebounced(get().currentColors.map((c) => ({ ...c })))
    set((s) => {
      const colors = [...s.currentColors]
      const [removed] = colors.splice(from, 1)
      colors.splice(to, 0, removed)
      return { currentColors: colors }
    })
  },

  undo: () => {
    commitPendingHistory()
    set((s) => {
      if (s.historyIndex === 0) return {}
      return { currentColors: s.history[s.historyIndex - 1].map((c) => ({ ...c })), historyIndex: s.historyIndex - 1 }
    })
  },

  redo: () => {
    commitPendingHistory()
    set((s) => {
      if (s.historyIndex >= s.history.length) return {}
      return { currentColors: s.history[s.historyIndex].map((c) => ({ ...c })), historyIndex: s.historyIndex + 1 }
    })
  },

  saveCurrentPalette: (name, tags = []) =>
    set((s) => {
      const palette: Palette = {
        id: generateUUID(),
        name,
        colors: s.currentColors.map((c) => ({ ...c })),
        tags,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      }
      const saved = [palette, ...s.savedPalettes]
      savePalettes(saved)
      return { savedPalettes: saved, activePaletteId: palette.id }
    }),

  importPalette: (palette) =>
    set((s) => {
      const p = s.savedPalettes.some((x) => x.id === palette.id)
        ? { ...palette, id: generateUUID() }
        : palette
      const saved = [p, ...s.savedPalettes]
      savePalettes(saved)
      return { savedPalettes: saved }
    }),

  deletePalette: (id) =>
    set((s) => {
      const saved = s.savedPalettes.filter((p) => p.id !== id)
      savePalettes(saved)
      return { savedPalettes: saved, activePaletteId: s.activePaletteId === id ? null : s.activePaletteId }
    }),

  loadPalette: (id) => {
    const palette = get().savedPalettes.find((p) => p.id === id)
    if (!palette) return
    recordHistoryImmediate(get().currentColors.map((c) => ({ ...c })))
    set({
      currentColors: palette.colors.map((c) => ({ ...c })),
      paletteSize: palette.colors.length,
      activePaletteId: id,
    })
  },

  updatePalette: (id, data) =>
    set((s) => {
      const saved = s.savedPalettes.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: Date.now() } : p
      )
      savePalettes(saved)
      return { savedPalettes: saved }
    }),

  toggleDarkMode: () =>
    set((s) => {
      const next = !s.darkMode
      document.documentElement.classList.toggle('dark', next)
      try { localStorage.setItem(DARK_KEY, String(next)) } catch {}
      return { darkMode: next }
    }),

  setColorBlindness: (type) => set({ colorBlindness: type }),
  }
})
