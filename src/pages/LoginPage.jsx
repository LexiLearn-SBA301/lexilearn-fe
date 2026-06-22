import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { loginSchema, defaultLoginValues } from '../schemas/auth.schema'

export const LoginPage = () => {
  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: defaultLoginValues,
    mode: 'onChange', // Validate realtime (gõ tới đâu bắt lỗi tới đó)
  })

  const onSubmit = (data) => {
    // TODO: wire to auth API khi backend đăng nhập sẵn sàng
    console.log('Login submit:', data)
  }

  return (
    <main className="paper-texture flex items-center justify-center p-6 md:px-20 md:py-6 relative z-10 min-h-[calc(100svh-5rem)]">
      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-bright-cream rounded-3xl overflow-hidden ink-shadow border border-earth-beige relative">
        {/* Left Side: Artistic Illustration */}
        <div className="hidden md:block md:w-1/2 relative bg-surface-variant overflow-hidden group">
          <img
            alt="Artistic interpretation of Vietnamese literature heritage"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 opacity-90 mix-blend-multiply"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBRLinyX-5GTzrLreKW1AnFqyyYj9gSxXho4VQqv1VQneW891fTHxaDIigQc3TyqkD7wYKsjU8bhUWYDPz1CmGhO8wZ789DIvq_FKqQp6PT8ZFwyuB4uTJpskT716G6tqi4MNCRaUUyIa1Hr1sj4d-GVCcPpJJw1JNvDBoyoJV_wjLSmjWXDWkUjMTyXqH3xDoNDR6l7l4Ejg4hps_5Hr6iZIgq2njDR-HpyTVk9oXXMEJv7RxeamL8aTeI1zDCzpcgoZEPvNJmGTpp"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent"></div>
          <div className="absolute bottom-12 left-12 right-12 text-on-primary">
            <h2 className="font-title text-[44px] leading-tight font-bold mb-4 text-bright-cream">
              Hồn Việt Trong Từng Nét Chữ
            </h2>
            <p className="font-quote text-xl leading-relaxed text-surface-container opacity-90">
              Khám phá di sản văn học ngàn năm tuổi qua lăng kính của trí tuệ
              nhân tạo hiện đại.
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="w-full md:w-1/2 p-8 sm:px-10 sm:py-8 lg:px-12 lg:py-8 flex flex-col justify-center relative bg-bright-cream z-10">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-6 text-center md:text-left">
              <h1 className="font-title text-[32px] font-semibold text-primary mb-2">
                Đăng nhập
              </h1>
              <p className="font-body text-base text-on-surface-variant">
                Chào mừng bạn trở lại với Mộc Bản.
              </p>
            </div>

            <form
              className="space-y-5"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
            >
              {/* Email/Username */}
              <div>
                <label
                  className="block font-body text-[15px] font-semibold tracking-wide text-primary mb-2"
                  htmlFor="email"
                >
                  Email hoặc Tên đăng nhập
                </label>
                <div className="relative">
                  <Mail
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                  />
                  <input
                    className={`w-full pl-10 pr-4 py-3 bg-surface border ${errors.email ? 'border-[#ab3429]' : 'border-outline-variant'} rounded-xl focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors font-body text-base text-on-surface placeholder:text-outline-variant`}
                    id="email"
                    placeholder="ví dụ: nguyenvan@gmail.com"
                    type="text"
                    {...register('email')}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-[#ab3429] font-medium">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label
                    className="block font-body text-[15px] font-semibold tracking-wide text-primary"
                    htmlFor="password"
                  >
                    Mật khẩu
                  </label>
                  <a
                    className="font-body text-[13px] text-secondary hover:underline decoration-secondary/30 transition-all"
                    href="#"
                  >
                    Quên mật khẩu?
                  </a>
                </div>
                <div className="relative">
                  <Lock
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
                  />
                  <input
                    className={`w-full pl-10 pr-12 py-3 bg-surface border ${errors.password ? 'border-[#ab3429]' : 'border-outline-variant'} rounded-xl focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors font-body text-base text-on-surface placeholder:text-outline-variant`}
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                  />
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors focus:outline-none"
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                  >
                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-[#ab3429] font-medium">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center">
                <input
                  className="h-4 w-4 rounded border-outline-variant text-secondary focus:ring-secondary/30 bg-surface transition-colors cursor-pointer"
                  id="remember-me"
                  type="checkbox"
                  {...register('rememberMe')}
                />
                <label
                  className="ml-2 block font-body text-base text-on-surface-variant cursor-pointer"
                  htmlFor="remember-me"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>

              {/* Submit Button */}
              <button
                className="w-full py-3 px-4 bg-gradient-to-r from-secondary to-secondary-container text-on-secondary font-body text-[15px] font-semibold tracking-wide rounded-xl hover:shadow-[0_8px_16px_rgba(171,52,41,0.2)] hover:-translate-y-0.5 transition-all duration-200 flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:translate-y-0"
                type="submit"
                disabled={isSubmitting}
              >
                <span>Đăng nhập</span>
                <ArrowRight size={20} />
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center">
              <p className="font-body text-base text-on-surface-variant">
                Chưa có tài khoản?
                <Link
                  className="font-body text-[15px] font-semibold tracking-wide text-secondary hover:underline decoration-secondary/30 transition-all ml-1"
                  to="/dang-ky"
                >
                  Đăng ký tài khoản mới
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
