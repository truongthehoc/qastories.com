import { Link } from 'react-router-dom'
import { Camera, Phone, Mail, MapPin, Heart } from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'
import { formatExternalUrl, formatZaloUrl } from '../../utils/urlHelper'

// Các biểu tượng Mạng Xã Hội chuẩn chuyên nghiệp chính hãng (Official Brand Badges)
function FacebookBrandIcon({ size = 36, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <rect width="40" height="40" rx="10" fill="#1877F2" />
      <path
        d="M27 21.2l.8-5.3h-5.1v-3.4c0-1.4.7-2.9 3-2.9h2.3V5.1s-2.1-.4-4.1-.4c-4.2 0-7 2.6-7 7.2v3.9H12v5.3h4.9V34c1 .2 2 .2 3 .2s2-.1 3-.2V21.2H27z"
        fill="#FFFFFF"
      />
    </svg>
  )
}

function InstagramBrandIcon({ size = 36, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <defs>
        <radialGradient id="ig-grad-footer" cx="20%" cy="110%" r="120%">
          <stop offset="0%" stopColor="#ffd521" />
          <stop offset="10%" stopColor="#ffd521" />
          <stop offset="45%" stopColor="#f50000" />
          <stop offset="90%" stopColor="#b900b4" />
        </radialGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#ig-grad-footer)" />
      <rect x="9" y="9" width="22" height="22" rx="6" stroke="#ffffff" strokeWidth="2.5" fill="none" />
      <circle cx="20" cy="20" r="5.5" stroke="#ffffff" strokeWidth="2.5" fill="none" />
      <circle cx="25.5" cy="14.5" r="1.5" fill="#ffffff" />
    </svg>
  )
}

function ZaloBrandIcon({ size = 36, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <rect width="40" height="40" rx="10" fill="#0068FF" />
      <text
        x="50%"
        y="53%"
        dominantBaseline="central"
        textAnchor="middle"
        fill="#FFFFFF"
        fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
        fontWeight="800"
        fontSize="13.5"
        letterSpacing="-0.3px"
      >
        Zalo
      </text>
    </svg>
  )
}

function YoutubeBrandIcon({ size = 36, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <rect width="40" height="40" rx="10" fill="#FF0000" />
      <path
        d="M30 15.2c-.2-.9-.9-1.6-1.8-1.8-1.6-.4-8.2-.4-8.2-.4s-6.6 0-8.2.4c-.9.2-1.6.9-1.8 1.8-.4 1.6-.4 4.8-.4 4.8s0 3.2.4 4.8c.2.9.9 1.6 1.8 1.8 1.6.4 8.2.4 8.2.4s6.6 0 8.2-.4c.9-.2 1.6-.9 1.8-1.8.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8z"
        fill="#FFFFFF"
      />
      <path d="M18 23.2l5.8-3.2L18 16.8v6.4z" fill="#FF0000" />
    </svg>
  )
}

function TikTokBrandIcon({ size = 36, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" className={className}>
      <rect width="40" height="40" rx="10" fill="#000000" stroke="#333333" strokeWidth="1" />
      <g transform="translate(8, 8) scale(0.68)">
        <path
          d="M24.8 8.6a6.1 6.1 0 01-4.8-5.4V2h-4.4v17.4a3.7 3.7 0 01-6.6 2.2 3.7 3.7 0 012.9-5.9c.4 0 .8.1 1.1.2V11.8a8.7 8.7 0 00-1.3-.1A8 8 0 003.7 20a8 8 0 0011.9 6.9 7.8 7.8 0 004-6.9v-11a10.6 10.6 0 006.3 2.1V6.5a6.4 6.4 0 01-1.1.1z"
          fill="#FE2C55"
        />
        <path
          d="M23.8 7.6a6.1 6.1 0 01-4.8-5.4V1h-4.4v17.4a3.7 3.7 0 01-6.6 2.2 3.7 3.7 0 012.9-5.9c.4 0 .8.1 1.1.2V10.8a8.7 8.7 0 00-1.3-.1A8 8 0 002.7 19a8 8 0 0011.9 6.9 7.8 7.8 0 004-6.9v-11a10.6 10.6 0 006.3 2.1V5.5a6.4 6.4 0 01-1.1.1z"
          fill="#25F4EE"
        />
        <path
          d="M24.3 8.1a6.1 6.1 0 01-4.8-5.4V1.5h-4.4v17.4a3.7 3.7 0 01-6.6 2.2 3.7 3.7 0 012.9-5.9c.4 0 .8.1 1.1.2V11.3a8.7 8.7 0 00-1.3-.1A8 8 0 003.2 19.5a8 8 0 0011.9 6.9 7.8 7.8 0 004-6.9v-11a10.6 10.6 0 006.3 2.1V6a6.4 6.4 0 01-1.1.1z"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  )
}

export default function Footer() {
  const { settings } = useSettings()

  // 1. Kiểm tra nếu tắt toàn bộ Footer
  if (settings?.footer_enabled === '0' || settings?.footer_enabled === false) {
    return null
  }

  const brandEnabled = settings?.footer_brand_enabled !== '0' && settings?.footer_brand_enabled !== false
  const linksEnabled = settings?.footer_links_enabled !== '0' && settings?.footer_links_enabled !== false
  const contactEnabled = settings?.footer_contact_enabled !== '0' && settings?.footer_contact_enabled !== false
  const socialEnabled = settings?.footer_social_enabled !== '0' && settings?.footer_social_enabled !== false
  const bottomEnabled = settings?.footer_bottom_enabled !== '0' && settings?.footer_bottom_enabled !== false

  const brandName = settings?.footer_custom_title || settings?.brand_name || 'QA Stories'
  const brandSlogan = settings?.footer_custom_slogan || settings?.brand_slogan ||
    'Chúng tôi tin rằng từng tiếng cười khúc khích, từng ánh mắt trong veo và khoảnh khắc đầu đời của bé là món quà quý giá nhất. Hãy để QA Stories đồng hành lưu giữ câu chuyện thiên thần của gia đình bạn.'

  const brandPhone = settings?.footer_custom_phone || settings?.brand_phone || '0901 234 567'
  const brandEmail = settings?.footer_custom_email || settings?.brand_email || 'hello@qastories.vn'
  const brandAddress = settings?.footer_custom_address || settings?.brand_address || '123 Đường ABC, Quận 1, TP. Hồ Chí Minh'
  const brandMapsUrl = settings?.footer_custom_maps_url || settings?.brand_maps_url || null

  const linksTitle = settings?.footer_links_title || 'Khám Phá'
  const contactTitle = settings?.footer_contact_title || 'Liên Hệ'

  // Custom links parsing
  let navItems = [
    { to: '/', label: 'Trang Chủ', is_active: settings?.page_home_enabled !== '0' && settings?.page_home_enabled !== false },
    { to: '/album', label: 'Bộ Sưu Tập Album', is_active: settings?.page_album_enabled !== '0' && settings?.page_album_enabled !== false },
    { to: '/about', label: 'Giới Thiệu', is_active: settings?.page_about_enabled !== '0' && settings?.page_about_enabled !== false },
    { to: '/contact', label: 'Báo Giá & Đặt Lịch', is_active: settings?.page_contact_enabled !== '0' && settings?.page_contact_enabled !== false },
  ]

  if (settings?.footer_custom_links) {
    try {
      const parsed = typeof settings.footer_custom_links === 'string'
        ? JSON.parse(settings.footer_custom_links)
        : settings.footer_custom_links
      if (Array.isArray(parsed) && parsed.length > 0) {
        navItems = parsed
      }
    } catch {
      // Use defaults
    }
  }

  const activeNavItems = navItems.filter((item) => item.is_active !== false)

  // Danh sách mạng xã hội: Chỉ hiển thị các nút có URL hợp lệ cấu hình từ Tab Mạng Xã Hội trong Cài Đặt
  const rawSocial = [
    {
      icon: FacebookBrandIcon,
      href: formatExternalUrl(settings?.brand_facebook),
      label: 'Facebook',
    },
    {
      icon: InstagramBrandIcon,
      href: formatExternalUrl(settings?.brand_instagram),
      label: 'Instagram',
    },
    {
      icon: ZaloBrandIcon,
      href: formatZaloUrl(settings?.brand_zalo, brandPhone),
      label: 'Zalo',
    },
    {
      icon: YoutubeBrandIcon,
      href: formatExternalUrl(settings?.brand_youtube),
      label: 'YouTube',
    },
    {
      icon: TikTokBrandIcon,
      href: formatExternalUrl(settings?.brand_tiktok),
      label: 'TikTok',
    },
  ]

  const socialList = rawSocial.filter((s) => {
    if (!s.href) return false
    const trimmed = String(s.href).trim()
    return trimmed !== '' && trimmed !== '#'
  })

  return (
    <footer className="w-full bg-gray-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#FF7A2F_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 2xl:px-16 pt-12 sm:pt-16 pb-10 sm:pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12">
          {/* Brand Col */}
          {brandEnabled && (
            <div className={`${linksEnabled && contactEnabled ? 'lg:col-span-5' : 'lg:col-span-6'}`}>
              <Link
                to="/"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-3 mb-4 group cursor-pointer"
              >
                {settings?.brand_logo ? (
                  <img
                    src={settings.brand_logo}
                    alt={brandName}
                    className="h-9 sm:h-10 w-auto max-w-[140px] object-contain group-hover:scale-105 transition-transform duration-300"
                    width="140"
                    height="40"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform duration-300">
                    <Camera size={20} className="text-white" />
                  </div>
                )}
                <div className="font-heading font-bold text-xl sm:text-2xl text-white tracking-tight group-hover:text-primary transition-colors duration-300">
                  {brandName}
                </div>
              </Link>
              <p className="font-body text-gray-400 text-xs sm:text-sm leading-relaxed mb-6 max-w-md">
                {brandSlogan}
              </p>

              {socialEnabled && socialList.length > 0 && (
                <div className="flex items-center gap-2.5 sm:gap-3 pt-1">
                  {socialList.map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      title={label}
                      aria-label={label}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-300 hover:scale-110 hover:-translate-y-0.5 shadow-md shadow-black/40 group overflow-hidden"
                    >
                      <Icon size={38} className="w-full h-full object-contain" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Links */}
          {linksEnabled && (
            <div className="lg:col-span-3">
              <h3 className="font-heading font-semibold text-base sm:text-lg mb-4 text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" /> {linksTitle}
              </h3>
              <ul className="grid grid-cols-2 sm:grid-cols-1 gap-2.5 sm:gap-3">
                {activeNavItems.map(({ to, label }) => {
                  const isExt = to.startsWith('http')
                  return (
                    <li key={to + label}>
                      {isExt ? (
                        <a
                          href={to}
                          target="_blank"
                          rel="noreferrer"
                          className="font-body text-xs sm:text-sm text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5 sm:gap-2 group py-1 sm:py-0"
                        >
                          <span className="text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition-all">
                            &rarr;
                          </span>
                          {label}
                        </a>
                      ) : (
                        <Link
                          to={to}
                          className="font-body text-xs sm:text-sm text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5 sm:gap-2 group py-1 sm:py-0"
                        >
                          <span className="text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition-all">
                            &rarr;
                          </span>
                          {label}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {/* Contact Info */}
          {contactEnabled && (
            <div className={`${brandEnabled && linksEnabled ? 'lg:col-span-4' : 'lg:col-span-6'}`}>
              <h3 className="font-heading font-semibold text-base sm:text-lg mb-4 text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-primary" /> {contactTitle}
              </h3>
              <ul className="space-y-3 sm:space-y-3.5">
                {[
                  { icon: Phone, text: brandPhone, href: `tel:${brandPhone.replace(/\s+/g, '')}` },
                  { icon: Mail, text: brandEmail, href: `mailto:${brandEmail}` },
                  { icon: MapPin, text: brandAddress, href: brandMapsUrl },
                ].map(({ icon: Icon, text, href }) => (
                  <li key={text} className="flex items-start gap-2.5 sm:gap-3 group">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-primary group-hover:border-primary transition-all duration-300">
                      <Icon size={14} className="text-primary group-hover:text-white transition-colors" />
                    </div>
                    {href ? (
                      <a
                        href={href}
                        target={href.startsWith('http') ? '_blank' : undefined}
                        rel={href.startsWith('http') ? 'noreferrer' : undefined}
                        className="font-body text-xs sm:text-sm text-gray-300 hover:text-primary transition-colors leading-snug break-words flex-1 pt-1"
                      >
                        {text}
                      </a>
                    ) : (
                      <span className="font-body text-xs sm:text-sm text-gray-300 leading-snug break-words flex-1 pt-1">{text}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar */}
      {bottomEnabled && (
        <div className="border-t border-white/10 bg-black/40">
          <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 2xl:px-16 py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
            <p className="font-body text-xs text-gray-400">
              {settings?.footer_copyright_text || (
                <>
                  &copy; {new Date().getFullYear()} <span className="text-white font-medium">{brandName}</span>. Bảo lưu mọi quyền.
                </>
              )}
            </p>
            {settings?.footer_tagline_text ? (
              <p className="font-body text-xs text-gray-400">
                {settings.footer_tagline_text}
              </p>
            ) : (
              <p className="font-body text-xs text-gray-400 flex items-center justify-center gap-1.5">
                Được tạo với <Heart size={13} className="text-primary fill-primary inline-block" /> dành cho những thiên thần nhỏ
              </p>
            )}
          </div>
        </div>
      )}
    </footer>
  )
}