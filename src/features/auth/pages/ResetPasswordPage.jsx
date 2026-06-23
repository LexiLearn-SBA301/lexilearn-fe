import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react'
import {
  resetPasswordSchema,
  defaultResetPasswordValues,
} from '../schemas/auth.schema'
import { useResetPassword } from '../hooks/useAuth'

export const ResetPasswordPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Đọc email từ location.state (điều hướng từ ForgotPasswordPage)
  // Nếu vào trực tiếp không có state, để trống để user tự nhập
  const emailFromState = location.state?.email ?? ''

  // Hook mutation đặt lại mật khẩu — isPending/isSuccess/isError/error dùng để điều khiển UI
  // onSuccess không tự navigate — để useEffect xử lý với cleanup an toàn
  const {
    mutate: resetPassword,
    isPending,
    isSuccess,
    isError,
    error,
  } = useResetPassword()

  // Sau khi đặt lại thành công: chờ 1.5s rồi chuyển sang /dang-nhap
  // Dùng useEffect với cleanup để tránh navigate trên component đã unmount
  useEffect(() => {
    if (!isSuccess) return
    const id = setTimeout(() => navigate('/dang-nhap'), 1500)
    return () => clearTimeout(id)
  }, [isSuccess, navigate])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resetPasswordSchema),
    // Prefill email từ state nếu có — readOnly sẽ giữ giá trị này
    defaultValues: { ...defaultResetPasswordValues, email: emailFromState },
    mode: 'onChange', // Validate realtime (gõ tới đâu bắt lỗi tới đó)
  })

  const onSubmit = (data) => {
    // Chỉ gửi { email, otp, newPassword } — confirmPassword chỉ dùng validate phía client
    resetPassword({
      email: data.email,
      otp: data.otp,
      newPassword: data.newPassword,
    })
  }

  // Lấy message lỗi từ BE (ApiResponse.message) hoặc fallback nếu không có response
  const serverErrorMessage = isError
    ? (error?.response?.data?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.')
    : null

  return (
    <main className="paper-texture flex items-center justify-center p-6 md:px-20 md:py-6 relative z-10 min-h-[calc(100svh-5rem)]">
      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-bright-cream rounded-3xl overflow-hidden ink-shadow border border-earth-beige relative">
        {/* Left Side: Artistic Illustration — giống LoginPage/ForgotPasswordPage */}
        <div className="hidden md:block md:w-1/2 relative bg-surface-variant overflow-hidden group">
          <img
            alt="Artistic interpretation of Vietnamese literature heritage"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 mix-blend-multiply"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRLinyX-5GTzrLreKW1AnFqyyYj9gSxXho4VQqv1VQneW891fTHxaDIigQc3TyqkD7wYKsjU8bhUWYDPz1CmGhO8wZ789DIvq_FKqQp6PT8ZFwyuB4uTJpskT716G6tqi4MNCRaUUyIa1Hr1sj4d-GVCcPpJJw1JNvDBoyoJV_wjLSmjWXDWkUjMTyXqH3xDoNDR6l7l4Ejg4hps_5Hr6iZIgq2njDR-HpyTVk9oXXMEJv7RxeamL8aTeI1zDCzpcgoZEPvNJmGTpp"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
          <div className="absolute bottom-12 left-12 right-12 text-on-primary">
            <h2 className="font-title text-[44px] leading-tight font-bold mb-4 text-bright-cream">
              Tạo mật khẩu mới
            </h2>
            <p className="font-quote text-xl leading-relaxed text-surface-container opacity-90">
              Chọn một mật khẩu mạnh để bảo vệ hành trình khám phá văn học của
              bạn.
            </p>
          </div>
        </div>

        {/* Right Side: Reset Password Form */}
        <div className="w-full md:w-1/2 p-8 sm:px-10 sm:py-8 lg:px-12 lg:py-8 flex flex-col justify-center relative bg-bright-cream z-10">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-6 text-center md:text-left">
              <h1 className="font-title text-[32px] font-semibold text-primary mb-2">
                Đặt lại mật khẩu
              </h1>
              <p className="font-body text-base text-on-surface-variant">
                {emailFromState ? (
                  <>
                    Nhập mã OTP đã gửi đến{' '}
                    <span className="font-semibold text-primary">
                      {emailFromState}
                    </span>{' '}
                    và mật khẩu mới của bạn.
                  </>
                ) : (
                  'Nhập email, mã OTP và mật khẩu mới để hoàn tất đặt lại.'
                )}
              </p>
            </div>

            {/* Banner thành công — dùng hex arbitrary, không dùng green-* */}
            {isSuccess && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-[#f0fdf4] border border-[#86efac]">
                <p className="text-sm text-[#15803d] font-medium mb-1">
                  Đặt lại mật khẩu thành công!
                </p>
                <p className="text-xs text-[#15803d]">
                  Đang chuyển sang trang đăng nhập...{' '}
                  <Link
                    to="/dang-nhap"
                    className="font-semibold underline decoration-[#15803d]/30"
                  >
                    Nhấn đây nếu không tự chuyển
                  </Link>
                </p>
              </div>
            )}

            <form
              className="space-y-5"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              {/* Thông báo lỗi từ server (BE) */}
              {serverErrorMessage && (
                <div className="px-4 py-3 rounded-xl bg-[#ab3429]/10 border border-[#ab3429]/30">
                  <p className="text-sm text-[#ab3429] font-medium">
                    {serverErrorMessage}
                  </p>
                </div>
              )}

              {/* Ô Email: readonly nếu có email từ state, cho nhập nếu vào trực tiếp */}
              <div>
                <label
                  className="block font-body text-[15px] font-semibold tracking-wide text-primary mb-2"
                  htmlFor="reset-email"
                >
                  Email
                </label>
                <div className="relative">
                  <Mail
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                  />
                  <input
                    className={`w-full pl-10 pr-4 py-3 bg-surface border ${errors.email ? 'border-[#ab3429]' : 'border-outline-variant'} rounded-xl focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors font-body text-base text-on-surface placeholder:text-outline-variant ${emailFromState ? 'bg-surface-container text-on-surface-variant cursor-default' : ''}`}
                    id="reset-email"
                    placeholder="ví dụ: nguyenvan@gmail.com"
                    type="email"
                    // readOnly giữ giá trị khi submit — khác với disabled sẽ bị bỏ qua
                    readOnly={!!emailFromState}
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-[#ab3429] font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Ô OTP: 6 chữ số */}
              <div>
                <label
                  className="block font-body text-[15px] font-semibold tracking-wide text-primary mb-2"
                  htmlFor="reset-otp"
                >
                  Mã OTP
                </label>
                <div className="relative">
                  <KeyRound
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                  />
                  <input
                    className={`w-full pl-10 pr-4 py-3 bg-surface border ${errors.otp ? 'border-[#ab3429]' : 'border-outline-variant'} rounded-xl focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors font-body text-base text-on-surface placeholder:text-outline-variant tracking-[0.3em]`}
                    id="reset-otp"
                    placeholder="_ _ _ _ _ _"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    autoComplete="one-time-code"
                    {...register('otp')}
                  />
                </div>
                {errors.otp && (
                  <p className="mt-1.5 text-xs text-[#ab3429] font-medium">
                    {errors.otp.message}
                  </p>
                )}
              </div>

              {/* Ô Mật khẩu mới */}
              <div>
                <label
                  className="block font-body text-[15px] font-semibold tracking-wide text-primary mb-2"
                  htmlFor="new-password"
                >
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <Lock
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                  />
                  <input
                    className={`w-full pl-10 pr-12 py-3 bg-surface border ${errors.newPassword ? 'border-[#ab3429]' : 'border-outline-variant'} rounded-xl focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors font-body text-base text-on-surface placeholder:text-outline-variant`}
                    id="new-password"
                    placeholder="••••••••"
                    type={showNewPassword ? 'text' : 'password'}
                    {...register('newPassword')}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors focus:outline-none"
                    type="button"
                    aria-label="Hiện hoặc ẩn mật khẩu mới"
                    onClick={() => setShowNewPassword((v) => !v)}
                  >
                    {showNewPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
                {/* Gợi ý luật mật khẩu — hiển thị thường trực để user biết trước */}
                <p className="mt-1.5 text-xs text-on-surface-variant">
                  Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số.
                </p>
                {errors.newPassword && (
                  <p className="mt-1 text-xs text-[#ab3429] font-medium">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Ô Xác nhận mật khẩu mới */}
              <div>
                <label
                  className="block font-body text-[15px] font-semibold tracking-wide text-primary mb-2"
                  htmlFor="confirm-new-password"
                >
                  Xác nhận mật khẩu mới
                </label>
                <div className="relative">
                  <Lock
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                  />
                  <input
                    className={`w-full pl-10 pr-12 py-3 bg-surface border ${errors.confirmPassword ? 'border-[#ab3429]' : 'border-outline-variant'} rounded-xl focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors font-body text-base text-on-surface placeholder:text-outline-variant`}
                    id="confirm-new-password"
                    placeholder="••••••••"
                    type={showConfirmPassword ? 'text' : 'password'}
                    {...register('confirmPassword')}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors focus:outline-none"
                    type="button"
                    aria-label="Hiện hoặc ẩn xác nhận mật khẩu"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                  >
                    {showConfirmPassword ? (
                      <Eye size={20} />
                    ) : (
                      <EyeOff size={20} />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-[#ab3429] font-medium">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Nút đặt lại — disable khi đang pending hoặc đã thành công */}
              <button
                className="w-full py-3 px-4 bg-gradient-to-r from-secondary to-secondary-container text-on-secondary font-body text-[15px] font-semibold tracking-wide rounded-xl hover:shadow-[0_8px_16px_rgba(171,52,41,0.2)] hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
                type="submit"
                disabled={isPending || isSuccess}
              >
                <span>
                  {isPending ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
                </span>
                <ArrowRight size={20} />
              </button>
            </form>

            {/* Link quay về đăng nhập */}
            <div className="mt-6 text-center">
              <Link
                to="/dang-nhap"
                className="font-body text-[13px] text-on-surface-variant hover:text-primary transition-colors underline decoration-outline-variant underline-offset-4"
              >
                Quay về đăng nhập
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
