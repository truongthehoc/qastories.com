import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../utils/api'

const AdminAuthContext = createContext(null)

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('qastories_admin_token'))
  const [loading, setLoading] = useState(true)

  const logout = useCallback(() => {
    localStorage.removeItem('qastories_admin_token')
    setToken(null)
    setAdmin(null)
  }, [])

  useEffect(() => {
    async function checkAuth() {
      if (!token) {
        setAdmin(null)
        setLoading(false)
        return
      }

      try {
        const res = await api.get('/auth/me')
        if (res.success && res.admin) {
          setAdmin(res.admin)
        } else {
          logout()
        }
      } catch (err) {
        console.warn('Phiên đăng nhập hết hạn:', err.message)
        logout()
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [token, logout])

  const login = async (username, password) => {
    const res = await api.post('/auth/login', { username, password })
    if (res.success && res.token) {
      localStorage.setItem('qastories_admin_token', res.token)
      setToken(res.token)
      setAdmin(res.admin)
      return res
    }
    throw new Error(res.message || 'Đăng nhập không thành công')
  }

  const hasPermission = (perm) => {
    if (!admin) return false
    if (admin.role === 'superadmin') return true
    if (Array.isArray(admin.permissions)) {
      return admin.permissions.includes(perm)
    }
    return false
  }

  const isSuperAdmin = admin?.role === 'superadmin'

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!admin,
        isSuperAdmin,
        hasPermission,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

export default AdminAuthContext
