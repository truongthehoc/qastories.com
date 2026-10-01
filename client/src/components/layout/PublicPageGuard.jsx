import { Outlet, Link } from 'react-router-dom'
import { EyeOff, Home, PhoneCall, ArrowLeft } from 'lucide-react'
import { useSettings } from '../../context/SettingsContext'

export default function PublicPageGuard({ pageKey, title = 'Trang' }) {
  const { settings } = useSettings()

  const isEnabled = () => {
    if (!settings) return true
    const key = `page_${pageKey}_enabled`
    return settings[key] !== '0' && settings[key] !== false && settings[key] !== 0
  }

  if (!isEnabled()) {
    return (
      <div className="pt-28 pb-20 min-h-[75vh] flex items-center justify-center px-4 bg-offwhite">
        <div className="max-w-md w-full text-center bg-white border border-orange-100/80 rounded-3xl p-8 sm:p-10 shadow-xl shadow-orange-950/5">
          <div className="w-16 h-16 rounded-3xl bg-orange-50 border border-orange-200 text-primary flex items-center justify-center mx-auto mb-5 shadow-inner">
            <EyeOff size={30} />
          </div>

          <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider mb-3">
            Tạm Ẩn Truy Cập
          </span>

          <h1 className="font-heading font-bold text-2xl text-gray-900 mb-3">
            {title} Hiện Đang Tạm Đóng
          </h1>

          <p className="font-body text-gray-500 text-sm leading-relaxed mb-8">
            Nội dung trang này hiện đang được studio cập nhật hoặc tạm ẩn theo cấu hình quản trị. Bố mẹ vui lòng quay lại sau nhé!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/"
              className="btn-primary w-full sm:w-auto text-xs py-2.5 px-5 flex items-center justify-center gap-2 shadow-md shadow-primary/20"
            >
              <Home size={15} />
              <span>Về Trang Chủ</span>
            </Link>

            {settings?.brand_phone && (
              <a
                href={`tel:${settings.brand_phone.replace(/\s+/g, '')}`}
                className="btn-outline w-full sm:w-auto text-xs py-2.5 px-5 flex items-center justify-center gap-2"
              >
                <PhoneCall size={15} />
                <span>Liên Hệ Hotline</span>
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  return <Outlet />
}
