import { useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { KeyRound, Mail, ArrowRight } from 'lucide-react'
import {
  resetPasswordSchema,
  defaultResetPasswordValues,
} from '../schemas/auth.schema'
import { useResetPassword } from '../hooks/useAuth'
import { AuthLayout } from '../components/AuthLayout'
import { AuthMessageBanner } from '../components/AuthMessageBanner'
import { PasswordField } from '../components/PasswordField'

const ILLUSTRATION = {
  imageSrc:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBRLinyX-5GTzrLreKW1AnFqyyYj9gSxXho4VQqv1VQneW891fTHxaDIigQc3TyqkD7wYKsjU8bhUWYDPz1CmGhO8wZ789DIvq_FKqQp6PT8ZFwyuB4uTJpskT716G6tqi4MNCRaUUyIa1Hr1sj4d-GVCcPpJJw1JNvDBoyoJV_wjLSmjWXDWkUjMTyXqH3xDoNDR6l7l4Ejg4hps_5Hr6iZIgq2njDR-HpyTVk9oXXMEJv7RxeamL8aTeI1zDCzpcgoZEPvNJmGTpp',
  imageAlt: 'Artistic interpretation of Vietnamese literature heritage',
  title: 'Tạo mật khẩu mới',
  description:
    'Chọn một mật khẩu mạnh để bảo vệ hành trình khám phá văn học của bạn.',
}

export const ResetPasswordPage = () => {
  const location = useLocation()
  const navigate = useNavigate()

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
    <AuthLayout illustration={ILLUSTRATION}>
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
        <AuthMessageBanner
          variant="success"
          reserveSpace={false}
          className="mb-5"
          message="Đặt lại mật khẩu thành công!"
        >
          <p className="text-xs text-[#15803d]">
            Đang chuyển sang trang đăng nhập...{' '}
            <Link
              to="/dang-nhap"
              className="font-semibold underline decoration-[#15803d]/30"
            >
              Nhấn đây nếu không tự chuyển
            </Link>
          </p>
        </AuthMessageBanner>
      )}

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Thông báo lỗi từ server (BE) */}
        <AuthMessageBanner
          variant="error"
          reserveSpace={false}
          message={serverErrorMessage}
        />

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
        <PasswordField
          id="new-password"
          label="Mật khẩu mới"
          registration={register('newPassword')}
          error={errors.newPassword?.message}
          errorDisplay="inline"
          toggleAriaLabel="Hiện hoặc ẩn mật khẩu mới"
          hint="Tối thiểu 8 ký tự, gồm chữ hoa, chữ thường và số."
        />

        {/* Ô Xác nhận mật khẩu mới */}
        <PasswordField
          id="confirm-new-password"
          label="Xác nhận mật khẩu mới"
          registration={register('confirmPassword')}
          error={errors.confirmPassword?.message}
          errorDisplay="inline"
          toggleAriaLabel="Hiện hoặc ẩn xác nhận mật khẩu"
        />

        {/* Nút đặt lại — disable khi đang pending hoặc đã thành công */}
        <button
          className="w-full py-3 px-4 bg-gradient-to-r from-secondary to-secondary-container text-on-secondary font-body text-[15px] font-semibold tracking-wide rounded-xl hover:shadow-[0_8px_16px_rgba(171,52,41,0.2)] hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
          type="submit"
          disabled={isPending || isSuccess}
        >
          <span>{isPending ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}</span>
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
    </AuthLayout>
  )
}
