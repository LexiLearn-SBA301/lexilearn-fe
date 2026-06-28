import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../../features/auth/store/auth.store'

export const AdminRoute = () => {
  const { user, accessToken } = useAuthStore()

  // Nếu chưa đăng nhập (không có token), chuyển hướng về trang đăng nhập
  if (!accessToken) {
    return <Navigate to="/dang-nhap" replace />
  }

  // Nếu đã đăng nhập nhưng không có role ADMIN, chuyển hướng về trang chủ
  if (user && !user.roles?.includes('ADMIN')) {
    return <Navigate to="/" replace />
  }

  // Nếu thoả mãn điều kiện, render các trang Admin bên trong
  return <Outlet />
}
