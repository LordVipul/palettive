import { lazy, Suspense } from 'react'
import { HashRouter, Routes, Route, Link } from 'react-router-dom'
import { Palette } from 'lucide-react'

const Layout = lazy(() => import('./components/layout/Layout').then(m => ({ default: m.Layout })))
const GeneratorPage = lazy(() => import('./pages/GeneratorPage').then(m => ({ default: m.GeneratorPage })))
const ExplorePage = lazy(() => import('./pages/ExplorePage').then(m => ({ default: m.ExplorePage })))
const SavedPage = lazy(() => import('./pages/SavedPage').then(m => ({ default: m.SavedPage })))
const ImagePage = lazy(() => import('./pages/ImagePage').then(m => ({ default: m.ImagePage })))
const PreviewPage = lazy(() => import('./pages/PreviewPage').then(m => ({ default: m.PreviewPage })))
const ContrastPage = lazy(() => import('./pages/ContrastPage').then(m => ({ default: m.ContrastPage })))
const GradientPage = lazy(() => import('./pages/GradientPage').then(m => ({ default: m.GradientPage })))
const ExportPage = lazy(() => import('./pages/ExportPage').then(m => ({ default: m.ExportPage })))

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--color-accent-muted)' }}>
        <Palette className="w-8 h-8" style={{ color: 'var(--color-accent)' }} />
      </div>
      <h2 className="text-xl font-bold mb-2">Page not found</h2>
      <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>This page doesn't exist or has been moved.</p>
      <Link to="/" className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80" style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }}>Go to Generator</Link>
    </div>
  )
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-32" style={{ color: 'var(--color-text-secondary)' }}>
      <div className="w-6 h-6 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: 'var(--color-text-secondary)', borderTopColor: 'transparent' }} />
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Suspense fallback={<PageLoader />}><Layout /></Suspense>}>
          <Route index element={<Suspense fallback={<PageLoader />}><GeneratorPage /></Suspense>} />
          <Route path="/explore" element={<Suspense fallback={<PageLoader />}><ExplorePage /></Suspense>} />
          <Route path="/saved" element={<Suspense fallback={<PageLoader />}><SavedPage /></Suspense>} />
          <Route path="/image" element={<Suspense fallback={<PageLoader />}><ImagePage /></Suspense>} />
          <Route path="/preview" element={<Suspense fallback={<PageLoader />}><PreviewPage /></Suspense>} />
          <Route path="/contrast" element={<Suspense fallback={<PageLoader />}><ContrastPage /></Suspense>} />
          <Route path="/gradient" element={<Suspense fallback={<PageLoader />}><GradientPage /></Suspense>} />
          <Route path="/export" element={<Suspense fallback={<PageLoader />}><ExportPage /></Suspense>} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
