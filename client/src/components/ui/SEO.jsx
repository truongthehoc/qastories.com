import { useEffect } from 'react'
import { useSettings } from '../../context/SettingsContext'

export default function SEO({
  title,
  description,
  image,
  url,
  type = 'website',
}) {
  const { settings } = useSettings()

  useEffect(() => {
    const siteName = settings?.brand_name || 'QA Stories'
    const defaultDesc =
      settings?.seo_description ||
      'Studio chụp ảnh sơ sinh newborn, thôi nôi, 100 ngày tuổi và gia đình uy tín với phong cách nghệ thuật, ánh sáng tự nhiên.'
    const defaultImage = settings?.seo_image || '/og-image.jpg'

    const pageTitle = title
      ? `${title} | ${siteName}`
      : (settings?.seo_title || `${siteName} | Studio Chụp Ảnh Em Bé & Gia Đình Nghệ Thuật`)
    const pageDesc = description || defaultDesc

    // Đảm bảo image luôn là full absolute URL
    let rawImage = image || defaultImage
    let pageImage = rawImage
    try {
      pageImage = new URL(rawImage, window.location.origin).href
    } catch (e) {
      pageImage = rawImage
    }

    const pageUrl = url || window.location.href

    // 1. Update Title
    document.title = pageTitle

    // 2. Helper update or create meta tag
    const setMeta = (attrName, attrVal, content) => {
      let element = document.querySelector(`meta[${attrName}="${attrVal}"]`)
      if (!element) {
        element = document.createElement('meta')
        element.setAttribute(attrName, attrVal)
        document.head.appendChild(element)
      }
      element.setAttribute('content', content || '')
    }

    setMeta('name', 'title', pageTitle)
    setMeta('name', 'description', pageDesc)
    setMeta('property', 'og:type', type)
    setMeta('property', 'og:site_name', siteName)
    setMeta('property', 'og:title', pageTitle)
    setMeta('property', 'og:description', pageDesc)
    setMeta('property', 'og:image', pageImage)
    setMeta('property', 'og:image:secure_url', pageImage)
    setMeta('property', 'og:image:width', '1200')
    setMeta('property', 'og:image:height', '630')
    setMeta('property', 'og:url', pageUrl)
    setMeta('property', 'og:locale', 'vi_VN')

    setMeta('name', 'twitter:card', 'summary_large_image')
    setMeta('name', 'twitter:title', pageTitle)
    setMeta('name', 'twitter:description', pageDesc)
    setMeta('name', 'twitter:image', pageImage)
    setMeta('name', 'twitter:url', pageUrl)

    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.setAttribute('rel', 'canonical')
      document.head.appendChild(canonical)
    }
    canonical.setAttribute('href', pageUrl)
  }, [title, description, image, url, type, settings])

  return null
}
