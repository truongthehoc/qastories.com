/**
 * Utility to optimize and compress image files on the client side before uploading.
 * Reduces bandwidth, prevents network timeouts, and ensures smooth performance.
 */

export async function optimizeImage(file, options = {}) {
  // If not an image or SVG/GIF (preserve animations/vectors), return as-is
  if (!file || !file.type || !file.type.startsWith('image/') || file.type === 'image/svg+xml' || file.type === 'image/gif') {
    return file
  }

  const {
    maxWidth = 2048,
    maxHeight = 2048,
    quality = 0.82,
    outputType = 'image/webp',
  } = options

  return new Promise((resolve) => {
    // If file is already small (< 250KB) and is already webp/jpeg, return as is unless forced
    if (file.size < 250 * 1024 && (file.type === 'image/webp' || file.type === 'image/jpeg') && !options.forceResize) {
      return resolve(file)
    }

    const reader = new FileReader()
    reader.onerror = () => resolve(file) // Fallback to original
    reader.onload = (event) => {
      const img = new Image()
      img.onerror = () => resolve(file) // Fallback to original
      img.onload = () => {
        try {
          let width = img.naturalWidth || img.width
          let height = img.naturalHeight || img.height

          // Calculate new dimensions while maintaining aspect ratio perfectly
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height)
            width = Math.round(width * ratio)
            height = Math.round(height * ratio)
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) return resolve(file)

          // High quality image smoothing
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, width, height)

          // Determine target MIME type
          const targetMime = canvas.toBlob ? outputType : 'image/jpeg'

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                return resolve(file)
              }

              const newFileName = file.name.replace(/\.[^/.]+$/, '') + (targetMime === 'image/webp' ? '.webp' : '.jpg')
              const optimizedFile = new File([blob], newFileName, {
                type: targetMime,
                lastModified: Date.now(),
              })

              resolve(optimizedFile)
            },
            targetMime,
            quality
          )
        } catch (err) {
          console.warn('[ImageOptimizer] Client compression fallback:', err)
          resolve(file)
        }
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  })
}

export async function optimizeFiles(files, options = {}, onProgress = null) {
  if (!files || files.length === 0) return []
  const fileArray = Array.from(files)
  const results = []
  const concurrency = 2 // Process 2 images at a time to keep browser RAM and CPU ultra-light
  let completed = 0

  for (let i = 0; i < fileArray.length; i += concurrency) {
    const chunk = fileArray.slice(i, i + concurrency)
    const chunkResults = await Promise.all(
      chunk.map(async (f) => {
        try {
          const opt = await optimizeImage(f, options)
          completed++
          if (typeof onProgress === 'function') onProgress(completed, fileArray.length)
          return opt
        } catch {
          completed++
          if (typeof onProgress === 'function') onProgress(completed, fileArray.length)
          return f
        }
      })
    )
    results.push(...chunkResults)
  }
  return results
}

