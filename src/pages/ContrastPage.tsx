import { usePaletteStore } from '../store/paletteStore'
import { getContrastRatio, meetsAA, meetsAAA, simulateColorBlindness, getTextColor } from '../lib/color'
import { useState, useMemo } from 'react'
import type { BlindnessType } from '../types'

export function ContrastPage() {
  const { currentColors } = usePaletteStore()
  const [blindSim, setBlindSim] = useState<BlindnessType>('none')

  const colors = useMemo(() => currentColors.map((c) => c.hex), [currentColors])

  const simulatedCache = useMemo(() => {
    const map = new Map<string, string>()
    if (blindSim !== 'none') {
      for (const c of colors) map.set(c, simulateColorBlindness(c, blindSim))
    }
    return map
  }, [colors, blindSim])

  const pairs = useMemo(() => {
    const result: { bg: string; fg: string; ratio: number }[] = []
    for (let i = 0; i < colors.length; i++) {
      for (let j = i + 1; j < colors.length; j++) {
        const bg = colors[i]
        const fg = colors[j]
        const fgFinal = simulatedCache.get(fg) ?? fg
        const bgFinal = simulatedCache.get(bg) ?? bg
        const ratio1 = getContrastRatio(fgFinal, bgFinal)
        const ratio2 = getContrastRatio(bgFinal, fgFinal)
        const higher = ratio1 >= ratio2
          ? { bg: colors[i], fg: colors[j], ratio: ratio1 }
          : { bg: colors[j], fg: colors[i], ratio: ratio2 }
        result.push(higher)
      }
    }
    return result
  }, [colors, simulatedCache])

  if (colors.length < 2) {
    return (
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">Contrast Checker</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Add at least 2 colors to see contrast comparisons.</p>
      </div>
    )
  }

  const showMatrix = colors.length <= 5

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Contrast Checker</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>WCAG 2.1 contrast ratios between all color pairs</p>
        </div>
        <select
          value={blindSim}
          onChange={(e) => setBlindSim(e.target.value as BlindnessType)}
          className="px-3 py-1.5 rounded-lg text-sm outline-none"
          style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
        >
          <option value="none">Normal vision</option>
          <option value="protanopia">Protanopia</option>
          <option value="deuteranopia">Deuteranopia</option>
          <option value="tritanopia">Tritanopia</option>
          <option value="achromatopsia">Achromatopsia</option>
        </select>
      </div>

      {showMatrix ? (
        <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="p-3 text-left text-xs font-medium uppercase tracking-wider sticky left-0 z-10" style={{ backgroundColor: 'var(--color-bg-secondary)', color: 'var(--color-text-secondary)' }}>Foreground ↓ / Background →</th>
                  {colors.map((c, i) => (
                    <th key={i} className="p-3 text-center text-xs font-mono sticky top-0 z-10" style={{ backgroundColor: c, color: getTextColor(c) }}>{c.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {colors.map((fg, fi) => (
                  <tr key={fi}>
                    <td className="p-3 font-mono text-xs font-medium sticky left-0 z-10" style={{ backgroundColor: fg, color: getTextColor(fg) }}>{fg.toUpperCase()}</td>
                    {colors.map((bg, bi) => {
                      if (fg === bg) return <td key={bi} className="p-3 text-center text-xs" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>—</td>
                      const fgSim = simulatedCache.get(fg) ?? fg
                      const bgSim = simulatedCache.get(bg) ?? bg
                      const ratio = getContrastRatio(fgSim, bgSim)
                      const aa = meetsAA(ratio)
                      const aaa = meetsAAA(ratio)
                      return (
                        <td key={bi} className="p-3 text-center" style={{ backgroundColor: bg }}>
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-xs font-mono font-bold" style={{ color: getTextColor(bg) }}>{ratio.toFixed(1)}</span>
                            <span className="text-xs px-1 rounded" style={{
                              backgroundColor: aaa ? '#22c55e' : aa ? '#f59e0b' : '#ef4444',
                              color: '#ffffff'
                            }}>
                              {aaa ? 'AAA' : aa ? 'AA' : 'Fail'}
                            </span>
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <p className="text-xs font-medium mb-3" style={{ color: 'var(--color-text-secondary)' }}>Showing unique pairs sorted by ratio (matrix hidden for &gt;5 colors)</p>
          <div className="space-y-1">
            {[...pairs].sort((a, b) => a.ratio - b.ratio).map((p, i) => {
              const aa = meetsAA(p.ratio)
              const aaa = meetsAAA(p.ratio)
              return (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ backgroundColor: p.bg }}>
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: p.fg }} />
                  <span className="text-xs font-mono flex-1" style={{ color: getTextColor(p.bg) }}>{p.fg.toUpperCase()} on {p.bg.toUpperCase()}</span>
                  <span className="text-xs font-mono" style={{ color: getTextColor(p.bg) }}>{p.ratio.toFixed(1)}:1</span>
                  <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{
                    backgroundColor: aaa ? 'var(--color-success)' : aa ? 'var(--color-warning)' : 'var(--color-danger)',
                    color: '#ffffff'
                  }}>
                    {aaa ? 'AAA' : aa ? 'AA' : 'Fail'}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <h3 className="font-semibold text-sm mb-3">On White / On Black</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {['#ffffff', '#000000'].map((bg) => (
            <div key={bg}>
              <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>On {bg === '#ffffff' ? 'White' : 'Black'}</p>
              {colors.map((fg) => {
                const fgSim = simulatedCache.get(fg) ?? fg
                const ratio = getContrastRatio(fgSim, bg)
                const aa = meetsAA(ratio)
                return (
                  <div key={fg} className="flex items-center gap-3 px-3 py-2 rounded-lg mb-1" style={{ backgroundColor: bg }}>
                    <div className="w-6 h-6 rounded" style={{ backgroundColor: fg }} />
                    <span className="text-xs font-mono flex-1" style={{ color: fg }}>{fg.toUpperCase()}</span>
                    <span className="text-xs font-mono" style={{ color: fg }}>{ratio.toFixed(1)}:1</span>
                    <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{
                      backgroundColor: aa ? 'color-mix(in srgb, var(--color-success) 20%, transparent)' : 'color-mix(in srgb, var(--color-danger) 20%, transparent)',
                      color: aa ? 'var(--color-success)' : 'var(--color-danger)'
                    }}>
                      {aa ? 'PASS' : 'FAIL'}
                    </span>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
