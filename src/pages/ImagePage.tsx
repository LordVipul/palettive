import { useRef, useState, useEffect } from 'react'
import { extractColorsFromImage } from '../lib/quantize'
import { usePaletteStore } from '../store/paletteStore'
import { getTextColor } from '../lib/color'
import { Upload } from 'lucide-react'

export function ImagePage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [extracted, setExtracted] = useState<string[]>([])
  const [count, setCount] = useState(5)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageDataRef = useRef<ImageData | null>(null)
  const abortRef = useRef(false)
  const { setColors } = usePaletteStore()

  useEffect(() => {
    if (!imageUrl) return
    abortRef.current = false
    setLoading(true)
    setError(null)
    let cancelled = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = async () => {
      if (abortRef.current || cancelled) return
      const canvas = canvasRef.current
      if (!canvas) { setLoading(false); setError('Canvas not ready'); return }
      const ctx = canvas.getContext('2d')
      if (!ctx) { setLoading(false); setError('Could not get canvas context'); return }
      try {
        const maxW = 400
        const scale = Math.min(maxW / img.width, 1)
        canvas.width = img.width * scale
        canvas.height = img.height * scale
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        imageDataRef.current = imageData
        const result = await extractColorsFromImage(imageData, count)
        if (!abortRef.current && !cancelled) setExtracted(result)
      } catch {
        if (!abortRef.current && !cancelled) setError('Failed to process image. The image may be from a cross-origin source.')
      }
      if (!abortRef.current && !cancelled) setLoading(false)
    }
    img.onerror = () => { if (!abortRef.current) { setLoading(false); setError('Failed to load image. Try a different file.') } }
    img.src = imageUrl
    return () => { abortRef.current = true; img.src = ''; cancelled = true }
  }, [imageUrl])

  useEffect(() => {
    const data = imageDataRef.current
    if (!data || !imageUrl) return
    setLoading(true)
    let cancelled = false
    const id = setTimeout(async () => {
      const result = await extractColorsFromImage(data, count)
      if (!cancelled) setExtracted(result)
      if (!cancelled) setLoading(false)
    }, 0)
    return () => { clearTimeout(id); cancelled = true }
  }, [count, imageUrl])

  function handleImage(file: File) {
    setLoading(true)
    setError(null)
    if (imageUrl && imageUrl.startsWith('blob:')) URL.revokeObjectURL(imageUrl)
    setImageUrl(URL.createObjectURL(file))
  }

  function applyToGenerator() {
    if (extracted.length === 0) return
    setColors(extracted.map((hex) => ({ hex, locked: false })))
  }

  useEffect(() => {
    return () => { if (imageUrl && imageUrl.startsWith('blob:')) URL.revokeObjectURL(imageUrl) }
  }, [imageUrl])

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Extract from Image</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Upload an image to extract its color palette</p>
      </div>

      {!imageUrl ? (
        <div className="border-2 border-dashed rounded-xl p-16 text-center cursor-pointer transition-all hover:opacity-70 active:scale-[0.99]"
          style={{
            borderColor: isDragOver ? 'var(--color-accent)' : 'var(--color-border)',
            backgroundColor: isDragOver ? 'var(--color-accent-muted)' : 'transparent',
          }}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f) handleImage(f) }}
          onClick={() => document.getElementById('image-input')?.click()}
        >
          <Upload className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--color-text-secondary)' }} />
          <p className="font-medium">Drop an image here or click to browse</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-secondary)' }}>JPEG, PNG, WebP</p>
          <input id="image-input" type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImage(f) }} />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid var(--color-border)' }}
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragOver(false); const f = e.dataTransfer.files[0]; if (f) { if (imageUrl && imageUrl.startsWith('blob:')) URL.revokeObjectURL(imageUrl); handleImage(f) } }}
            >
              <img src={imageUrl} className="w-full rounded-xl" alt="Uploaded" />
              {isDragOver && <div className="absolute inset-0 flex items-center justify-center rounded-xl" style={{ backgroundColor: 'var(--color-accent-muted)' }}>
                <p className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>Drop to replace</p>
              </div>}
            </div>
            <canvas ref={canvasRef} className="hidden" />
            <button onClick={() => document.getElementById('image-input')?.click()} className="mt-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-80 active:scale-95"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
            >Choose another &rarr;</button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Colors</label>
              <select value={count} onChange={(e) => setCount(parseInt(e.target.value))}
                className="px-2.5 py-1.5 rounded-lg text-xs outline-none"
                style={{ backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              >
                {[3, 4, 5, 6, 7, 8, 9].map((n) => (<option key={n} value={n}>{n}</option>))}
              </select>
            </div>

            {loading ? (
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Processing...</p>
            ) : error ? (
              <p className="text-sm" style={{ color: 'var(--color-danger)' }}>{error}</p>
            ) : extracted.length > 0 ? (
              <>
                <div className="flex rounded-xl overflow-hidden h-14" style={{ border: '1px solid var(--color-border)' }}>
                  {extracted.map((hex, i) => (
                    <div key={i} className="flex-1 flex items-center justify-center" style={{ backgroundColor: hex }}>
                      <span className="text-xs font-mono opacity-0 hover:opacity-100 transition-opacity" style={{ color: getTextColor(hex) }}>
                        {hex.toUpperCase()}
                      </span>
                    </div>
                  ))}
                </div>
                <button onClick={applyToGenerator}
                  className="w-full py-2.5 rounded-lg text-sm font-medium transition-all hover:opacity-80 active:scale-[0.98]"
                  style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-bg)' }}
                >Apply to Generator</button>
              </>
            ) : (
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Extracting palette...</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
