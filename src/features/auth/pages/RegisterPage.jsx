import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { User, Mail, KeyRound, ArrowRight } from 'lucide-react'
import { registerSchema, defaultRegisterValues } from '../schemas/auth.schema'
import { useRegister } from '../hooks/useAuth'
import { AuthLayout } from '../components/AuthLayout'
import { AuthMessageBanner } from '../components/AuthMessageBanner'
import { PasswordField } from '../components/PasswordField'

const ILLUSTRATION = {
  bgClassName: 'bg-surface-container-low',
  hoverEffect: false,
  imageSrc:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDNnPQVQEe-X6IHugtccLJqRKw0Nv_nPbavimDHzTG9Di6Mnfyu12zK2FeRiDOM-Awf2k9a0rDYYnd28SYekZDWYK1Syz5Rw7zeD-JqmFnl-MCKx74JD8mXSeNoqesrOAs6mEasawy2FWsSvvweG7X2wlnc-ynrt0chnisJuJ_ukVw8-iWcd2ETJA7hnjixHQOp5fdynAfrXh9CwlkEm9V3RECMgfMsxae_h08ykqdH6idQXmvAIy_8Lq8kCWnjBG66SzHrueG-5jqw',
  imageAlt: 'Literary illustration',
  gradientClassName:
    'bg-gradient-to-t from-primary/80 via-primary/20 to-transparent',
  title: 'Hành trình tri thức',
  description:
    'Bắt đầu khám phá di sản văn học nghìn năm với không gian lưu trữ số hóa hiện đại, trang nhã và có chiều sâu.',
  showDecorativeCorners: true,
}

export const RegisterPage = () => {
  const navigate = useNavigate()

  // Hook mutation đăng ký — isPending/isError/error dùng để điều khiển UI
  // onSuccess được truyền per-call (trong onSubmit) để capture email từ form closure
  const { mutate: registerUser, isPending, isError, error } = useRegister()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: defaultRegisterValues,
    mode: 'onChange', // Validate realtime (gõ tới đâu bắt lỗi tới đó)
  })

  const onSubmit = (data) => {
    // BE RegisterRequest nhận { fullName, email, password }
    // confirmPassword chỉ dùng để validate phía client, không gửi lên BE
    registerUser(
      { fullName: data.fullName, email: data.email, password: data.password },
      {
        // Truyền email qua location.state vì API response không chứa email (ApiResponse<Void>)
        // VerifyOtpPage sẽ đọc email từ state để prefill và hiển thị hướng dẫn
        onSuccess: () =>
          navigate('/xac-thuc-otp', { state: { email: data.email } }),
      },
    )
  }

  // Lấy message lỗi từ BE (ApiResponse.message) hoặc fallback nếu không có response
  const serverErrorMessage = isError
    ? (error?.response?.data?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.')
    : null

  return (
    <AuthLayout
      mainClassName="bg-pattern-dots flex items-center justify-center p-4 md:px-8 md:py-4 min-h-[calc(100svh-5rem)]"
      illustration={ILLUSTRATION}
      rightPanelClassName="w-full md:w-1/2 p-8 md:px-12 md:py-6 flex flex-col justify-center bg-bright-cream relative z-10"
      wrapContent={false}
    >
      {/* Tiêu đề — không lặp lại logo "Mộc Bản" vì header phía trên đã hiển thị */}
      <div className="mb-3 text-center md:text-left">
        <h2 className="font-title text-2xl font-semibold text-primary mb-1">
          Tạo tài khoản mới
        </h2>
        <p className="font-body text-sm text-on-surface-variant">
          Vui lòng điền thông tin bên dưới để đăng ký.
        </p>
      </div>

      <form className="space-y-2" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Thông báo lỗi từ server (BE) — luôn render (giữ chỗ cố định)
            và chỉ ẩn bằng `invisible` khi không có lỗi, để tránh làm
            co giãn/đổi vị trí card khi banner xuất hiện/biến mất */}
        <AuthMessageBanner variant="error" message={serverErrorMessage} />

        {/* Họ và tên */}
        <div>
          <label
            className="block font-body text-[15px] font-semibold tracking-wide text-primary mb-1"
            htmlFor="fullname"
          >
            Họ và tên
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <User size={20} />
            </span>
            <input
              className={`w-full pl-10 pr-4 py-2 bg-surface-container-lowest border ${errors.fullName ? 'border-[#ab3429]' : 'border-outline-variant'} rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all placeholder:text-outline-variant font-body text-base`}
              id="fullname"
              placeholder="Nguyễn Văn A"
              type="text"
              {...register('fullName')}
            />
          </div>
          {/* Luôn render slot lỗi với min-height cố định để không làm co giãn
              chiều cao form khi lỗi xuất hiện/biến mất (tránh layout shift) */}
          <p
            className={`mt-1 min-h-[18px] text-xs font-medium ${
              errors.fullName ? 'text-[#ab3429]' : 'invisible'
            }`}
          >
            {errors.fullName?.message || ' '}
          </p>
        </div>

        {/* Email */}
        <div>
          <label
            className="block font-body text-[15px] font-semibold tracking-wide text-primary mb-1"
            htmlFor="email"
          >
            Email
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <Mail size={20} />
            </span>
            <input
              className={`w-full pl-10 pr-4 py-2 bg-surface-container-lowest border ${errors.email ? 'border-[#ab3429]' : 'border-outline-variant'} rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all placeholder:text-outline-variant font-body text-base`}
              id="email"
              placeholder="email@domain.com"
              type="email"
              {...register('email')}
            />
          </div>
          <p
            className={`mt-1 min-h-[18px] text-xs font-medium ${
              errors.email ? 'text-[#ab3429]' : 'invisible'
            }`}
          >
            {errors.email?.message || ' '}
          </p>
        </div>

        {/* Mật khẩu */}
        <PasswordField
          id="password"
          label="Mật khẩu"
          registration={register('password')}
          error={errors.password?.message}
          variant="compact"
          toggleAriaLabel="Hiện hoặc ẩn mật khẩu"
        />

        {/* Xác nhận mật khẩu */}
        <div>
          <label
            className="block font-body text-[15px] font-semibold tracking-wide text-primary mb-1"
            htmlFor="confirm_password"
          >
            Xác nhận mật khẩu
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
              <KeyRound size={20} />
            </span>
            <input
              className={`w-full pl-10 pr-4 py-2 bg-surface-container-lowest border ${errors.confirmPassword ? 'border-[#ab3429]' : 'border-outline-variant'} rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all placeholder:text-outline-variant font-body text-base`}
              id="confirm_password"
              placeholder="••••••••"
              type="password"
              {...register('confirmPassword')}
            />
          </div>
          <p
            className={`mt-1 min-h-[18px] text-xs font-medium ${
              errors.confirmPassword ? 'text-[#ab3429]' : 'invisible'
            }`}
          >
            {errors.confirmPassword?.message || ' '}
          </p>
        </div>

        {/* Submit Button — disable khi mutation đang chờ response */}
        <button
          className="w-full mt-2 py-2.5 px-4 bg-gradient-to-r from-secondary to-secondary-container text-white font-body text-[15px] font-semibold tracking-wide rounded-lg shadow-[0_4px_14px_rgba(171,52,41,0.25)] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
          type="submit"
          disabled={isPending}
        >
          {isPending ? 'Đang đăng ký...' : 'Đăng ký'}
          <ArrowRight size={18} />
        </button>
      </form>

      {/* Login Link */}
      <div className="mt-3 text-center border-t border-outline-variant/30 pt-3">
        <p className="font-body text-sm text-on-surface-variant">
          Đã có tài khoản?
          <Link
            className="font-body text-[15px] font-semibold tracking-wide text-secondary hover:text-on-secondary-container transition-colors ml-1 underline decoration-secondary/30 underline-offset-4"
            to="/dang-nhap"
          >
            Đăng nhập ngay
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
