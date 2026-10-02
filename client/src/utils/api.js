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

  // Helper upload ảnh (Tự động tối ưu nén kích thước & độ phân giải trước khi gửi)
  uploadPhotos: async (files, category = 'general') => {
    let optimizedList = files
    try {
      const maxDim = category === 'banners' ? 2560 : 2048
      const quality = category === 'branding' ? 0.90 : 0.85
      optimizedList = await optimizeFiles(files, {
        maxWidth: maxDim,
        maxHeight: maxDim,
        quality,
      })
    } catch (optErr) {
      console.warn('Tối ưu phía client bỏ qua, tiếp tục tải ảnh gốc:', optErr)
      optimizedList = files
    }

    const formData = new FormData()
    formData.append('category', category)
    for (let i = 0; i < optimizedList.length; i++) {
      formData.append('photos', optimizedList[i])
    }
    const res = await request('/upload', {
      method: 'POST',
      body: formData,
    })
    clearApiCache()
    return res
  },
}

export default api
