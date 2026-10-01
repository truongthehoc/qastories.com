import { useState, useEffect } from 'react'
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Search,
  KeyRound,
  Lock,
  Unlock,
  Trash2,
  Edit,
  Check,
  X,
  RefreshCw,
  Phone,
  Mail,
  Calendar,
  Eye,
  EyeOff,
  User,
  Crown,
  CheckCircle2,
  XCircle,
  Sparkles,
  SlidersHorizontal,
  Info,
} from 'lucide-react'
import api from '../../utils/api'
import { useAdminAuth } from '../../context/AdminAuthContext'

// Danh mục tất cả module / quyền trong hệ thống
const ALL_PERMISSIONS = [
  { id: 'dashboard', label: 'Bảng Điều Khiển (Dashboard)', desc: 'Xem thống kê tổng quan và KPI' },
  { id: 'bookings', label: 'Quản Lý Lịch Hẹn', desc: 'Xử lý đặt lịch, liên hệ Zalo, chốt giờ chụp' },
  { id: 'albums', label: 'Albums & Kho Ảnh', desc: 'Thêm, sửa, xóa album và tải ảnh' },
  { id: 'packages', label: 'Gói Dịch Vụ', desc: 'Quản lý danh mục gói chụp và bảng giá' },
  { id: 'banners', label: 'Banner & Trang Chủ', desc: 'Cấu hình hình ảnh slider trang chủ' },
  { id: 'about', label: 'Nội Dung Giới Thiệu', desc: 'Chỉnh sửa thông tin giới thiệu và ekip' },
  { id: 'quick-access', label: 'Cấu Hình Quick Access', desc: 'Quản lý các nút liên kết nhanh trang chủ' },
  { id: 'analytics', label: 'Thống Kê Lưu Lượng', desc: 'Xem biểu đồ lượt xem và thiết bị truy cập' },
  { id: 'settings', label: 'Cài Đặt Hệ Thống', desc: 'Cấu hình thông tin studio và thương hiệu' },
  { id: 'users', label: 'Quản Lý Tài Khoản & Quyền', desc: 'Tạo tài khoản và phân quyền quản trị' },
]

// Cấu hình vai trò mẫu (Role Presets)
const ROLE_PRESETS = [
  {
    id: 'superadmin',
    name: 'Super Admin',
    desc: 'Toàn quyền quản trị hệ thống và phân quyền tài khoản',
    badgeClass: 'bg-purple-500/15 text-purple-700 border-purple-300',
    icon: Crown,
    defaultPerms: ALL_PERMISSIONS.map((p) => p.id),
  },
  {
    id: 'admin',
    name: 'Quản Trị Viên (Admin)',
    desc: 'Quản lý toàn bộ vận hành & nội dung (không sửa tài khoản)',
    badgeClass: 'bg-emerald-500/15 text-emerald-700 border-emerald-300',
    icon: ShieldCheck,
    defaultPerms: [
      'dashboard',
      'bookings',
      'albums',
      'packages',
      'banners',
      'about',
      'quick-access',
      'analytics',
      'settings',
    ],
  },
  {
    id: 'editor',
    name: 'Biên Tập Viên (Editor)',
    desc: 'Quản lý nội dung truyền thông: Ảnh, Banners, Gói chụp, Giới thiệu',
    badgeClass: 'bg-blue-500/15 text-blue-700 border-blue-300',
    icon: Sparkles,
    defaultPerms: ['dashboard', 'albums', 'packages', 'banners', 'about', 'quick-access'],
  },
  {
    id: 'staff',
    name: 'Nhân Viên Điều Phối (Staff)',
    desc: 'Tiếp nhận, xử lý và điều phối các yêu cầu đặt lịch hẹn',
    badgeClass: 'bg-amber-500/15 text-amber-700 border-amber-300',
    icon: User,
    defaultPerms: ['dashboard', 'bookings'],
  },
  {
    id: 'custom',
    name: 'Tùy Chỉnh (Custom)',
    desc: 'Tự do tùy biến từng module riêng biệt theo nhu cầu',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    icon: SlidersHorizontal,
    defaultPerms: ['dashboard'],
  },
]

export default function UsersManager() {
  const { admin: currentAdmin, isSuperAdmin } = useAdminAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
  const [passwordTargetUser, setPasswordTargetUser] = useState(null)

  // Form states
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    phone: '',
    role: 'staff',
    permissions: ['dashboard', 'bookings'],
    status: 'active',
  })
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [newPasswordValue, setNewPasswordValue] = useState('')
  const [passwordSubmitting, setPasswordSubmitting] = useState(false)

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const res = await api.get('/admin/users')
      if (res.success && Array.isArray(res.data)) {
        setUsers(res.data)
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách tài khoản:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // Mở modal tạo mới
  const handleOpenCreateModal = () => {
    setEditingUser(null)
    setFormData({
      username: '',
      password: '',
      full_name: '',
      email: '',
      phone: '',
      role: 'staff',
      permissions: ['dashboard', 'bookings'],
      status: 'active',
    })
    setShowPassword(false)
    setIsFormOpen(true)
  }

  // Mở modal sửa
  const handleOpenEditModal = (user) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      password: '',
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || 'staff',
      permissions: Array.isArray(user.permissions) ? user.permissions : [],
      status: user.status || 'active',
    })
    setIsFormOpen(true)
  }

  // Chọn mẫu vai trò
  const handleSelectRolePreset = (roleId) => {
    const preset = ROLE_PRESETS.find((r) => r.id === roleId)
    if (!preset) return
    setFormData((prev) => ({
      ...prev,
      role: roleId,
      permissions: roleId === 'custom' ? prev.permissions : preset.defaultPerms,
    }))
  }

  // Tích / Bỏ tích từng quyền
  const handleTogglePermission = (permId) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.permissions) ? prev.permissions : []
      const exists = current.includes(permId)
      const next = exists ? current.filter((p) => p !== permId) : [...current, permId]

      // Nếu đang ở preset khác mà bấm tùy biến quyền, tự chuyển sang 'custom'
      let newRole = prev.role
      if (prev.role !== 'superadmin' && prev.role !== 'custom') {
        newRole = 'custom'
      }

      return {
        ...prev,
        role: newRole,
        permissions: next,
      }
    })
  }

  // Lưu tạo mới hoặc chỉnh sửa
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    if (!formData.full_name.trim()) {
      alert('Vui lòng nhập họ và tên')
      return
    }

    if (!editingUser) {
      if (!formData.username.trim() || !formData.password.trim()) {
        alert('Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu')
        return
      }
      if (formData.password.length < 6) {
        alert('Mật khẩu phải có ít nhất 6 ký tự')
        return
      }
    }

    try {
      setFormSubmitting(true)
      if (editingUser) {
        // Cập nhật
        const res = await api.put(`/admin/users/${editingUser.id}`, {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
          permissions: formData.permissions,
          status: formData.status,
        })
        if (res.success) {
          setIsFormOpen(false)
          fetchUsers()
        }
      } else {
        // Tạo mới
        const res = await api.post('/admin/users', formData)
        if (res.success) {
          setIsFormOpen(false)
          fetchUsers()
        }
      }
    } catch (err) {
      alert('Lỗi: ' + (err.message || 'Không thể lưu thông tin'))
    } finally {
      setFormSubmitting(false)
    }
  }

  // Đổi trạng thái khóa / mở khóa
  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'inactive' : 'active'
    const confirmMsg =
      newStatus === 'inactive'
        ? `Bạn có chắc chắn muốn TẠM KHÓA tài khoản @${user.username}? Người này sẽ không thể đăng nhập.`
        : `Mở khóa hoạt động cho tài khoản @${user.username}?`

    if (!window.confirm(confirmMsg)) return

    try {
      const res = await api.patch(`/admin/users/${user.id}/status`, { status: newStatus })
      if (res.success) {
        fetchUsers()
      }
    } catch (err) {
      alert('Không thể đổi trạng thái: ' + err.message)
    }
  }

  // Đổi mật khẩu
  const handleOpenPasswordModal = (user) => {
    setPasswordTargetUser(user)
    setNewPasswordValue('')
    setShowPassword(false)
    setIsPasswordModalOpen(true)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    if (!newPasswordValue || newPasswordValue.length < 6) {
      alert('Mật khẩu mới phải có ít nhất 6 ký tự')
      return
    }

    try {
      setPasswordSubmitting(true)
      const res = await api.patch(`/admin/users/${passwordTargetUser.id}/password`, {
        newPassword: newPasswordValue,
      })
      if (res.success) {
        alert(`Đã đổi mật khẩu thành công cho tài khoản @${passwordTargetUser.username}`)
        setIsPasswordModalOpen(false)
      }
    } catch (err) {
      alert('Lỗi đổi mật khẩu: ' + err.message)
    } finally {
      setPasswordSubmitting(false)
    }
  }

  // Xóa tài khoản
  const handleDeleteUser = async (user) => {
    if (!window.confirm(`Bạn có chắc chắn muốn XÓA VĨNH VIỄN tài khoản @${user.username} (${user.full_name})?`)) return
    try {
      const res = await api.delete(`/admin/users/${user.id}`)
      if (res.success) {
        fetchUsers()
      }
    } catch (err) {
      alert('Không thể xóa tài khoản: ' + err.message)
    }
  }

  // Lọc tài khoản
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'all') {
      if (roleFilter === 'inactive' && u.status !== 'inactive') return false
      if (roleFilter !== 'inactive' && u.role !== roleFilter) return false
    }

    if (search.trim()) {
      const term = search.toLowerCase()
      const matchName = (u.full_name || '').toLowerCase().includes(term)
      const matchUser = (u.username || '').toLowerCase().includes(term)
      const matchEmail = (u.email || '').toLowerCase().includes(term)
      const matchPhone = (u.phone || '').toLowerCase().includes(term)
      if (!matchName && !matchUser && !matchEmail && !matchPhone) return false
    }

    return true
  })

  // Helper render badge vai trò
  const renderRoleBadge = (role) => {
    const preset = ROLE_PRESETS.find((r) => r.id === role) || {
      name: role,
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: User,
    }
    const Icon = preset.icon
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${preset.badgeClass}`}
      >
        <Icon size={12} />
        <span>{preset.name}</span>
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-bold text-2xl text-slate-900 flex items-center gap-2.5">
            <ShieldCheck className="text-primary" size={26} />
            Quản Lý Tài Khoản & Phân Quyền
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Tạo tài khoản quản trị viên, phân quyền truy cập theo từng module và quản lý trạng thái thành viên studio
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={fetchUsers}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-2xs flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Tải lại danh sách"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span>Làm Mới</span>
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md shadow-primary/25 hover:shadow-primary/40 flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
          >
            <UserPlus size={15} />
            <span>Thêm Tài Khoản</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Tổng Tài Khoản</div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{users.length}</div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-2xs bg-purple-50/20">
          <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1">
            <Crown size={12} /> Super Admin
          </div>
          <div className="text-2xl font-black text-purple-900 mt-1 font-mono">
            {users.filter((u) => u.role === 'superadmin').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-2xs bg-emerald-50/20">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1">
            <CheckCircle2 size={12} /> Đang Hoạt Động
          </div>
          <div className="text-2xl font-black text-emerald-900 mt-1 font-mono">
            {users.filter((u) => u.status === 'active').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-rose-200/80 shadow-2xs bg-rose-50/20">
          <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider flex items-center gap-1">
            <XCircle size={12} /> Đang Bị Khóa
          </div>
          <div className="text-2xl font-black text-rose-900 mt-1 font-mono">
            {users.filter((u) => u.status === 'inactive').length}
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 flex flex-col lg:flex-row items-center justify-between gap-4 shadow-2xs">
        {/* Role Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 custom-scrollbar">
          {[
            { id: 'all', label: 'Tất Cả' },
            { id: 'superadmin', label: 'Super Admin' },
            { id: 'admin', label: 'Quản Trị Viên' },
            { id: 'editor', label: 'Biên Tập' },
            { id: 'staff', label: 'Điều Phối' },
            { id: 'inactive', label: 'Đã Khóa' },
          ].map((tab) => {
            const active = roleFilter === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setRoleFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? 'bg-primary text-white shadow-xs shadow-primary/30'
                    : 'bg-slate-100/80 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <input
            type="text"
            placeholder="Tìm theo họ tên, username, email, SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
            <span>Đang tải danh sách tài khoản...</span>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700 min-w-[900px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Tài Khoản</th>
                  <th className="py-3.5 px-3">Liên Hệ</th>
                  <th className="py-3.5 px-3">Vai Trò</th>
                  <th className="py-3.5 px-3">Quyền Truy Cập Module</th>
                  <th className="py-3.5 px-3">Trạng Thái</th>
                  <th className="py-3.5 px-3">Đăng Nhập Cuối</th>
                  <th className="py-3.5 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isSelf = currentAdmin && Number(currentAdmin.id) === Number(u.id)
                  const isMasterSuper = Number(u.id) === 1
                  const initials = (u.full_name || u.username || 'U').charAt(0).toUpperCase()
                  const userPerms = Array.isArray(u.permissions) ? u.permissions : []

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        u.status === 'inactive' ? 'bg-slate-50/60 opacity-70' : ''
                      }`}
                    >
                      {/* Tài khoản */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs ${
                              u.role === 'superadmin'
                                ? 'bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-purple-500/20'
                                : 'bg-gradient-to-tr from-primary to-orange-400 text-white shadow-primary/20'
                            }`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                              <span>{u.full_name}</span>
                              {isSelf && (
                                <span className="px-1.5 py-0.2 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
                                  Tôi
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">@{u.username}</div>
                          </div>
                        </div>
                      </td>

                      {/* Liên hệ */}
                      <td className="py-4 px-3 space-y-1">
                        {u.phone ? (
                          <div className="flex items-center gap-1 font-mono text-slate-800 font-medium text-xs">
                            <Phone size={11} className="text-primary" />
                            <a href={`tel:${u.phone}`} className="hover:underline">
                              {u.phone}
                            </a>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">Chưa có SĐT</span>
                        )}
                        {u.email ? (
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate max-w-[170px]" title={u.email}>
                            <Mail size={11} className="text-slate-400 shrink-0" />
                            <span>{u.email}</span>
                          </div>
                        ) : null}
                      </td>

                      {/* Vai trò */}
                      <td className="py-4 px-3">{renderRoleBadge(u.role)}</td>

                      {/* Quyền truy cập */}
                      <td className="py-4 px-3">
                        {u.role === 'superadmin' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.8 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 text-[11px] font-bold">
                            <Crown size={11} /> Toàn quyền (Full Access)
                          </span>
                        ) : userPerms.length > 0 ? (
                          <div className="flex items-center gap-1 flex-wrap max-w-xs">
                            {userPerms.map((pId) => {
                              const pInfo = ALL_PERMISSIONS.find((p) => p.id === pId)
                              return (
                                <span
                                  key={pId}
                                  className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-medium"
                                >
                                  {pInfo ? pInfo.label.split('(')[0].trim() : pId}
                                </span>
                              )
                            })}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Chưa cấp quyền</span>
                        )}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-4 px-3">
                        {u.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-800 border border-emerald-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Hoạt động
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <Lock size={11} /> Đã khóa
                          </span>
                        )}
                      </td>

                      {/* Đăng nhập cuối */}
                      <td className="py-4 px-3 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                        {u.last_login ? (
                          new Date(u.last_login).toLocaleString('vi-VN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })
                        ) : (
                          <span className="italic text-slate-300">Chưa đăng nhập</span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="py-4 px-4 text-right space-x-1 whitespace-nowrap">
                        {/* Đổi mật khẩu */}
                        <button
                          onClick={() => handleOpenPasswordModal(u)}
                          title="Đổi mật khẩu"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                          <KeyRound size={14} />
                        </button>

                        {/* Sửa thông tin & quyền */}
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          title="Chỉnh sửa thông tin & phân quyền"
                          className="p-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors cursor-pointer"
                        >
                          <Edit size={14} />
                        </button>

                        {/* Khóa / Mở khóa (không tự khóa chính mình hoặc master superadmin) */}
                        {!isSelf && !isMasterSuper && (
                          <button
                            onClick={() => handleToggleStatus(u)}
                            title={u.status === 'active' ? 'Tạm khóa tài khoản' : 'Mở khóa tài khoản'}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              u.status === 'active'
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                            }`}
                          >
                            {u.status === 'active' ? <Lock size={14} /> : <Unlock size={14} />}
                          </button>
                        )}

                        {/* Xóa tài khoản (chỉ Super Admin và không tự xóa chính mình) */}
                        {isSuperAdmin && !isSelf && !isMasterSuper && (
                          <button
                            onClick={() => handleDeleteUser(u)}
                            title="Xóa vĩnh viễn tài khoản"
                            className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 text-slate-400 text-xs">
            Không tìm thấy tài khoản nào phù hợp với bộ lọc tìm kiếm.
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* MODAL: TẠO MỚI / CHỈNH SỬA TÀI KHOẢN & PHÂN QUYỀN */}
      {/* ========================================================= */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl relative my-auto animate-in fade-in zoom-in-95 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
            {/* Close Button */}
            <button
              onClick={() => setIsFormOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Đóng"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary to-orange-400 text-white flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
                {editingUser ? <Edit size={20} /> : <UserPlus size={20} />}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingUser ? `Chỉnh Sửa Tài Khoản: @${editingUser.username}` : 'Tạo Tài Khoản Quản Trị Mới'}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Thiết lập thông tin cá nhân, chọn vai trò và cấp quyền truy cập theo từng module
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-5 pt-5 text-xs">
              {/* Thông tin đăng nhập & cơ bản */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Username */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <span>Tên đăng nhập</span> <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    disabled={!!editingUser}
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="Nhập tên đăng nhập (chữ không dấu, số)"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
                    required
                  />
                </div>

                {/* Password (khi tạo mới) */}
                {!editingUser && (
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 flex items-center gap-1">
                      <span>Mật khẩu ban đầu</span> <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="Tối thiểu 6 ký tự"
                        className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Họ và tên */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 flex items-center gap-1">
                    <span>Họ và tên</span> <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Nhập họ và tên nhân sự"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                  />
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email liên hệ</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Nhập địa chỉ email"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Số điện thoại */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Số điện thoại</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Nhập số điện thoại"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Trạng thái */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Trạng thái tài khoản</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary cursor-pointer"
                  >
                    <option value="active">Đang hoạt động (Active)</option>
                    <option value="inactive">Tạm khóa (Inactive)</option>
                  </select>
                </div>
              </div>

              {/* Lựa chọn Vai Trò Mẫu (Role Presets) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="font-bold text-slate-800 text-xs flex items-center justify-between">
                  <span>Chọn Vai Trò Mẫu (Role Preset)</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    Chọn nhanh các nhóm quyền được thiết lập sẵn
                  </span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {ROLE_PRESETS.map((preset) => {
                    const active = formData.role === preset.id
                    const Icon = preset.icon
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectRolePreset(preset.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          active
                            ? 'border-primary bg-primary/5 ring-2 ring-primary/20 shadow-2xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <Icon size={14} className={active ? 'text-primary' : 'text-slate-400'} />
                            {preset.name}
                          </span>
                          {active && <Check size={14} className="text-primary font-bold" />}
                        </div>
                        <p className="text-[10px] text-slate-500 leading-snug">{preset.desc}</p>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Lưới Phân Quyền Chi Tiết (Granular Permissions Matrix) */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                    <ShieldCheck size={14} className="text-primary" />
                    <span>Lưới Phân Quyền Chi Tiết Theo Module</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          permissions: ALL_PERMISSIONS.map((p) => p.id),
                          role: 'custom',
                        }))
                      }
                      className="text-[10px] text-primary hover:underline font-semibold cursor-pointer"
                    >
                      Chọn tất cả
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          permissions: ['dashboard'],
                          role: 'custom',
                        }))
                      }
                      className="text-[10px] text-slate-400 hover:text-slate-600 font-semibold cursor-pointer"
                    >
                      Bỏ chọn hết
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-slate-50/70 p-3 rounded-2xl border border-slate-200/80">
                  {ALL_PERMISSIONS.map((perm) => {
                    const isChecked = formData.permissions.includes(perm.id)
                    const isSuper = formData.role === 'superadmin'

                    return (
                      <label
                        key={perm.id}
                        className={`flex items-start gap-2.5 p-2 rounded-xl transition-all cursor-pointer select-none ${
                          isChecked ? 'bg-white border border-slate-200/90 shadow-2xs' : 'hover:bg-slate-100/70'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked || isSuper}
                          disabled={isSuper}
                          onChange={() => handleTogglePermission(perm.id)}
                          className="mt-0.5 rounded text-primary focus:ring-primary h-3.5 w-3.5 border-slate-300 cursor-pointer"
                        />
                        <div className="min-w-0">
                          <div className={`font-semibold text-xs ${isChecked ? 'text-slate-900' : 'text-slate-600'}`}>
                            {perm.label}
                          </div>
                          <div className="text-[10px] text-slate-400 leading-tight">{perm.desc}</div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Bottom Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md shadow-primary/25 hover:shadow-primary/40 transition-all cursor-pointer disabled:opacity-50"
                >
                  {formSubmitting ? 'Đang lưu...' : editingUser ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ĐỔI MẬT KHẨU NHANH */}
      {/* ========================================================= */}
      {isPasswordModalOpen && passwordTargetUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative my-auto animate-in fade-in zoom-in-95">
            {/* Close Button */}
            <button
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              title="Đóng"
            >
              <X size={18} />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 pb-3.5 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                <KeyRound size={18} />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  Đổi Mật Khẩu Cho @{passwordTargetUser.username}
                </h3>
                <p className="text-[11px] text-slate-500">{passwordTargetUser.full_name}</p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handlePasswordSubmit} className="space-y-4 pt-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Mật khẩu mới</label>
                <div className="relative flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPasswordValue}
                    onChange={(e) => setNewPasswordValue(e.target.value)}
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    className="w-full pl-3 pr-9 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  disabled={passwordSubmitting}
                  className="px-5 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold shadow-md shadow-primary/25 hover:shadow-primary/40 transition-all cursor-pointer disabled:opacity-50"
                >
                  {passwordSubmitting ? 'Đang lưu...' : 'Xác Nhận Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
