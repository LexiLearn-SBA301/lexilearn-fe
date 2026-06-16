import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { LibraryPage } from './features/library/pages/LibraryPage'
import { WorkDetailPage } from './features/library/pages/WorkDetailPage'
import { AuthorListPage } from './features/author/pages/AuthorListPage'
import { AuthorDetailPage } from './features/author/pages/AuthorDetailPage'

import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { Header } from './components/layout/Header'
import { Footer } from './components/layout/Footer'
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
              {/* Tự động chuyển hướng từ trang chủ vào Thư viện */}
              <Route path="/" element={<HomePage />} />

              {/* Tuyến đường 1: Thư viện (Danh sách sách) */}
              <Route path="/thu-vien" element={<LibraryPage />} />

              {/* Tuyến đường 2: Chi tiết tác phẩm (Bắt tham số slug) */}
              <Route path="/thu-vien/:slug" element={<WorkDetailPage />} />
              <Route path="/tac-gia" element={<AuthorListPage />} />
              <Route path="/tac-gia/:slug" element={<AuthorDetailPage />} />
              <Route path="/dang-nhap" element={<LoginPage />} />
            </Routes>
          </div>
          <Footer />
        </main>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
