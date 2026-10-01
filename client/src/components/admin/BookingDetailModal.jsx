import { useState, useEffect, useRef } from 'react'
import {
  X,
  Phone,
  Mail,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  MessageSquare,
  FileText,
  User,
  Trash2,
  Check,
  Copy,
  Save,
  Tag,
  ExternalLink,
  Shirt,
  Info,
  ShieldCheck,
} from 'lucide-react'
import api from '../../utils/api'

const toIsoDate = (val) => {
  if (!val) return ''
  const iso = String(val).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`
  const dmy = String(val).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (dmy) {
    const d = dmy[1].padStart(2, '0')
    const m = dmy[2].padStart(2, '0')
    const y = dmy[3]
    return `${y}-${m}-${d}`
  }
  return ''
}

const formatDateDisplay = (val) => {
  if (!val) return ''
  const iso = String(val).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`
  const dmy = String(val).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (dmy) {
    return `${dmy[1].padStart(2, '0')}/${dmy[2].padStart(2, '0')}/${dmy[3]}`
  }
  return val
}

export default function BookingDetailModal({
  booking,
  onClose,
  onUpdated,
  onDeleted,
}) {
  const dateInputRef = useRef(null)
  const [formData, setFormData] = useState({
    shoot_date: '',
    shoot_time: '',
    preparation_notes: '',
    admin_notes: '',
    status: 'pending',
  })
  const [saving, setSaving] = useState(false)
  const [copiedPhone, setCopiedPhone] = useState(false)
  const [copiedZaloMsg, setCopiedZaloMsg] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    if (booking) {
      setFormData({
        shoot_date: toIsoDate(booking.date) || booking.date || '',
        shoot_time: booking.shoot_time || '',
        preparation_notes: booking.preparation_notes || '',
        admin_notes: booking.admin_notes || '',
        status: booking.status || 'pending',
      })
    }
  }, [booking])

  if (!booking) return null

  // Clean phone for Zalo link: e.g. 0962834892 -> 84962834892 or 0962834892
  const cleanPhone = (booking.phone || '').replace(/[^0-9]/g, '')
  const zaloUrl = cleanPhone ? `https://zalo.me/${cleanPhone}` : '#'

  // Quick prep templates for baby/family photography
  const quickPrepTags = [
    'Tone trang phục: Trắng / Be / Pastel',
    'Mang theo 2 - 3 bộ đồ thay cho bé',
    'Chuẩn bị sữa ấm & núm ti ngậm',
    'Đồ chơi yêu thích gây chú ý',
    'Tã bỉm & khăn ướt dự phòng',
    'Bố mẹ chuẩn bị trang phục đồng màu',
  ]

  const handleAddPrepTag = (tag) => {
    setFormData((prev) => {
      const current = prev.preparation_notes ? prev.preparation_notes.trim() : ''
      if (current.includes(tag)) return prev
      const updated = current ? `${current}\n• ${tag}` : `• ${tag}`
      return { ...prev, preparation_notes: updated }
    })
  }

  const handleSave = async (statusOverride = null) => {
    try {
      setSaving(true)
      const newStatus = statusOverride || formData.status
      const finalDate = formData.shoot_date
        ? formatDateDisplay(formData.shoot_date)
        : (formatDateDisplay(booking.date) || booking.date || '')

      const payload = {
        name: booking.name,
        phone: booking.phone,
        email: booking.email,
        service: booking.service,
        date: finalDate,
        shoot_time: formData.shoot_time,
        preparation_notes: formData.preparation_notes,
        admin_notes: formData.admin_notes,
        status: newStatus,
      }

      if (statusOverride) {
        setFormData((prev) => ({ ...prev, status: statusOverride }))
      }

      let success = false
      // 1. Try PUT /admin/bookings/:id
      try {
        const res = await api.put(`/admin/bookings/${booking.id}`, payload)
        if (res.success) success = true
      } catch (putErr) {
        // 2. Try PATCH /admin/bookings/:id
        try {
          const res = await api.patch(`/admin/bookings/${booking.id}`, payload)
          if (res.success) success = true
        } catch (patchErr) {
          // 3. Fallback: PATCH /admin/bookings/:id/status
          const res = await api.patch(`/admin/bookings/${booking.id}/status`, { status: newStatus })
          if (res.success) success = true
        }
      }

      setSaveSuccess(true)
      if (onUpdated) {
        onUpdated({ ...booking, ...payload, date: finalDate })
      }
      if (onClose) {
        onClose()
      }
    } catch (error) {
      alert('Không thể cập nhật lịch hẹn: ' + (error.message || 'Lỗi kết nối'))
    } finally {
      setSaving(false)
    }
  }

  const handleOpenDatePicker = () => {
    if (dateInputRef.current) {
      try {
        dateInputRef.current.showPicker?.()
      } catch {
        dateInputRef.current.focus()
      }
    }
  }

  const handleCopyPhone = () => {
    if (!booking.phone) return
    navigator.clipboard.writeText(booking.phone)
    setCopiedPhone(true)
    setTimeout(() => setCopiedPhone(false), 2000)
  }

  const handleCopyZaloMessage = () => {
    const formattedDate = formData.shoot_date
      ? formatDateDisplay(formData.shoot_date)
      : (formatDateDisplay(booking.date) || 'sắp tới')
    const formattedTime = formData.shoot_time ? ` vào lúc ${formData.shoot_time}` : ''
    const msg = `Dạ em chào anh/chị ${booking.name}! QA Stories Studio xin phép liên hệ xác nhận lịch chụp ảnh gói "${booking.service}" cho bé${formattedTime} ngày ${formattedDate}. Studio xin gửi một số lưu ý chuẩn bị trước buổi chụp ạ:\n${formData.preparation_notes || '• Ba mẹ cho bé ngủ đủ giấc và chuẩn bị 2-3 bộ trang phục yêu thích nhé!'}\nCảm ơn anh/chị đã tin tưởng lựa chọn QA Stories!`

    navigator.clipboard.writeText(msg)
    setCopiedZaloMsg(true)
    setTimeout(() => setCopiedZaloMsg(false), 2500)
  }

  const handleDelete = () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch hẹn này không?')) return
    if (onDeleted) onDeleted(booking.id)
  }

  const statusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Chờ xác nhận
          </span>
        )
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-800 border border-emerald-300">
            <CheckCircle2 size={13} className="text-emerald-600" />
            Đã xác nhận
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/15 text-blue-800 border border-blue-300">
            <Sparkles size={13} className="text-blue-600" />
            Đã hoàn thành
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={13} className="text-rose-500" />
            Đã hủy lịch
          </span>
        )
      default:
        return status
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-5xl w-full p-5 sm:p-7 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          title="Đóng"
        >
          <X size={20} />
        </button>

        {/* Modal Top Header */}
        <div className="flex items-start gap-3.5 pb-4 border-b border-slate-100 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-primary/20 shrink-0">
            {(booking.name || 'K').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 pr-8">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 truncate font-admin">
                {booking.name}
              </h2>
              {statusBadge(formData.status)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap font-mono">
              <span>Mã lịch hẹn: #{booking.id}</span>
              <span>•</span>
              <span>Gửi lúc: {new Date(booking.created_at).toLocaleString('vi-VN')}</span>
            </div>
          </div>
        </div>

        {/* Quick Contact & Action Buttons */}
        <div className="py-3 border-b border-slate-100 flex flex-wrap items-center gap-2 shrink-0 bg-slate-50/70 -mx-5 sm:-mx-7 px-5 sm:px-7">
          {/* Chat Zalo Button */}
          <a
            href={zaloUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 min-w-[140px] py-2 px-3 rounded-xl bg-[#0068FF] hover:bg-[#0055d4] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs shadow-blue-500/30 transition-all cursor-pointer group active:scale-95"
            title={`Mở Zalo nhắn tin với ${booking.name}`}
          >
            <div className="w-4 h-4 rounded-full bg-white text-[#0068FF] flex items-center justify-center font-bold text-[9px] group-hover:scale-110 transition-transform">
              Z
            </div>
            <span>Chat Zalo Ngay</span>
            <ExternalLink size={12} className="opacity-70" />
          </a>

          {/* Phone Call */}
          <a
            href={`tel:${booking.phone}`}
            className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer active:scale-95"
            title={`Gọi ngay cho ${booking.phone}`}
          >
            <Phone size={14} />
            <span>Gọi {booking.phone}</span>
          </a>

          {/* Copy Phone */}
          <button
            type="button"
            onClick={handleCopyPhone}
            className="py-2 px-3 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Sao chép số điện thoại"
          >
            {copiedPhone ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
            <span>{copiedPhone ? 'Đã chép SĐT' : 'Chép SĐT'}</span>
          </button>

          {/* Copy Zalo Confirmation Template */}
          <button
            type="button"
            onClick={handleCopyZaloMessage}
            className="py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Sao chép tin nhắn mẫu để gửi Zalo cho khách hàng"
          >
            {copiedZaloMsg ? <Check size={14} className="text-emerald-600" /> : <MessageSquare size={14} />}
            <span>{copiedZaloMsg ? 'Đã chép mẫu tin!' : 'Mẫu tin Zalo'}</span>
          </button>
        </div>

        {/* 2-Column Responsive Layout (Customer: 5 cols / Studio: 7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 py-5 text-xs">
          {/* LEFT COLUMN: THÔNG TIN KHÁCH HÀNG CUNG CẤP (READ-ONLY) - 5/12 */}
          <div className="lg:col-span-5 space-y-3.5 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
              <span className="font-bold text-slate-700 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <Info size={14} className="text-primary" /> Thông Tin Khách Hàng
              </span>
              <span className="text-[10px] text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded-md font-semibold">
                Không thể sửa
              </span>
            </div>

            <div className="space-y-3">
              {/* Họ tên */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <User size={13} className="text-slate-400" /> Họ và tên:
                </span>
                <span className="font-bold text-slate-900 text-sm">{booking.name}</span>
              </div>

              {/* Số điện thoại */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Phone size={13} className="text-slate-400" /> Số điện thoại:
                </span>
                <a
                  href={`tel:${booking.phone}`}
                  className="font-mono text-primary font-bold hover:underline text-sm"
                >
                  {booking.phone}
                </a>
              </div>

              {/* Email */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Mail size={13} className="text-slate-400" /> Email liên hệ:
                </span>
                <span className="font-medium text-slate-800 truncate max-w-[170px]" title={booking.email}>
                  {booking.email || 'Không cung cấp'}
                </span>
              </div>

              {/* Gói dịch vụ */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Tag size={13} className="text-primary" /> Gói dịch vụ:
                </span>
                <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200 text-[11px]">
                  {booking.service}
                </span>
              </div>

              {/* Ngày dự kiến chụp */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar size={13} className="text-primary" /> Ngày dự kiến:
                </span>
                <span className="font-bold text-primary text-xs bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200/60 font-mono">
                  {formatDateDisplay(booking.date) || 'Chưa định ngày'}
                </span>
              </div>

              {/* Lời nhắn riêng từ khách */}
              <div className="pt-1">
                <span className="text-slate-500 flex items-center gap-1.5 mb-1.5 font-semibold">
                  <MessageSquare size={13} className="text-primary" /> Lời nhắn từ khách:
                </span>
                <div className="p-3 rounded-xl bg-white border border-slate-200/80 text-slate-800 italic leading-relaxed text-xs">
                  {booking.note ? `"${booking.note}"` : 'Không có ghi chú thêm từ khách hàng.'}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: STUDIO QUẢN LÝ & ĐIỀU PHỐI (EDITABLE) - 7/12 */}
          <div className="lg:col-span-7 space-y-3.5 bg-blue-50/20 p-4 sm:p-5 rounded-2xl border border-blue-200/70">
            <div className="flex items-center justify-between pb-2 border-b border-blue-200/60">
              <span className="font-bold text-blue-950 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <ShieldCheck size={14} className="text-blue-600" /> Studio Điều Phối & Ghi Chú
              </span>
              <span className="text-[10px] text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md font-semibold">
                Có thể chỉnh sửa
              </span>
            </div>

            {/* Ngày & Giờ Chụp Đã Chốt (Date Time Picker) */}
            <div className="space-y-2.5 bg-white/90 p-3.5 rounded-xl border border-blue-200/70 shadow-2xs">
              <div className="flex items-center justify-between flex-wrap gap-1">
                <label className="font-bold text-slate-800 flex items-center gap-1.5 text-xs">
                  <Calendar size={13} className="text-blue-600" /> Ngày & Giờ Chụp Đã Chốt
                </label>
                {booking.date && (
                  <button
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        shoot_date: toIsoDate(booking.date) || prev.shoot_date,
                      }))
                    }
                    className="text-[10px] text-primary hover:text-primary-dark font-semibold hover:underline cursor-pointer"
                    title="Lấy theo ngày khách đặt ban đầu"
                  >
                    Ngày khách đặt ({formatDateDisplay(booking.date)})
                  </button>
                )}
              </div>

              {/* 2 Ô Chọn: Ngày & Giờ */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {/* Chọn ngày với định dạng dd/mm/yyyy */}
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 mb-1 block flex items-center gap-1">
                    <Calendar size={11} className="text-slate-400" /> Ngày chụp:
                  </span>
                  <div
                    onClick={handleOpenDatePicker}
                    className="relative w-full px-3 py-2 bg-slate-50 hover:bg-slate-100/90 focus-within:bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary cursor-pointer transition-colors flex items-center justify-between group"
                  >
                    <input
                      ref={dateInputRef}
                      type="date"
                      value={toIsoDate(formData.shoot_date) || ''}
                      onChange={(e) => setFormData({ ...formData, shoot_date: e.target.value })}
                      className="sr-only"
                      tabIndex={-1}
                    />
                    <span className={formData.shoot_date ? 'text-slate-900 font-bold font-mono' : 'text-slate-400 font-normal'}>
                      {formData.shoot_date ? formatDateDisplay(formData.shoot_date) : 'dd/mm/yyyy'}
                    </span>
                    <Calendar size={14} className="text-slate-400 group-hover:text-primary transition-colors shrink-0" />
                  </div>
                </div>

                {/* Chọn giờ dạng 24 tiếng */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                      <Clock size={11} className="text-slate-400" /> Khung giờ (24h):
                    </span>
                    {formData.shoot_time && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, shoot_time: '' })}
                        className="text-[10px] text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                        title="Xóa giờ đã nhập"
                      >
                        Xóa
                      </button>
                    )}
                  </div>
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={formData.shoot_time}
                      onChange={(e) => setFormData({ ...formData, shoot_time: e.target.value })}
                      placeholder="08:30, 14:00 hoặc 14:00 - 16:30"
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 hover:bg-slate-100/90 focus:bg-white border border-slate-200 rounded-xl text-xs font-semibold font-mono text-slate-900 placeholder:text-slate-400 placeholder:font-normal placeholder:font-sans focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    />
                    <Clock size={13} className="absolute right-3 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Quick Time Slot Chips (24h) */}
              <div className="pt-0.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] text-slate-400 font-medium">Giờ 24h nhanh:</span>
                {['08:30', '09:00', '09:30', '10:30', '13:30', '14:00', '15:00', '15:30', '17:00'].map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setFormData({ ...formData, shoot_time: slot })}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                      formData.shoot_time === slot
                        ? 'bg-primary text-white shadow-2xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Thứ cần chuẩn bị */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                <Shirt size={13} className="text-blue-600" /> Thứ Cần Chuẩn Bị (Trang phục, phụ kiện gửi khách)
              </label>

              {/* Quick tags */}
              <div className="flex flex-wrap gap-1 pb-0.5">
                {quickPrepTags.map((tag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleAddPrepTag(tag)}
                    className="px-2 py-0.5 rounded-md bg-white hover:bg-blue-100/70 text-blue-700 border border-blue-200 text-[10px] font-medium transition-colors cursor-pointer"
                  >
                    + {tag}
                  </button>
                ))}
              </div>

              <textarea
                rows={3}
                value={formData.preparation_notes}
                onChange={(e) => setFormData({ ...formData, preparation_notes: e.target.value })}
                placeholder="Nhập danh sách đồ cần chuẩn bị và lưu ý gửi khách"
                className="w-full p-2.5 bg-white border border-blue-200/80 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 leading-relaxed resize-none"
              />
            </div>

            {/* Ghi chú nội bộ studio */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                <FileText size={13} className="text-slate-500" /> Ghi Chú Nội Bộ Studio
              </label>
              <textarea
                rows={2}
                value={formData.admin_notes}
                onChange={(e) => setFormData({ ...formData, admin_notes: e.target.value })}
                placeholder="Nhập ghi chú thợ ảnh phụ trách, ekip, tiền cọc..."
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary leading-relaxed resize-none"
              />
            </div>
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="pt-4 border-t border-slate-100 shrink-0 space-y-3">
          {/* Status buttons */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Trạng thái lịch hẹn:
            </span>
            <div className="flex items-center gap-1.5 flex-wrap">
              {[
                { id: 'pending', label: 'Chờ duyệt', activeClass: 'bg-amber-500 text-white' },
                { id: 'confirmed', label: 'Đã xác nhận', activeClass: 'bg-emerald-600 text-white' },
                { id: 'completed', label: 'Hoàn thành', activeClass: 'bg-blue-600 text-white' },
                { id: 'cancelled', label: 'Hủy lịch', activeClass: 'bg-rose-600 text-white' },
              ].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleSave(s.id)}
                  disabled={saving}
                  className={`py-1.2 px-3 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    formData.status === s.id
                      ? `${s.activeClass} shadow-xs font-bold`
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handleDelete}
              className="text-rose-600 hover:text-rose-700 text-xs font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Trash2 size={13} />
              <span>Xóa lịch hẹn</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Đóng
              </button>

              <button
                type="button"
                onClick={() => handleSave()}
                disabled={saving}
                className="px-6 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md shadow-primary/25 hover:shadow-primary/40 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <Check size={14} className="text-white" />
                    <span>Đã lưu thành công!</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>{saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
