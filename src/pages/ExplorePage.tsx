import { useState, useMemo, useEffect, useRef } from 'react'
import { builtInPalettes } from '../lib/palettes'
import { usePaletteStore } from '../store/paletteStore'
import { useDebounce } from '../lib/useDebounce'
import { Search, Palette } from 'lucide-react'

const moods = ['Vibrant', 'Cool', 'Nature', 'Warm', 'Dark', 'Pastel'] as const

const TOP_TAGS = [
  'brand', 'dark', 'travel', 'ui', 'warm', 'google', 'nature', 'retro',
  'gaming', 'food', 'material', 'neon', 'tailwind', 'utility', 'vibrant',
  'editor', 'forest', 'minimal', 'seasonal', 'theme',
] as const

export function ExplorePage() {
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [selectedFilters, setSelectedFilters] = useState<Set<string>>(new Set())
  const [visibleCount, setVisibleCount] = useState(20)
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setVisibleCount(20)
  }, [debouncedSearch, selectedFilters])

  const { setColors } = usePaletteStore()

  const toggleFilter = (filter: string) => {
    setSelectedFilters((prev) => {
      const next = new Set(prev)
      if (next.has(filter)) next.delete(filter)
      else next.add(filter)
      return next
    })
  }

  const resetFilters = () => setSelectedFilters(new Set())

  const hasFilters = selectedFilters.size > 0

  const filtered = useMemo(() => {
    return builtInPalettes.filter((p) => {
      if (debouncedSearch) {
        const q = debouncedSearch.toLowerCase()
        if (!p.name.toLowerCase().includes(q) && !p.tags.some((t) => t.includes(q))) return false
      }
      if (selectedFilters.size > 0) {
        return [...selectedFilters].some((f) => p.mood === f || p.tags.some((t) => t.toLowerCase() === f.toLowerCase()))
      }
      return true
    })
  }, [debouncedSearch, selectedFilters])

  useEffect(() => {
    const el = sentinelRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisibleCount((prev) => Math.min(prev + 12, filtered.length))
      }
    }, { rootMargin: '200px' })
    observer.observe(el)
    return () => observer.disconnect()
  }, [filtered.length])

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Explore Palettes</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Browse {builtInPalettes.length} curated color palettes from popular design systems and sources</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--color-text-secondary)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search palettes..."
          className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
          style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
        />
      </div>

      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin" style={{ scrollbarWidth: 'thin' }}>
        <button onClick={resetFilters} className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all hover:opacity-80 active:scale-95" style={{
          backgroundColor: !hasFilters ? 'var(--color-text)' : 'var(--color-bg-tertiary)',
          color: !hasFilters ? 'var(--color-bg)' : 'var(--color-text)',
        }}>All</button>
        {moods.map((m) => {
          const isActive = selectedFilters.has(m)
          return (
            <button key={m} onClick={() => toggleFilter(m)}
              className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all hover:opacity-80 active:scale-95"
              style={{
                backgroundColor: isActive ? 'var(--color-text)' : 'var(--color-bg-tertiary)',
                color: isActive ? 'var(--color-bg)' : 'var(--color-text)',
              }}
            >{m}</button>
          )
        })}
        {TOP_TAGS.map((tag) => {
          const isActive = selectedFilters.has(tag)
          return (
            <button key={tag} onClick={() => toggleFilter(tag)}
              className="shrink-0 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all hover:opacity-80 active:scale-95"
              style={{
                backgroundColor: isActive ? 'var(--color-text)' : 'var(--color-bg-tertiary)',
                color: isActive ? 'var(--color-bg)' : 'var(--color-text)',
              }}
            >{tag}</button>
          )
        })}
      </div>
      {hasFilters && (
        <div className="text-[11px]" style={{ color: 'var(--color-text-secondary)' }}>
          {filtered.length} palette{filtered.length !== 1 ? 's' : ''} match your filters
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.slice(0, visibleCount).map((p, i) => (
          <button
            key={i}
            onClick={() => setColors(p.colors.map((hex) => ({ hex, locked: false })))}
            className="group text-left rounded-xl overflow-hidden transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ border: '1px solid var(--color-border)' }}
          >
            <div className="flex h-24">
              {p.colors.map((hex, ci) => (
                <div key={ci} className="flex-1" style={{ backgroundColor: hex }} />
              ))}
            </div>
            <div className="p-3">
              <h3 className="font-semibold text-sm">{p.name}</h3>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {p.tags.slice(0, 3).map((t, ti) => (
                  <span key={ti} className="text-xs px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text-secondary)' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </button>
        ))}
        {visibleCount < filtered.length && (
          <>
            {Array.from({ length: Math.min(6, filtered.length - visibleCount) }).map((_, i) => (
              <div key={`sk-${i}`} className="rounded-xl overflow-hidden animate-pulse" style={{ border: '1px solid var(--color-border)' }}>
                <div className="flex h-24" style={{ backgroundColor: 'var(--color-bg-tertiary)' }}>
                  {Array.from({ length: Math.min(5, filtered[0]?.colors.length || 5) }).map((_, ci) => (
                    <div key={ci} className="flex-1" style={{ backgroundColor: 'var(--color-bg-secondary)' }} />
                  ))}
                </div>
                <div className="p-3 space-y-2">
                  <div className="h-4 w-2/3 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)' }} />
                  <div className="flex gap-1.5">
                    <div className="h-3 w-12 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)' }} />
                    <div className="h-3 w-16 rounded" style={{ backgroundColor: 'var(--color-bg-tertiary)' }} />
                  </div>
                </div>
              </div>
            ))}
            <div ref={sentinelRef} className="h-4" />
          </>
        )}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16" style={{ color: 'var(--color-text-secondary)' }}>
          <Palette className="w-12 h-12 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No palettes found</p>
          <p className="text-sm">Try a different search or tag combination</p>
        </div>
      )}
    </div>
  )
}
