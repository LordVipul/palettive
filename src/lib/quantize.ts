export function extractColorsFromImage(
  imageData: ImageData,
  count: number
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    try {
      const worker = new Worker(
        new URL('./quantize.worker.ts', import.meta.url),
        { type: 'module' }
      )

      worker.onmessage = (e: MessageEvent<string[]>) => {
        resolve(e.data)
        worker.terminate()
      }

      worker.onerror = (e) => {
        reject(new Error('Worker error: ' + e.message))
        worker.terminate()
      }

      const transferable = imageData.data.buffer
      worker.postMessage({ imageData, count }, [transferable])
    } catch (err) {
      reject(err)
    }
  })
}
