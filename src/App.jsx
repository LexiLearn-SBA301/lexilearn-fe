import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LibraryPage } from './features/library/pages/LibraryPage'
import { WorkDetailPage } from './features/library/pages/WorkDetailPage'
import { AuthorListPage } from './features/author/pages/AuthorListPage'
import { AuthorDetailPage } from './features/author/pages/AuthorDetailPage'
import { ReadingPage } from './features/library/pages/ReadingPage'

import { HomePage } from './pages/HomePage'
import { LoginPage } from './features/auth/pages/LoginPage'
import { RegisterPage } from './features/auth/pages/RegisterPage'
import { VerifyOtpPage } from './features/auth/pages/VerifyOtpPage'
import { ForgotPasswordPage } from './features/auth/pages/ForgotPasswordPage'
import { ResetPasswordPage } from './features/auth/pages/ResetPasswordPage'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'

// Admin Pages
import { WorkAdminPage } from './features/library/pages/WorkAdminPage'
import { AuthorAdminPage } from './features/author/pages/AuthorAdminPage'
// Khởi tạo một instance của QueryClient
const queryClient = new QueryClient()

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <main className="min-h-svh w-full bg-background text-on-surface-variant">
          <Header />

          <div className="flex-grow flex flex-col pt-20">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/thu-vien" element={<LibraryPage />} />
              <Route path="/thu-vien/:slug" element={<WorkDetailPage />} />
              <Route path="/thu-vien/:slug/doc" element={<ReadingPage />} />
              <Route
                path="/thu-vien/:slug/doc/:sectionId"
                element={<ReadingPage />}
              />
              <Route path="/tac-gia" element={<AuthorListPage />} />
              <Route path="/tac-gia/:slug" element={<AuthorDetailPage />} />
              <Route path="/dang-nhap" element={<LoginPage />} />
              <Route path="/dang-ky" element={<RegisterPage />} />
              {/* Trang xác thực OTP — điều hướng từ RegisterPage kèm email qua location.state */}
              <Route path="/xac-thuc-otp" element={<VerifyOtpPage />} />
              {/* Luồng quên mật khẩu: nhập email → nhận OTP → đặt lại */}
              <Route path="/quen-mat-khau" element={<ForgotPasswordPage />} />
              <Route path="/dat-lai-mat-khau" element={<ResetPasswordPage />} />
              {/* --- ADMIN ROUTES --- */}
              {/* Tạm thời để mở để dev, sau này team làm Auth thì bọc <ProtectedRoute> vào đây */}
              <Route path="/admin/tac-gia" element={<AuthorAdminPage />} />
              <Route path="/admin/thu-vien" element={<WorkAdminPage />} />
            </Routes>
          </div>
          <Footer />
        </main>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
