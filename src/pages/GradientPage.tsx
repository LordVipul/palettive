import { useState, useEffect } from 'react'
import { usePaletteStore } from '../store/paletteStore'

export function GradientPage() {
  const { currentColors } = usePaletteStore()
  const palette = currentColors.map((c) => c.hex)
  const [angle, setAngle] = useState(90)
  const [type, setType] = useState<'linear' | 'radial'>('linear')
  const [color1Idx, setColor1Idx] = useState(0)
  const [color2Idx, setColor2Idx] = useState(Math.min(1, palette.length - 1))

  useEffect(() => {
    setColor1Idx((i) => Math.min(i, palette.length - 1))
    setColor2Idx((i) => Math.min(i, palette.length - 1))
  }, [palette.length])

  const color1 = palette[color1Idx] || '#6366f1'
  const color2 = palette[color2Idx] || '#8b5cf6'

  const gradientCss = type === 'linear'
    ? `linear-gradient(${angle}deg, ${color1}, ${color2})`
    : `radial-gradient(circle, ${color1}, ${color2})`

  function copy(text: string) { navigator.clipboard.writeText(text) }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-2xl font-bold">Gradient Generator</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>2-color gradients from your palette</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        {/* Section 1: Colors & Angle */}
        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <h3 className="text-base font-bold mb-4">Colors & Angle</h3>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Color 1</p>
              <div className="flex gap-2 flex-wrap">
                {palette.map((hex, i) => (
                  <button key={i} onClick={() => setColor1Idx(i)}
                    className="w-9 h-9 rounded-lg transition-all hover:scale-110 active:scale-95"
                    style={{
                      backgroundColor: hex,
                      outline: i === color1Idx ? '2px solid var(--color-accent)' : 'none',
                      outlineOffset: 2,
                    }}
                    title={hex.toUpperCase()}
                  />
                ))}
              </div>
              <p className="text-xs font-mono mt-1.5" style={{ color: 'var(--color-text)' }}>{color1.toUpperCase()}</p>
            </div>
            <div>
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--color-text-secondary)' }}>Color 2</p>
              <div className="flex gap-2 flex-wrap">
                {palette.map((hex, i) => (
                  <button key={i} onClick={() => setColor2Idx(i)}
                    className="w-9 h-9 rounded-lg transition-all hover:scale-110 active:scale-95"
                    style={{
                      backgroundColor: hex,
                      outline: i === color2Idx ? '2px solid var(--color-accent)' : 'none',
                      outlineOffset: 2,
                    }}
                    title={hex.toUpperCase()}
                  />
                ))}
              </div>
              <p className="text-xs font-mono mt-1.5" style={{ color: 'var(--color-text)' }}>{color2.toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setType('linear')} className="px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{
                backgroundColor: type === 'linear' ? 'var(--color-text)' : 'var(--color-bg-tertiary)',
                color: type === 'linear' ? 'var(--color-bg)' : 'var(--color-text)',
              }}>Linear</button>
              <button onClick={() => setType('radial')} className="px-4 py-2 rounded-lg text-sm font-medium transition-all" style={{
                backgroundColor: type === 'radial' ? 'var(--color-text)' : 'var(--color-bg-tertiary)',
                color: type === 'radial' ? 'var(--color-bg)' : 'var(--color-text)',
              }}>Radial</button>
            </div>
            {type === 'linear' && (
              <div className="space-y-2">
                <label className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Angle</label>
                <div className="flex items-center gap-2">
                  <input type="number" min={0} max={360} value={angle} onChange={(e) => setAngle(Math.max(0, Math.min(360, parseInt(e.target.value) || 0)))}
                    className="w-20 px-2 py-1.5 rounded text-sm text-center outline-none"
                    style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                  <input type="range" min={0} max={360} value={angle} onChange={(e) => setAngle(parseInt(e.target.value))} className="flex-1" />
                </div>
              </div>
            )}
            <div className="w-full rounded-xl" style={{ height: 160, background: gradientCss, border: '1px solid var(--color-border)' }} />
          </div>
        </div>

        {/* Section 2: UI Previews */}
        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <h3 className="text-base font-bold mb-3">UI Previews</h3>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>How your gradient looks on real elements</p>
          <div className="space-y-4">
            <GradientCard gradient={gradientCss} />
            <GradientButton gradient={gradientCss} />
            <GradientBadge gradient={gradientCss} />
            <GradientDivider gradient={gradientCss} />
          </div>
        </div>

        {/* Section 3: Export */}
        <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
          <h3 className="text-base font-bold mb-3">Export</h3>
          <div className="space-y-3">
            <CodeBox label="CSS" code={`background: ${gradientCss};`} onCopy={copy} />
            <CodeBox label="Tailwind v3" code={`module.exports = {\n  theme: {\n    extend: {\n      backgroundImage: {\n        'gradient-palette': '${gradientCss}',\n      },\n    },\n  },\n}`} onCopy={copy} />
            <CodeBox label="Tailwind v4" code={`@theme {\n  --gradient-palette: ${gradientCss};\n}`} onCopy={copy} />
            <CodeBox label="SVG" code={`<svg width="400" height="200" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="${color2}" />
    </linearGradient>
  </defs>
  <rect width="400" height="200" fill="url(#g)" />
</svg>`} onCopy={copy} />
          </div>
        </div>
      </div>
    </div>
  )
}

function GradientCard({ gradient }: { gradient: string }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
      <div className="h-24" style={{ background: gradient }} />
      <div className="p-3" style={{ backgroundColor: 'var(--color-bg)' }}>
        <p className="font-semibold text-sm">Gradient Card</p>
        <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>A preview card with your gradient as the hero background</p>
      </div>
    </div>
  )
}

function GradientButton({ gradient }: { gradient: string }) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <button className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90 active:scale-95" style={{ background: gradient }}>Gradient Button</button>
    </div>
  )
}

function GradientBadge({ gradient }: { gradient: string }) {
  return (
    <div className="flex gap-2 items-center">
      <span className="text-xs px-2.5 py-1 rounded-full font-medium text-white" style={{ background: gradient }}>New</span>
      <span className="text-xs px-2.5 py-1 rounded font-medium text-white" style={{ background: gradient }}>Featured</span>
    </div>
  )
}

function GradientDivider({ gradient }: { gradient: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Section</span>
      <div className="flex-1 h-0.5 rounded-full" style={{ background: gradient }} />
      <span className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Divider</span>
    </div>
  )
}

function CodeBox({ label, code, onCopy }: { label: string; code: string; onCopy: (s: string) => void }) {
  const [copied, setCopied] = useState(false)
  return (
    <div className="rounded-lg" style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
      <div className="flex items-center justify-between px-3 pt-3 pb-1.5 sticky top-0 z-10" style={{ backgroundColor: 'var(--color-bg)' }}>
        <span className="text-xs font-medium">{label}</span>
        <button onClick={() => { onCopy(code); setCopied(true); setTimeout(() => setCopied(false), 1200) }}
          className="text-xs font-medium transition-all hover:opacity-70"
          style={{ color: copied ? 'var(--color-success)' : 'var(--color-accent)' }}
        >{copied ? 'Copied!' : 'Copy'}</button>
      </div>
      <pre className="text-[11px] font-mono whitespace-pre-wrap overflow-x-auto max-h-32 overflow-y-auto px-3 pb-3" style={{ color: 'var(--color-text-secondary)' }}>{code}</pre>
    </div>
  )
}
