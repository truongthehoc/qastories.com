import { useState, useEffect, useMemo } from 'react'
import {
  Tag,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  X,
  CheckCircle2,
  Search,
  Check,
} from 'lucide-react'
import api from '../../utils/api'

export default function PackagesManager() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingPkg, setEditingPkg] = useState(null)
  const [saving, setSaving] = useState(false)

  // Simple Form state
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    is_active: true,
    sort_order: 1,
  })

  const fetchPackages = async () => {
    try {
      setLoading(true)
      const res = await api.get('/packages/admin/all')
      if (res.success && res.data) {
        setPackages(res.data)
      }
    } catch (err) {
      console.warn('Lỗi tải danh sách gói dịch vụ:', err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPackages()
  }, [])

  // Handle Escape key & body overflow lock
  useEffect(() => {
    if (drawerOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [drawerOpen])

  const handleOpenCreateDrawer = () => {
    setEditingPkg(null)
    setFormData({
      name: '',
      price: '',
      description: '',
      is_active: true,
      sort_order: packages.length + 1,
    })
    setDrawerOpen(true)
  }

  const handleOpenEditDrawer = (pkg) => {
    setEditingPkg(pkg)
    setFormData({
      name: pkg.name || '',
      price: pkg.price && Number(pkg.price) > 0 ? String(Math.round(Number(pkg.price))) : '',
      description: pkg.description || '',
      is_active: pkg.is_active !== false,
      sort_order: pkg.sort_order || 0,
    })
    setDrawerOpen(true)
  }

  const handlePriceChange = (e) => {
    const rawDigits = e.target.value.replace(/\D/g, '')
    setFormData((prev) => ({
      ...prev,
      price: rawDigits,
    }))
  }

  const formatInputDisplay = (val) => {
    if (!val) return ''
    const num = Number(val)
    if (isNaN(num)) return ''
    return num.toLocaleString('vi-VN')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.name.trim()) {
      alert('Vui lòng nhập tên gói dịch vụ!')
      return
    }

    const rawNum = formData.price ? Number(String(formData.price).replace(/\D/g, '')) : 0
    const payload = {
      name: formData.name.trim(),
      price: !isNaN(rawNum) ? rawNum : 0,
      description: formData.description ? formData.description.trim() : '',
      is_active: formData.is_active ? 1 : 0,
      sort_order: Number(formData.sort_order) || 0,
    }

    try {
      setSaving(true)
      if (editingPkg) {
        await api.put(`/packages/${editingPkg.id}`, payload)
      } else {
        await api.post('/packages', payload)
      }
      setDrawerOpen(false)
      fetchPackages()
    } catch (err) {
      alert('Lỗi lưu gói dịch vụ: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDeletePackage = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa gói dịch vụ này?')) return
    try {
      await api.delete(`/packages/${id}`)
      fetchPackages()
    } catch (err) {
      alert('Không thể xóa: ' + err.message)
    }
  }

  const handleToggleActive = async (pkg) => {
    try {
      await api.put(`/packages/${pkg.id}`, {
        ...pkg,
        is_active: !pkg.is_active ? 1 : 0,
      })
      fetchPackages()
    } catch (err) {
      alert('Lỗi thay đổi trạng thái: ' + err.message)
    }
  }

  // Filtered packages
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const matchName = (pkg.name || '').toLowerCase().includes(q)
        const matchDesc = (pkg.description || '').toLowerCase().includes(q)
        if (!matchName && !matchDesc) return false
      }
      return true
    })
  }, [packages, searchQuery])

  // Helper format currency
  const formatCurrency = (amount) => {
    if (!amount || isNaN(amount) || Number(amount) === 0) return 'Liên hệ'
    return Number(amount).toLocaleString('vi-VN') + 'đ'
  }

  return (
    <div className="space-y-6">
      {/* Top Header Bar */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/90 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-9 h-9 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-primary shadow-xs">
              <Tag size={20} className="text-primary" />
            </div>
            <h1 className="font-heading font-bold text-xl sm:text-2xl text-slate-900 tracking-tight">
              Danh Mục Gói Dịch Vụ
            </h1>
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-orange-50 text-primary-dark border border-orange-200/70">
              {packages.length} gói
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm pl-0 sm:pl-11">
            Quản lý danh sách các gói dịch vụ chụp ảnh. Thông tin này sẽ tự động nạp khi tạo album và form đặt lịch.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={() => fetchPackages()}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs text-xs transition-colors flex items-center gap-1.5"
            title="Làm mới dữ liệu"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Làm Mới</span>
          </button>
          <button
            onClick={handleOpenCreateDrawer}
            className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-md shadow-primary/25 hover:shadow-primary/40 transition-all flex items-center gap-2"
          >
            <Plus size={16} />
            <span>Thêm Gói Mới</span>
          </button>
        </div>
      </div>

      {/* Search Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo tên gói dịch vụ, mô tả..."
            className="w-full pl-10 pr-9 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-primary transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md"
            >
              <X size={14} />
            </button>
          )}
        </div>

        <div className="text-xs text-slate-500 self-end sm:self-auto shrink-0">
          Hiển thị <strong className="text-slate-800">{filteredPackages.length}</strong> / {packages.length} gói
        </div>
      </div>

      {/* Main List Table */}
      {loading ? (
        <div className="p-16 text-center text-slate-500 text-xs flex flex-col items-center gap-3 bg-white border border-slate-200/90 rounded-3xl shadow-xs">
          <div className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span>Đang tải danh sách gói dịch vụ...</span>
        </div>
      ) : filteredPackages.length > 0 ? (
        <div className="bg-white border border-slate-200/90 rounded-2xl sm:rounded-3xl shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">STT</th>
                  <th className="py-3.5 px-4 min-w-[240px]">Tên Gói Dịch Vụ</th>
                  <th className="py-3.5 px-4 min-w-[150px]">Giá Tiền (VNĐ)</th>
                  <th className="py-3.5 px-4 min-w-[280px]">Mô Tả / Ghi Chú</th>
                  <th className="py-3.5 px-4 text-center min-w-[120px]">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-right min-w-[120px]">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredPackages.map((pkg, idx) => (
                  <tr key={pkg.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* STT */}
                    <td className="py-4 px-4 text-center font-mono text-slate-400 font-medium">
                      #{idx + 1}
                    </td>

                    {/* Name */}
                    <td className="py-4 px-4">
                      <h3
                        onClick={() => handleOpenEditDrawer(pkg)}
                        className="font-heading font-bold text-sm sm:text-base text-slate-900 hover:text-primary transition-colors cursor-pointer"
                      >
                        {pkg.name}
                      </h3>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4">
                      <span className="font-heading font-bold text-sm text-primary">
                        {formatCurrency(pkg.price)}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-4 px-4 text-slate-600">
                      <p className="line-clamp-2 leading-relaxed max-w-lg">
                        {pkg.description || <span className="text-slate-400 italic">Không có mô tả</span>}
                      </p>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleActive(pkg)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all ${
                          pkg.is_active !== false
                            ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {pkg.is_active !== false ? '● Đang mở' : '○ Tạm dừng'}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditDrawer(pkg)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                          title="Chỉnh sửa gói"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePackage(pkg.id)}
                          className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                          title="Xóa gói dịch vụ"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-slate-200/90 rounded-3xl shadow-xs">
          <Tag className="mx-auto text-slate-300 mb-3" size={48} />
          <h4 className="font-heading font-bold text-base text-slate-800">Chưa có gói dịch vụ nào</h4>
          <p className="text-slate-500 text-xs mt-1">Bấm nút bên dưới để tự thêm gói chụp cho studio.</p>
          <button
            onClick={handleOpenCreateDrawer}
            className="mt-4 px-4 py-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-md shadow-primary/25"
          >
            Thêm Gói Mới
          </button>
        </div>
      )}

      {/* Drawer: Create / Edit Package (Trượt từ phải qua) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            onClick={() => setDrawerOpen(false)}
            className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl z-10 flex flex-col transform transition-transform duration-300 ease-out animate-in slide-in-from-right">
            {/* Header */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="space-y-0.5">
                <div className="inline-flex items-center gap-1.5 text-xs text-primary font-semibold">
                  <Tag size={14} />
                  <span>{editingPkg ? 'Chỉnh Sửa Gói' : 'Tạo Gói Mới'}</span>
                </div>
                <h3 className="font-heading font-bold text-lg sm:text-xl text-slate-900">
                  {editingPkg ? 'Chỉnh Sửa Gói Dịch Vụ' : 'Thêm Gói Dịch Vụ'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                title="Đóng (Esc)"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 custom-scrollbar space-y-5">
              <form id="pkg-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
                {/* Name */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">
                    Tên Gói Dịch Vụ <span className="text-primary">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Nhập tên gói dịch vụ..."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-primary text-xs sm:text-sm font-medium"
                  />
                </div>

                {/* Price */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-slate-700 font-semibold">Giá Tiền (VNĐ - Tùy chọn)</label>
                    {formData.price && Number(formData.price) > 0 ? (
                      <span className="text-[11px] font-bold text-primary bg-orange-50 px-2 py-0.5 rounded-lg border border-orange-200">
                        {Number(formData.price).toLocaleString('vi-VN')} VNĐ
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        Để trống = Liên hệ báo giá
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Nhập giá tiền hoặc để trống nếu liên hệ báo giá..."
                      value={formatInputDisplay(formData.price)}
                      onChange={handlePriceChange}
                      className="w-full pl-3.5 pr-14 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary text-xs sm:text-sm font-semibold text-primary"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 font-semibold text-xs">
                      VNĐ
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-slate-700 font-semibold mb-1.5">Mô Tả / Chi Tiết Gói</label>
                  <textarea
                    rows={4}
                    placeholder="Nhập mô tả chi tiết quyền lợi và đặc điểm của gói chụp..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary text-xs leading-relaxed"
                  />
                </div>

                {/* Order & Active toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                  <div>
                    <label className="block text-slate-700 font-semibold mb-1.5">Thứ Tự Sắp Xếp</label>
                    <input
                      type="number"
                      value={formData.sort_order}
                      onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-none focus:border-primary text-xs"
                    />
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 cursor-pointer w-full">
                      <input
                        type="checkbox"
                        checked={formData.is_active}
                        onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                        className="w-4 h-4 rounded text-primary focus:ring-primary"
                      />
                      <span className="font-semibold text-slate-800 text-xs">Đang mở nhận lịch</span>
                    </label>
                  </div>
                </div>
              </form>
            </div>

            {/* Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/90 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                form="pkg-form"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-semibold shadow-md shadow-primary/25 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 size={16} />
                )}
                <span>{saving ? 'Đang Lưu...' : editingPkg ? 'Lưu Thay Đổi' : 'Thêm Gói'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
