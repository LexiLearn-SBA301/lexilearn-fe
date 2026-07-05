import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, ArrowRight } from 'lucide-react'
import {
  forgotPasswordSchema,
  defaultForgotPasswordValues,
} from '../schemas/auth.schema'
import { useForgotPassword } from '../hooks/useAuth'
import { AuthLayout } from '../components/AuthLayout'
import { AuthMessageBanner } from '../components/AuthMessageBanner'

const ILLUSTRATION = {
  imageSrc:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuBRLinyX-5GTzrLreKW1AnFqyyYj9gSxXho4VQqv1VQneW891fTHxaDIigQc3TyqkD7wYKsjU8bhUWYDPz1CmGhO8wZ789DIvq_FKqQp6PT8ZFwyuB4uTJpskT716G6tqi4MNCRaUUyIa1Hr1sj4d-GVCcPpJJw1JNvDBoyoJV_wjLSmjWXDWkUjMTyXqH3xDoNDR6l7l4Ejg4hps_5Hr6iZIgq2njDR-HpyTVk9oXXMEJv7RxeamL8aTeI1zDCzpcgoZEPvNJmGTpp',
  imageAlt: 'Artistic interpretation of Vietnamese literature heritage',
  title: 'Khôi phục tài khoản',
  description:
    'Đừng lo — chúng tôi sẽ giúp bạn lấy lại quyền truy cập vào kho tàng văn học của mình.',
}

export const ForgotPasswordPage = () => {
  const navigate = useNavigate()

  // Hook mutation quên mật khẩu — isPending/isError/error dùng để điều khiển UI
  // onSuccess truyền per-call để capture email từ form closure (API không trả email)
  const {
    mutate: forgotPassword,
    isPending,
    isError,
    error,
  } = useForgotPassword()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: defaultForgotPasswordValues,
    mode: 'onChange', // Validate realtime (gõ tới đâu bắt lỗi tới đó)
  })

  const onSubmit = (data) => {
    forgotPassword(
      { email: data.email },
      {
        // BE luôn trả 200 dù email có tồn tại hay không — cứ điều hướng sang bước nhập OTP
        // Truyền email qua location.state vì response không chứa email (ApiResponse<Void>)
        onSuccess: (responseData) => {
          navigate('/dat-lai-mat-khau', {
            state: {
              email: data.email,
              // Truyền message từ BE sang trang reset để hiển thị hướng dẫn nếu cần
              message: responseData?.message,
            },
          })
        },
      },
    )
  }

  // Lấy message lỗi từ BE hoặc fallback — thực tế ít khi có vì BE luôn trả 200
  const serverErrorMessage = isError
    ? (error?.response?.data?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.')
    : null

  return (
    <AuthLayout illustration={ILLUSTRATION}>
      <div className="mb-6 text-center md:text-left">
        <h1 className="font-title text-[32px] font-semibold text-primary mb-2">
          Quên mật khẩu
        </h1>
        <p className="font-body text-base text-on-surface-variant">
          Nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
        </p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Thông báo lỗi từ server — luôn render (giữ chỗ cố định) và
            chỉ ẩn bằng `invisible` khi không có lỗi, để tránh làm
            co giãn/đổi vị trí card khi banner xuất hiện/biến mất */}
        <AuthMessageBanner variant="error" message={serverErrorMessage} />

        {/* Ô Email */}
        <div>
          <label
            className="block font-body text-[15px] font-semibold tracking-wide text-primary mb-2"
            htmlFor="forgot-email"
          >
            Email đã đăng ký
          </label>
          <div className="relative">
            <Mail
              size={20}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
            />
            <input
              className={`w-full pl-10 pr-4 py-3 bg-surface border ${errors.email ? 'border-[#ab3429]' : 'border-outline-variant'} rounded-xl focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors font-body text-base text-on-surface placeholder:text-outline-variant`}
              id="forgot-email"
              placeholder="ví dụ: nguyenvan@gmail.com"
              type="email"
              {...register('email')}
            />
          </div>
          {/* Luôn render slot lỗi với min-height cố định để không làm co giãn
              chiều cao form khi lỗi xuất hiện/biến mất (tránh layout shift) */}
          <p
            className={`mt-1.5 min-h-[18px] text-xs font-medium ${
              errors.email ? 'text-[#ab3429]' : 'invisible'
            }`}
          >
            {errors.email?.message || ' '}
          </p>
        </div>

        {/* Nút gửi — disable khi đang pending */}
        <button
          className="w-full py-3 px-4 bg-gradient-to-r from-secondary to-secondary-container text-on-secondary font-body text-[15px] font-semibold tracking-wide rounded-xl hover:shadow-[0_8px_16px_rgba(171,52,41,0.2)] hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
          type="submit"
          disabled={isPending}
        >
          <span>{isPending ? 'Đang gửi...' : 'Gửi mã đặt lại'}</span>
          <ArrowRight size={20} />
        </button>
      </form>

      {/* Link quay về đăng nhập */}
      <div className="mt-6 text-center">
        <p className="font-body text-base text-on-surface-variant">
          Nhớ mật khẩu rồi?
          <Link
            className="font-body text-[15px] font-semibold tracking-wide text-secondary hover:underline decoration-secondary/30 transition-all ml-1"
            to="/dang-nhap"
          >
            Quay về đăng nhập
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}
