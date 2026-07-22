import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/store/auth.store'

// Guard yêu cầu ĐÃ ĐĂNG NHẬP (mọi role đều qua được) — dùng cho các trang cá nhân.
// Theo đúng pattern của AdminRoute, chỉ bỏ phần kiểm tra role.
export const ProtectedRoute = () => {
  const accessToken = useAuthStore((state) => state.accessToken)

  // Nếu chưa đăng nhập (không có token), chuyển hướng về trang đăng nhập
  if (!accessToken) {
    return <Navigate to="/dang-nhap" replace />
  }

  // Đã đăng nhập → render các trang bên trong
  return <Outlet />
}
