import { useState, useEffect } from 'react'
import {
  CalendarCheck2,
  Search,
  Clock,
  CheckCircle2,
  XCircle,
  Sparkles,
  Trash2,
  Eye,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  FileText,
  X,
  User,
  Filter,
  Copy,
  Check,
  ExternalLink,
} from 'lucide-react'
import api from '../../utils/api'
import BookingDetailModal from '../../components/admin/BookingDetailModal'

const formatDateDisplay = (val) => {
  if (!val) return '—'
  const iso = String(val).match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (iso) return `${iso[3]}/${iso[2]}/${iso[1]}`
  const dmy = String(val).match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})/)
  if (dmy) {
    return `${dmy[1].padStart(2, '0')}/${dmy[2].padStart(2, '0')}/${dmy[3]}`
  }
  return val
}

export default function BookingsManager() {
  const [bookings, setBookings] = useState([])
  const [stats, setStats] = useState({ total: 0, pending: 0, confirmed: 0, completed: 0, cancelled: 0 })
  const [loading, setLoading] = useState(true)
  const [activeFilter, setActiveFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [copiedPhoneId, setCopiedPhoneId] = useState(null)

  const handleCopyPhone = (id, phone) => {
    if (!phone) return
    navigator.clipboard.writeText(phone)
    setCopiedPhoneId(id)
    setTimeout(() => setCopiedPhoneId(null), 2000)
  }

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      if (activeFilter !== 'all') queryParams.append('status', activeFilter)
      if (search.trim()) queryParams.append('search', search.trim())

      const res = await api.get(`/admin/bookings?${queryParams.toString()}`)
      if (res.success) {
        setBookings(res.data || [])
        if (res.stats) setStats(res.stats)
      }
    } catch (error) {
      console.warn('Lỗi khi tải lịch hẹn:', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [activeFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchBookings()
  }

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await api.patch(`/admin/bookings/${id}/status`, { status: newStatus })
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking((prev) => ({ ...prev, status: newStatus }))
      }
      fetchBookings()
    } catch (error) {
      alert('Lỗi cập nhật: ' + error.message)
    }
  }

  const handleDeleteBooking = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch hẹn này?')) return
    try {
      await api.delete(`/admin/bookings/${id}`)
      if (selectedBooking && selectedBooking.id === id) {
        setSelectedBooking(null)
      }
      fetchBookings()
    } catch (error) {
      alert('Lỗi khi xóa: ' + error.message)
    }
  }

  const statusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock size={12} /> Chờ Xác Nhận
          </span>
        )
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={12} /> Đã Xác Nhận
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Sparkles size={12} /> Hoàn Thành
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle size={12} /> Đã Hủy
          </span>
        )
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900 flex items-center gap-2.5">
            <CalendarCheck2 className="text-primary" size={24} />
            Quản Lý Lịch Hẹn Chụp Ảnh
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Theo dõi, xử lý và cập nhật trạng thái các yêu cầu đặt lịch của khách hàng
          </p>
        </div>

        <button
          onClick={() => fetchBookings()}
          className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-xs flex items-center gap-2 self-start sm:self-auto transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Làm Mới</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-sm">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 custom-scrollbar">
          {[
            { id: 'all', label: 'Tất Cả', count: stats.total },
            { id: 'pending', label: 'Chờ Xác Nhận', count: stats.pending, color: 'text-amber-600' },
            { id: 'confirmed', label: 'Đã Xác Nhận', count: stats.confirmed, color: 'text-emerald-600' },
            { id: 'completed', label: 'Hoàn Thành', count: stats.completed, color: 'text-blue-600' },
            { id: 'cancelled', label: 'Đã Hủy', count: stats.cancelled, color: 'text-rose-600' },
          ].map((tab) => {
            const active = activeFilter === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  active
                    ? 'bg-primary text-white font-semibold shadow-md shadow-primary/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${active ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {tab.count || 0}
                </span>
              </button>
            )
          })}
        </div>

        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full lg:w-72">
          <input
            type="text"
            placeholder="Tìm kiếm theo tên khách hàng, số điện thoại, gói chụp..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </form>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span>Đang tải danh sách lịch hẹn...</span>
          </div>
        ) : bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 min-w-[900px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-3">#ID</th>
                  <th className="py-3.5 px-4">Khách Hàng</th>
                  <th className="py-3.5 px-3">Số Điện Thoại</th>
                  <th className="py-3.5 px-3">Gói Dịch Vụ</th>
                  <th className="py-3.5 px-3">Ngày Dự Kiến</th>
                  <th className="py-3.5 px-3">Thời Gian Chụp (Đã Chốt)</th>
                  <th className="py-3.5 px-3">Trạng Thái</th>
                  <th className="py-3.5 px-3">Ngày Gửi</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => {
                  const cleanPhone = (b.phone || '').replace(/[^0-9]/g, '')
                  const isCopied = copiedPhoneId === b.id

                  return (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      {/* #ID */}
                      <td className="py-4 px-3 text-slate-400 font-mono text-[11px]">#{b.id}</td>

                      {/* Khách Hàng */}
                      <td className="py-4 px-4 font-bold text-slate-900">
                        {b.name}
                      </td>

                      {/* Số Điện Thoại (Cột Riêng) */}
                      <td className="py-4 px-3">
                        <div className="flex items-center gap-1.5">
                          <a
                            href={`tel:${b.phone}`}
                            className="font-mono text-primary font-bold hover:underline text-xs"
                            title="Gọi điện"
                          >
                            {b.phone}
                          </a>
                          <button
                            type="button"
                            onClick={() => handleCopyPhone(b.id, b.phone)}
                            className="p-1 rounded hover:bg-slate-200/70 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                            title="Sao chép SĐT"
                          >
                            {isCopied ? (
                              <Check size={12} className="text-emerald-600" />
                            ) : (
                              <Copy size={12} />
                            )}
                          </button>
                          {cleanPhone && (
                            <a
                              href={`https://zalo.me/${cleanPhone}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-1.5 py-0.5 rounded bg-[#0068FF]/10 hover:bg-[#0068FF]/20 text-[#0068FF] text-[10px] font-bold transition-colors cursor-pointer"
                              title="Nhắn Zalo"
                            >
                              Zalo
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Gói Dịch Vụ */}
                      <td className="py-4 px-3 text-slate-700 font-medium">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-[11px] font-semibold">
                          {b.service}
                        </span>
                      </td>

                      {/* Ngày Dự Kiến */}
                      <td className="py-4 px-3 text-slate-600">
                        {b.date ? (
                          <span className="flex items-center gap-1 font-mono font-medium text-xs">
                            <Calendar size={12} className="text-slate-400" /> {formatDateDisplay(b.date)}
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Chưa chọn ngày</span>
                        )}
                      </td>

                      {/* Thời Gian Chụp (Đã Chốt) */}
                      <td className="py-4 px-3">
                        {b.shoot_time ? (
                          <div className="space-y-0.5 font-mono">
                            <div className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                              <Clock size={12} className="text-primary shrink-0" />
                              <span>{b.shoot_time}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Calendar size={11} className="text-slate-400 shrink-0" />
                              <span>{formatDateDisplay(b.date)}</span>
                            </div>
                          </div>
                        ) : b.status === 'confirmed' || b.status === 'completed' ? (
                          <div className="space-y-0.5 font-mono">
                            <div className="font-medium text-amber-600 flex items-center gap-1 text-[11px]">
                              <Clock size={11} className="text-amber-500 shrink-0" />
                              <span>Chưa chọn giờ</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Calendar size={11} className="text-slate-400 shrink-0" />
                              <span>{formatDateDisplay(b.date)}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-400">
                            Chưa chốt
                          </span>
                        )}
                      </td>

                      {/* Trạng Thái */}
                      <td className="py-4 px-3">{statusBadge(b.status)}</td>

                      {/* Ngày Gửi */}
                      <td className="py-4 px-3 text-slate-400 text-[11px] font-mono whitespace-nowrap">
                        {new Date(b.created_at).toLocaleString('vi-VN', { dateStyle: 'short', timeStyle: 'short' })}
                      </td>

                      {/* Thao Tác */}
                      <td className="py-4 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          title="Xem chi tiết & Điều phối"
                          className="px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Eye size={13} />
                          <span>Chi tiết</span>
                        </button>
                        <button
                          onClick={() => handleDeleteBooking(b.id)}
                          title="Xóa"
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 text-xs">
            Không tìm thấy lịch hẹn nào phù hợp với bộ lọc.
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdated={(updated) => {
            setSelectedBooking(updated)
            fetchBookings()
          }}
          onDeleted={(id) => {
            handleDeleteBooking(id)
          }}
        />
      )}
    </div>
  )
}
