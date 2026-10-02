import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { Camera, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'

export default function AdminLogin() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login, isAuthenticated } = useAdminAuth()
  const navigate = useNavigate()

  if (isAuthenticated) {
    return <Navigate to="/admin" replace />
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(username, password)
      navigate('/admin')
    } catch (err) {
      setError(err.message || 'Tên đăng nhập hoặc mật khẩu không đúng')
    } finally {
      setLoading(false)
    }
  }

  const handleFillDemo = () => {
    setUsername('admin')
    setPassword('admin@123')
    setError('')
  }

  return (
    <div className="admin-scope min-h-screen bg-slate-100 text-slate-900 flex items-center justify-center p-4 relative overflow-hidden font-admin">
      {/* Background ambient lighting effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#0000000a_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

      <div className="max-w-md w-full relative z-10">
        {/* Card */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 text-white shadow-lg shadow-primary/30 mb-4">
              <Camera size={28} />
            </div>
            <h1 className="font-heading font-bold text-2xl text-slate-900 tracking-tight">QA Stories Admin</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-1">Hệ Thống Quản Trị & Điều Hành Studio</p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-600 text-xs animate-shake">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Tên Đăng Nhập</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập tên đăng nhập..."
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Mật Khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu..."
                  className="w-full pl-10 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-primary to-orange-500 hover:from-primary-dark hover:to-orange-600 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Đang Đăng Nhập...</span>
                </>
              ) : (
                <>
                  <span>Đăng Nhập Quản Trị</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* System Version Footer */}
          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400 font-medium">
              QA Stories Studio System • Phiên bản v1.0.0
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
