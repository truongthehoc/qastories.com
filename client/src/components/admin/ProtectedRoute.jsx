import { Navigate, Outlet, Link } from 'react-router-dom'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { ShieldAlert, ArrowLeft } from 'lucide-react'

export default function ProtectedRoute({ permission = null, requireSuper = false }) {
  const { isAuthenticated, loading, isSuperAdmin, hasPermission } = useAdminAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
          <p className="text-slate-500 font-body text-sm">Đang xác thực quyền quản trị...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />
  }

  if (requireSuper && !isSuperAdmin) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-rose-200 text-center max-w-md mx-auto my-12 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Truy Cập Bị Giới Hạn</h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Khu vực này yêu cầu quyền <b>Super Admin</b>. Tài khoản của bạn không có quyền truy cập vào mục này.
        </p>
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-md shadow-primary/20 hover:bg-primary-dark transition-all"
        >
          <ArrowLeft size={14} />
          <span>Về Bảng Điều Khiển</span>
        </Link>
      </div>
    )
  }

  if (permission && !hasPermission(permission)) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-amber-200 text-center max-w-md mx-auto my-12 shadow-sm">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Không Có Quyền Truy Cập</h2>
        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
          Tài khoản của bạn chưa được cấp quyền <b>"{permission}"</b>. Vui lòng liên hệ Quản trị viên cấp cao để được cấp quyền.
        </p>
        <Link
          to="/admin"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold shadow-md shadow-primary/20 hover:bg-primary-dark transition-all"
        >
          <ArrowLeft size={14} />
          <span>Về Bảng Điều Khiển</span>
        </Link>
      </div>
    )
  }

  return <Outlet />
}
