import { useState, useCallback, useEffect, useMemo, memo } from 'react'
import { usePaletteStore } from '../store/paletteStore'
import { fontOptions } from '../lib/fonts'
import { getTextColor } from '../lib/color'
import '@fontsource-variable/dm-sans'
import '@fontsource-variable/outfit'
import '@fontsource-variable/fraunces'
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/space-grotesk'
import '@fontsource-variable/manrope'
import '@fontsource/dm-serif-display'
import '@fontsource/young-serif'
import type { FontOption } from '../types'

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const btnBase = 'transition-all hover:opacity-80 active:scale-[0.97] cursor-pointer'

const BoltIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
const AccessibilityIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="4" r="1.5" /><path d="M16 10h-8" /><path d="M12 8v8" /><path d="M8 16h8" /></svg>
const CodeIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>
const EyeIcon = () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>

interface PreviewProps {
  palette: string[]
  headingFont: string
  bodyFont: string
  cardBg: string
  border: string
  muted: string
  text: string
  bg: string
}

export function PreviewPage() {
  const { currentColors } = usePaletteStore()
  const [headingFont, setHeadingFont] = useState<FontOption>(fontOptions[6])
  const [bodyFont, setBodyFont] = useState<FontOption>(fontOptions[0])
  const [previewBg, setPreviewBg] = useState<'light' | 'dark'>('light')

  const palette = useMemo(() => currentColors.map((c) => c.hex), [currentColors])

  const randomizeFonts = useCallback(() => {
    const others = fontOptions.filter((f) => f.name !== headingFont.name && f.name !== bodyFont.name)
    const shuffled = shuffleArray(others)
    const heading = shuffled.find((f) => f.category === 'serif') || shuffled[0]
    const body = shuffled.find((f) => f.category === 'sans-serif' && f.name !== heading.name) || shuffled[1]
    setHeadingFont(heading)
    setBodyFont(body)
  }, [headingFont.name, bodyFont.name])

  useEffect(() => {
    const allDark = palette.every((hex) => getTextColor(hex) === '#ffffff')
    const allLight = palette.every((hex) => getTextColor(hex) === '#000000')
    if (allDark) setPreviewBg('dark')
    else if (allLight) setPreviewBg('light')
  }, [palette])

  const text = previewBg === 'light' ? '#0c0a09' : '#fafaf9'
  const bg = previewBg === 'light' ? '#fafaf9' : '#0c0a09'
  const muted = previewBg === 'light' ? '#78716c' : '#a8a29e'
  const cardBg = previewBg === 'light' ? '#ffffff' : '#1c1917'
  const borderC = previewBg === 'light' ? '#e7e5e4' : '#292524'

  const sharedProps = useMemo<PreviewProps>(() => ({
    palette, headingFont: headingFont.cssFamily, bodyFont: bodyFont.cssFamily, cardBg, border: borderC, muted, text, bg
  }), [palette, headingFont.cssFamily, bodyFont.cssFamily, cardBg, borderC, muted, text, bg])

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-bold">UI Preview</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>See your palette on real interface components</p>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <select value={headingFont.name} onChange={(e) => setHeadingFont(fontOptions.find((f) => f.name === e.target.value) || fontOptions[6])}
            className="px-2 py-1.5 rounded-lg text-xs outline-none"
            style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          >{fontOptions.map((f) => (<option key={f.name} value={f.name}>{f.name}</option>))}</select>
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>heading</span>
          <select value={bodyFont.name} onChange={(e) => setBodyFont(fontOptions.find((f) => f.name === e.target.value) || fontOptions[0])}
            className="px-2 py-1.5 rounded-lg text-xs outline-none"
            style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
          >{fontOptions.map((f) => (<option key={f.name} value={f.name}>{f.name}</option>))}</select>
          <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>body</span>
          <button onClick={randomizeFonts} className="px-2 py-1.5 rounded-lg text-xs font-medium transition-all hover:opacity-80" style={{ border: '1px solid var(--color-border)' }}>
            Random
          </button>
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
            <button onClick={() => setPreviewBg('light')} className="px-2.5 py-1.5 text-xs font-medium transition-all" style={{ backgroundColor: previewBg === 'light' ? 'var(--color-text)' : 'transparent', color: previewBg === 'light' ? 'var(--color-bg)' : 'var(--color-text)' }}>Light</button>
            <button onClick={() => setPreviewBg('dark')} className="px-2.5 py-1.5 text-xs font-medium transition-all" style={{ backgroundColor: previewBg === 'dark' ? 'var(--color-text)' : 'transparent', color: previewBg === 'dark' ? 'var(--color-bg)' : 'var(--color-text)' }}>Dark</button>
          </div>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}>
        <div className="p-4 sm:p-5 space-y-5" style={{ backgroundColor: bg, color: text, fontFamily: bodyFont.cssFamily }}>
          <SectionLabel label="Hero" />
          <HeroSection {...sharedProps} />
          <SectionLabel label="Feature Cards" />
          <FeatureCardsMemo {...sharedProps} />
          <SectionLabel label="Typography" />
          <TypographyPreviewMemo {...sharedProps} />
          <SectionLabel label="Navigation" />
          <NavbarPreviewMemo {...sharedProps} />
          <SectionLabel label="Data Display" />
          <StatCardsPreviewMemo {...sharedProps} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ProfileCardsPreviewMemo {...sharedProps} />
            <PricingCardsPreviewMemo {...sharedProps} />
          </div>
          <SectionLabel label="Forms & Tables" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <FormPreviewMemo {...sharedProps} />
            <TablePreviewMemo {...sharedProps} />
          </div>
          <SectionLabel label="Tabs & Breadcrumbs" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <TabsPreviewMemo {...sharedProps} />
            <BreadcrumbsPreviewMemo {...sharedProps} />
            <PaginationPreviewMemo {...sharedProps} />
          </div>
          <SectionLabel label="Feedback" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <BadgesPreviewMemo {...sharedProps} />
            <AlertsPreviewMemo {...sharedProps} />
            <TagsPreviewMemo {...sharedProps} />
          </div>
          <SectionLabel label="Progress & Toggles" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ProgressPreviewMemo {...sharedProps} />
            <TogglePreviewMemo {...sharedProps} />
          </div>
          <SectionLabel label="Avatars & Empty State" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AvatarPreviewMemo {...sharedProps} />
            <EmptyStatePreviewMemo {...sharedProps} />
          </div>
          <SectionLabel label="Buttons" />
          <ButtonsPreviewMemo {...sharedProps} />
        </div>
      </div>
    </div>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3" style={{ color: 'var(--color-accent)' }}>
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
      <div className="flex-1 h-px" style={{ backgroundColor: 'currentColor', opacity: 0.2 }} />
    </div>
  )
}

const HeroSection = ({ palette, headingFont }: PreviewProps) => {
  const p = (i: number) => palette[i] || '#6366f1'
  return (
    <div className="rounded-xl overflow-hidden" style={{ background: `linear-gradient(135deg, ${p(0)} 0%, ${p(1) || p(0)} 50%, ${p(2) || p(0)} 100%)` }}>
      <div className="p-6 sm:p-8" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}>
        <p className="text-xs font-medium uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Hero Section</p>
        <h1 className="text-3xl sm:text-4xl font-bold mb-2" style={{ fontFamily: headingFont, color: '#ffffff' }}>Your Palette in Action</h1>
        <p className="text-sm max-w-md" style={{ color: 'rgba(255,255,255,0.8)' }}>See how your colors work together in a real hero banner with a gradient background.</p>
        <div className="flex gap-2 mt-4">
          <button className={`px-4 py-2 rounded-lg text-sm font-medium ${btnBase}`} style={{ backgroundColor: '#ffffff', color: '#0c0a09' }}>Get Started</button>
          <button className={`px-4 py-2 rounded-lg text-sm font-medium ${btnBase}`} style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.4)' }}>Learn More</button>
        </div>
      </div>
    </div>
  )
}

const FeatureCards = ({ palette, headingFont, text }: PreviewProps) => {
  const p = (i: number) => palette[i] || '#6366f1'
  const features = [
    { title: 'Lightning Fast', desc: 'Optimized for performance with instant color generation.', icon: <BoltIcon />, color: p(0) },
    { title: 'Accessible', desc: 'All palettes meet WCAG AAA contrast standards out of the box.', icon: <AccessibilityIcon />, color: p(1) || p(0) },
    { title: 'Developer Friendly', desc: 'Export to CSS, Tailwind, SVG, or JSON with one click.', icon: <CodeIcon />, color: p(2) || p(0) },
    { title: 'Color Blind Safe', desc: 'Built-in color blindness simulation for inclusive design.', icon: <EyeIcon />, color: p(3) || p(0) },
  ]
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {features.map((f, i) => (
        <div key={i} className="rounded-xl overflow-hidden transition-all hover:shadow-lg" style={{ backgroundColor: f.color + '15', border: `1px solid ${f.color}30` }}>
          <div className="p-4">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: f.color + '25', color: f.color }}>{f.icon}</div>
            <h3 className="font-semibold text-sm mb-1" style={{ fontFamily: headingFont, color: f.color }}>{f.title}</h3>
            <p className="text-xs" style={{ color: text, opacity: 0.75 }}>{f.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

const TypographyPreview = ({ headingFont, palette, muted, cardBg, border }: PreviewProps) => {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
      <h2 className="font-bold text-lg mb-3" style={{ fontFamily: headingFont, color: palette[0] || '#6366f1' }}>Typography</h2>
      <div className="space-y-1">
        {[
          { tag: 'h1', size: 'text-3xl', text: 'Heading 1 - Display' },
          { tag: 'h2', size: 'text-2xl', text: 'Heading 2 - Section Title' },
          { tag: 'h3', size: 'text-xl', text: 'Heading 3 - Card Title' },
          { tag: 'h4', size: 'text-lg', text: 'Heading 4 - Subsection' },
          { tag: 'body', size: 'text-sm', text: 'Body text — the quick brown fox jumps over the lazy dog.' },
          { tag: 'small', size: 'text-xs', text: 'Small / caption — labels, timestamps, helper text.' },
          { tag: 'tiny', size: 'text-xs', text: 'Tiny — badges, legal, footnotes, metadata.' },
        ].map((t, i) => (
          <div key={i} className="flex items-baseline gap-3">
            <span className="text-xs font-mono w-14" style={{ color: muted }}>{t.tag}</span>
            <span className={t.size} style={{ fontFamily: t.tag.startsWith('h') ? headingFont : undefined, color: t.tag === 'h1' ? (palette[0] || '#6366f1') : undefined, fontWeight: t.tag === 'h1' ? 700 : undefined }}>
              {t.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const NavbarPreview = ({ cardBg, border, text, palette }: PreviewProps) => {
  const p = (i: number) => palette[i] || '#6366f1'
  return (
    <div className="rounded-xl p-3 flex items-center justify-between" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
      <div className="flex items-center gap-4">
        <div className="w-7 h-7 rounded flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: p(0) }}>B</div>
        <div className="hidden sm:flex gap-3 text-sm" style={{ color: text }}>
          {['Home', 'Products', 'About', 'Contact'].map((l) => (
            <span key={l} className="cursor-pointer" style={l === 'Home' ? { color: p(0), fontWeight: 600 } : {}}>{l}</span>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {palette.slice(1, 5).map((hex: string, i: number) => (
          <div key={i} className="w-4 h-4 rounded-full" style={{ backgroundColor: hex, border: `2px solid ${border}` }} />
        ))}
        <button className={`px-3 py-1.5 rounded-lg text-sm font-medium ${btnBase}`} style={{ backgroundColor: p(0), color: getTextColor(p(0)) }}>Sign Up</button>
      </div>
    </div>
  )
}

const StatCardsPreview = ({ cardBg, border, muted, palette }: PreviewProps) => {
  const stats = [
    { label: 'Revenue', value: '$48.2k', change: '+12.5%', up: true, color: palette[0] || '#6366f1' },
    { label: 'Users', value: '2,847', change: '+8.2%', up: true, color: palette[1] || palette[0] },
    { label: 'Bounce', value: '3.2%', change: '-1.4%', up: false, color: palette[2] || palette[0] },
  ]
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
      <h2 className="font-bold text-sm mb-3" style={{ color: palette[0] || '#6366f1' }}>Stat Cards</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="rounded-lg p-3" style={{ border: `1px solid ${s.color}33` }}>
            <p className="text-xs" style={{ color: muted }}>{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs" style={{ color: s.up ? '#22c55e' : '#ef4444' }}>{s.change}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

const ProfileCardsPreview = ({ cardBg, border, muted, palette, headingFont }: PreviewProps) => {
  const p = (i: number) => palette[i] || '#6366f1'
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
      <h2 className="font-bold text-sm mb-3" style={{ fontFamily: headingFont, color: p(0) }}>Profile</h2>
      <div className="flex flex-col items-center text-center p-3 rounded-lg" style={{ border: `1px solid ${border}` }}>
        <div className="w-12 h-12 rounded-full mb-2" style={{ backgroundColor: p(1) || p(0), opacity: 0.6 }} />
        <p className="font-semibold text-sm">Alex Rivera</p>
        <p className="text-xs" style={{ color: muted }}>UI/UX Designer</p>
        <div className="flex gap-1 mt-2">
          {['Design', 'UX', 'React'].map((t, i) => (
            <span key={t} className="text-[11px] px-1.5 py-0.5 rounded" style={{ backgroundColor: (palette[(i + 1) % palette.length] || p(0)) + '18', color: palette[(i + 1) % palette.length] || p(0) }}>{t}</span>
          ))}
        </div>
        <button className={`mt-3 w-full py-1.5 rounded-lg text-sm font-medium text-white ${btnBase}`} style={{ backgroundColor: p(1) || p(0) }}>Follow</button>
      </div>
    </div>
  )
}

const PricingCardsPreview = ({ cardBg, border, muted, palette, headingFont }: PreviewProps) => {
  const p = (i: number) => palette[i] || '#6366f1'
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
      <h2 className="font-bold text-sm mb-3" style={{ fontFamily: headingFont, color: p(0) }}>Pricing</h2>
      <div className="rounded-lg p-4 text-center" style={{ border: `2px solid ${p(1) || p(0)}` }}>
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: p(1) || p(0) }}>Pro</p>
        <p className="text-2xl font-bold mt-1">$29<span className="text-xs font-normal" style={{ color: muted }}>/mo</span></p>
        <ul className="text-xs mt-2 space-y-1" style={{ color: muted }}>
          {['Unlimited projects', 'Team collaboration', 'Priority support'].map((f) => (<li key={f}>{f}</li>))}
        </ul>
        <button className={`mt-3 w-full py-1.5 rounded-lg text-sm font-medium text-white ${btnBase}`} style={{ backgroundColor: p(1) || p(0) }}>Subscribe</button>
      </div>
    </div>
  )
}

const FormPreview = ({ cardBg, border, muted, palette, text }: PreviewProps) => {
  const p = (i: number) => palette[i] || '#6366f1'
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
      <h2 className="font-bold text-sm mb-3" style={{ color: p(0) }}>Form Elements</h2>
      <div className="space-y-3">
        <div><label className="block text-xs font-medium mb-1" style={{ color: muted }}>Email</label><input type="email" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ backgroundColor: border, color: text, border: 'none' }} placeholder="you@example.com" /></div>
        <div><label className="block text-xs font-medium mb-1" style={{ color: muted }}>Password</label><input type="password" className="w-full px-3 py-2 rounded-lg text-sm outline-none" style={{ backgroundColor: border, color: text, border: 'none' }} placeholder="••••••••" /></div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="remember" defaultChecked className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: p(0) }} />
          <label htmlFor="remember" className="text-xs" style={{ color: muted }}>Remember me</label>
        </div>
        <div className="flex gap-2">
          {['Admin', 'Editor', 'Viewer'].map((r) => (
            <label key={r} className="flex items-center gap-1 text-xs cursor-pointer" style={{ color: muted }}>
              <input type="radio" name="role" defaultChecked={r === 'Editor'} className="w-3.5 h-3.5 cursor-pointer" style={{ accentColor: p(0) }} />{r}
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <button className={`flex-1 py-2 rounded-lg text-sm font-medium text-white ${btnBase}`} style={{ backgroundColor: p(1) || p(0) }}>Sign In</button>
          <button className={`px-4 py-2 rounded-lg text-sm font-medium ${btnBase}`} style={{ border: `1px solid ${border}`, color: p(2) || p(0) }}>Cancel</button>
        </div>
        <div className="flex gap-1.5 pt-2 border-t" style={{ borderColor: border }}>
          {palette.map((hex: string, i: number) => (<div key={i} className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: hex }} />))}
        </div>
      </div>
    </div>
  )
}

const TablePreview = ({ cardBg, border, muted, text, palette }: PreviewProps) => {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
      <h2 className="font-bold text-sm mb-3" style={{ color: palette[0] || '#6366f1' }}>Table</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wider" style={{ color: muted }}>
              <th className="text-left pb-2 font-medium">Name</th>
              <th className="text-left pb-2 font-medium">Role</th>
              <th className="text-right pb-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody style={{ color: text }}>
            {[
              { name: 'Alex Rivera', role: 'Designer', status: 'Active' },
              { name: 'Sam Chen', role: 'Developer', status: 'Away' },
              { name: 'Jordan Lee', role: 'PM', status: 'Active' },
              { name: 'Taylor Kim', role: 'Designer', status: 'Inactive' },
            ].map((r, i) => (
              <tr key={i} className="border-t" style={{ borderColor: border }}>
                <td className="py-2 pr-2">{r.name}</td>
                <td className="py-2 pr-2">{r.role}</td>
                <td className="py-2 text-right">
                  <span className="text-[11px] px-1.5 py-0.5 rounded font-medium" style={{
                    backgroundColor: r.status === 'Active' ? (palette[2] || '#22c55e') + '22' : r.status === 'Away' ? (palette[1] || '#f59e0b') + '22' : (palette[3] || '#ef4444') + '22',
                    color: r.status === 'Active' ? (palette[2] || '#22c55e') : r.status === 'Away' ? (palette[1] || '#f59e0b') : (palette[3] || '#ef4444'),
                  }}>{r.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TabsPreviewInner({ cardBg, border, muted, palette }: PreviewProps) {
  const [tab, setTab] = useState(0)
  const p = (i: number) => palette[i] || '#6366f1'
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
      <h2 className="font-bold text-sm mb-3" style={{ color: p(0) }}>Tabs</h2>
      <div className="flex border-b gap-3" style={{ borderColor: border }}>
        {['Overview', 'Details', 'Settings'].map((t, i) => (
          <button key={t} onClick={() => setTab(i)} className="pb-2 text-sm font-medium transition-all border-b-2" style={{
            color: i === tab ? p(0) : muted, borderColor: i === tab ? p(0) : 'transparent',
          }}>{t}</button>
        ))}
      </div>
      <p className="text-sm mt-2" style={{ color: muted }}>Content for "{['Overview', 'Details', 'Settings'][tab]}" tab</p>
    </div>
  )
}

const BreadcrumbsPreview = ({ cardBg, border, muted, palette }: PreviewProps) => {
  const p = (i: number) => palette[i] || '#6366f1'
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
      <h2 className="font-bold text-sm mb-3" style={{ color: p(0) }}>Breadcrumbs</h2>
      <div className="flex items-center gap-1.5 text-sm" style={{ color: muted }}>
        <span className="cursor-pointer hover:underline" style={{ color: p(0) }}>Home</span><span>/</span>
        <span className="cursor-pointer hover:underline" style={{ color: p(1) || p(0) }}>Products</span><span>/</span>
        <span>Details</span>
      </div>
    </div>
  )
}

const PaginationPreview = ({ cardBg, border, palette }: PreviewProps) => {
  const p = (i: number) => palette[i] || '#6366f1'
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
      <h2 className="font-bold text-sm mb-3" style={{ color: p(0) }}>Pagination</h2>
      <div className="flex items-center gap-1.5">
        <button className="px-2 py-1 rounded text-sm transition-all hover:opacity-70" style={{ border: `1px solid ${border}` }}>Prev</button>
        {[1, 2, 3, 4].map((n) => (
          <button key={n} className="w-8 h-8 rounded text-sm font-medium transition-all" style={{
            backgroundColor: n === 2 ? (p(1) || p(0)) : 'transparent',
            color: n === 2 ? '#ffffff' : 'var(--color-text)',
            border: n === 2 ? 'none' : `1px solid ${border}`,
          }}>{n}</button>
        ))}
        <button className="px-2 py-1 rounded text-sm transition-all hover:opacity-70" style={{ border: `1px solid ${border}` }}>Next</button>
      </div>
    </div>
  )
}

const BadgesPreview = ({ cardBg, border, palette }: PreviewProps) => {
  const p = (i: number) => palette[i] || '#6366f1'
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
      <h2 className="font-bold text-sm mb-3" style={{ color: p(0) }}>Badges</h2>
      <div className="flex flex-wrap gap-1.5">
        {[
          { label: 'Primary', color: p(0) },
          { label: 'Secondary', color: p(1) || p(0) },
          { label: 'Accent', color: p(2) || p(0) },
          { label: 'Muted', color: p(3) || p(0) },
          { label: 'Neutral', color: palette[4] || '#78716c' },
        ].map((k) => (
          <span key={k.label} className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: k.color + '18', color: k.color }}>{k.label}</span>
        ))}
      </div>
    </div>
  )
}

const AlertsPreview = ({ cardBg, border, palette }: PreviewProps) => {
  const p = (i: number) => palette[i] || '#6366f1'
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
      <h2 className="font-bold text-sm mb-3" style={{ color: p(0) }}>Alerts</h2>
      <div className="space-y-1.5">
        {[
          { type: 'Success', color: p(1) || '#22c55e', msg: 'Palette saved successfully' },
          { type: 'Error', color: p(2) || '#ef4444', msg: 'Failed to generate palette' },
          { type: 'Warning', color: p(3) || '#f59e0b', msg: 'Low contrast on color pair' },
          { type: 'Info', color: p(0), msg: 'New update available' },
        ].map((a) => (
          <div key={a.type} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm" style={{ backgroundColor: a.color + '12', color: a.color }}>
            <span className="font-medium">{a.type}</span><span>{a.msg}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const TagsPreview = ({ cardBg, border, palette }: PreviewProps) => {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
      <h2 className="font-bold text-sm mb-3" style={{ color: palette[0] || '#6366f1' }}>Tags</h2>
      <div className="flex flex-wrap gap-1.5">
        {['Design', 'UI', 'Color', 'Palette', 'Accessibility'].map((t, i) => (
          <span key={t} className="text-[11px] px-2 py-1 rounded font-medium" style={{
            backgroundColor: (palette[i % palette.length] || '#6366f1') + '20',
            color: palette[i % palette.length] || '#6366f1',
          }}>{t}</span>
        ))}
      </div>
    </div>
  )
}

const ProgressPreview = ({ cardBg, border, muted, palette }: PreviewProps) => {
  const p = (i: number) => palette[i] || '#6366f1'
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
      <h2 className="font-bold text-sm mb-3" style={{ color: p(0) }}>Progress</h2>
      <div className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1" style={{ color: muted }}><span>Progress</span><span>65%</span></div>
          <div className="h-2 rounded-full" style={{ backgroundColor: border }}>
            <div className="h-2 rounded-full" style={{ width: '65%', backgroundColor: p(0) }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1" style={{ color: muted }}><span>Loading</span></div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: border }}>
            <div className="h-2 rounded-full w-1/3 animate-pulse" style={{ backgroundColor: p(1) || p(0) }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1" style={{ color: muted }}><span>Segmented</span></div>
          <div className="flex gap-0.5 h-2 rounded-full overflow-hidden">
            {palette.map((hex: string, i: number) => (
              <div key={i} className="h-full" style={{ width: `${100 / palette.length}%`, backgroundColor: hex }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

const TogglePreview = ({ cardBg, border, muted, palette }: PreviewProps) => {
  const p = (i: number) => palette[i] || '#6366f1'
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
      <h2 className="font-bold text-sm mb-3" style={{ color: p(0) }}>Toggles</h2>
      <div className="space-y-3">
        {[['Notifications', true], ['Dark mode', false], ['Sounds', true]].map(([label, def], i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-sm" style={{ color: muted }}>{label as string}</span>
            <button onClick={() => {}} className="w-8 h-4 rounded-full relative transition-colors" style={{ backgroundColor: def ? (p(1) || p(0)) : border }}>
              <div className="w-3 h-3 rounded-full bg-white absolute top-0.5 transition-all" style={{ left: def ? '18px' : '2px' }} />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const AvatarPreview = ({ cardBg, border, muted, palette }: PreviewProps) => {
  const p = (i: number) => palette[i] || '#6366f1'
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
      <h2 className="font-bold text-sm mb-3" style={{ color: p(0) }}>Avatars</h2>
      <div className="flex items-center gap-2">
        {[
          { initials: 'AR', color: p(0) },
          { initials: 'SC', color: p(1) || p(0) },
          { initials: 'JL', color: p(2) || p(0) },
          { initials: 'TK', color: p(3) || p(0) },
        ].map((a, i) => (
          <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: a.color }}>{a.initials}</div>
        ))}
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium" style={{ backgroundColor: border, color: muted }}>+3</div>
      </div>
      <div className="flex items-center gap-2 mt-3">
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: p(0) }}>AR</div>
        <div><p className="text-sm font-medium">Alex Rivera</p><p className="text-xs" style={{ color: muted }}>Online now</p></div>
        <div className="w-1.5 h-1.5 rounded-full ml-auto" style={{ backgroundColor: p(2) || '#22c55e' }} />
      </div>
    </div>
  )
}

const EmptyStatePreview = ({ cardBg, border, muted, palette }: PreviewProps) => {
  const p = (i: number) => palette[i] || '#6366f1'
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: cardBg, border: `1px solid ${border}` }}>
      <h2 className="font-bold text-sm mb-3" style={{ color: p(0) }}>Empty State</h2>
      <div className="flex flex-col items-center justify-center py-6 text-center rounded-lg" style={{ border: `1px dashed ${border}` }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center mb-2" style={{ backgroundColor: (p(1) || p(0)) + '18' }}>
          <svg className="w-4 h-4" style={{ color: p(1) || p(0) }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
        </div>
        <p className="text-sm font-medium">No palettes yet</p>
        <p className="text-sm mt-1" style={{ color: muted }}>Create your first palette to get started</p>
        <button className={`mt-3 px-4 py-1.5 rounded-lg text-sm font-medium text-white ${btnBase}`} style={{ backgroundColor: p(1) || p(0) }}>New Palette</button>
      </div>
    </div>
  )
}

const ButtonsPreview = ({ palette, headingFont }: PreviewProps) => {
  const p = (i: number) => palette[i] || '#6366f1'
  return (
    <div className="space-y-2">
      <h2 className="font-bold text-sm" style={{ fontFamily: headingFont, color: p(0) }}>Button Sizes & Variants</h2>
      <div className="flex flex-wrap gap-2 items-center">
        <button className={`px-2.5 py-1 rounded text-xs font-medium text-white ${btnBase}`} style={{ backgroundColor: p(0) }}>XS</button>
        <button className={`px-3 py-1.5 rounded-lg text-sm font-medium text-white ${btnBase}`} style={{ backgroundColor: p(0) }}>Small</button>
        <button className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${btnBase}`} style={{ backgroundColor: p(0) }}>Default</button>
        <button className={`px-5 py-2.5 rounded-lg text-sm font-medium text-white ${btnBase}`} style={{ backgroundColor: p(0) }}>Large</button>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <button className={`px-3 py-1.5 rounded-lg text-sm font-medium text-white ${btnBase}`} style={{ backgroundColor: p(0) }}>Primary</button>
        <button className={`px-3 py-1.5 rounded-lg text-sm font-medium ${btnBase}`} style={{ backgroundColor: p(1) || p(0), color: getTextColor(p(1) || p(0)) }}>Secondary</button>
        <button className={`px-3 py-1.5 rounded-lg text-sm font-medium ${btnBase}`} style={{ border: `1px solid ${p(0)}`, color: p(0) }}>Outline</button>
        <button className={`px-3 py-1.5 rounded-lg text-sm font-medium ${btnBase}`} style={{ color: p(1) || p(0) }}>Ghost</button>
        <button className={`px-3 py-1.5 rounded-lg text-sm font-medium text-white opacity-50 ${btnBase}`} style={{ backgroundColor: p(0) }}>Disabled</button>
      </div>
      <div className="flex flex-wrap gap-2">
        {palette.slice(0, 5).map((hex: string, i: number) => (
          <button key={i} className={`px-3 py-1.5 rounded-lg text-sm font-medium text-white ${btnBase}`} style={{ backgroundColor: hex }}>Color {i + 1}</button>
        ))}
      </div>
    </div>
  )
}

const FeatureCardsMemo = memo(FeatureCards)
const TypographyPreviewMemo = memo(TypographyPreview)
const NavbarPreviewMemo = memo(NavbarPreview)
const StatCardsPreviewMemo = memo(StatCardsPreview)
const ProfileCardsPreviewMemo = memo(ProfileCardsPreview)
const PricingCardsPreviewMemo = memo(PricingCardsPreview)
const FormPreviewMemo = memo(FormPreview)
const TablePreviewMemo = memo(TablePreview)
const TabsPreviewMemo = memo(TabsPreviewInner)
const BreadcrumbsPreviewMemo = memo(BreadcrumbsPreview)
const PaginationPreviewMemo = memo(PaginationPreview)
const BadgesPreviewMemo = memo(BadgesPreview)
const AlertsPreviewMemo = memo(AlertsPreview)
const TagsPreviewMemo = memo(TagsPreview)
const ProgressPreviewMemo = memo(ProgressPreview)
const TogglePreviewMemo = memo(TogglePreview)
const AvatarPreviewMemo = memo(AvatarPreview)
const EmptyStatePreviewMemo = memo(EmptyStatePreview)
const ButtonsPreviewMemo = memo(ButtonsPreview)
