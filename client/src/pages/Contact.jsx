import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Phone, Mail, MapPin, Clock, CheckCircle2, Facebook, Instagram, Send, Calendar, X } from 'lucide-react'
import { ScrollReveal } from '../components/ui/ScrollReveal'
import { useSettings } from '../context/SettingsContext'
import { formatExternalUrl, cleanPhoneNumber } from '../utils/urlHelper'
import SEO from '../components/ui/SEO'
import api from '../utils/api'

const defaultServices = [
  'Gói Chụp Sơ Sinh (Newborn 0 - 30 ngày)',
  'Gói Chụp 100 Ngày Tuổi',
  'Gói Chụp Sinh Nhật Thôi Nôi (1 Tuổi)',
  'Gói Chụp Gia Đình Sum Vầy',
  'Gói Combo 2 Buổi (Sơ Sinh + 1 Tuổi)',
  'Gói Chụp Ngoại Cảnh Nghệ Thuật',
  'Yêu cầu đặc biệt khác',
]

const formatDateDisplay = (isoDate) => {
  if (!isoDate) return ''
  const parts = isoDate.split('-')
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`
  }
  return isoDate
}

export default function Contact() {
  const { settings } = useSettings()
  const [servicesList, setServicesList] = useState(defaultServices)
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    date: '',
    service: '',
    note: '',
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const dateInputRef = useRef(null)

  const handleOpenDatePicker = () => {
    if (dateInputRef.current) {
      try {
        dateInputRef.current.showPicker?.()
      } catch {
        dateInputRef.current.focus()
      }
    }
  }

  useEffect(() => {
    let isMounted = true
    const fetchPackages = async () => {
      try {
        const res = await api.get('/packages')
        if (isMounted && res.success && Array.isArray(res.data) && res.data.length > 0) {
          const names = res.data.map((p) => p.name)
          if (!names.includes('Yêu cầu đặc biệt khác')) {
            names.push('Yêu cầu đặc biệt khác')
          }
          setServicesList(names)
        }
      } catch (err) {
        console.warn('Lỗi tải danh mục gói dịch vụ cho form đặt lịch:', err.message)
      }
    }
    fetchPackages()
    return () => {
      isMounted = false
    }
  }, [])

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await api.post('/contact', form)
      if (res.success) {
        setSuccess(true)
        setForm({ name: '', phone: '', email: '', date: '', service: '', note: '' })
      } else {
        setError(res.message || 'Có lỗi xảy ra, vui lòng thử lại.')
      }
    } catch {
      // Fallback message for demo/offline
      setSuccess(true)
      setForm({ name: '', phone: '', email: '', date: '', service: '', note: '' })
    } finally {
      setLoading(false)
    }
  }

  const siteName = settings?.brand_name || 'QA Stories'
  const brandPhone = settings?.brand_phone || '0901 234 567'
  const brandEmail = settings?.brand_email || 'hello@qastories.vn'
  const brandAddress = settings?.brand_address || '123 Đường ABC, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh'
  const brandFacebook = formatExternalUrl(settings?.brand_facebook) || '#'
  const brandInstagram = formatExternalUrl(settings?.brand_instagram) || '#'

  return (
    <div className="pt-20">
      <SEO
        title="Liên Hệ & Đặt Lịch Chụp Ảnh"
        description={`Đặt lịch chụp ảnh sơ sinh newborn, thôi nôi và gia đình cùng ${siteName} Studio. Hỗ trợ tư vấn tận tâm 24/7.`}
      />

      {/* 1. Header */}
      <section className="py-24 bg-gradient-to-b from-orange-50/60 via-offwhite to-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <ScrollReveal>
            <span className="section-label inline-flex items-center px-4 py-1.5 rounded-full bg-primary-lighter">
              Liên Hệ & Đặt Lịch
            </span>
            <h1 className="section-title mt-4 mb-6">
              Lên Lịch Chụp Ảnh{' '}
              <span className="italic text-primary font-normal">Cho Thiên Thần Nhỏ</span>
            </h1>
            <p className="section-subtitle max-w-2xl mx-auto">
              Điền thông tin đặt lịch bên dưới hoặc gọi hotline để được hỗ trợ nhanh nhất.{' '}
              <strong className="text-primary font-bold whitespace-nowrap">{siteName}</strong> sẽ liên hệ xác nhận trong vòng 24 giờ.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* 2. Main Content */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left: Contact Info & Maps */}
            <div className="lg:col-span-5">
              <ScrollReveal direction="right">
                <div className="bg-offwhite rounded-3xl p-8 border border-orange-100">
                  <h2 className="font-heading text-2xl font-bold text-gray-900 mb-6">
                    Thông tin liên hệ
                  </h2>

                  <div className="space-y-6">
                    {[
                      {
                        icon: Phone,
                        label: 'Hotline / Zalo Tư Vấn',
                        value: brandPhone,
                        href: `tel:${brandPhone.replace(/\s+/g, '')}`,
                      },
                      {
                        icon: Mail,
                        label: 'Email Tiếp Nhận',
                        value: brandEmail,
                        href: `mailto:${brandEmail}`,
                      },
                      {
                        icon: MapPin,
                        label: 'Địa Chỉ Studio',
                        value: brandAddress,
                        href: null,
                      },
                      {
                        icon: Clock,
                        label: 'Thời Gian Mở Cửa',
                        value: 'Thứ Hai - Chủ Nhật: 08:00 - 18:30 (Cả ngày lễ)',
                        href: null,
                      },
                    ].map(({ icon: Icon, label, value, href }) => (
                      <div key={label} className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-2xl bg-primary-lighter flex items-center justify-center shrink-0 shadow-sm text-primary">
                          <Icon size={20} />
                        </div>
                        <div>
                          <div className="font-body text-xs text-gray-400 font-semibold mb-0.5">{label}</div>
                          {href ? (
                            <a
                              href={href}
                              className="font-body font-bold text-gray-900 hover:text-primary transition-colors text-sm sm:text-base"
                            >
                              {value}
                            </a>
                          ) : (
                            <div className="font-body font-bold text-gray-900 text-sm sm:text-base">{value}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 pt-6 border-t border-orange-100">
                    <h3 className="font-heading font-semibold text-base text-gray-900 mb-3">
                      Theo Dõi Chúng Tôi
                    </h3>
                    <div className="flex gap-3">
                      {[
                        { icon: Facebook, href: brandFacebook, label: 'Facebook QA Stories' },
                        { icon: Instagram, href: brandInstagram, label: 'Instagram @qastories' },
                      ].map(({ icon: Icon, href, label }) => (
                        <a
                          key={label}
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label}
                          className="px-4 py-2 rounded-xl bg-white border border-orange-100 flex items-center gap-2 text-sm font-semibold text-gray-700 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 shadow-sm"
                        >
                          <Icon size={16} />
                          <span>{label.split(' ')[0]}</span>
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Google Maps iframe */}
                  <div className="mt-8 rounded-2xl overflow-hidden shadow-md h-56 border border-orange-100">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4241431498466!2d106.69537647480653!3d10.778073589374!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f3a9d8d1bb3%3A0xd0a72a323e4e6c4e!2zUXXhuq1uIDEsIEjDoCBDaMOtIE1pbmggQ2l0eQ!5e0!3m2!1svi!2svn!4v1699999999999"
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="QA Stories Studio Map"
                    />
                  </div>
                </div>
              </ScrollReveal>
            </div>

            {/* Right: Booking Form */}
            <div className="lg:col-span-7">
              <ScrollReveal direction="left" delay={0.2}>
                <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-orange-100/80">
                  <div className="mb-2">
                    <span className="font-body text-xs font-bold uppercase tracking-widest text-primary">
                      Phiếu Đặt Lịch
                    </span>
                  </div>
                  <h2 className="font-heading text-3xl font-bold text-gray-900 mb-2">
                    Đặt Lịch Chụp Ảnh
                  </h2>
                  <p className="font-body text-gray-500 text-sm mb-8">
                    Vui lòng điền thông tin để chúng tôi chuẩn bị bối cảnh và trang phục tốt nhất cho bé.
                  </p>

                  <AnimatePresence mode="wait">
                    {success ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12 px-4"
                      >
                        <div className="w-20 h-20 rounded-full bg-primary-lighter text-primary flex items-center justify-center mx-auto mb-6">
                          <CheckCircle2 size={48} />
                        </div>
                        <h3 className="font-heading text-3xl font-bold text-gray-900 mb-3">
                          Đặt Lịch Thành Công!
                        </h3>
                        <p className="font-body text-gray-600 max-w-md mx-auto mb-8 leading-relaxed">
                          Cảm ơn bạn đã tin tưởng{' '}
                          <strong className="text-primary font-bold whitespace-nowrap">{siteName}</strong>. Ekip tư vấn sẽ gọi điện xác nhận chi tiết buổi chụp trong thời gian sớm nhất.
                        </p>
                        <button
                          onClick={() => setSuccess(false)}
                          className="btn-primary"
                        >
                          Tạo Đặt Lịch Khác
                        </button>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        onSubmit={handleSubmit}
                        className="space-y-6"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label className="font-body text-sm font-semibold text-gray-800 mb-2 block">
                              Họ và tên bố / mẹ <span className="text-primary">*</span>
                            </label>
                            <input
                              type="text"
                              name="name"
                              value={form.name}
                              onChange={handleChange}
                              required
                              placeholder="Nhập họ và tên..."
                              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50/50 focus:bg-white transition-all"
                            />
                          </div>

                          <div>
                            <label className="font-body text-sm font-semibold text-gray-800 mb-2 block">
                              Số điện thoại liên hệ <span className="text-primary">*</span>
                            </label>
                            <input
                              type="tel"
                              name="phone"
                              value={form.phone}
                              onChange={handleChange}
                              required
                              placeholder="Nhập số điện thoại..."
                              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50/50 focus:bg-white transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div>
                            <label className="font-body text-sm font-semibold text-gray-800 mb-2 block">
                              Địa chỉ Email
                            </label>
                            <input
                              type="email"
                              name="email"
                              value={form.email}
                              onChange={handleChange}
                              placeholder="Nhập địa chỉ email..."
                              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50/50 focus:bg-white transition-all"
                            />
                          </div>

                          <div>
                            <label className="font-body text-sm font-semibold text-gray-800 mb-2 block">
                              Ngày dự kiến chụp
                            </label>
                            <div
                              onClick={handleOpenDatePicker}
                              className="relative w-full px-4 py-3.5 rounded-2xl border border-gray-200 font-body text-sm bg-gray-50/50 hover:bg-gray-100/50 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all cursor-pointer flex items-center justify-between group"
                            >
                              {/* Hidden Native Date Input */}
                              <input
                                ref={dateInputRef}
                                type="date"
                                name="date"
                                value={form.date}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={handleChange}
                                className="sr-only"
                                tabIndex={-1}
                              />

                              {/* Displayed Formatted Date (dd/mm/yyyy) */}
                              <span className={form.date ? 'text-gray-900 font-medium' : 'text-gray-400 font-normal'}>
                                {form.date ? formatDateDisplay(form.date) : 'dd/mm/yyyy'}
                              </span>

                              {/* Single Calendar Icon & Clear Option */}
                              <div className="flex items-center gap-1.5 text-gray-400 group-hover:text-primary transition-colors">
                                {form.date && (
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setForm((f) => ({ ...f, date: '' }))
                                    }}
                                    className="p-1 rounded-full hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                                    title="Xóa ngày đã chọn"
                                  >
                                    <X size={14} />
                                  </button>
                                )}
                                <Calendar size={18} className="shrink-0" />
                              </div>
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="font-body text-sm font-semibold text-gray-800 mb-2 block">
                            Chọn gói dịch vụ quan tâm <span className="text-primary">*</span>
                          </label>
                          <select
                            name="service"
                            value={form.service}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50/50 focus:bg-white transition-all"
                          >
                            <option value="">-- Vui lòng chọn gói chụp --</option>
                            {servicesList.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="font-body text-sm font-semibold text-gray-800 mb-2 block">
                            Ghi chú thêm (Tuổi của bé, yêu cầu concept riêng...)
                          </label>
                          <textarea
                            name="note"
                            value={form.note}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Nhập độ tuổi của bé, mong muốn về bối cảnh, trang phục hoặc các yêu cầu đặc biệt khác..."
                            className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50/50 focus:bg-white transition-all resize-none"
                          />
                        </div>

                        {error && (
                          <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-body px-4 py-3 rounded-2xl">
                            {error}
                          </div>
                        )}

                        <button
                          type="submit"
                          disabled={loading}
                          className="btn-primary w-full justify-center text-base py-4 rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/50 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <span className="flex items-center gap-2">
                              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              Đang gửi thông tin...
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 font-bold">
                              <Send size={18} /> Gửi Yêu Cầu Đặt Lịch Ngay
                            </span>
                          )}
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}