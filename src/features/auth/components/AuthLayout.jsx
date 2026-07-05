/**
 * Khung layout 2 cột dùng chung cho các trang auth (Login/Register/VerifyOtp/
 * ForgotPassword/ResetPassword): ảnh minh hoạ bên trái + form bên phải.
 *
 * Mỗi trang có vài khác biệt nhỏ về style (main wrapper, padding cột phải,
 * ảnh minh hoạ...) nên các phần đó được truyền vào qua props để giữ nguyên
 * pixel-perfect như trước khi refactor.
 */
const AuthIllustration = ({
  bgClassName = 'bg-surface-variant',
  hoverEffect = true,
  imageSrc,
  imageAlt,
  gradientClassName = 'bg-gradient-to-t from-primary/80 to-transparent',
  title,
  description,
  showDecorativeCorners = false,
}) => (
  <div
    className={`hidden md:block md:w-1/2 relative ${bgClassName} overflow-hidden ${
      hoverEffect ? 'group' : ''
    }`}
  >
    <img
      alt={imageAlt}
      className={`absolute inset-0 w-full h-full object-cover opacity-90 ${
        hoverEffect
          ? 'transition-transform duration-1000 group-hover:scale-105 mix-blend-multiply'
          : ''
      }`}
      src={imageSrc}
    />
    <div className={`absolute inset-0 ${gradientClassName}`}></div>
    <div className="absolute bottom-12 left-12 right-12 z-10 text-on-primary">
      <h2 className="font-title text-[44px] leading-tight font-bold mb-4 text-bright-cream">
        {title}
      </h2>
      <p className="font-quote text-xl leading-relaxed text-surface-container opacity-90">
        {description}
      </p>
    </div>
    {showDecorativeCorners && (
      <>
        <div className="absolute top-8 left-8 w-16 h-16 border-t-2 border-l-2 border-surface-container/30"></div>
        <div className="absolute bottom-8 right-8 w-16 h-16 border-b-2 border-r-2 border-surface-container/30"></div>
      </>
    )}
  </div>
)

export const AuthLayout = ({
  mainClassName = 'paper-texture flex items-center justify-center p-6 md:px-20 md:py-6 relative z-10 min-h-[calc(100svh-5rem)]',
  illustration,
  rightPanelClassName = 'w-full md:w-1/2 p-8 sm:px-10 sm:py-8 lg:px-12 lg:py-8 flex flex-col justify-center relative bg-bright-cream z-10',
  wrapContent = true,
  children,
}) => {
  return (
    <main className={mainClassName}>
      <div className="w-full max-w-6xl flex flex-col md:flex-row bg-bright-cream rounded-3xl overflow-hidden ink-shadow border border-earth-beige relative">
        <AuthIllustration {...illustration} />

        <div className={rightPanelClassName}>
          {wrapContent ? (
            <div className="max-w-md w-full mx-auto">{children}</div>
          ) : (
            children
          )}
        </div>
      </div>
    </main>
  )
}
