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
  let data = {}
  try {
    data = await response.json()
  } catch {
    data = {}
  }

  if (!response.ok) {
    let errMsg = data?.message
    if (!errMsg) {
      if (response.status === 413) {
        errMsg = 'Dung lượng file tải lên quá lớn so với cấu hình máy chủ (Lỗi 413: Payload Too Large).'
      } else if (response.status === 504 || response.status === 502) {
        errMsg = 'Máy chủ xử lý quá hạn (Lỗi 504/502: Gateway Timeout). Hãy tải số lượng ít hơn hoặc thử lại.'
      } else if (response.status === 500) {
        errMsg = 'Máy chủ gặp lỗi nội bộ khi xử lý (Lỗi 500).'
      } else if (response.status === 401) {
        errMsg = 'Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.'
      } else if (response.status === 404) {
        errMsg = 'Không tìm thấy tài nguyên yêu cầu (Lỗi 404).'
      } else {
        errMsg = `Lỗi yêu cầu (Mã ${response.status}${response.statusText ? ': ' + response.statusText : ''})`
      }
    }
    const error = new Error(errMsg)
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

  // Helper upload ảnh (Tự động tối ưu nén kích thước & upload theo từng đợt nhỏ 4-5 ảnh để không bao giờ bị nghẽn)
  uploadPhotos: async (files, category = 'general', onProgress = null) => {
    if (!files || files.length === 0) return { success: true, files: [] }
    const fileList = Array.from(files)
    const totalCount = fileList.length

    // 1. Tối ưu ảnh ở Client với hàng đợi tuần tự tránh tràn bộ nhớ trình duyệt
    let optimizedList = fileList
    try {
      const maxDim = category === 'banners' ? 2560 : 2048
      const quality = category === 'branding' ? 0.90 : 0.82
      optimizedList = await optimizeFiles(fileList, {
        maxWidth: maxDim,
        maxHeight: maxDim,
        quality,
      }, (done, total) => {
        if (typeof onProgress === 'function') {
          const pct = Math.round((done / total) * 40)
          onProgress({
            phase: 'compress',
            done,
            total,
            percent: Math.max(5, pct),
            message: `Đang nén & chuẩn bị: ${done}/${total} ảnh (${pct}%)...`,
          })
        }
      })
    } catch (optErr) {
      console.warn('Tối ưu phía client gặp lỗi, tiếp tục với file gốc:', optErr)
      optimizedList = fileList
    }

    // 2. Tải lên Server theo từng đợt nhỏ (chunk 4-5 ảnh/request)
    // Mỗi đợt chỉ khoảng 300KB-800KB, vượt qua mọi giới hạn Nginx & tránh tràn RAM VPS
    const chunkSize = 4
    const allUploadedFiles = []
    let uploadedCount = 0

    for (let i = 0; i < optimizedList.length; i += chunkSize) {
      const chunk = optimizedList.slice(i, i + chunkSize)
      const formData = new FormData()
      formData.append('category', category)
      for (let j = 0; j < chunk.length; j++) {
        formData.append('photos', chunk[j])
      }

      // Hỗ trợ tự động thử lại 2 lần nếu mất kết nối mạng tạm thời
      let attempt = 0
      let success = false
      let lastErr = null

      while (attempt < 2 && !success) {
        attempt++
        try {
          const res = await request('/upload', {
            method: 'POST',
            body: formData,
          })

          if (res.success && Array.isArray(res.files)) {
            allUploadedFiles.push(...res.files)
            success = true
          } else {
            throw new Error(res.message || 'Lỗi xử lý file từ máy chủ')
          }
        } catch (err) {
          lastErr = err
          if (attempt < 2) {
            // Chờ 1 giây trước khi thử lại
            await new Promise((r) => setTimeout(r, 1000))
          }
        }
      }

      if (!success) {
        throw new Error(lastErr?.message || `Tải lên thất bại ở đợt ảnh thứ ${Math.floor(i / chunkSize) + 1}`)
      }

      uploadedCount += chunk.length
      if (typeof onProgress === 'function') {
        const uploadPct = 40 + Math.round((uploadedCount / totalCount) * 58)
        onProgress({
          phase: 'upload',
          done: uploadedCount,
          total: totalCount,
          percent: Math.min(98, uploadPct),
          message: `Đang truyền lên máy chủ: ${uploadedCount}/${totalCount} ảnh (${Math.min(98, uploadPct)}%)...`,
        })
      }
    }

    if (typeof onProgress === 'function') {
      onProgress({
        phase: 'complete',
        done: totalCount,
        total: totalCount,
        percent: 100,
        message: `Hoàn tất tải lên ${allUploadedFiles.length} ảnh! Đang lưu thông tin...`,
      })
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
