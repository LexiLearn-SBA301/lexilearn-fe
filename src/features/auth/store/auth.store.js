import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Store lưu trữ token xác thực, persist vào localStorage để giữ phiên sau reload.
// Key lưu trong localStorage: 'auth-storage'
// Lưu ý: rememberMe chưa phân biệt session/localStorage — luôn persist cho đơn giản.
// Nếu sau này cần tôn trọng rememberMe, có thể swap storage sang sessionStorage cho trường hợp không tick.
export const useAuthStore = create(
  persist(
    (set) => ({
      // Token truy cập, dùng để gắn vào header Authorization mỗi request
      accessToken: null,
      // Token làm mới, dùng để xin cấp lại accessToken khi hết hạn
      refreshToken: null,

      // Lưu cặp token sau khi đăng nhập thành công
      setTokens: ({ accessToken, refreshToken }) =>
        set({ accessToken, refreshToken }),

      // Xóa token khi đăng xuất
      clearTokens: () => set({ accessToken: null, refreshToken: null }),
    }),
    {
      // Key dùng để lưu vào localStorage — interceptor trong api.js đọc cùng key này
      name: 'auth-storage',
    },
  ),
)
