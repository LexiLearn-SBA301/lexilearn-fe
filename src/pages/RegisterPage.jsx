import { useState } from 'react'
import {
  User,
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react'

export const RegisterPage = () => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <main className="bg-pattern-dots flex items-center justify-center p-4 md:p-8 min-h-[calc(100svh-5rem)]">
      <div className="max-w-6xl w-full bg-bright-cream rounded-3xl ink-shadow overflow-hidden flex flex-col md:flex-row border border-earth-beige relative">
        {/* Left Side: Illustration Panel */}
        <div className="hidden md:block md:w-1/2 relative bg-surface-container-low overflow-hidden">
          <div className="absolute inset-0 w-full h-full">
            <img
              alt="Literary illustration"
              className="w-full h-full object-cover opacity-90"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDNnPQVQEe-X6IHugtccLJqRKw0Nv_nPbavimDHzTG9Di6Mnfyu12zK2FeRiDOM-Awf2k9a0rDYYnd28SYekZDWYK1Syz5Rw7zeD-JqmFnl-MCKx74JD8mXSeNoqesrOAs6mEasawy2FWsSvvweG7X2wlnc-ynrt0chnisJuJ_ukVw8-iWcd2ETJA7hnjixHQOp5fdynAfrXh9CwlkEm9V3RECMgfMsxae_h08ykqdH6idQXmvAIy_8Lq8kCWnjBG66SzHrueG-5jqw"
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent"></div>
          </div>
          <div className="absolute bottom-12 left-12 right-12 z-10 text-on-primary">
            <h2 className="font-title text-[44px] leading-tight font-bold mb-4 text-bright-cream">
              Hành trình tri thức
            </h2>
            <p className="font-quote text-xl leading-relaxed text-surface-container opacity-90">
              Bắt đầu khám phá di sản văn học nghìn năm với không gian lưu trữ
              số hóa hiện đại, trang nhã và có chiều sâu.
            </p>
          </div>
          {/* Decorative element */}
          <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-surface-container/30"></div>
          <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-surface-container/30"></div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="w-full md:w-1/2 p-8 md:px-12 md:py-8 flex flex-col justify-center bg-bright-cream relative z-10">
          {/* Brand Logo */}
          <div className="mb-6 text-center md:text-left">
            <h1 className="font-title text-2xl font-bold text-primary tracking-tight">
              Thư Hiên
            </h1>
          </div>

          <div className="mb-6">
            <h2 className="font-title text-[32px] font-semibold text-primary mb-2">
              Tạo tài khoản mới
            </h2>
            <p className="font-body text-base text-on-surface-variant">
              Vui lòng điền thông tin bên dưới để đăng ký.
            </p>
          </div>

          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
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
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all placeholder:text-outline-variant font-body text-base"
                  id="fullname"
                  placeholder="Nguyễn Văn A"
                  type="text"
                />
              </div>
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
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all placeholder:text-outline-variant font-body text-base"
                  id="email"
                  placeholder="email@domain.com"
                  type="email"
                />
              </div>
            </div>

            {/* Mật khẩu */}
            <div>
              <label
                className="block font-body text-[15px] font-semibold tracking-wide text-primary mb-1"
                htmlFor="password"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                  <Lock size={20} />
                </span>
                <input
                  className="w-full pl-10 pr-12 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all placeholder:text-outline-variant font-body text-base"
                  id="password"
                  placeholder="••••••••"
                  type={showPassword ? 'text' : 'password'}
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-primary transition-colors"
                  type="button"
                  aria-label="Hiện hoặc ẩn mật khẩu"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>
            </div>

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
                  className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all placeholder:text-outline-variant font-body text-base"
                  id="confirm_password"
                  placeholder="••••••••"
                  type="password"
                />
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start mt-2">
              <div className="flex items-center h-5">
                <input
                  className="w-4 h-4 text-secondary bg-surface-container-lowest border-outline-variant rounded focus:ring-secondary focus:ring-2"
                  id="terms"
                  type="checkbox"
                />
              </div>
              <div className="ml-3">
                <label
                  className="font-body text-base text-on-surface-variant"
                  htmlFor="terms"
                >
                  Tôi đồng ý với{' '}
                  <a
                    className="text-secondary hover:underline font-medium"
                    href="#"
                  >
                    Điều khoản
                  </a>{' '}
                  và{' '}
                  <a
                    className="text-secondary hover:underline font-medium"
                    href="#"
                  >
                    Chính sách
                  </a>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-secondary to-secondary-container text-white font-body text-[15px] font-semibold tracking-wide rounded-lg shadow-[0_4px_14px_rgba(171,52,41,0.25)] hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300 flex justify-center items-center gap-2"
              type="submit"
            >
              Đăng ký
              <ArrowRight size={18} />
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center border-t border-outline-variant/30 pt-6">
            <p className="font-body text-base text-on-surface-variant">
              Đã có tài khoản?
              <a
                className="font-body text-[15px] font-semibold tracking-wide text-secondary hover:text-on-secondary-container transition-colors ml-1 underline decoration-secondary/30 underline-offset-4"
                href="#"
              >
                Đăng nhập ngay
              </a>
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
