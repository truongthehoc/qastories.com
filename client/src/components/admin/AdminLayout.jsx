import { useState, useRef, useEffect } from 'react'
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CalendarCheck2,
  Home as HomeIcon,
  Images,
  UserCheck,
  SlidersHorizontal,
  TrendingUp,
  LogOut,
  Menu,
  X,
  ExternalLink,
  Camera,
  ChevronRight,
  ChevronDown,
  ShieldCheck,
  Zap,
  Tag,
  Users,
  Crown,
  PanelBottom,
  User,
} from 'lucide-react'
import { useAdminAuth } from '../../context/AdminAuthContext'
import { useSettings } from '../../context/SettingsContext'

const navSections = [
  {
    title: 'Tổng Quan & Vận Hành',
    items: [
      { path: '/admin', label: 'Tổng Quan', icon: LayoutDashboard, exact: true, permission: 'dashboard' },
      { path: '/admin/bookings', label: 'Quản Lý Lịch Hẹn', icon: CalendarCheck2, permission: 'bookings' },
    ],
  },
  {
    title: 'Quản Lý Nội Dung',
    items: [
      { path: '/admin/banners', label: 'Trang Chủ', icon: HomeIcon, permission: 'banners' },
      { path: '/admin/albums', label: 'Albums & Kho Ảnh', icon: Images, permission: 'albums' },
      { path: '/admin/packages', label: 'Gói Dịch Vụ', icon: Tag, permission: 'packages' },
      { path: '/admin/about', label: 'Nội Dung Giới Thiệu', icon: UserCheck, permission: 'about' },
      { path: '/admin/quick-access', label: 'Cấu Hình Quick Access', icon: Zap, permission: 'quick-access' },
      { path: '/admin/footer', label: 'Cấu Hình Chân Trang', icon: PanelBottom, permission: 'settings' },
    ],
  },
  {
    title: 'Hệ Thống & Báo Cáo',
    items: [
      { path: '/admin/analytics', label: 'Thống Kê Truy Cập', icon: TrendingUp, permission: 'analytics' },
      { path: '/admin/settings', label: 'Cài Đặt & Thương Hiệu', icon: SlidersHorizontal, permission: 'settings' },
      { path: '/admin/users', label: 'Tài Khoản & Phân Quyền', icon: Users, permission: 'users' },
    ],
  },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  const location = useLocation()
  const navigate = useNavigate()
  const { admin, logout, hasPermission, isSuperAdmin } = useAdminAuth()
  const { settings } = useSettings()

  const brandName = settings?.brand_name || 'QA Stories'
  const brandLogo = settings?.brand_logo

  // Click outside and ESC listener for avatar dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false)
      }
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Close dropdown on route navigation
  useEffect(() => {
    setUserMenuOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/admin/login')
  }

  // Lọc các menu sidebar dựa theo danh sách quyền của tài khoản
  const visibleNavSections = navSections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !item.permission || hasPermission(item.permission)),
    }))
    .filter((section) => section.items.length > 0)

  const allNavItems = navSections.flatMap((s) => s.items)
  const currentNav = allNavItems.find((item) =>
    item.exact ? location.pathname === item.path : location.pathname.startsWith(item.path)
  )

  const roleLabel = (role) => {
    switch (role) {
      case 'superadmin':
        return 'Super Admin'
      case 'admin':
        return 'Quản Trị Viên'
      case 'editor':
        return 'Biên Tập Viên'
      case 'staff':
        return 'Điều Phối Viên'
      default:
        return 'Thành Viên'
    }
  }

  return (
    <div className="admin-scope min-h-screen bg-slate-100 text-slate-800 flex flex-col md:flex-row font-admin antialiased">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 md:hidden transition-opacity"
        />
      )}

      {/* Sidebar - Dark Background Theme */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-slate-900 border-r border-slate-800 shadow-xl flex flex-col transition-transform duration-300 ease-in-out text-slate-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header with dynamic Logo */}
        <div className="h-16 px-5 border-b border-slate-800/90 bg-slate-950/40 flex items-center justify-between">
          <Link to="/admin" className="flex items-center gap-3 overflow-hidden">
            {brandLogo ? (
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-white/10 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-md p-1">
                <img
                  src={brandLogo}
                  alt={brandName}
                  className="w-full h-full object-contain"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-orange-400 flex items-center justify-center shadow-md shadow-primary/30 shrink-0">
                <Camera size={19} className="text-white" />
              </div>
            )}
            <div className="overflow-hidden">
              <div className="font-heading font-bold text-base text-white leading-tight tracking-tight truncate">
                {brandName}
              </div>
              <div className="text-[11px] font-body text-primary font-semibold truncate">
                Trang Quản Trị Studio
              </div>
            </div>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation by Logical Groups */}
        <nav className="flex-1 px-3.5 py-4 space-y-4 overflow-y-auto custom-scrollbar">
          {visibleNavSections.map((section, sIdx) => (
            <div key={sIdx} className="space-y-1">
              <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon
                const active = item.exact
                  ? location.pathname === item.path
                  : location.pathname.startsWith(item.path)

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-body text-xs sm:text-sm transition-all duration-200 ${
                      active
                        ? 'bg-gradient-to-r from-primary to-orange-500 text-white font-semibold shadow-md shadow-primary/25'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70 font-medium'
                    }`}
                  >
                    <Icon size={17} className={active ? 'text-white' : 'text-slate-400'} />
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/90 bg-slate-950/40 text-center">
          <p className="text-[10.5px] text-slate-500 font-medium">
            QA Stories Studio System v1.0
          </p>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-100">
        {/* Top Header */}
        <header className="h-16 px-4 sm:px-8 border-b border-slate-200/90 bg-white/90 backdrop-blur-md sticky top-0 z-30 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Menu size={22} />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-body text-slate-500">
              <span>Admin</span>
              <ChevronRight size={14} className="text-slate-400" />
              <span className="text-slate-900 font-semibold">{currentNav?.label || 'Bảng Điều Khiển'}</span>
            </div>
          </div>

          {/* Right Header Actions: Website Link & Avatar Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3.5">
            <Link
              to="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-primary border border-slate-200 shadow-2xs text-xs font-medium transition-all"
            >
              <span>Xem Website</span>
              <ExternalLink size={13} />
            </Link>

            <div className="hidden sm:block h-5 w-px bg-slate-200" />

            {/* Avatar Button & Dropdown Menu */}
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 sm:gap-2.5 p-1 sm:px-2.5 sm:py-1.5 rounded-2xl hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-all duration-200 cursor-pointer group"
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                {admin?.avatar ? (
                  <img
                    src={admin.avatar}
                    alt={admin.full_name || 'Admin'}
                    className="w-8 h-8 rounded-full object-cover border border-slate-200 shadow-2xs group-hover:scale-105 transition-transform"
                  />
                ) : (
                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs group-hover:scale-105 transition-transform ${
                    admin?.role === 'superadmin'
                      ? 'bg-purple-500/10 border-purple-500/30 text-purple-600'
                      : 'bg-orange-500/10 border-orange-500/25 text-primary'
                  }`}>
                    {admin?.role === 'superadmin' ? <Crown size={15} /> : <ShieldCheck size={16} />}
                  </div>
                )}
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight group-hover:text-primary transition-colors">
                    {admin?.full_name || 'Admin'}
                  </div>
                  <div className="text-[10.5px] text-slate-400 flex items-center gap-1 leading-tight mt-0.5">
                    <span>@{admin?.username || 'admin'}</span>
                    <span>•</span>
                    <span className={admin?.role === 'superadmin' ? 'text-purple-600 font-semibold' : 'text-primary font-semibold'}>
                      {roleLabel(admin?.role)}
                    </span>
                  </div>
                </div>

                <ChevronDown
                  size={14}
                  className={`text-slate-400 transition-transform duration-200 hidden sm:block ${
                    userMenuOpen ? 'rotate-180 text-slate-700' : 'group-hover:text-slate-600'
                  }`}
                />
              </button>

              {/* Dropdown Menu Modal */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 sm:w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {/* User Profile Summary */}
                  <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/70 rounded-t-xl">
                    <div className="flex items-center gap-3">
                      {admin?.avatar ? (
                        <img
                          src={admin.avatar}
                          alt={admin.full_name || 'Admin'}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0 shadow-2xs"
                        />
                      ) : (
                        <div
                          className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-sm shrink-0 ${
                            admin?.role === 'superadmin'
                              ? 'bg-purple-100 border-purple-300 text-purple-700'
                              : 'bg-orange-100 border-orange-300 text-primary'
                          }`}
                        >
                          {admin?.role === 'superadmin' ? <Crown size={18} /> : <ShieldCheck size={18} />}
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {admin?.full_name || 'Admin'}
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          @{admin?.username || 'admin'}
                        </p>
                        <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          admin?.role === 'superadmin'
                            ? 'bg-purple-50 text-purple-700 border border-purple-200'
                            : 'bg-orange-50 text-primary border border-orange-200'
                        }`}>
                          {roleLabel(admin?.role)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Quick Links */}
                  <div className="p-1.5 space-y-0.5">
                    {hasPermission('users') && (
                      <Link
                        to="/admin/users"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                      >
                        <Users size={15} className="text-slate-400" />
                        <span>Tài Khoản & Phân Quyền</span>
                      </Link>
                    )}

                    {hasPermission('settings') && (
                      <>
                        <Link
                          to="/admin/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                          <SlidersHorizontal size={15} className="text-slate-400" />
                          <span>Cài Đặt & Thương Hiệu</span>
                        </Link>
                        <Link
                          to="/admin/footer"
                          onClick={() => setUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                          <PanelBottom size={15} className="text-slate-400" />
                          <span>Cấu Hình Chân Trang</span>
                        </Link>
                      </>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-slate-100 my-1" />

                  {/* Logout Item */}
                  <div className="p-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false)
                        handleLogout()
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    >
                      <LogOut size={15} className="stroke-[2.2]" />
                      <span>Đăng Xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content View */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
