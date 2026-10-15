let bannersMemoryCache = null
let bannersLastFetched = 0
const TTL = 60 * 1000 // 60s TTL for memory cache

export async function getCachedBanners() {
  const now = Date.now()
  if (bannersMemoryCache && now - bannersLastFetched < TTL) {
    return bannersMemoryCache
  }
  try {
    const { Banner } = await import('../models/Banner.js')
    const banners = await Banner.getAll({ activeOnly: true })
    bannersMemoryCache = banners || []
    bannersLastFetched = now
    return bannersMemoryCache
  } catch (e) {
    return bannersMemoryCache || []
  }
}

export function invalidateBannersCache() {
  bannersMemoryCache = null
  bannersLastFetched = 0
}
