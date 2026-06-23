import { apiClient } from '../../../lib/api'

// Gọi API đăng nhập, trả về TokenResponse (accessToken, refreshToken, tokenType, expiresIn)
// BE: POST /v1/auth/login → ApiResponse<TokenResponse>
export const loginApi = async ({ email, password }) => {
  const response = await apiClient.post('/v1/auth/login', { email, password })
  // response.data.result là TokenResponse chứa accessToken và refreshToken
  return response.data.result
}

// Gọi API đăng ký, trả về toàn bộ ApiResponse (để lấy .message hướng dẫn OTP)
// BE: POST /v1/auth/register → ApiResponse<Void> (HTTP 201, tài khoản UNVERIFIED, gửi OTP qua email)
// KHÔNG trả token — user phải xác thực OTP trước khi đăng nhập được
export const registerApi = async ({ email, password }) => {
  const response = await apiClient.post('/v1/auth/register', {
    email,
    password,
  })
  // Trả về response.data (ApiResponse) thay vì .result vì result là Void,
  // cần .message để hiển thị thông báo cho user
  return response.data
}

// Gọi API xác thực OTP, trả về ApiResponse<Void> (để lấy .message xác nhận thành công)
// BE: POST /v1/auth/verify-otp → ApiResponse<Void>
export const verifyOtpApi = async ({ email, otp }) => {
  const response = await apiClient.post('/v1/auth/verify-otp', { email, otp })
  return response.data
}

// Gọi API gửi lại OTP, trả về ApiResponse<Void> (để lấy .message kết quả)
// BE giới hạn tối đa 5 lần/giờ — có thể trả lỗi 4xx khi vượt giới hạn
// BE: POST /v1/auth/resend-otp → ApiResponse<Void>
export const resendOtpApi = async ({ email }) => {
  const response = await apiClient.post('/v1/auth/resend-otp', { email })
  return response.data
}

// Gọi API yêu cầu đặt lại mật khẩu, trả về ApiResponse<Void>
// BE luôn trả 200 dù email có tồn tại hay không (chống dò email)
// BE: POST /v1/auth/forgot-password → ApiResponse<Void>
export const forgotPasswordApi = async ({ email }) => {
  const response = await apiClient.post('/v1/auth/forgot-password', { email })
  return response.data
}

// Gọi API đặt lại mật khẩu với OTP, trả về ApiResponse<Void>
// BE: POST /v1/auth/reset-password → ApiResponse<Void>
// Lưu ý: chỉ gửi { email, otp, newPassword } — KHÔNG gửi confirmPassword
export const resetPasswordApi = async ({ email, otp, newPassword }) => {
  const response = await apiClient.post('/v1/auth/reset-password', {
    email,
    otp,
    newPassword,
  })
  return response.data
}
