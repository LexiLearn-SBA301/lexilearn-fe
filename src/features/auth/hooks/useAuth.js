import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  loginApi,
  registerApi,
  verifyOtpApi,
  resendOtpApi,
  forgotPasswordApi,
  resetPasswordApi,
  getMeApi,
} from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'
import { resolveHomeRoute } from '../utils/resolveHomeRoute'

// Hook xử lý đăng nhập:
// - Gọi loginApi khi mutate({ email, password })
// - onSuccess: lưu token, gọi /me lấy thông tin user, rồi điều hướng theo role
export const useLogin = () => {
  const navigate = useNavigate()
  const setTokens = useAuthStore((state) => state.setTokens)
  const setUser = useAuthStore((state) => state.setUser)

  return useMutation({
    mutationFn: loginApi,
    onSuccess: async (tokenResponse) => {
      // Lưu accessToken và refreshToken vào zustand store (persist vào localStorage đồng bộ)
      // Interceptor trong api.js đọc token từ localStorage tại thời điểm gọi request,
      // nên sau khi setTokens() trả về, token đã có trong localStorage cho getMeApi()
      setTokens({
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
      })

      // Lấy thông tin người dùng hiện tại từ /v1/auth/me (token đã được gắn tự động)
      // Lưu ý: KHÔNG bọc try/catch nuốt lỗi ở đây nữa.
      // Trước đây nếu getMeApi() thất bại (vd 401 do bug BE chỉ xảy ra với role USER),
      // code sẽ console.error rồi tự navigate('/') — điều này gây ra 2 vấn đề:
      //  1. Lỗi thật bị nuốt mất, user không được thông báo gì (banner lỗi không hiện)
      //  2. navigate('/') (điều hướng phía client) chạy đua với response interceptor
      //     trong lib/api.js — nếu refresh token cũng thất bại, interceptor sẽ gọi
      //     window.location.href = '/dang-nhap' (reload cứng cả trang). Hai điều hướng
      //     này đụng nhau khiến trang nháy lỗi rồi bị load lại về /dang-nhap sạch trơn,
      //     trông như "lỗi hiện rồi biến mất ngay".
      // Giờ để lỗi ném ra ngoài — mutation sẽ chuyển sang isError=true với đúng lỗi
      // gốc, LoginPage hiển thị message thật (hoặc fallback) và KHÔNG tự ý điều hướng,
      // tránh đụng độ với interceptor.
      const user = await getMeApi()
      // Lưu thông tin người dùng vào store
      setUser(user)

      // Điều hướng theo role
      navigate(resolveHomeRoute(user.roles))
    },
  })
}

// Hook xử lý đăng ký:
// - Gọi registerApi khi mutate({ email, password })
// - onSuccess: KHÔNG tự điều hướng ở đây — RegisterPage truyền per-call onSuccess
//   để navigate sang /xac-thuc-otp kèm email (email không có trong API response)
// - Không lưu token vì account vẫn đang UNVERIFIED, cần xác thực OTP trước
export const useRegister = () => {
  return useMutation({
    mutationFn: registerApi,
  })
}

// Hook xử lý xác thực OTP:
// - Gọi verifyOtpApi khi mutate({ email, otp })
// - onSuccess: KHÔNG tự navigate — để VerifyOtpPage hiển thị banner thành công
//   và tự điều hướng sang /dang-nhap sau 1.5s qua useEffect
export const useVerifyOtp = () => {
  return useMutation({
    mutationFn: verifyOtpApi,
  })
}

// Hook xử lý gửi lại OTP:
// - Gọi resendOtpApi khi mutate({ email })
// - BE giới hạn 5 lần/giờ — FE còn chặn thêm bằng countdown 60 giây
// - onSuccess/onError: để VerifyOtpPage xử lý hiển thị message và reset countdown
export const useResendOtp = () => {
  return useMutation({
    mutationFn: resendOtpApi,
  })
}

// Hook xử lý quên mật khẩu:
// - Gọi forgotPasswordApi khi mutate({ email })
// - BE luôn trả 200 (không tiết lộ email có tồn tại không)
// - onSuccess: để ForgotPasswordPage tự xử lý banner + điều hướng sang /dat-lai-mat-khau kèm email
//   (email phải lấy từ form closure vì API response không chứa email)
export const useForgotPassword = () => {
  return useMutation({
    mutationFn: forgotPasswordApi,
  })
}

// Hook xử lý đặt lại mật khẩu:
// - Gọi resetPasswordApi khi mutate({ email, otp, newPassword })
// - onSuccess: để ResetPasswordPage hiển thị banner thành công + điều hướng sang /dang-nhap sau 1.5s
export const useResetPassword = () => {
  return useMutation({
    mutationFn: resetPasswordApi,
  })
}
