/**
 * Banner thông báo lỗi/thành công dùng chung cho các trang auth.
 *
 * - variant="error": nền/đỏ (#ab3429) — dùng khi hiển thị lỗi từ server.
 * - variant="success": nền/xanh lá (#15803d) — dùng khi thao tác thành công.
 *
 * reserveSpace (mặc định true): luôn render banner và chỉ ẩn bằng class
 * `invisible` khi không có message, để tránh co giãn/đổi vị trí layout khi
 * banner xuất hiện/biến mất (pattern đang dùng ở Login/Forgot/Register).
 * Với các banner chỉ xuất hiện tạm thời (vd. thông báo thành công trước khi
 * điều hướng ở VerifyOtp/ResetPassword) truyền reserveSpace={false} để giữ
 * đúng hành vi conditional-render như trước.
 */
export const AuthMessageBanner = ({
  variant = 'error',
  message,
  reserveSpace = true,
  className = '',
  children,
}) => {
  if (!reserveSpace && !message) return null

  const isSuccess = variant === 'success'
  const wrapperClassName = isSuccess
    ? 'bg-[#f0fdf4] border border-[#86efac]'
    : 'bg-[#ab3429]/10 border border-[#ab3429]/30'
  const textClassName = isSuccess ? 'text-[#15803d]' : 'text-[#ab3429]'

  return (
    <div
      className={`px-4 py-3 rounded-xl ${wrapperClassName} ${
        message ? '' : 'invisible'
      } ${className}`}
    >
      <p
        className={`text-sm font-medium ${textClassName}${
          children ? ' mb-1' : ''
        }`}
      >
        {message || ' '}
      </p>
      {children}
    </div>
  )
}
