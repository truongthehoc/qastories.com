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
    maxWidth = 2560,
    maxHeight = 2560,
    quality = 0.85,
    outputType = 'image/webp',
  } = options

  return new Promise((resolve) => {
    // If file is already small (< 300KB), return as is
    if (file.size < 300 * 1024 && !options.forceResize) {
      return resolve(file)
    }

    const reader = new FileReader()
    reader.onerror = () => resolve(file) // Fallback to original
    reader.onload = (event) => {
      const img = new Image()
      img.onerror = () => resolve(file) // Fallback to original
      img.onload = () => {
        try {
          let width = img.width
          let height = img.height

          // Calculate new dimensions while maintaining aspect ratio
          if (width > maxWidth || height > maxHeight) {
            if (width / maxWidth > height / maxHeight) {
              height = Math.round((height * maxWidth) / width)
              width = maxWidth
            } else {
              width = Math.round((width * maxHeight) / height)
              height = Math.round((height * maxHeight) / img.height)
            }
          }

          const canvas = document.createElement('canvas')
          canvas.width = width
          canvas.height = height

          const ctx = canvas.getContext('2d')
          if (!ctx) return resolve(file)

          // Smooth rendering
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = 'high'
          ctx.drawImage(img, 0, 0, width, height)

          // Determine target MIME type
          const targetMime = canvas.toBlob ? outputType : 'image/jpeg'

          canvas.toBlob(
            (blob) => {
              if (!blob || blob.size >= file.size) {
                // If compressed size isn't smaller, keep original
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

export async function optimizeFiles(files, options = {}) {
  if (!files || files.length === 0) return []
  const fileArray = Array.from(files)
  return Promise.all(fileArray.map((f) => optimizeImage(f, options)))
}
