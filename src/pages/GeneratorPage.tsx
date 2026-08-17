import { useState, useCallback, useMemo, useEffect, useRef } from 'react'
import { usePaletteStore } from '../store/paletteStore'
import { ColorWheel } from '../components/palette/ColorWheel'
import { HarmonySelector } from '../components/palette/HarmonySelector'
import { generateScaledShades } from '../lib/harmony'
import { getTextColor } from '../lib/color'
import { Shuffle, Save, Check, Undo2, Redo2 } from 'lucide-react'

export function GeneratorPage() {
  const { currentColors, paletteSize, harmonyRule, intensity, setColor, setPaletteSize, setHarmonyRule, setIntensity, generatePalette, saveCurrentPalette, undo, redo, history, historyIndex } = usePaletteStore()
  const [saveName, setSaveName] = useState('')
  const [saveTags, setSaveTags] = useState('')
  const [showSave, setShowSave] = useState(false)
  const [copiedShade, setCopiedShade] = useState<string | null>(null)
  const [copiedHex, setCopiedHex] = useState<string | null>(null)
  const hexKey = currentColors.map(c => c.hex).join(',')
  const shadesCache = useRef<Map<string, string[]>>(new Map())

  useEffect(() => {
    if (!showSave) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowSave(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showSave])

  const shadesMap = useMemo(() => {
    const cache = shadesCache.current
    if (cache.size > 50) {
      const first = cache.keys().next().value
      if (first !== undefined) cache.delete(first)
    }
    const result = new Map<string, string[]>()
    for (const c of currentColors) {
      const existing = cache.get(c.hex)
      if (existing) { result.set(c.hex, existing); continue }
      const shades = generateScaledShades(c.hex, 9)
      cache.set(c.hex, shades)
      result.set(c.hex, shades)
    }
    return result
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hexKey])

  const handleSave = useCallback(() => {
    if (!saveName.trim()) return
    const tags = saveTags.split(',').map((t) => t.trim()).filter(Boolean)
    saveCurrentPalette(saveName.trim(), tags)
    setSaveName('')
    setSaveTags('')
    setShowSave(false)
  }, [saveName, saveTags, saveCurrentPalette])

  const openSaveModal = useCallback(() => {
    setShowSave(true)
  }, [])

  const allLocked = currentColors.length > 0 && currentColors.every(c => c.locked)

  return (
    <div className="space-y-4">
      {allLocked && (
        <div className="px-3 py-2 rounded-lg text-xs font-medium" style={{ backgroundColor: 'var(--color-accent-muted)', color: 'var(--color-accent)' }}>
          All colors locked — unlock some to generate new variations
        </div>
      )}
      <div className="flex flex-col gap-3">
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 flex-col sm:flex-row">
          <HarmonySelector value={harmonyRule} onChange={setHarmonyRule} />
          <div className="flex items-center gap-2">
            <label className="text-xs font-medium flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>Colors:</label>
            <div className="flex gap-1 flex-wrap">
              {[3, 4, 5, 6, 7, 8, 9].map((n) => (
                <button key={n} onClick={() => setPaletteSize(n)}
                  className="w-9 h-9 rounded text-xs font-medium transition-all hover:opacity-80 active:scale-95"
                  style={{ backgroundColor: n === paletteSize ? 'var(--color-text)' : 'var(--color-bg-tertiary)', color: n === paletteSize ? 'var(--color-bg)' : 'var(--color-text)' }}
                >{n}</button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 sm:ml-auto">
            <label className="text-xs font-medium whitespace-nowrap flex-shrink-0" style={{ color: 'var(--color-text-secondary)' }}>
              Intensity <span className="font-mono">{Math.round(intensity * 100)}%</span>
            </label>
            <input type="range" min="0" max="1" step="0.05" value={intensity}
              onChange={(e) => setIntensity(parseFloat(e.target.value))}
              className="w-28 sm:w-20 h-1.5 rounded-full accent-current cursor-pointer"
              style={{ accentColor: 'var(--color-accent)' }}
            />
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={generatePalette} className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed" style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }}>
            <Shuffle className="w-4 h-4" /> Generate
          </button>
          <button onClick={openSaveModal} className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 active:scale-95" style={{ border: '1px solid var(--color-border)' }}>
            <Save className="w-4 h-4" /> Save
          </button>
          <button onClick={undo} disabled={historyIndex === 0} title="Undo (Ctrl+Z)" className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed" style={{ border: '1px solid var(--color-border)' }}>
            <Undo2 className="w-4 h-4" /> Undo
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length} title="Redo (Ctrl+Shift+Z / Ctrl+Y)" className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed" style={{ border: '1px solid var(--color-border)' }}>
            <Redo2 className="w-4 h-4" /> Redo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          <div>
            <h3 className="text-xs font-medium uppercase tracking-wider mb-2" style={{ color: 'var(--color-text-secondary)' }}>Shades · click to copy</h3>
            <div className="space-y-1">
              {currentColors.map((c, ci) => {
                const shades = shadesMap.get(c.hex) || []
                return (
                  <div key={ci} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded flex-shrink-0" style={{ backgroundColor: c.hex }} title={c.hex.toUpperCase()} />
                    <div className="flex gap-0.5 flex-1">
                      {shades.map((sh, si) => (
                        <button key={si} onClick={() => {
                          navigator.clipboard.writeText(sh.toUpperCase())
                          setCopiedShade(sh)
                          setTimeout(() => setCopiedShade(null), 1000)
                        }}
                          className="flex-1 min-w-0 rounded transition-all hover:scale-110 active:scale-95 flex items-center justify-center group disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ backgroundColor: sh, height: 36 }}
                          title={sh.toUpperCase()}
                        >
                          {copiedShade === sh
                            ? <Check className="w-3 h-3" style={{ color: getTextColor(sh) }} />
                            : <span className="text-[10px] font-mono leading-none opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 group-active:opacity-100 transition-opacity" style={{ color: getTextColor(sh) }}>{sh.toUpperCase()}</span>
                          }
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <ColorWheel colors={currentColors.map(c => c.hex)} onChange={(hex, i) => setColor(i, hex)} />
          <div className="flex flex-wrap gap-1.5">
            {currentColors.map((c, i) => (
              <button key={i} onClick={() => {
                navigator.clipboard.writeText(c.hex.toUpperCase())
                setCopiedHex(c.hex)
                setTimeout(() => setCopiedHex(null), 1000)
              }}
                className="flex items-center gap-1 px-2 py-1 rounded text-xs font-mono transition-all hover:opacity-80 active:scale-95"
                style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}
              >
                <div className="w-3 h-3 rounded" style={{ backgroundColor: c.hex }} />
                {copiedHex === c.hex ? <Check className="w-3 h-3" /> : c.hex.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {showSave && <SaveModal saveName={saveName} setSaveName={setSaveName} saveTags={saveTags} setSaveTags={setSaveTags} handleSave={handleSave} setShowSave={setShowSave} />}
    </div>
  )
}

function SaveModal({ saveName, setSaveName, saveTags, setSaveTags, handleSave, setShowSave }: {
  saveName: string; setSaveName: (v: string) => void; saveTags: string; setSaveTags: (v: string) => void
  handleSave: () => void; setShowSave: (v: boolean) => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = dialogRef.current
    if (!el) return
    const prev = document.activeElement as HTMLElement | null
    const focusable = el.querySelectorAll<HTMLElement>('input, button, [tabindex]:not([tabindex="-1"])')
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    first?.focus()

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setShowSave(false); return }
      if (e.key === 'Tab') {
        const active = document.activeElement
        if (e.shiftKey && active === first) { e.preventDefault(); last?.focus() }
        else if (!e.shiftKey && active === last) { e.preventDefault(); first?.focus() }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); prev?.focus() }
  }, [setShowSave])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowSave(false)} role="dialog" aria-modal="true" aria-label="Save palette">
      <div ref={dialogRef} className="w-full max-w-sm p-6 rounded-xl" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }} onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-bold mb-4">Save Palette</h3>
        <input value={saveName} onChange={(e) => setSaveName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="Palette name..." className="w-full px-3 py-2 rounded-lg text-sm outline-none mb-3"
          style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
        />
        <input value={saveTags} onChange={(e) => setSaveTags(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          placeholder="Tags (comma-separated) e.g. warm, pastel, summer" className="w-full px-3 py-2 rounded-lg text-sm outline-none mb-4"
          style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
        />
        <div className="flex gap-2 justify-end">
          <button onClick={() => setShowSave(false)} className="px-4 py-2 rounded-lg text-sm transition-all hover:opacity-80 hover:bg-[var(--color-bg-tertiary)] active:scale-95" style={{ border: '1px solid var(--color-border)' }}>Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 rounded-lg text-sm transition-all hover:opacity-80 active:scale-95" style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }}>Save</button>
        </div>
      </div>
    </div>
  )
}
