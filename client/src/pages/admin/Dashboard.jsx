import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CalendarCheck2,
  TrendingUp,
  Images,
  Image as ImageIcon,
  Clock,
  ArrowUpRight,
  Smartphone,
  Monitor,
  CheckCircle2,
  Sparkles,
  Zap,
  Tag,
  SlidersHorizontal,
  UserCheck,
  RefreshCw,
  Eye,
  Plus,
  Phone,
  Mail,
  Calendar,
  Layers,
  ChevronRight,
  Activity,
  Search,
  Check,
  Copy,
  XCircle,
  Trash2,
  X,
  MessageSquare,
  FileText,
  User,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import api from '../../utils/api'
import { useAdminAuth } from '../../context/AdminAuthContext'
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

export default function Dashboard() {
  const { admin } = useAdminAuth()
  const [loading, setLoading] = useState(true)
  const [bookingLoading, setBookingLoading] = useState(false)
  const [chartDays, setChartDays] = useState(14)
  const [chartMetric, setChartMetric] = useState('views') // 'views' | 'unique_visitors'
  const [hoveredDay, setHoveredDay] = useState(null)

  // Bookings state & filters
  const [bookings, setBookings] = useState([])
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  })
  const [activeBookingTab, setActiveBookingTab] = useState('all') // 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'
  const [bookingSearch, setBookingSearch] = useState('')
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [copiedPhoneId, setCopiedPhoneId] = useState(null)

  const [data, setData] = useState({
    overview: {
      totalViews: 0,
      todayViews: 0,
      weekViews: 0,
      monthViews: 0,
      totalBookings: 0,
      pendingBookings: 0,
      totalAlbums: 0,
      totalPhotos: 0,
    },
    dailyTraffic: [],
    topPages: [],
    deviceBreakdown: [],
    recentLogs: [],
  })

  // Fetch all dashboard & bookings data
  const fetchDashboardData = async (days = chartDays, bookingFilter = activeBookingTab, search = bookingSearch) => {
    try {
      setLoading(true)
      const bookingQuery = new URLSearchParams()
      if (bookingFilter !== 'all') bookingQuery.append('status', bookingFilter)
      if (search.trim()) bookingQuery.append('search', search.trim())
      bookingQuery.append('limit', '15')

      const [analyticsRes, bookingsRes] = await Promise.all([
        api.get(`/analytics/overview?days=${days}`),
        api.get(`/admin/bookings?${bookingQuery.toString()}`),
      ])

      if (analyticsRes.success && analyticsRes.data) {
        setData(analyticsRes.data)
      }
      if (bookingsRes.success) {
        setBookings(bookingsRes.data || [])
        if (bookingsRes.stats) {
          setBookingStats(bookingsRes.stats)
        }
      }
    } catch (error) {
      console.warn('Lỗi khi tải dữ liệu dashboard:', error.message)
    } finally {
      setLoading(false)
    }
  }

  // Refetch only bookings on filter or search change
  const fetchOnlyBookings = async (bookingFilter = activeBookingTab, search = bookingSearch) => {
    try {
      setBookingLoading(true)
      const bookingQuery = new URLSearchParams()
      if (bookingFilter !== 'all') bookingQuery.append('status', bookingFilter)
      if (search.trim()) bookingQuery.append('search', search.trim())
      bookingQuery.append('limit', '15')

      const res = await api.get(`/admin/bookings?${bookingQuery.toString()}`)
      if (res.success) {
        setBookings(res.data || [])
        if (res.stats) {
          setBookingStats(res.stats)
        }
      }
    } catch (error) {
      console.warn('Lỗi khi tải danh sách lịch hẹn:', error.message)
    } finally {
      setBookingLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData(chartDays, activeBookingTab, bookingSearch)
  }, [chartDays])

  useEffect(() => {
    fetchOnlyBookings(activeBookingTab, bookingSearch)
  }, [activeBookingTab])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchOnlyBookings(activeBookingTab, bookingSearch)
  }

  const handleUpdateBookingStatus = async (bookingId, newStatus) => {
    try {
      await api.patch(`/admin/bookings/${bookingId}/status`, { status: newStatus })
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking((prev) => ({ ...prev, status: newStatus }))
      }
      fetchDashboardData(chartDays, activeBookingTab, bookingSearch)
    } catch (error) {
      alert('Không thể cập nhật trạng thái: ' + error.message)
    }
  }

  const handleDeleteBooking = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch hẹn này không?')) return
    try {
      await api.delete(`/admin/bookings/${bookingId}`)
      if (selectedBooking && selectedBooking.id === bookingId) {
        setSelectedBooking(null)
      }
      fetchDashboardData(chartDays, activeBookingTab, bookingSearch)
    } catch (error) {
      alert('Không thể xóa lịch hẹn: ' + error.message)
    }
  }

  const handleCopyPhone = (id, phone) => {
    if (!phone) return
    navigator.clipboard.writeText(phone)
    setCopiedPhoneId(id)
    setTimeout(() => {
      setCopiedPhoneId(null)
    }, 2000)
  }

  // Greeting based on current hour
  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Chào buổi sáng'
    if (hour < 18) return 'Chào buổi chiều'
    return 'Chào buổi tối'
  }, [])

  // Today formatted
  const formattedToday = useMemo(() => {
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date())
  }, [])

  // Device calculations
  const totalDeviceCount = (data.deviceBreakdown || []).reduce((acc, curr) => acc + Number(curr.count), 0) || 1
  const mobileCount = Number(data.deviceBreakdown?.find((d) => d.device_type === 'mobile')?.count || 0)
  const desktopCount = Number(data.deviceBreakdown?.find((d) => d.device_type === 'desktop')?.count || 0)
  const mobilePercent = Math.round((mobileCount / totalDeviceCount) * 100) || 0
  const desktopPercent = Math.round((desktopCount / totalDeviceCount) * 100) || 0

  // Chart calculations
  const trafficList = data.dailyTraffic || []
  const chartValues = trafficList.map((d) => Number(d[chartMetric] || 0))
  const maxMetricValue = Math.max(...chartValues, 5)
  const totalTrafficInPeriod = trafficList.reduce((acc, d) => acc + Number(d[chartMetric] || 0), 0)
  const avgTrafficInPeriod = trafficList.length > 0 ? Math.round(totalTrafficInPeriod / trafficList.length) : 0
  const peakTraffic = trafficList.length > 0 ? Math.max(...chartValues) : 0

  // Top Pages Max
  const maxTopViews = Math.max(...(data.topPages?.map((p) => Number(p.views)) || [1]), 1)

  const statusBadge = (status) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/15 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Chờ duyệt
          </span>
        )
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-800 border border-emerald-300">
            <CheckCircle2 size={12} className="text-emerald-600" />
            Đã xác nhận
          </span>
        )
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/15 text-blue-800 border border-blue-300">
            <Sparkles size={12} className="text-blue-600" />
            Hoàn thành
          </span>
        )
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle size={12} className="text-rose-500" />
            Đã hủy
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
            {status}
          </span>
        )
    }
  }

  // Quick Action Config
  const quickActions = [
    {
      title: 'Thêm Album Mới',
      desc: 'Tải ảnh & tạo bộ sưu tập',
      icon: Images,
      to: '/admin/albums',
      iconBg: 'bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-blue-500/20',
      hoverBorder: 'hover:border-blue-300 hover:bg-blue-50/30',
    },
    {
      title: 'Đổi Banner Trang Chủ',
      desc: 'Tùy biến slide & khẩu hiệu',
      icon: ImageIcon,
      to: '/admin/banners',
      iconBg: 'bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-orange-500/20',
      hoverBorder: 'hover:border-orange-300 hover:bg-orange-50/30',
    },
    {
      title: 'Gói Dịch Vụ',
      desc: 'Cập nhật bảng giá & ưu đãi',
      icon: Tag,
      to: '/admin/packages',
      iconBg: 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-emerald-500/20',
      hoverBorder: 'hover:border-emerald-300 hover:bg-emerald-50/30',
    },
    {
      title: 'Quick Access',
      desc: 'Nút hotline, Zalo & MXH',
      icon: Zap,
      to: '/admin/quick-access',
      iconBg: 'bg-gradient-to-tr from-amber-600 to-yellow-500 text-white shadow-amber-500/20',
      hoverBorder: 'hover:border-amber-300 hover:bg-amber-50/30',
    },
    {
      title: 'Sửa Giới Thiệu',
      desc: 'Tiểu sử thợ ảnh & triết lý',
      icon: UserCheck,
      to: '/admin/about',
      iconBg: 'bg-gradient-to-tr from-purple-600 to-pink-500 text-white shadow-purple-500/20',
      hoverBorder: 'hover:border-purple-300 hover:bg-purple-50/30',
    },
    {
      title: 'Cài Đặt SEO',
      desc: 'Thông tin thương hiệu & Google',
      icon: SlidersHorizontal,
      to: '/admin/settings',
      iconBg: 'bg-gradient-to-tr from-slate-700 to-slate-900 text-white shadow-slate-500/20',
      hoverBorder: 'hover:border-slate-400 hover:bg-slate-50',
    },
  ]

  const bookingTabs = [
    { id: 'all', label: 'Tất Cả', count: bookingStats.total || data.overview.totalBookings || 0 },
    { id: 'pending', label: 'Chờ Duyệt', count: bookingStats.pending || data.overview.pendingBookings || 0, isPendingBadge: true },
    { id: 'confirmed', label: 'Đã Xác Nhận', count: bookingStats.confirmed || 0 },
    { id: 'completed', label: 'Đã Hoàn Thành', count: bookingStats.completed || 0 },
    { id: 'cancelled', label: 'Đã Hủy', count: bookingStats.cancelled || 0 },
  ]

  return (
    <div className="w-full space-y-6 pb-8">
      {/* 1. Header Bar: Full Width, Clean & Professional */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Hệ thống trực tuyến
            </span>
            <span className="text-xs text-slate-400 capitalize hidden sm:inline">• {formattedToday}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {greeting}, {admin?.full_name || 'Quản Trị Viên'} 👋
          </h1>
          <p className="text-xs text-slate-500">
            Trung tâm tiếp nhận yêu cầu đặt lịch và theo dõi vận hành QA Stories Studio theo thời gian thực.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => fetchDashboardData(chartDays, activeBookingTab, bookingSearch)}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer active:scale-95 disabled:opacity-50"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin text-primary' : 'text-slate-500'} />
            <span className="hidden sm:inline">Làm mới</span>
          </button>

          <Link
            to="/admin/bookings"
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-xs shadow-primary/25 hover:shadow-md transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <CalendarCheck2 size={15} />
            <span>Toàn Bộ Lịch Hẹn</span>
          </Link>
        </div>
      </div>

      {/* 2. Top Metric Cards: GỌN GÀNG + MÀU SẮC + HỌA TIẾT NGHỆ THUẬT */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Lịch hẹn chờ duyệt (Warm Amber Motif) */}
        <div
          onClick={() => setActiveBookingTab('pending')}
          className={`relative overflow-hidden rounded-2xl p-4 sm:p-4.5 border transition-all cursor-pointer group shadow-xs hover:shadow-md bg-gradient-to-br from-amber-500/10 via-amber-50/40 to-white ${
            activeBookingTab === 'pending'
              ? 'border-amber-400 ring-2 ring-amber-400/30'
              : 'border-amber-200/90 hover:border-amber-400'
          }`}
        >
          {/* Decorative Pattern / Watermark */}
          <div className="absolute -right-3 -bottom-3 text-amber-500/10 group-hover:text-amber-500/20 transition-all pointer-events-none transform rotate-12">
            <Clock size={84} />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-400/10 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              Lịch Hẹn Chờ Duyệt
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-white shadow-xs shadow-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock size={16} />
            </div>
          </div>

          <div className="relative z-10 flex items-baseline gap-1.5 my-1">
            <span className="text-2xl sm:text-3xl font-bold text-amber-700 font-admin">
              {bookingStats.pending || data.overview.pendingBookings || 0}
            </span>
            <span className="text-[11px] text-amber-900/60 font-medium">
              / {bookingStats.total || data.overview.totalBookings || 0} yêu cầu
            </span>
          </div>

          <div className="relative z-10 mt-2 pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
            <span className="font-bold text-amber-700 flex items-center gap-1">
              {(bookingStats.pending || data.overview.pendingBookings || 0) > 0 ? (
                <>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                  Cần xử lý ngay
                </>
              ) : (
                'Đã duyệt hết'
              )}
            </span>
            <span className="text-amber-800 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Chi tiết &rarr;
            </span>
          </div>
        </div>

        {/* Card 2: Lịch chụp đã xác nhận (Emerald Motif) */}
        <div
          onClick={() => setActiveBookingTab('confirmed')}
          className={`relative overflow-hidden rounded-2xl p-4 sm:p-4.5 border transition-all cursor-pointer group shadow-xs hover:shadow-md bg-gradient-to-br from-emerald-500/10 via-emerald-50/40 to-white ${
            activeBookingTab === 'confirmed'
              ? 'border-emerald-400 ring-2 ring-emerald-400/30'
              : 'border-emerald-200/90 hover:border-emerald-400'
          }`}
        >
          {/* Decorative Pattern / Watermark */}
          <div className="absolute -right-3 -bottom-3 text-emerald-500/10 group-hover:text-emerald-500/20 transition-all pointer-events-none transform rotate-12">
            <CalendarCheck2 size={84} />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-400/10 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">
              Lịch Đã Xác Nhận
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white shadow-xs shadow-emerald-600/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CalendarCheck2 size={16} />
            </div>
          </div>

          <div className="relative z-10 flex items-baseline gap-1.5 my-1">
            <span className="text-2xl sm:text-3xl font-bold text-emerald-700 font-admin">
              {bookingStats.confirmed || 0}
            </span>
            <span className="text-[11px] text-emerald-900/60 font-medium">buổi chụp đã hẹn</span>
          </div>

          <div className="relative z-10 mt-2 pt-2 border-t border-emerald-200/60 flex items-center justify-between text-[11px]">
            <span className="text-emerald-700 font-medium">Sẵn sàng phục vụ</span>
            <span className="text-emerald-800 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Xem lịch &rarr;
            </span>
          </div>
        </div>

        {/* Card 3: Đã Hoàn Thành (Indigo & Blue Motif) */}
        <div
          onClick={() => setActiveBookingTab('completed')}
          className={`relative overflow-hidden rounded-2xl p-4 sm:p-4.5 border transition-all cursor-pointer group shadow-xs hover:shadow-md bg-gradient-to-br from-blue-500/10 via-blue-50/40 to-white ${
            activeBookingTab === 'completed'
              ? 'border-blue-400 ring-2 ring-blue-400/30'
              : 'border-blue-200/90 hover:border-blue-400'
          }`}
        >
          {/* Decorative Pattern / Watermark */}
          <div className="absolute -right-3 -bottom-3 text-blue-500/10 group-hover:text-blue-500/20 transition-all pointer-events-none transform rotate-12">
            <Sparkles size={84} />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-400/10 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">
              Đã Hoàn Thành
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-600 text-white shadow-xs shadow-blue-600/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles size={16} />
            </div>
          </div>

          <div className="relative z-10 flex items-baseline gap-1.5 my-1">
            <span className="text-2xl sm:text-3xl font-bold text-blue-700 font-admin">
              {bookingStats.completed || 0}
            </span>
            <span className="text-[11px] text-blue-900/60 font-medium">bộ ảnh hoàn tất</span>
          </div>

          <div className="relative z-10 mt-2 pt-2 border-t border-blue-200/60 flex items-center justify-between text-[11px]">
            <span className="text-blue-700 font-medium">Hài lòng khách hàng</span>
            <span className="text-blue-800 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Danh sách &rarr;
            </span>
          </div>
        </div>

        {/* Card 4: Lượt truy cập (Vivid Sunset Orange Motif) */}
        <div className="relative overflow-hidden rounded-2xl p-4 sm:p-4.5 border transition-all cursor-pointer group shadow-xs hover:shadow-md bg-gradient-to-br from-orange-500/10 via-orange-50/40 to-white border-orange-200/90 hover:border-orange-400">
          {/* Decorative Pattern / Watermark */}
          <div className="absolute -right-3 -bottom-3 text-primary/10 group-hover:text-primary/20 transition-all pointer-events-none transform rotate-12">
            <TrendingUp size={84} />
          </div>
          <div className="absolute top-0 right-0 w-24 h-24 bg-orange-400/10 rounded-full blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-orange-800 uppercase tracking-wider">
              Lượt Truy Cập Hôm Nay
            </span>
            <div className="w-8 h-8 rounded-xl bg-primary text-white shadow-xs shadow-primary/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp size={16} />
            </div>
          </div>

          <div className="relative z-10 flex items-baseline gap-1.5 my-1">
            <span className="text-2xl sm:text-3xl font-bold text-primary font-admin">
              {data.overview.todayViews}
            </span>
            <span className="text-[11px] text-orange-900/60 font-medium">lượt truy cập</span>
          </div>

          <div className="relative z-10 mt-2 pt-2 border-t border-orange-200/60 flex items-center justify-between text-[11px]">
            <span className="text-orange-900/70 font-medium">
              30 ngày: <strong className="text-slate-800 font-admin">{data.overview.monthViews} lượt</strong>
            </span>
            <Link
              to="/admin/analytics"
              className="text-primary font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5"
            >
              Thống kê &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* 3. MAIN SECTION: 2-COLUMN SPLIT (Left = Bookings & Traffic, Right = Phím tắt nhanh & Thiết bị) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ================= LEFT COLUMN (2 COLS) ================= */}
        <div className="lg:col-span-2 space-y-6">
          {/* 3.1 TRUNG TÂM XỬ LÝ YÊU CẦU ĐẶT LỊCH (Nằm bên trái, kích thước ngang chuẩn) */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-white via-orange-50/20 to-white">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <h2 className="text-base sm:text-lg font-bold text-slate-900">
                      Trung Tâm Xử Lý Yêu Cầu Đặt Lịch
                    </h2>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Tiếp nhận, duyệt yêu cầu và liên hệ nhanh qua điện thoại / Zalo
                  </p>
                </div>

                {/* Quick Search */}
                <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
                  <input
                    type="text"
                    placeholder="Tìm tên, SĐT, gói chụp..."
                    value={bookingSearch}
                    onChange={(e) => setBookingSearch(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                  />
                  <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  {bookingSearch && (
                    <button
                      type="button"
                      onClick={() => {
                        setBookingSearch('')
                        fetchOnlyBookings(activeBookingTab, '')
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  )}
                </form>
              </div>

              {/* Status Tabs */}
              <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-slate-100 overflow-x-auto pb-1 custom-scrollbar">
                {bookingTabs.map((tab) => {
                  const active = activeBookingTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveBookingTab(tab.id)}
                      className={`px-3 py-1.2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                        active
                          ? 'bg-primary text-white shadow-xs shadow-primary/30'
                          : 'bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          active
                            ? 'bg-white/25 text-white'
                            : tab.isPendingBadge && tab.count > 0
                            ? 'bg-amber-500 text-white'
                            : 'bg-slate-200/90 text-slate-700'
                        }`}
                      >
                        {tab.count}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Table */}
            {bookingLoading ? (
              <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                <div className="w-7 h-7 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
                <span>Đang tải danh sách lịch hẹn...</span>
              </div>
            ) : bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700 min-w-[700px]">
                  <thead className="bg-slate-50/80 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-2.5 px-4">Khách Hàng</th>
                      <th className="py-2.5 px-3">Số Điện Thoại</th>
                      <th className="py-2.5 px-3">Gói Chụp</th>
                      <th className="py-2.5 px-3">Ngày Dự Kiến</th>
                      <th className="py-2.5 px-3">Thời Gian Chụp (Đã Chốt)</th>
                      <th className="py-2.5 px-3">Trạng Thái</th>
                      <th className="py-2.5 px-4 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {bookings.map((b) => {
                      const firstLetter = (b.name || 'K').charAt(0).toUpperCase()
                      const cleanPhone = (b.phone || '').replace(/[^0-9]/g, '')
                      const isCopied = copiedPhoneId === b.id

                      return (
                        <tr
                          key={b.id}
                          className={`hover:bg-slate-50/80 transition-colors group ${
                            b.status === 'pending' ? 'bg-amber-50/30' : ''
                          }`}
                        >
                          {/* Khách hàng */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div
                                className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 border ${
                                  b.status === 'pending'
                                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                                    : 'bg-primary/10 text-primary border-primary/20'
                                }`}
                              >
                                {firstLetter}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-slate-900 text-xs flex items-center gap-1">
                                  <span className="truncate">{b.name}</span>
                                  {b.status === 'pending' && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Chờ xác nhận" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Số điện thoại (Cột riêng) */}
                          <td className="py-3 px-3">
                            <div className="flex items-center gap-1.5">
                              <a
                                href={`tel:${b.phone}`}
                                className="font-mono text-primary hover:underline text-xs font-semibold"
                                title="Gọi"
                              >
                                {b.phone}
                              </a>
                              <button
                                onClick={() => handleCopyPhone(b.id, b.phone)}
                                className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                                title="Sao chép SĐT"
                              >
                                {isCopied ? (
                                  <Check size={11} className="text-emerald-600" />
                                ) : (
                                  <Copy size={11} />
                                )}
                              </button>
                              {cleanPhone && (
                                <a
                                  href={`https://zalo.me/${cleanPhone}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-1 py-0.2 rounded bg-[#0068FF]/10 hover:bg-[#0068FF]/20 text-[#0068FF] text-[9px] font-bold transition-colors cursor-pointer"
                                  title="Zalo"
                                >
                                  Zalo
                                </a>
                              )}
                            </div>
                          </td>

                          {/* Gói chụp */}
                          <td className="py-3 px-3">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-semibold border border-slate-200/60 truncate max-w-[130px]">
                              {b.service || 'Tư vấn'}
                            </span>
                          </td>

                          {/* Ngày dự kiến */}
                          <td className="py-3 px-3 text-slate-600 font-mono text-xs">
                            {b.date ? (
                              <div className="flex items-center gap-1 font-medium">
                                <Calendar size={12} className="text-slate-400" />
                                <span>{formatDateDisplay(b.date)}</span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic text-[10px]">Chưa chọn</span>
                            )}
                          </td>

                          {/* Thời gian chụp (Đã chốt) */}
                          <td className="py-3 px-3">
                            {b.shoot_time ? (
                              <div className="space-y-0.5 font-mono text-xs">
                                <div className="font-bold text-slate-800 flex items-center gap-1">
                                  <Clock size={11} className="text-primary shrink-0" />
                                  <span>{b.shoot_time}</span>
                                </div>
                                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                  <Calendar size={10} className="text-slate-400 shrink-0" />
                                  <span>{formatDateDisplay(b.date)}</span>
                                </div>
                              </div>
                            ) : b.status === 'confirmed' || b.status === 'completed' ? (
                              <div className="space-y-0.5 font-mono text-xs">
                                <div className="font-medium text-amber-600 flex items-center gap-1 text-[10px]">
                                  <Clock size={10} className="text-amber-500 shrink-0" />
                                  <span>Chưa chọn giờ</span>
                                </div>
                                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                                  <Calendar size={10} className="text-slate-400 shrink-0" />
                                  <span>{formatDateDisplay(b.date)}</span>
                                </div>
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-md text-[9px] font-medium bg-slate-100 text-slate-400">
                                Chưa chốt
                              </span>
                            )}
                          </td>

                          {/* Trạng thái */}
                          <td className="py-3 px-3">{statusBadge(b.status)}</td>

                          {/* Thao tác */}
                          <td className="py-3 px-4 text-right whitespace-nowrap space-x-1">
                            {b.status === 'pending' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'confirmed')}
                                className="px-2 py-0.8 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-2xs transition-all cursor-pointer active:scale-95"
                                title="Xác nhận ngay"
                              >
                                ✓ Xác nhận
                              </button>
                            )}
                            {b.status === 'confirmed' && (
                              <button
                                onClick={() => handleUpdateBookingStatus(b.id, 'completed')}
                                className="px-2 py-0.8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold shadow-2xs transition-all cursor-pointer active:scale-95"
                                title="Hoàn thành"
                              >
                                ★ Hoàn tất
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedBooking(b)}
                              className="px-2 py-0.8 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-semibold transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="Xem chi tiết"
                            >
                              <Eye size={11} />
                              <span>Chi tiết</span>
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 px-4 text-slate-400 text-xs">
                <CalendarCheck2 size={32} className="mx-auto text-slate-300 mb-1.5" />
                <div className="font-semibold text-slate-600">Không có yêu cầu đặt lịch nào</div>
                <p className="mt-0.5 text-slate-400 text-[11px]">
                  {bookingSearch
                    ? `Không tìm thấy kết quả phù hợp với "${bookingSearch}"`
                    : `Hiện không có lịch hẹn nào ở mục "${bookingTabs.find((t) => t.id === activeBookingTab)?.label}"`}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="p-3 px-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500 text-[11px]">
                Hiển thị <strong>{bookings.length}</strong> yêu cầu gần nhất
              </span>
              <Link
                to="/admin/bookings"
                className="text-primary hover:text-primary-dark font-bold flex items-center gap-1 group text-xs"
              >
                <span>Xem tất cả danh sách</span>
                <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* 3.2 XU HƯỚNG LƯU LƯỢNG TRUY CẬP (SVG Chart) */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
            {/* Chart Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-slate-900">Xu Hướng Lưu Lượng</h2>
                  <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md font-medium">
                    {chartDays} ngày qua
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lượt xem trang và số lượng khách hàng truy cập studio
                </p>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/70 flex items-center text-xs">
                  <button
                    onClick={() => setChartMetric('views')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      chartMetric === 'views'
                        ? 'bg-white text-primary shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Lượt xem
                  </button>
                  <button
                    onClick={() => setChartMetric('unique_visitors')}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                      chartMetric === 'unique_visitors'
                        ? 'bg-white text-primary shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Khách truy cập
                  </button>
                </div>

                <div className="bg-slate-100/90 p-0.5 rounded-xl border border-slate-200/70 flex items-center text-xs">
                  {[7, 14, 30].map((d) => (
                    <button
                      key={d}
                      onClick={() => setChartDays(d)}
                      className={`px-2 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                        chartDays === d
                          ? 'bg-primary text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      {d}N
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Chart Stats */}
            <div className="grid grid-cols-3 gap-2 py-3 my-2 border-b border-slate-100 text-center">
              <div className="p-2 rounded-xl bg-slate-50">
                <div className="text-[11px] text-slate-400 font-medium">Tổng trong kỳ</div>
                <div className="text-base sm:text-lg font-bold text-slate-800 font-admin">
                  {totalTrafficInPeriod.toLocaleString()}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50">
                <div className="text-[11px] text-slate-400 font-medium">Trung bình/ngày</div>
                <div className="text-base sm:text-lg font-bold text-primary font-admin">
                  {avgTrafficInPeriod.toLocaleString()}
                </div>
              </div>
              <div className="p-2 rounded-xl bg-slate-50">
                <div className="text-[11px] text-slate-400 font-medium">Đỉnh điểm</div>
                <div className="text-base sm:text-lg font-bold text-emerald-600 font-admin">
                  {peakTraffic.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Interactive SVG Chart */}
            <div className="pt-3">
              {trafficList.length > 0 ? (
                <div className="relative">
                  {/* Grid Lines */}
                  <div className="absolute inset-x-0 top-0 bottom-7 flex flex-col justify-between pointer-events-none opacity-40">
                    <div className="border-b border-dashed border-slate-200 w-full" />
                    <div className="border-b border-dashed border-slate-200 w-full" />
                    <div className="border-b border-dashed border-slate-200 w-full" />
                    <div className="border-b border-slate-200 w-full" />
                  </div>

                  {/* Bars */}
                  <div className="h-52 w-full flex items-end gap-1.5 sm:gap-2.5 pt-6 pb-2 px-1 relative z-10">
                    {trafficList.map((day, idx) => {
                      const val = Number(day[chartMetric] || 0)
                      const heightPercent = maxMetricValue > 0 ? Math.max(Math.round((val / maxMetricValue) * 100), 6) : 6
                      const isHovered = hoveredDay === idx
                      const dateParts = (day.date || '').split('-')
                      const displayDate = dateParts.length === 3 ? `${dateParts[2]}/${dateParts[1]}` : day.date

                      return (
                        <div
                          key={idx}
                          onMouseEnter={() => setHoveredDay(idx)}
                          onMouseLeave={() => setHoveredDay(null)}
                          className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                        >
                          {/* Tooltip */}
                          {isHovered && (
                            <div className="absolute -top-12 bg-slate-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-30 pointer-events-none animate-fade-in border border-slate-700">
                              <div className="font-semibold text-orange-300">{day.date}</div>
                              <div className="text-[10px] text-slate-200">
                                Lượt xem: <strong>{day.views || 0}</strong> • Khách: <strong>{day.unique_visitors || 0}</strong>
                              </div>
                            </div>
                          )}

                          {/* Bar */}
                          <div className="w-full flex justify-center items-end h-full">
                            <div
                              style={{ height: `${heightPercent}%` }}
                              className={`w-full max-w-[24px] sm:max-w-[32px] rounded-t-md transition-all duration-300 ${
                                isHovered
                                  ? 'bg-gradient-to-t from-orange-500 to-primary shadow-md shadow-primary/30 scale-x-105'
                                  : 'bg-gradient-to-t from-orange-400/90 to-primary/85 hover:from-orange-500 hover:to-primary'
                              }`}
                            />
                          </div>

                          {/* X-axis */}
                          <span
                            className={`text-[10px] truncate w-full text-center mt-2 transition-colors ${
                              isHovered ? 'text-primary font-bold' : 'text-slate-400 font-medium'
                            }`}
                          >
                            {displayDate}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-52 flex flex-col items-center justify-center text-slate-400 text-xs">
                  <Activity size={28} className="text-slate-300 mb-2" />
                  <span>Chưa có dữ liệu lưu lượng trong {chartDays} ngày qua</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN (1 COL) ================= */}
        <div className="space-y-6">
          {/* 3.3 PHÍM TẮT NHANH (ĐƯỢC ĐƯA LÊN ĐẦU BÊN PHẢI) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3.5 pb-2.5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Phím Tắt Nhanh</h3>
                <p className="text-xs text-slate-500 mt-0.5">Truy cập nhanh các phân hệ</p>
              </div>
              <Sparkles size={16} className="text-primary" />
            </div>

            <div className="space-y-2.5">
              {quickActions.map((action, idx) => {
                const Icon = action.icon
                return (
                  <Link
                    key={idx}
                    to={action.to}
                    className={`p-3 rounded-xl bg-slate-50/90 hover:bg-white border border-slate-200/80 ${action.hoverBorder} hover:shadow-xs transition-all flex items-center gap-3 group cursor-pointer`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl ${action.iconBg} flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform`}
                    >
                      <Icon size={17} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-slate-800 group-hover:text-primary transition-colors truncate">
                        {action.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{action.desc}</div>
                    </div>
                    <ChevronRight
                      size={15}
                      className="text-slate-400 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0"
                    />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* 3.4 THIẾT BỊ TRUY CẬP */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Thiết Bị Truy Cập</h3>
                <p className="text-xs text-slate-500 mt-0.5">Tỷ lệ theo thiết bị người xem</p>
              </div>
              <Smartphone size={16} className="text-slate-400" />
            </div>

            {/* Segmented Progress Bar */}
            <div className="space-y-4">
              <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex p-0.5 border border-slate-200/60">
                <div
                  style={{ width: `${desktopPercent}%` }}
                  className="h-full bg-blue-500 rounded-l-full transition-all duration-500"
                  title={`Máy tính: ${desktopPercent}%`}
                />
                <div
                  style={{ width: `${mobilePercent}%` }}
                  className="h-full bg-primary rounded-r-full transition-all duration-500"
                  title={`Di động: ${mobilePercent}%`}
                />
              </div>

              {/* Legend & Numbers */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                    <Monitor size={14} className="text-blue-500" />
                    <span className="font-semibold">Máy Tính</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold text-slate-900 font-admin">{desktopPercent}%</span>
                    <span className="text-[11px] text-slate-400">{desktopCount} lượt</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                    <Smartphone size={14} className="text-primary" />
                    <span className="font-semibold">Di Động</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-base font-bold text-slate-900 font-admin">{mobilePercent}%</span>
                    <span className="text-[11px] text-slate-400">{mobileCount} lượt</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3.5 TRANG & ALBUM THỊNH HÀNH */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Trang Thịnh Hành</h3>
                <p className="text-xs text-slate-500 mt-0.5">Nội dung xem nhiều nhất</p>
              </div>
              <Link
                to="/admin/analytics"
                className="text-xs text-primary hover:text-primary-dark font-semibold flex items-center gap-0.5"
              >
                <span>Xem tất cả</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>

            {data.topPages && data.topPages.length > 0 ? (
              <div className="space-y-3">
                {data.topPages.slice(0, 4).map((p, idx) => {
                  const widthPercent = Math.max(Math.round((Number(p.views) / maxTopViews) * 100), 10)
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="w-4 h-4 rounded-md bg-slate-100 text-slate-600 font-bold text-[10px] flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-semibold text-slate-800 truncate" title={p.title || p.path}>
                            {p.title || p.path}
                          </span>
                        </div>
                        <span className="font-bold text-slate-700 shrink-0 font-admin">{p.views} lượt</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${widthPercent}%` }}
                          className="h-full bg-gradient-to-r from-orange-400 to-primary rounded-full transition-all duration-500"
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-6 text-slate-400 text-xs">Chưa có dữ liệu trang xem</div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Booking Details Modal (Interactive popup for full detail & fast actions) */}
      {selectedBooking && (
        <BookingDetailModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUpdated={(updated) => {
            setSelectedBooking(updated)
            fetchDashboardData(chartDays, activeBookingTab, bookingSearch)
          }}
          onDeleted={(id) => {
            handleDeleteBooking(id)
          }}
        />
      )}
    </div>
  )
}
