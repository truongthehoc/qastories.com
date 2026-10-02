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
    const defaultImage =
      settings?.brand_logo ||
      'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=1200&h=630&fit=crop&q=85'

    const pageTitle = title
      ? `${title} | ${siteName}`
      : (settings?.seo_title || `${siteName} | Studio Chụp Ảnh Em Bé & Gia Đình Nghệ Thuật`)
    const pageDesc = description || defaultDesc
    const pageImage = image || defaultImage
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
      element.setAttribute('content', content)
    }

    setMeta('name', 'description', pageDesc)
    setMeta('property', 'og:title', pageTitle)
    setMeta('property', 'og:description', pageDesc)
    setMeta('property', 'og:image', pageImage)
    setMeta('property', 'og:url', pageUrl)
    setMeta('property', 'og:type', type)
    setMeta('name', 'twitter:title', pageTitle)
    setMeta('name', 'twitter:description', pageDesc)
    setMeta('name', 'twitter:image', pageImage)

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
