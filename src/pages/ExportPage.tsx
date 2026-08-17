import { useState, useMemo } from 'react'
import { usePaletteStore } from '../store/paletteStore'
import { exportPaletteJson } from '../lib/storage'
import { getTextColor, generateUUID } from '../lib/color'
import { Check, Copy } from 'lucide-react'

export function ExportPage() {
  const { currentColors } = usePaletteStore()
  const [copied, setCopied] = useState<string | null>(null)
  const [svgWidth, setSvgWidth] = useState(400)
  const [svgHeight, setSvgHeight] = useState(80)

  const colors = currentColors.map((c) => c.hex)

  function copy(text: string, id: string) {
    navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 1500)
  }

  function exportBlock(label: string, code: string, id: string) {
    return (
      <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold">{label}</h3>
          <button onClick={() => copy(code, id)} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all" style={{ border: '1px solid var(--color-border)' }}>
            {copied === id ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
            {copied === id ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <pre className="text-xs overflow-x-auto p-3 rounded-lg whitespace-pre" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', maxHeight: '240px', overflowY: 'auto', backgroundImage: 'linear-gradient(to right, transparent 95%, var(--color-bg))', backgroundRepeat: 'no-repeat', backgroundSize: '100% 100%' }}>
          {code}
        </pre>
      </div>
    )
  }

  const cssVars = useMemo(() => `:root {\n${colors.map((c, i) => `  --color-${i + 1}: ${c.toUpperCase()};`).join('\n')}\n}`, [colors])

  const tailwindV3 = useMemo(() => `// tailwind.config.js\nmodule.exports = {\n  theme: {\n    extend: {\n      colors: {\n        palette: {\n${colors.map((c, i) => `          '${i + 1}': '${c.toUpperCase()}'`).join(',\n')},\n        },\n      },\n    },\n  },\n}`, [colors])

  const tailwindV4 = useMemo(() => `@theme {\n${colors.map((c, i) => `  --color-palette-${i + 1}: ${c.toUpperCase()};`).join('\n')}\n}`, [colors])

  const rawHex = useMemo(() => colors.map((c) => c.toUpperCase()).join(', '), [colors])

  const rawHexLines = useMemo(() => colors.map((c) => c.toUpperCase()).join('\n'), [colors])

  const jsonId = useMemo(() => generateUUID(), [currentColors])
  const json = useMemo(() => exportPaletteJson({
    id: jsonId,
    name: 'My Palette',
    colors: currentColors.map((c) => ({ hex: c.hex, locked: c.locked })),
    tags: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }), [currentColors, jsonId])

  const svg = useMemo(() => `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  ${colors.map((c, i) =>
    `<rect x="${i * (svgWidth / colors.length)}" y="0" width="${svgWidth / colors.length}" height="${svgHeight}" fill="${c}" />`
  ).join('\n  ')}
</svg>`, [colors, svgWidth, svgHeight])

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Export</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            Export your palette in multiple formats
          </p>
        </div>
      </div>

      <div className="flex rounded-xl overflow-hidden h-16" style={{ border: '1px solid var(--color-border)' }}>
        {colors.map((hex, i) => (
          <div key={i} className="flex-1 flex items-center justify-center" style={{ backgroundColor: hex }}>
            <span className="text-xs font-mono opacity-0 hover:opacity-100 transition-opacity" style={{ color: getTextColor(hex) }}>{hex.toUpperCase()}</span>
          </div>
        ))}
      </div>

      <div className="rounded-xl p-4 flex items-center gap-4 flex-wrap" style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)' }}>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>SVG Width:</label>
          <input type="number" min={100} max={2000} step={50} value={svgWidth}
            onChange={(e) => setSvgWidth(Math.max(100, Math.min(2000, parseInt(e.target.value) || 400)))}
            className="w-16 px-2 py-1 rounded text-xs text-center outline-none"
            style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium" style={{ color: 'var(--color-text-secondary)' }}>Height:</label>
          <input type="number" min={20} max={500} step={10} value={svgHeight}
            onChange={(e) => setSvgHeight(Math.max(20, Math.min(500, parseInt(e.target.value) || 80)))}
            className="w-16 px-2 py-1 rounded text-xs text-center outline-none"
            style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {exportBlock('CSS Variables', cssVars, 'css')}
        {exportBlock('Tailwind CSS v3 Config', tailwindV3, 'tw3')}
        {exportBlock('Tailwind CSS v4 @theme', tailwindV4, 'tw4')}
        {exportBlock('Raw Hex (comma separated)', rawHex, 'hex')}
        {exportBlock('Raw Hex (line separated)', rawHexLines, 'hexl')}
        {exportBlock('SVG Palette Sheet', svg, 'svg')}
        {exportBlock('JSON', json, 'json')}
      </div>
    </div>
  )
}


