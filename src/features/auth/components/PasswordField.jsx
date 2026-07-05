import { useState } from 'react'
import { Eye, EyeOff, Lock } from 'lucide-react'

/**
 * Ô nhập mật khẩu dùng chung (Login/Register/ResetPassword) — tự quản lý
 * state ẩn/hiện mật khẩu và tương thích với react-hook-form (spread
 * `registration` là kết quả của `register('...')`).
 *
 * variant:
 *  - 'card' (mặc định): style dùng ở LoginPage/ResetPasswordPage
 *    (bg-surface, rounded-xl, py-3, icon đặt trực tiếp).
 *  - 'compact': style dùng ở RegisterPage
 *    (bg-surface-container-lowest, rounded-lg, py-2, icon bọc trong span).
 *
 * errorDisplay:
 *  - 'reserved' (mặc định): luôn render slot lỗi với min-height cố định,
 *    dùng class `invisible` khi không có lỗi (tránh layout shift) — dùng ở
 *    LoginPage/RegisterPage.
 *  - 'inline': chỉ render dòng lỗi khi có lỗi — dùng ở ResetPasswordPage.
 */
export const PasswordField = ({
  id,
  label,
  registration,
  error,
  placeholder = '••••••••',
  toggleAriaLabel,
  variant = 'card',
  errorDisplay = 'reserved',
  hint,
  headerRight,
}) => {
  const [showPassword, setShowPassword] = useState(false)
  const isCompact = variant === 'compact'
  const borderClassName = error ? 'border-[#ab3429]' : 'border-outline-variant'

  const labelBaseClassName =
    'block font-body text-[15px] font-semibold tracking-wide text-primary'
  const labelMargin = isCompact ? 'mb-1' : 'mb-2'

  const inputClassName = isCompact
    ? `w-full pl-10 pr-12 py-2 bg-surface-container-lowest border ${borderClassName} rounded-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-all placeholder:text-outline-variant font-body text-base`
    : `w-full pl-10 pr-12 py-3 bg-surface border ${borderClassName} rounded-xl focus:ring-2 focus:ring-secondary/30 focus:border-secondary transition-colors font-body text-base text-on-surface placeholder:text-outline-variant`

  const toggleClassName = isCompact
    ? 'absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-primary transition-colors'
    : 'absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-primary transition-colors focus:outline-none'

  const reservedMargin = isCompact ? 'mt-1' : 'mt-1.5'
  const inlineMargin = hint ? 'mt-1' : 'mt-1.5'

  const errorClassName =
    errorDisplay === 'reserved'
      ? `${reservedMargin} min-h-[18px] text-xs font-medium ${
          error ? 'text-[#ab3429]' : 'invisible'
        }`
      : `${inlineMargin} text-xs text-[#ab3429] font-medium`

  return (
    <div>
      {label && !headerRight && (
        <label className={`${labelBaseClassName} ${labelMargin}`} htmlFor={id}>
          {label}
        </label>
      )}
      {label && headerRight && (
        <div className="flex justify-between items-center mb-2">
          <label className={labelBaseClassName} htmlFor={id}>
            {label}
          </label>
          {headerRight}
        </div>
      )}

      <div className="relative">
        {isCompact ? (
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
            <Lock size={20} />
          </span>
        ) : (
          <Lock
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
          />
        )}
        <input
          className={inputClassName}
          id={id}
          placeholder={placeholder}
          type={showPassword ? 'text' : 'password'}
          {...registration}
        />
        <button
          className={toggleClassName}
          type="button"
          aria-label={toggleAriaLabel}
          onClick={() => setShowPassword((v) => !v)}
        >
          {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
        </button>
      </div>

      {hint && <p className="mt-1.5 text-xs text-on-surface-variant">{hint}</p>}

      {errorDisplay === 'reserved' ? (
        <p className={errorClassName}>{error || ' '}</p>
      ) : (
        error && <p className={errorClassName}>{error}</p>
      )}
    </div>
  )
}
