import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { usePaletteStore } from '../../store/paletteStore'
import { Lock, Unlock, Shuffle, Palette, Compass, Bookmark, Image, Eye, Contrast, Droplets, Download, Sun, Moon, Menu, X } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getTextColor } from '../../lib/color'
import { useNotificationStore } from '../../store/notificationStore'
import type { HarmonyRule } from '../../types'

const navItems = [
  { to: '/', icon: Palette, label: 'Generator' },
  { to: '/explore', icon: Compass, label: 'Explore' },
  { to: '/saved', icon: Bookmark, label: 'Saved' },
  { to: '/image', icon: Image, label: 'Image' },
  { to: '/preview', icon: Eye, label: 'Preview' },
  { to: '/contrast', icon: Contrast, label: 'Contrast' },
  { to: '/gradient', icon: Droplets, label: 'Gradient' },
  { to: '/export', icon: Download, label: 'Export' },
]

export function Layout() {
  const darkMode = usePaletteStore((s) => s.darkMode)
  const toggleDarkMode = usePaletteStore((s) => s.toggleDarkMode)
  const currentColors = usePaletteStore((s) => s.currentColors)
  const toggleLock = usePaletteStore((s) => s.toggleLock)
  const setColor = usePaletteStore((s) => s.setColor)
  const generatePalette = usePaletteStore((s) => s.generatePalette)
  const setHarmonyRule = usePaletteStore((s) => s.setHarmonyRule)
  const setIntensity = usePaletteStore((s) => s.setIntensity)
  const reorderColors = usePaletteStore((s) => s.reorderColors)
  const undo = usePaletteStore((s) => s.undo)
  const redo = usePaletteStore((s) => s.redo)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const location = useLocation()
  const primary = currentColors[0]?.hex || '#6366f1'

  useEffect(() => {
    const rules: HarmonyRule[] = ['complementary', 'analogous', 'triadic', 'split-complementary', 'square', 'monochromatic', 'random']
    const handleKeyDown = (e: KeyboardEvent) => {
      const editing = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target instanceof HTMLElement && e.target.isContentEditable)
      const mod = e.ctrlKey || e.metaKey
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) redo()
        else undo()
        return
      }
      if (mod && e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return }
      if (editing || e.target instanceof HTMLButtonElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLAnchorElement) return
      if (document.querySelector('[role="dialog"]')) return
      if (e.code === 'Space' && !e.ctrlKey && !e.altKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault()
        setHarmonyRule(rules[Math.floor(Math.random() * rules.length)])
        setIntensity(0.3 + Math.random() * 0.7)
        generatePalette()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [generatePalette, setHarmonyRule, setIntensity, undo, redo])

  const currentLabel = navItems.find((n) =>
    n.to === '/' ? location.pathname === '/' : location.pathname.startsWith(n.to)
  )?.label || 'Generator'

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-full sm:w-80 lg:w-64 transform transition-transform duration-200 ease-in-out
        lg:relative lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `} style={{ backgroundColor: 'var(--color-bg-secondary)', borderRight: `1px solid var(--color-border)` }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.08, backgroundColor: primary, pointerEvents: 'none' }} />
        <div className="relative flex flex-col h-full">
          <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--color-border)' }}>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors" style={{ backgroundColor: primary }}>
                <Palette className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold" style={{ fontFamily: 'var(--font-pp-heading)' }}>Palettive</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 rounded-md hover:opacity-70 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none">
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="p-3 space-y-1 overflow-y-auto flex-1">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}
                onClick={() => setSidebarOpen(false)}
                className={"flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 hover:bg-[var(--color-accent)]/10 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:outline-none"}
                style={({ isActive }: { isActive: boolean }) => ({
                  backgroundColor: isActive ? primary : undefined,
                  color: isActive ? getTextColor(primary) : 'var(--color-text-secondary)',
                })}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="flex items-center justify-between px-4 lg:px-6 py-3 border-b" style={{ backgroundColor: 'var(--color-bg)', borderColor: 'var(--color-border)', borderBottomWidth: 2, borderBottomColor: primary + '40' }}>
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 -ml-2 rounded-md hover:opacity-70 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none">
            <Menu className="w-5 h-5" />
          </button>
          <div className="text-sm font-medium" style={{ color: 'var(--color-accent)' }}>{currentLabel}</div>
          <div className="flex items-center gap-2">
            <button onClick={toggleDarkMode} className="p-2 rounded-lg transition-all duration-200 hover:opacity-70 focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:outline-none" style={{ backgroundColor: 'var(--color-bg-secondary)' }} title={darkMode ? 'Light mode' : 'Dark mode'}> 
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </header>

        <div className="flex items-stretch border-b" style={{ borderColor: 'var(--color-border)' }}>
          {currentColors.map((c, i) => (
            <div key={i} className="flex-1 flex flex-col items-center justify-center py-1.5 relative group min-w-0" style={{ backgroundColor: c.hex, minHeight: 78 }}
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={(e) => { e.preventDefault(); if (dragIdx !== null && dragIdx !== i) reorderColors(dragIdx, i); setDragIdx(i) }}
              onDragEnd={() => setDragIdx(null)}
            >
              <input type="color" value={c.hex} onChange={(e) => setColor(i, e.target.value)}
                className="w-0 h-0 opacity-0 absolute" id={`palette-color-${i}`}
              />
              <label htmlFor={`palette-color-${i}`}
                className="text-xs font-mono font-medium px-2 py-0.5 rounded cursor-pointer"
                style={{ backgroundColor: getTextColor(c.hex) + '20', color: getTextColor(c.hex) }}
              >{c.hex.toUpperCase()}</label>
              <div className="flex items-center gap-0.5 mt-0.5">
                <div className="opacity-0 group-hover:opacity-60 cursor-grab active:cursor-grabbing p-2" style={{ color: getTextColor(c.hex) }}>
                  <svg className="w-4 h-4" viewBox="0 0 8 8" fill="currentColor"><circle cx="4" cy="1" r="1" /><circle cx="4" cy="4" r="1" /><circle cx="4" cy="7" r="1" /></svg>
                </div>
                <button onClick={() => toggleLock(i)} className="p-2 rounded hover:bg-black/20 min-w-[44px] min-h-[44px] flex items-center justify-center" title={c.locked ? 'Unlock' : 'Lock'}>
                  {c.locked ? <Lock className="w-3.5 h-3.5" style={{ color: getTextColor(c.hex) }} /> : <Unlock className="w-3.5 h-3.5" style={{ color: getTextColor(c.hex) }} />}
                </button>
              </div>
            </div>
          ))}
          <button onClick={generatePalette}
            className="px-2.5 flex items-center gap-1 text-xs font-medium transition-all hover:opacity-80 active:scale-95"
            style={{ backgroundColor: 'var(--color-bg-tertiary)', color: 'var(--color-text)' }}
          >
            <Shuffle className="w-3 h-3" /> Space
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}

function ToastContainer() {
  const notifications = useNotificationStore((s) => s.notifications)
  const remove = useNotificationStore((s) => s.removeNotification)
  const [leaving, setLeaving] = useState<Set<string>>(new Set())
  const [entered, setEntered] = useState<Set<string>>(new Set())

  useEffect(() => {
    const ids = notifications.filter((n) => !entered.has(n.id)).map((n) => n.id)
    if (ids.length === 0) return
    const t = setTimeout(() => setEntered((s) => { const n = new Set(s); for (const id of ids) n.add(id); return n }), 30)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications])

  useEffect(() => {
    if (notifications.length === 0) return
    const id = notifications[notifications.length - 1].id
    const t = setTimeout(() => setLeaving((s) => { const n = new Set(s); n.add(id); return n }), 3000)
    return () => clearTimeout(t)
  }, [notifications.length])

  if (notifications.length === 0) return null
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 pointer-events-none">
      {notifications.map((n) => (
        <div key={n.id}
          className={`pointer-events-auto px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg transition-all duration-300 ease-in-out ${leaving.has(n.id) || !entered.has(n.id) ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}`}
          style={{
            backgroundColor: n.type === 'error' ? 'var(--color-danger)' : n.type === 'info' ? 'var(--color-accent)' : 'var(--color-success)',
            color: '#ffffff',
          }}
        >
          <div className="flex items-center gap-2">
            <span>{n.message}</span>
            <button onClick={() => remove(n.id)} className="opacity-70 hover:opacity-100 text-white">✕</button>
          </div>
        </div>
      ))}
    </div>
  )
}


