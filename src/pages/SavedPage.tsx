import { useState } from 'react'
import { usePaletteStore } from '../store/paletteStore'
import { exportPaletteJson, downloadJson, importPaletteJson } from '../lib/storage'
import { useDebounce } from '../lib/useDebounce'
import { getTextColor } from '../lib/color'
import { Search, Trash2, Download, Upload, Edit3, Palette, Tag, RotateCcw, Layers } from 'lucide-react'

export function SavedPage() {
  const { savedPalettes, loadPalette, setColors, deletePalette, updatePalette, importPalette } = usePaletteStore()
  const [search, setSearch] = useState('')
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [importError, setImportError] = useState<string | null>(null)

  const debouncedSearch = useDebounce(search, 200)
  const collections = [...new Set(savedPalettes.map((p) => p.collection).filter(Boolean))] as string[]

  const filtered = savedPalettes.filter((p) => {
    const matchSearch = !debouncedSearch || p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || p.tags.some((t) => t.includes(debouncedSearch.toLowerCase()))
    const matchCollection = !selectedCollection || p.collection === selectedCollection
    return matchSearch && matchCollection
  })

  function handleExport(palette: typeof savedPalettes[0]) {
    const json = exportPaletteJson(palette)
    downloadJson(json, `${palette.name.replace(/\s+/g, '-').toLowerCase()}.json`)
  }

  function handleImport() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      try {
        setImportError(null)
        if (file.size > 10 * 1024 * 1024) { setImportError('File too large (>10MB)'); return }
        const text = await file.text()
        const palette = importPaletteJson(text)
        if (palette) {
          importPalette(palette)
        } else {
          setImportError('Invalid palette JSON file')
        }
      } catch (e) {
        setImportError('Failed to import: ' + (e instanceof Error ? e.message : 'Unknown error'))
      }
    }
    input.click()
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Saved Palettes</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>{savedPalettes.length} saved</p>
        </div>
        <div className="flex items-center gap-2">
          {importError && <p className="text-xs" style={{ color: 'var(--color-danger)' }}>{importError}</p>}
          <button onClick={handleImport} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80" style={{ border: '1px solid var(--color-border)' }}>
            <Upload className="w-4 h-4" /> Import JSON
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or tag..."
            className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
            style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          />
        </div>
        {collections.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setSelectedCollection(null)} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium" style={{
              backgroundColor: !selectedCollection ? 'var(--color-accent)' : 'transparent',
              color: !selectedCollection ? '#ffffff' : 'var(--color-text)',
              border: `1px solid ${!selectedCollection ? 'var(--color-accent)' : 'var(--color-border)'}`,
            }}>
              <Layers className="w-3 h-3" /> All
            </button>
            {collections.map((c) => (
              <button key={c} onClick={() => setSelectedCollection(c)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{
                backgroundColor: selectedCollection === c ? 'var(--color-text)' : 'var(--color-bg-tertiary)',
                color: selectedCollection === c ? 'var(--color-bg)' : 'var(--color-text)',
              }}>{c}</button>
            ))}
          </div>
        )}
      </div>

      {filtered.length === 0 && savedPalettes.length === 0 && (
        <div className="text-center py-16" style={{ color: 'var(--color-text-secondary)' }}>
          <Palette className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No saved palettes yet</p>
          <p className="text-sm">Generate a palette and save it — it'll appear here</p>
        </div>
      )}

      {filtered.length === 0 && savedPalettes.length > 0 && (
        <div className="text-center py-16" style={{ color: 'var(--color-text-secondary)' }}>
          <Palette className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No palettes match your filters</p>
          <button onClick={() => { setSearch(''); setSelectedCollection(null) }} className="flex items-center gap-1 text-xs font-medium mx-auto mt-2 transition-all hover:opacity-70" style={{ color: 'var(--color-accent)' }}>
            <RotateCcw className="w-3 h-3" /> Clear filters
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <button onClick={() => loadPalette(p.id)} className="w-full text-left group">
              <div className="flex h-20">
                {p.colors.map((c, ci) => (
                  <div key={ci} className="flex-1 flex items-center justify-center" style={{ backgroundColor: c.hex }}>
                    <span className="text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: getTextColor(c.hex), textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                      {c.hex.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </button>
            <div className="p-3 space-y-2">
              {editingId === p.id ? (
                <div className="flex gap-2">
                  <input
                    autoFocus
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { updatePalette(p.id, { name: editName }); setEditingId(null) }
                      if (e.key === 'Escape') setEditingId(null)
                    }}
                    className="flex-1 px-2 py-1 rounded text-sm outline-none"
                    style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm truncate">{p.name}</h3>
                  <button onClick={() => { setEditingId(p.id); setEditName(p.name) }} className="p-1 hover:opacity-60">
                    <Edit3 className="w-3 h-3" style={{ color: 'var(--color-text-secondary)' }} />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                <Tag className="w-3 h-3" />
                <span>{p.tags.length > 0 ? p.tags.join(', ') : 'No tags'}</span>
              </div>
              <div className="flex items-center gap-2 justify-end pt-1">
                <button onClick={() => setColors(p.colors.map((c) => ({ hex: c.hex, locked: false })))} className="px-3 py-1 rounded text-xs font-medium transition-all hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed" style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)' }}>
                  Apply
                </button>
                <button onClick={() => handleExport(p)} className="p-1.5 rounded hover:opacity-60" title="Export JSON">
                  <Download className="w-3.5 h-3.5" style={{ color: 'var(--color-text-secondary)' }} />
                </button>
                <button onClick={() => deletePalette(p.id)} className="p-1.5 rounded hover:opacity-60" title="Delete">
                  <Trash2 className="w-3.5 h-3.5" style={{ color: 'var(--color-danger)' }} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
