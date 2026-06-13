export const Footer = () => {
  return (
    <footer className="w-full mt-auto bg-[#f4ede1] border-t border-outline-variant/30 relative overflow-hidden font-body">
      <div className="absolute inset-0 opacity-5 watermark-pattern pointer-events-none"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-6 py-12 max-w-7xl mx-auto relative z-10">
        <div className="col-span-1 flex flex-col gap-4">
          <span className="font-title text-3xl font-bold text-secondary">
            Mộc Bản{' '}
          </span>
          <p className="text-on-surface-variant font-medium text-sm">
            Di sản Văn học Việt Nam trong thời đại số.
          </p>
        </div>

        <div className="col-span-1 md:col-span-3 flex flex-wrap gap-x-12 gap-y-4 md:justify-end items-center">
          <a
            href="#"
            className="text-sm font-semibold text-on-surface-variant hover:text-secondary transition-colors"
          >
            Về chúng tôi
          </a>
          <a
            href="#"
            className="text-sm font-semibold text-on-surface-variant hover:text-secondary transition-colors"
          >
            Điều khoản
          </a>
          <a
            href="#"
            className="text-sm font-semibold text-on-surface-variant hover:text-secondary transition-colors"
          >
            Liên hệ
          </a>
          <a
            href="#"
            className="text-sm font-semibold text-on-surface-variant hover:text-secondary transition-colors"
          >
            Bảo mật
          </a>
        </div>

        <div className="col-span-1 md:col-span-4 border-t border-outline-variant/20 pt-6 mt-2 text-center md:text-left">
          <p className="text-sm font-medium text-on-surface-variant">
            © 2026 Mộc Bản - Di sản Văn học Việt Nam
          </p>
        </div>
      </div>
    </footer>
  )
}
