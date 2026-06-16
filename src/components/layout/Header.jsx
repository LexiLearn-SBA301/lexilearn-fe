import { useState, useEffect } from 'react' // Bổ sung useState và useEffect
import { Link, useLocation } from 'react-router-dom'
import { Search, Menu } from 'lucide-react'

export const Header = () => {
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)

  // Logic phát hiện scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Hàm check active menu
  const isActive = (path) => location.pathname.includes(path)

  return (
    // Sử dụng fixed để header luôn nổi trên đầu, kết hợp với pt-20 ở App.jsx sẽ không bị đè nội dung
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${
        isScrolled
          ? 'h-16 bg-[#fff9ef]/90 backdrop-blur-xl shadow-md border-b border-outline-variant/10'
          : 'h-20 bg-[#fff9ef]/80'
      }`}
    >
      <div className="flex justify-between items-center h-full px-6 max-w-7xl mx-auto">
        {/* Brand */}
        <Link
          to="/thu-vien"
          className="font-title text-3xl font-bold text-primary transition-all duration-500"
        >
          Mộc Bản
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-10">
          <Link
            to="/"
            className="text-on-surface-variant hover:text-secondary transition-colors font-semibold text-[15px]"
          >
            Trang chủ
          </Link>
          <Link
            to="/thu-vien"
            className={`font-semibold text-[15px] transition-colors ${isActive('/thu-vien') ? 'text-secondary border-b-2 border-secondary pb-1' : 'text-on-surface-variant hover:text-secondary'}`}
          >
            Thư viện
          </Link>
          <Link
            to="/tac-gia"
            className={`font-semibold text-[15px] transition-colors ${isActive('/tac-gia') ? 'text-secondary border-b-2 border-secondary pb-1' : 'text-on-surface-variant hover:text-secondary'}`}
          >
            Tác giả
          </Link>
          <Link
            to="/chatbot"
            className="text-on-surface-variant hover:text-secondary transition-colors font-semibold text-[15px]"
          >
            Chatbot
          </Link>
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-surface-container transition-colors">
            <Search size={20} strokeWidth={2} />
          </button>
          <Link
            to="/dang-nhap"
            className="hidden md:block px-6 py-2.5 bg-[#ab3429] text-white rounded-full hover:bg-[#8a1c14] transition-all font-semibold shadow-md text-[15px]"
          >
            Đăng nhập
          </Link>
          <button className="md:hidden p-2 text-on-surface-variant">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  )
}
