import { Link } from 'react-router-dom'
import { Camera, Phone, Mail, MapPin, Facebook, Instagram, Youtube, Heart, MessageCircle } from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'

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

  // Social items
  const socialList = [
    { icon: Facebook, href: settings?.brand_facebook, label: 'Facebook' },
    { icon: Instagram, href: settings?.brand_instagram, label: 'Instagram' },
    { icon: Youtube, href: settings?.brand_youtube, label: 'Youtube' },
    { icon: MessageCircle, href: settings?.brand_zalo, label: 'Zalo' },
  ].filter((s) => !!s.href && s.href !== '#')

  return (
    <footer className="bg-gray-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#FF7A2F_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-10 sm:pb-12 relative z-10">
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
                <div className="flex items-center gap-2.5 sm:gap-3">
                  {socialList.map(({ icon: Icon, href, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={label}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300 group"
                    >
                      <Icon size={17} className="text-gray-300 group-hover:text-white" />
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
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