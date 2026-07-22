import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getMeApi,
  updateProfileApi,
  changePasswordApi,
} from '../../../services/auth.service'
import { useAuthStore } from '../store/auth.store'

// Key dùng chung cho dữ liệu /v1/auth/me — export để nơi khác có thể invalidate
export const ME_QUERY_KEY = ['auth', 'me']

// Hook lấy thông tin người dùng hiện tại:
// - Gọi GET /v1/auth/me, chỉ chạy khi đã có accessToken (tránh gọi thừa lúc chưa đăng nhập)
// - initialData lấy từ zustand store (user đã được persist lúc đăng nhập) để trang
//   hiển thị ngay lập tức, sau đó react-query vẫn refetch nền lấy dữ liệu mới nhất
// - useEffect đồng bộ ngược dữ liệu mới về store: react-query v5 đã bỏ onSuccess
//   của useQuery nên phải sync bằng effect
export const useMe = () => {
  const accessToken = useAuthStore((state) => state.accessToken)
  const user = useAuthStore((state) => state.user)
  const setUser = useAuthStore((state) => state.setUser)

  const query = useQuery({
    queryKey: ME_QUERY_KEY,
    queryFn: getMeApi,
    enabled: Boolean(accessToken),
    initialData: user ?? undefined,
    staleTime: 30_000,
  })

  const fetchedUser = query.data

  useEffect(() => {
    if (!fetchedUser) return
    // Chỉ ghi lại store khi dữ liệu thực sự khác, tránh set state lặp vô hạn
    const current = useAuthStore.getState().user
    if (JSON.stringify(current) === JSON.stringify(fetchedUser)) return
    setUser(fetchedUser)
  }, [fetchedUser, setUser])

  return query
}

// Hook xử lý cập nhật thông tin cá nhân:
// - Gọi updateProfileApi khi mutate({ fullName })
// - onSuccess: ghi UserResponse mới vào cache /me VÀ vào zustand store để Header
//   hiển thị tên mới ngay lập tức mà không cần reload
// - Việc hiển thị banner thành công/lỗi để ProfilePage tự xử lý (giống các trang auth khác)
export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: updateProfileApi,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(ME_QUERY_KEY, updatedUser)
      setUser(updatedUser)
    },
  })
}

// Hook xử lý đổi mật khẩu:
// - Gọi changePasswordApi khi mutate({ currentPassword, newPassword })
// - BE KHÔNG thu hồi token → KHÔNG logout, KHÔNG điều hướng, chỉ báo thành công
// - Lỗi nghiệp vụ (password_incorrect / password_same_as_old) nằm trong
//   error.response.data.message, ProfilePage hiển thị qua AuthMessageBanner
export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePasswordApi,
  })
}
