import { BrowserRouter, Routes, Route, Outlet, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ScrollToTop from './components/ui/ScrollToTop'
import FloatingContact from './components/ui/FloatingContact'
import QuickAccess from './components/ui/QuickAccess'
import { SettingsProvider } from './context/SettingsContext'
import { AdminAuthProvider } from './context/AdminAuthContext'
import usePageTracking from './hooks/usePageTracking'
import ProtectedRoute from './components/admin/ProtectedRoute'
import AdminLayout from './components/admin/AdminLayout'

import PublicPageGuard from './components/layout/PublicPageGuard'

// Public Pages
const Home = lazy(() => import('./pages/Home'))
const Album = lazy(() => import('./pages/Album'))
const AlbumDetail = lazy(() => import('./pages/AlbumDetail'))
const About = lazy(() => import('./pages/About'))
const Contact = lazy(() => import('./pages/Contact'))

// Admin Pages (Directly imported for instant 0ms tab switching)
import AdminLogin from './pages/admin/AdminLogin'
import Dashboard from './pages/admin/Dashboard'
import BookingsManager from './pages/admin/BookingsManager'
import BannersManager from './pages/admin/BannersManager'
import QuickAccessManager from './pages/admin/QuickAccessManager'
import AlbumsManager from './pages/admin/AlbumsManager'
import PackagesManager from './pages/admin/PackagesManager'
import AboutManager from './pages/admin/AboutManager'
import SettingsManager from './pages/admin/SettingsManager'
import AnalyticsView from './pages/admin/AnalyticsView'
import UsersManager from './pages/admin/UsersManager'
import FooterManager from './pages/admin/FooterManager'

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-offwhite">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary-light border-t-primary rounded-full animate-spin"></div>
        <p className="font-body text-gray-400 text-sm">Đang tải...</p>
      </div>
    </div>
  )
}

function PublicLayout() {
  usePageTracking()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
      <QuickAccess />
      <FloatingContact />
    </div>
  )
}

export default function App() {
  return (
    <AdminAuthProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* 1. Public Website Routes */}
              <Route element={<PublicLayout />}>
                <Route element={<PublicPageGuard pageKey="home" title="Trang Chủ" />}>
                  <Route path="/" element={<Home />} />
                </Route>
                <Route element={<PublicPageGuard pageKey="album" title="Bộ Sưu Tập" />}>
                  <Route path="/album" element={<Album />} />
                  <Route path="/album/:id" element={<AlbumDetail />} />
                </Route>
                <Route element={<PublicPageGuard pageKey="about" title="Giới Thiệu" />}>
                  <Route path="/about" element={<About />} />
                </Route>
                <Route element={<PublicPageGuard pageKey="contact" title="Liên Hệ & Đặt Lịch" />}>
                  <Route path="/contact" element={<Contact />} />
                </Route>
              </Route>

              {/* 2. Admin Login */}
              <Route path="/admin/login" element={<AdminLogin />} />

              {/* 3. Protected Admin Panel Routes */}
              <Route path="/admin" element={<ProtectedRoute />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="bookings" element={<BookingsManager />} />
                  <Route path="packages" element={<PackagesManager />} />
                  <Route path="banners" element={<BannersManager />} />
                  <Route path="quick-access" element={<QuickAccessManager />} />
                  <Route path="albums" element={<AlbumsManager />} />
                  <Route path="about" element={<AboutManager />} />
                  <Route path="settings" element={<SettingsManager />} />
                  <Route path="footer" element={<FooterManager />} />
                  <Route path="analytics" element={<AnalyticsView />} />
                  <Route path="users" element={<UsersManager />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </SettingsProvider>
    </AdminAuthProvider>
  )
}

