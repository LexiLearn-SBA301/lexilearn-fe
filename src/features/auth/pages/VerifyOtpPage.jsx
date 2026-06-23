import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, Mail, ArrowRight, RotateCcw } from 'lucide-react'
import { verifyOtpSchema, defaultVerifyOtpValues } from '../schemas/auth.schema'
import { useVerifyOtp, useResendOtp } from '../hooks/useAuth'

export const VerifyOtpPage = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // Đọc email từ location.state (điều hướng từ RegisterPage)
  // Nếu vào trực tiếp không có state, để trống để user tự nhập
  const emailFromState = location.state?.email ?? ''

  // Countdown 60 giây chặn spam gửi lại OTP — bắt đầu từ 60 vì OTP vừa được gửi lúc đăng ký
  const [countdown, setCountdown] = useState(60)

  // Mỗi giây giảm countdown 1 đơn vị, dừng khi về 0
  useEffect(() => {
    if (countdown <= 0) return
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000)
    return () => clearTimeout(id)
  }, [countdown])

  // Hook mutation xác thực OTP
  const {
    mutate: verifyOtp,
    isPending: isVerifyPending,
    isSuccess: isVerifySuccess,
    isError: isVerifyError,
    error: verifyError,
  } = useVerifyOtp()

  // Hook mutation gửi lại OTP
  const {
    mutate: resendOtp,
    isPending: isResendPending,
    isSuccess: isResendSuccess,
    isError: isResendError,
    error: resendError,
    data: resendData,
    reset: resetResend,
  } = useResendOtp()

  // Sau khi xác thực thành công: chờ 1.5s rồi chuyển sang trang đăng nhập
  // Dùng useEffect với cleanup để tránh navigate trên component đã unmount
  useEffect(() => {
    if (!isVerifySuccess) return
    const id = setTimeout(() => navigate('/dang-nhap'), 1500)
    return () => clearTimeout(id)
  }, [isVerifySuccess, navigate])

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifyOtpSchema),
    // Prefill email từ state nếu có — readOnly sẽ giữ giá trị này không đổi
    defaultValues: { ...defaultVerifyOtpValues, email: emailFromState },
    mode: 'onChange', // Validate realtime (gõ tới đâu bắt lỗi tới đó)
  })

  // Email hiện tại trong form (dùng để gửi lại OTP)
  const currentEmail = watch('email')

  const onSubmit = (data) => {
    verifyOtp({ email: data.email, otp: data.otp })
  }

  const handleResend = () => {
    if (!currentEmail || countdown > 0 || isResendPending) return
    // Reset trạng thái resend cũ trước khi gọi lại
    resetResend()
    resendOtp(
      { email: currentEmail },
      {
        // Reset countdown 60s sau khi gửi lại thành công
        onSuccess: () => setCountdown(60),
      },
    )
  }

  // Lấy message lỗi xác thực OTP từ BE hoặc fallback
  const verifyErrorMessage = isVerifyError
    ? (verifyError?.response?.data?.message ??
      'Có lỗi xảy ra, vui lòng thử lại.')
    : null

  // Lấy message kết quả gửi lại OTP từ BE (thành công hoặc lỗi)
  const resendSuccessMessage = isResendSuccess
    ? (resendData?.message ?? 'Đã gửi lại mã OTP. Vui lòng kiểm tra email.')
    : null
  const resendErrorMessage = isResendError
    ? (resendError?.response?.data?.message ??
      'Không thể gửi lại OTP, vui lòng thử lại sau.')
    : null

  return (
    <main className="paper-texture flex items-center justify-center p-6 md:px-20 md:py-6 relative z-10 min-h-[calc(100svh-5rem)]">
      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-bright-cream rounded-3xl overflow-hidden ink-shadow border border-earth-beige relative">
        {/* Left Side: Illustration Panel — đồng bộ với LoginPage/RegisterPage */}
        <div className="hidden md:block md:w-1/2 relative bg-surface-container-low overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <img
              alt="Literary illustration"
              className="w-full h-full object-cover opacity-90"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNnPQVQEe-X6IHugtccLJqRKw0Nv_nPbavimDHzTG9Di6Mnfyu12zK2FeRiDOM-Awf2k9a0rDYYnd28SYekZDWYK1Syz5Rw7zeD-JqmFnl-MCKx74JD8mXSeNoqesrOAs6mEasawy2FWsSvvweG7X2wlnc-ynrt0chnisJuJ_ukVw8-iWcd2ETJA7hnjixHQOp5fdynAfrXh9CwlkEm9V3RECMgfMsxae_h08ykqdH6idQXmvAIy_8Lq8kCWnjBG66SzHrueG-5jqw"
            />
            {/* Gradient overlay giống RegisterPage */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent"></div>
          </div>
          <div className="absolute bottom-12 left-12 right-12 z-10 text-on-primary">
            <h2 className="font-title text-[44px] leading-tight font-bold mb-4 text-bright-cream">
              Gần đến nơi rồi
            </h2>
            <p className="font-quote text-xl leading-relaxed text-surface-container opacity-90">
              Chỉ còn một bước nữa để mở ra cánh cổng vào di sản văn học ngàn
              năm của dân tộc.
            </p>
          </div>
          {/* Decorative element — giống RegisterPage */}
          <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-surface-container/30"></div>
          <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-surface-container/30"></div>
        </div>

        {/* Right Side: OTP Verification Form */}
        <div className="w-full md:w-1/2 p-8 md:px-12 md:py-8 flex flex-col justify-center bg-bright-cream relative z-10">
          {/* Brand Logo */}
          <div className="mb-3 text-center md:text-left">
            <h1 className="font-title text-2xl font-bold text-primary tracking-tight">
              Mộc Bản
            </h1>
          </div>

          <div className="mb-6">
            <h2 className="font-title text-[28px] font-semibold text-primary mb-1">
              Xác thực email
            </h2>
            <p className="font-body text-base text-on-surface-variant">
              {emailFromState ? (
                <>
                  Mã OTP đã được gửi đến{' '}
                  <span className="font-semibold text-primary">
                    {emailFromState}
                  </span>
                  . Vui lòng kiểm tra hộp thư (kể cả thư mục Spam).
                </>
              ) : (
                'Nhập email và mã OTP đã được gửi đến hộp thư của bạn.'
              )}
            </p>
          </div>

          {/* Banner xác thực thành công — dùng hex tương tự RegisterPage, không dùng green-* */}
          {isVerifySuccess && (
            <div className="mb-5 px-4 py-3 rounded-xl bg-[#f0fdf4] border border-[#86efac]">
              <p className="text-sm text-[#15803d] font-medium mb-1">
                Xác thực thành công! Tài khoản của bạn đã được kích hoạt.
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
            {/* Thông báo lỗi từ server khi xác thực OTP */}
            {verifyErrorMessage && (
              <div className="px-4 py-3 rounded-xl bg-[#ab3429]/10 border border-[#ab3429]/30">
                <p className="text-sm text-[#ab3429] font-medium">
                  {verifyErrorMessage}
                </p>
              </div>
            )}

            {/* Ô Email: readonly nếu có email từ state, cho nhập nếu vào trực tiếp */}
            <div>
              <label
                className="block font-body text-[15px] font-semibold tracking-wide text-primary mb-2"
                htmlFor="otp-email"
              >
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                  <Mail size={20} />
                </span>
                <input
                  className={`w-full pl-10 pr-4 py-3 bg-surface border ${errors.email ? 'border-[#ab3429]' : 'border-outline-variant'} rounded-xl focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors font-body text-base text-on-surface placeholder:text-outline-variant ${emailFromState ? 'bg-surface-container text-on-surface-variant cursor-default' : ''}`}
                  id="otp-email"
                  placeholder="email@domain.com"
                  type="email"
                  // Nếu có email từ state (điều hướng từ Register), đặt readonly để giữ giá trị
                  // react-hook-form vẫn đọc được giá trị readOnly (khác với disabled)
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
                htmlFor="otp-code"
              >
                Mã OTP
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                  <KeyRound size={20} />
                </span>
                <input
                  className={`w-full pl-10 pr-4 py-3 bg-surface border ${errors.otp ? 'border-[#ab3429]' : 'border-outline-variant'} rounded-xl focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors font-body text-base text-on-surface placeholder:text-outline-variant tracking-[0.3em]`}
                  id="otp-code"
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

            {/* Nút xác nhận — disable khi đang pending hoặc đã xác thực thành công */}
            <button
              className="w-full py-3 px-4 bg-gradient-to-r from-secondary to-secondary-container text-on-secondary font-body text-[15px] font-semibold tracking-wide rounded-xl hover:shadow-[0_8px_16px_rgba(171,52,41,0.2)] hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
              type="submit"
              disabled={isVerifyPending || isVerifySuccess}
            >
              <span>{isVerifyPending ? 'Đang xác thực...' : 'Xác nhận'}</span>
              <ArrowRight size={20} />
            </button>
          </form>

          {/* Khu vực gửi lại OTP với countdown */}
          <div className="mt-5 pt-5 border-t border-outline-variant/30">
            {/* Thông báo kết quả gửi lại OTP — thành công hoặc lỗi */}
            {resendSuccessMessage && (
              <p className="mb-2 text-xs text-[#15803d] font-medium text-center">
                {resendSuccessMessage}
              </p>
            )}
            {resendErrorMessage && (
              <p className="mb-2 text-xs text-[#ab3429] font-medium text-center">
                {resendErrorMessage}
              </p>
            )}

            <div className="flex items-center justify-center gap-2">
              <p className="font-body text-base text-on-surface-variant">
                Không nhận được mã?
              </p>
              <button
                type="button"
                className="font-body text-[15px] font-semibold text-secondary hover:underline decoration-secondary/30 transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline"
                disabled={countdown > 0 || isResendPending || isVerifySuccess}
                onClick={handleResend}
              >
                <RotateCcw size={14} />
                {isResendPending
                  ? 'Đang gửi...'
                  : countdown > 0
                    ? `Gửi lại (${countdown}s)`
                    : 'Gửi lại mã'}
              </button>
            </div>
          </div>

          {/* Link quay về đăng nhập */}
          <div className="mt-4 text-center">
            <Link
              to="/dang-nhap"
              className="font-body text-[13px] text-on-surface-variant hover:text-primary transition-colors underline decoration-outline-variant underline-offset-4"
            >
              Quay về đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
