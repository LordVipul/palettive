function kMeans(
  data: { r: number; g: number; b: number }[],
  k: number,
  iterations: number
): { r: number; g: number; b: number }[] {
  if (data.length === 0) return Array.from({ length: k }, () => ({ r: 0, g: 0, b: 0 }))
  if (data.length <= k) {
    const result: { r: number; g: number; b: number }[] = []
    for (let i = 0; i < k; i++) result.push(data[Math.min(i, data.length - 1)])
    return result
  }

  const step = Math.floor(data.length / k)
  let centroids = Array.from({ length: k }, (_, i) => data[Math.min(i * step, data.length - 1)])

  for (let iter = 0; iter < iterations; iter++) {
    const clusters: typeof data[] = Array.from({ length: k }, () => [])
    for (const point of data) {
      let minDist = Infinity
      let closest = 0
      for (let i = 0; i < centroids.length; i++) {
        const d = colorDist(point, centroids[i])
        if (d < minDist) { minDist = d; closest = i }
      }
      clusters[closest].push(point)
    }
    for (let i = 0; i < k; i++) {
      if (clusters[i].length === 0) {
        const farthest = data.reduce((best, p) =>
          colorDist(p, centroids[i]) > colorDist(best, centroids[i]) ? p : best
        , data[0])
        centroids[i] = farthest
        continue
      }
      const sumR = clusters[i].reduce((s, p) => s + p.r, 0)
      const sumG = clusters[i].reduce((s, p) => s + p.g, 0)
      const sumB = clusters[i].reduce((s, p) => s + p.b, 0)
      centroids[i] = {
        r: sumR / clusters[i].length,
        g: sumG / clusters[i].length,
        b: sumB / clusters[i].length,
      }
    }
  }
  return centroids
}

function colorDist(a: { r: number; g: number; b: number }, b: { r: number; g: number; b: number }): number {
  return Math.sqrt((a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2)
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0')).join('')
}

function getLuminance(hexStr: string): number {
  const r = parseInt(hexStr.slice(1, 3), 16) / 255
  const g = parseInt(hexStr.slice(3, 5), 16) / 255
  const b = parseInt(hexStr.slice(5, 7), 16) / 255
  const rs = r <= 0.03928 ? r / 12.92 : ((r + 0.055) / 1.055) ** 2.4
  const gs = g <= 0.03928 ? g / 12.92 : ((g + 0.055) / 1.055) ** 2.4
  const bs = b <= 0.03928 ? b / 12.92 : ((b + 0.055) / 1.055) ** 2.4
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

self.onmessage = (e: MessageEvent<{ imageData: ImageData; count: number }>) => {
  const { imageData, count } = e.data
  const step = Math.max(1, Math.floor(imageData.data.length / 4 / 10000))
  const pixels: { r: number; g: number; b: number }[] = []
  for (let i = 0; i < imageData.data.length; i += 4 * step) {
    pixels.push({
      r: imageData.data[i],
      g: imageData.data[i + 1],
      b: imageData.data[i + 2],
    })
  }

  const clusters = kMeans(pixels, count, 5)
  const result = clusters
    .map((c) => rgbToHex(Math.round(c.r), Math.round(c.g), Math.round(c.b)))
    .sort((a, b) => getLuminance(b) - getLuminance(a))

  self.postMessage(result)
}
