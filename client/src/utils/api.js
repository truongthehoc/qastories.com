import { optimizeFiles } from './imageOptimizer.js'

const API_BASE = '/api'

export async function request(endpoint, options = {}) {
  const token = localStorage.getItem('qastories_admin_token')

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
    return request('/upload', {
      method: 'POST',
      body: formData,
    })
  },
}

export default api
