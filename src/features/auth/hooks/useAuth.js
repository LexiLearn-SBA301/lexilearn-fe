import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import {
  loginApi,
  registerApi,
  verifyOtpApi,
  resendOtpApi,
  forgotPasswordApi,
  resetPasswordApi,
} from '../api/auth.api'
import { useAuthStore } from '../store/auth.store'

// Hook xử lý đăng nhập:
// - Gọi loginApi khi mutate({ email, password })
// - onSuccess: lưu token vào store rồi chuyển hướng về trang chủ
export const useLogin = () => {
  const navigate = useNavigate()
  const setTokens = useAuthStore((state) => state.setTokens)

  return useMutation({
    mutationFn: loginApi,
    onSuccess: (tokenResponse) => {
      // Lưu accessToken và refreshToken vào zustand store (persist vào localStorage)
      setTokens({
        accessToken: tokenResponse.accessToken,
        refreshToken: tokenResponse.refreshToken,
      })
      // Chuyển về trang chủ sau khi đăng nhập thành công
      navigate('/')
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
