import { useState, useEffect } from 'react'
import {
  TrendingUp,
  RefreshCw,
  Smartphone,
  Monitor,
  Eye,
  Users,
  Compass,
  Clock,
  ArrowUpRight,
  Sparkles,
  Layers,
} from 'lucide-react'
import api from '../../utils/api'

export default function AnalyticsView() {
  const [days, setDays] = useState(14)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    overview: {
      totalViews: 0,
      todayViews: 0,
      weekViews: 0,
      monthViews: 0,
    },
    dailyTraffic: [],
    topPages: [],
    deviceBreakdown: [],
    recentLogs: [],
  })

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const res = await api.get(`/analytics/overview?days=${days}`)
      if (res.success && res.data) {
        setData(res.data)
      }
    } catch (error) {
      console.warn('Lỗi khi tải dữ liệu analytics:', error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [days])

  // Calculation for Chart Scaling
  const maxViews = Math.max(...(data.dailyTraffic.map((d) => Number(d.views)) || [1]), 10)
  const totalTopViews = data.topPages.reduce((acc, curr) => acc + Number(curr.views), 0) || 1

  // Device calculations
  const totalDeviceCount = data.deviceBreakdown.reduce((acc, curr) => acc + Number(curr.count), 0) || 1
  const mobileCount = Number(data.deviceBreakdown.find((d) => d.device_type === 'mobile')?.count || 0)
  const desktopCount = Number(data.deviceBreakdown.find((d) => d.device_type === 'desktop')?.count || 0)
  const mobilePercent = Math.round((mobileCount / totalDeviceCount) * 100)
  const desktopPercent = Math.round((desktopCount / totalDeviceCount) * 100)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900 flex items-center gap-2.5">
            <TrendingUp className="text-primary" size={24} />
            Thống Kê & Phân Tích Lưu Lượng Truy Cập
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Theo dõi chi tiết số lượt xem, trang được khách hàng quan tâm nhiều nhất và nguồn thiết bị
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Day range buttons */}
          <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1 text-xs">
            {[
              { label: '7 Ngày', val: 7 },
              { label: '14 Ngày', val: 14 },
              { label: '30 Ngày', val: 30 },
            ].map((d) => (
              <button
                key={d.val}
                onClick={() => setDays(d.val)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  days === d.val ? 'bg-primary text-white font-semibold shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchAnalytics()}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-xs text-xs transition-colors"
            title="Làm mới"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* 4 Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Lượt Xem Hôm Nay</span>
            <Eye size={16} className="text-primary" />
          </div>
          <div className="text-3xl font-heading font-bold text-slate-900">{data.overview.todayViews}</div>
          <div className="text-[11px] text-slate-500 mt-2">Truy cập trong ngày hôm nay</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Lượt Xem 7 Ngày Qua</span>
            <Users size={16} className="text-blue-500" />
          </div>
          <div className="text-3xl font-heading font-bold text-slate-900">{data.overview.weekViews}</div>
          <div className="text-[11px] text-slate-500 mt-2">Tổng số phiên trong 7 ngày</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Lượt Xem 30 Ngày Qua</span>
            <Compass size={16} className="text-purple-500" />
          </div>
          <div className="text-3xl font-heading font-bold text-slate-900">{data.overview.monthViews}</div>
          <div className="text-[11px] text-slate-500 mt-2">Tổng số phiên trong 30 ngày</div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-2">
            <span>Toàn Bộ Lượt Xem</span>
            <Sparkles size={16} className="text-emerald-500" />
          </div>
          <div className="text-3xl font-heading font-bold text-slate-900">{data.overview.totalViews}</div>
          <div className="text-[11px] text-slate-500 mt-2">Tổng tích lũy toàn hệ thống</div>
        </div>
      </div>

      {/* Main Traffic Chart */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="font-heading font-bold text-lg text-slate-900">Biểu Đồ Lưu Lượng ({days} Ngày Qua)</h2>
            <p className="text-slate-500 text-xs mt-0.5">Thống kê số lượt xem trang và số khách truy cập phân biệt theo ngày</p>
          </div>
        </div>

        {/* SVG Traffic Chart with Bars */}
        <div className="h-64 w-full flex items-end gap-2 sm:gap-4 pt-8 pb-3 px-2 border-b border-slate-100">
          {data.dailyTraffic.length > 0 ? (
            data.dailyTraffic.map((day, idx) => {
              const heightPercent = Math.max(Math.round((Number(day.views) / maxViews) * 100), 8)
              const dateLabel = day.date ? day.date.split('-').slice(1).join('/') : ''

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                  {/* Tooltip */}
                  <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-slate-800 text-white text-[11px] px-2.5 py-1 rounded-lg shadow-xl whitespace-nowrap pointer-events-none z-20">
                    <div className="font-bold text-orange-400">{day.views} lượt xem</div>
                    <div className="text-[10px] text-slate-300">{day.unique_visitors} khách duy nhất</div>
                  </div>

                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[32px] rounded-t-xl bg-gradient-to-t from-primary/70 via-primary to-orange-400 group-hover:from-orange-500 group-hover:to-orange-400 transition-all duration-300 shadow-xs"
                  />

                  {/* Date label */}
                  <span className="text-[10px] text-slate-500 truncate w-full text-center font-mono">
                    {dateLabel}
                  </span>
                </div>
              )
            })
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">
              Chưa có dữ liệu truy cập trong khoảng thời gian này.
            </div>
          )}
        </div>
      </div>

      {/* Top Pages Table & Device Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Visited Pages (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
          <div className="mb-6">
            <h2 className="font-heading font-bold text-lg text-slate-900">Top Trang & Album Được Xem Nhiều Nhất</h2>
            <p className="text-slate-500 text-xs mt-0.5">Xếp hạng theo tổng số lượt khách ghé thăm</p>
          </div>

          {data.topPages.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-3">Trang / Đường Dẫn</th>
                    <th className="py-3 px-3">Lượt Xem</th>
                    <th className="py-3 px-3">Tỷ Lệ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.topPages.map((page, idx) => {
                    const percent = Math.round((Number(page.views) / totalTopViews) * 100) || 0
                    return (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-3">
                          <div className="font-medium text-slate-900 line-clamp-1">{page.title || page.path}</div>
                          <div className="text-[11px] text-primary font-mono mt-0.5">{page.path}</div>
                        </td>
                        <td className="py-3.5 px-3 font-semibold text-slate-900">
                          <div>{page.views} lượt</div>
                          <div className="text-[10px] text-slate-500 font-normal">{page.unique_visitors} khách</div>
                        </td>
                        <td className="py-3.5 px-3 w-40">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${percent}%` }}
                                className="h-full bg-primary rounded-full"
                              />
                            </div>
                            <span className="text-[11px] font-mono text-slate-500 w-9 text-right">
                              {percent}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-10 text-slate-500 text-xs">Chưa có dữ liệu trang.</div>
          )}
        </div>

        {/* Device Breakdown */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div>
            <h2 className="font-heading font-bold text-lg text-slate-900">Nguồn Thiết Bị</h2>
            <p className="text-slate-500 text-xs mt-0.5">Phân bổ người dùng di động và máy tính</p>
          </div>

          <div className="space-y-5">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 flex items-center gap-2 font-medium">
                  <Smartphone size={16} className="text-orange-500" /> Di Động (Mobile)
                </span>
                <span className="font-bold text-slate-900 font-mono">{mobilePercent}%</span>
              </div>
              <div className="w-full h-3 bg-slate-200/70 rounded-full overflow-hidden p-0.5">
                <div
                  style={{ width: `${mobilePercent}%` }}
                  className="h-full bg-orange-500 rounded-full transition-all duration-500"
                />
              </div>
              <div className="text-[11px] text-slate-500 text-right">{mobileCount} lượt truy cập</div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-700 flex items-center gap-2 font-medium">
                  <Monitor size={16} className="text-blue-500" /> Máy Tính (Desktop)
                </span>
                <span className="font-bold text-slate-900 font-mono">{desktopPercent}%</span>
              </div>
              <div className="w-full h-3 bg-slate-200/70 rounded-full overflow-hidden p-0.5">
                <div
                  style={{ width: `${desktopPercent}%` }}
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                />
              </div>
              <div className="text-[11px] text-slate-500 text-right">{desktopCount} lượt truy cập</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Visitors Log */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
        <div className="mb-6">
          <h2 className="font-heading font-bold text-lg text-slate-900">Nhật Ký Khách Truy Cập Gần Đây</h2>
          <p className="text-slate-500 text-xs mt-0.5">Các phiên xem trang mới nhất được ghi nhận theo thời gian thực</p>
        </div>

        {data.recentLogs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Trang Đã Xem</th>
                  <th className="py-3 px-4">Thiết Bị</th>
                  <th className="py-3 px-4">Nguồn Giới Thiệu (Referer)</th>
                  <th className="py-3 px-4 text-right">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono text-primary font-medium">{log.path}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-700 capitalize font-medium">
                        {log.device_type === 'mobile' ? (
                          <Smartphone size={13} className="text-orange-500" />
                        ) : (
                          <Monitor size={13} className="text-blue-500" />
                        )}
                        {log.device_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px] truncate max-w-xs">
                      {log.referer || 'Direct (Trực tiếp)'}
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-right text-[11px] font-mono">
                      {new Date(log.created_at).toLocaleTimeString('vi-VN')} {new Date(log.created_at).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-slate-500 text-xs">Chưa có nhật ký truy cập.</div>
        )}
      </div>
    </div>
  )
}
