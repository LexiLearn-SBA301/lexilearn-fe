import { useState, useEffect, useRef } from 'react' // Bổ sung useState và useEffect
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Menu, User, LogOut, Star } from 'lucide-react'
import { useAuthStore } from '../../features/auth/store/auth.store'
import { useChatStore } from '../../features/library/store/chat.store'

export const Header = () => {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  const navigate = useNavigate()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const homeLink = isAdmin ? '/admin/thu-vien' : '/thu-vien'

  // Trạng thái đăng nhập: có accessToken nghĩa là đã đăng nhập
  const accessToken = useAuthStore((state) => state.accessToken)
  const clearTokens = useAuthStore((state) => state.clearTokens)
  const isAuthenticated = Boolean(accessToken)

  // Mở popup chatbot dùng chung (thay cho việc điều hướng tới /chatbot)
  const openChat = useChatStore((state) => state.openChat)

  // Logic phát hiện scroll
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Đóng dropdown user khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Đăng xuất: xóa token rồi quay về trang chủ
  const handleLogout = () => {
    clearTokens()
    setIsMenuOpen(false)
    navigate('/')
  }

  // Hàm check active menu
  const isActive = (path) => location.pathname.includes(path)

  return (
    // Sử dụng fixed để header luôn nổi trên đầu, kết hợp với pt-20 ở App.jsx sẽ không bị đè nội dung
    <header
      className={`fixed top-0 w-full z-50 transition-all duration-500 ease-in-out ${
        isScrolled
          ? 'bg-[#fff9ef]/90 backdrop-blur-xl shadow-md border-b border-outline-variant/10'
          : 'bg-[#fff9ef]/80'
      }`}
    >
      <div className="flex justify-between items-center h-20 px-6 max-w-7xl mx-auto">
        {/* Brand */}
        <Link
          to={homeLink}
          className="font-title text-3xl font-bold text-primary"
        >
          Mộc Bản
        </Link>

        {/* 1. NẾU LÀ ADMIN, HIỆN THANH TAB Ở GIỮA HEADER */}
        {isAdmin ? (
          <nav className="flex items-center gap-2 bg-surface-container-lowest p-1 rounded-xl border border-outline-variant/20">
            <Link
              to="/admin/thu-vien"
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${location.pathname.includes('/admin/thu-vien') ? 'bg-[#ab3429] text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Tác phẩm
            </Link>
            <Link
              to="/admin/tac-gia"
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${location.pathname.includes('/admin/tac-gia') ? 'bg-[#ab3429] text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Tác giả
            </Link>
            <Link
              to="/admin/the"
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${location.pathname.includes('/admin/the') ? 'bg-[#ab3429] text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Thẻ
            </Link>
            <Link
              to="/admin/duyet-review"
              className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${location.pathname.includes('/admin/duyet-review') ? 'bg-[#ab3429] text-white shadow-sm' : 'text-on-surface-variant hover:text-primary'}`}
            >
              Đánh giá
            </Link>
          </nav>
        ) : (
          /* 2. NẾU LÀ USER THÌ HIỆN NAV CŨ */
          <nav className="hidden md:flex items-center gap-10">
            <Link
              to="/"
              className="text-on-surface-variant hover:text-secondary font-semibold text-[15px]"
            >
              Trang chủ
            </Link>
            <Link
              to="/thu-vien"
              className={`font-semibold text-[15px] ${isActive('/thu-vien') ? 'text-secondary border-b-2 border-secondary pb-1' : 'text-on-surface-variant'}`}
            >
              Thư viện
            </Link>
            <Link
              to="/tac-gia"
              className={`font-semibold text-[15px] ${isActive('/tac-gia') ? 'text-secondary border-b-2 border-secondary pb-1' : 'text-on-surface-variant'}`}
            >
              Tác giả
            </Link>
            <button
              onClick={() => openChat()}
              className="text-on-surface-variant hover:text-secondary transition-colors font-semibold text-[15px] cursor-pointer"
            >
              Chatbot
            </button>
          </nav>
        )}
        {/* Actions */}
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-surface-container transition-colors">
            <Search size={20} strokeWidth={2} />
          </button>
          {isAuthenticated ? (
            // Đã đăng nhập: hiển thị icon user kèm dropdown đăng xuất
            <div className="relative hidden md:block" ref={menuRef}>
              <button
                onClick={() => setIsMenuOpen((open) => !open)}
                aria-label="Tài khoản"
                className="flex items-center justify-center w-10 h-10 rounded-full bg-[#ab3429] text-white hover:bg-[#8a1c14] transition-all shadow-md"
              >
                <User size={20} strokeWidth={2} />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-[#fff9ef] rounded-2xl shadow-xl border border-outline-variant/10 py-2 overflow-hidden">
                  <Link
                    to="/ca-nhan/reviews"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors font-semibold text-[15px]"
                  >
                    <Star size={18} strokeWidth={2} />
                    Đánh giá của tôi
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors font-semibold text-[15px]"
                  >
                    <LogOut size={18} strokeWidth={2} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Chưa đăng nhập: hiển thị nút Đăng nhập
            <Link
              to="/dang-nhap"
              className="hidden md:block px-6 py-2.5 bg-[#ab3429] text-white rounded-full hover:bg-[#8a1c14] transition-all font-semibold shadow-md text-[15px]"
            >
              Đăng nhập
            </Link>
          )}
          <button className="md:hidden p-2 text-on-surface-variant">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </header>
  )
}
