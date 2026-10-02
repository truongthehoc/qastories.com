import { Link } from 'react-router-dom'
import { Camera, Phone, Mail, MapPin, Facebook, Instagram, Youtube, Heart, MessageCircle } from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'

export default function Footer() {
  const { settings } = useSettings()

  return (
    <footer className="bg-gray-950 text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#FF7A2F_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-10 sm:pb-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12">
          {/* Brand Col */}
          <div className="lg:col-span-5">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-3 mb-4 group cursor-pointer"
            >
              {settings?.brand_logo ? (
                <img
                  src={settings.brand_logo}
                  alt={settings?.brand_name || 'QA Stories'}
                  className="h-9 sm:h-10 w-auto max-w-[140px] object-contain group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform duration-300">
                  <Camera size={20} className="text-white" />
                </div>
              )}
              <div className="font-heading font-bold text-xl sm:text-2xl text-white tracking-tight group-hover:text-primary transition-colors duration-300">
                {settings?.brand_name || 'QA Stories'}
              </div>
            </Link>
            <p className="font-body text-gray-400 text-xs sm:text-sm leading-relaxed mb-6 max-w-md">
              {settings?.brand_slogan ||
                'Chúng tôi tin rằng từng tiếng cười khúc khích, từng ánh mắt trong veo và khoảnh khắc đầu đời của bé là món quà quý giá nhất. Hãy để QA Stories đồng hành lưu giữ câu chuyện thiên thần của gia đình bạn.'}
            </p>
            <div className="flex items-center gap-2.5 sm:gap-3">
              {[
                { icon: Facebook, href: settings?.brand_facebook || '#', label: 'Facebook' },
                { icon: Instagram, href: settings?.brand_instagram || '#', label: 'Instagram' },
                { icon: Youtube, href: settings?.brand_youtube || '#', label: 'Youtube' },
                ...(settings?.brand_zalo ? [{ icon: MessageCircle, href: settings.brand_zalo, label: 'Zalo' }] : []),
              ].map(({ icon: Icon, href, label }) => (
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
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-3">
            <h3 className="font-heading font-semibold text-base sm:text-lg mb-4 text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" /> Khám Phá
            </h3>
            <ul className="grid grid-cols-2 sm:grid-cols-1 gap-2.5 sm:gap-3">
              {[
                { to: '/', label: 'Trang Chủ', enabled: settings?.page_home_enabled !== '0' && settings?.page_home_enabled !== false },
                { to: '/album', label: 'Bộ Sưu Tập Album', enabled: settings?.page_album_enabled !== '0' && settings?.page_album_enabled !== false },
                { to: '/about', label: 'Giới Thiệu', enabled: settings?.page_about_enabled !== '0' && settings?.page_about_enabled !== false },
                { to: '/contact', label: 'Báo Giá & Đặt Lịch', enabled: settings?.page_contact_enabled !== '0' && settings?.page_contact_enabled !== false },
              ]
                .filter((item) => item.enabled)
                .map(({ to, label }) => (
                  <li key={to}>
                    <Link
                      to={to}
                      className="font-body text-xs sm:text-sm text-gray-400 hover:text-primary transition-colors flex items-center gap-1.5 sm:gap-2 group py-1 sm:py-0"
                    >
                      <span className="text-primary/60 group-hover:text-primary group-hover:translate-x-1 transition-all">
                        &rarr;
                      </span>
                      {label}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-4">
            <h3 className="font-heading font-semibold text-base sm:text-lg mb-4 text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" /> Liên Hệ
            </h3>
            <ul className="space-y-3 sm:space-y-3.5">
              {[
                { icon: Phone, text: settings?.brand_phone || '0901 234 567', href: `tel:${(settings?.brand_phone || '0901234567').replace(/\s+/g, '')}` },
                { icon: Mail, text: settings?.brand_email || 'hello@qastories.vn', href: `mailto:${settings?.brand_email || 'hello@qastories.vn'}` },
                { icon: MapPin, text: settings?.brand_address || '123 Đường ABC, Quận 1, TP. Hồ Chí Minh', href: settings?.brand_maps_url || null },
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
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-center sm:text-left">
          <p className="font-body text-xs text-gray-400">
            &copy; {new Date().getFullYear()} <span className="text-white font-medium">{settings?.brand_name || 'QA Stories'}</span>. Bảo lưu mọi quyền.
          </p>
          <p className="font-body text-xs text-gray-400 flex items-center justify-center gap-1.5">
            Được tạo với <Heart size={13} className="text-primary fill-primary inline-block" /> dành cho những thiên thần nhỏ
          </p>
        </div>
      </div>
    </footer>
  )
}