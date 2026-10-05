import { optimizeFiles } from './imageOptimizer.js'

const API_BASE = '/api'

// Bộ nhớ đệm phía client (In-memory TTL cache)
const apiCache = new Map()
const DEFAULT_CACHE_TTL = 60 * 1000 // 60 giây

export function clearApiCache(prefix = '') {
  if (!prefix) {
    apiCache.clear()
    return
  }
  for (const key of apiCache.keys()) {
    if (key.startsWith(prefix)) {
      apiCache.delete(key)
    }
  }
}

export async function request(endpoint, options = {}) {
  const isGet = !options.method || options.method.toUpperCase() === 'GET'
  const token = localStorage.getItem('qastories_admin_token')

  // Kiểm tra cache cho các request GET không yêu cầu bypass
  const cacheKey = `${endpoint}_${token || 'guest'}`
  const bypassCache = options.bypassCache === true
  const cacheTtl = options.cacheTtl || DEFAULT_CACHE_TTL

  if (isGet && !bypassCache && apiCache.has(cacheKey)) {
    const cached = apiCache.get(cacheKey)
    if (Date.now() - cached.timestamp < cacheTtl) {
      return cached.data
    }
    apiCache.delete(cacheKey)
  }

  const headers = {
    ...(options.headers || {}),
  }

  // Nếu không phải FormData thì mặc định JSON
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config = {
    ...options,
    headers,
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config)
  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    const error = new Error(data.message || `Lỗi yêu cầu: ${response.statusText}`)
    error.status = response.status
    error.data = data
    throw error
  }

  // Lưu cache nếu là request GET thành công
  if (isGet && !bypassCache && response.ok) {
    apiCache.set(cacheKey, {
      data,
      timestamp: Date.now(),
    })
  }

  // Nếu là thao tác ghi (POST/PUT/PATCH/DELETE), tự động xóa cache liên quan
  if (!isGet) {
    clearApiCache()
  }

  return data
}

export const api = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: 'PUT',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: (endpoint, body, options = {}) =>
    request(endpoint, {
      ...options,
      method: 'PATCH',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' }),

  clearCache: clearApiCache,

  // Helper upload ảnh (Tự động tối ưu nén kích thước & chunk upload mượt mà)
  uploadPhotos: async (files, category = 'general', onProgress = null) => {
    if (!files || files.length === 0) return { success: true, files: [] }
    const fileList = Array.from(files)

    // 1. Tối ưu ảnh ở Client với hàng đợi tuần tự tránh tràn bộ nhớ
    let optimizedList = fileList
    try {
      const maxDim = category === 'banners' ? 2560 : 2048
      const quality = category === 'branding' ? 0.90 : 0.85
      optimizedList = await optimizeFiles(fileList, {
        maxWidth: maxDim,
        maxHeight: maxDim,
        quality,
      }, (done, total) => {
        if (typeof onProgress === 'function') {
          onProgress({
            phase: 'compress',
            done,
            total,
            percent: Math.round((done / total) * 35),
            message: `Đang nén tối ưu: ${done}/${total} ảnh...`,
          })
        }
      })
    } catch (optErr) {
      console.warn('Tối ưu phía client bỏ qua, tiếp tục tải ảnh gốc:', optErr)
      optimizedList = fileList
    }

    // 2. Tải lên Server theo từng đợt (chunk 20 ảnh/request) để ổn định tuyệt đối
    const chunkSize = 20
    const allUploadedFiles = []
    const totalFiles = optimizedList.length

    for (let i = 0; i < optimizedList.length; i += chunkSize) {
      const chunk = optimizedList.slice(i, i + chunkSize)
      const formData = new FormData()
      formData.append('category', category)
      for (let j = 0; j < chunk.length; j++) {
        formData.append('photos', chunk[j])
      }

      const res = await request('/upload', {
        method: 'POST',
        body: formData,
      })

      if (res.success && Array.isArray(res.files)) {
        allUploadedFiles.push(...res.files)
      } else {
        throw new Error(res.message || 'Tải ảnh lên máy chủ thất bại')
      }

      const uploadedCount = Math.min(i + chunkSize, totalFiles)
      if (typeof onProgress === 'function') {
        onProgress({
          phase: 'upload',
          done: uploadedCount,
          total: totalFiles,
          percent: 35 + Math.round((uploadedCount / totalFiles) * 65),
          message: `Đang tải lên server: ${uploadedCount}/${totalFiles} ảnh...`,
        })
      }
    }

    clearApiCache()
    return {
      success: true,
      message: `Đã tải lên và tối ưu thành công ${allUploadedFiles.length} ảnh.`,
      files: allUploadedFiles,
    }
  },
}

export default api
