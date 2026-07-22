import { useState, useEffect, useRef } from 'react' // Bổ sung useState và useEffect
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Search, Menu, User, UserCog, LogOut, Star, X } from 'lucide-react'
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

  // Ô tìm kiếm bung ra từ nút kính lúp; gửi từ khóa sang Thư viện qua ?search=
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const searchRef = useRef(null)
  const searchInputRef = useRef(null)

  // Trạng thái đăng nhập: có accessToken nghĩa là đã đăng nhập
  const accessToken = useAuthStore((state) => state.accessToken)
  const clearTokens = useAuthStore((state) => state.clearTokens)
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = Boolean(accessToken)

  // Tài khoản ADMIN không cần ô tìm kiếm của bạn đọc -> ẩn hẳn nút kính lúp
  const isAdminUser = Boolean(user?.roles?.includes('ADMIN'))

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

  // Click ra ngoài -> thu ô tìm kiếm lại (vẫn giữ từ khóa đã gõ cho lần mở sau)
  useEffect(() => {
    if (!isSearchOpen) return
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isSearchOpen])

  // Bung ô nhập -> focus luôn để gõ được ngay
  useEffect(() => {
    if (isSearchOpen) searchInputRef.current?.focus()
  }, [isSearchOpen])

  // Bấm kính lúp: chưa mở thì bung ô nhập, đang mở & có chữ thì tìm luôn
  const handleSearchClick = () => {
    if (!isSearchOpen) {
      setIsSearchOpen(true)
      return
    }
    submitSearch()
  }

  const submitSearch = () => {
    const keyword = searchTerm.trim()
    if (!keyword) {
      searchInputRef.current?.focus()
      return
    }
    navigate(`/thu-vien?search=${encodeURIComponent(keyword)}`)
    setIsSearchOpen(false)
    setSearchTerm('')
  }

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') submitSearch()
    if (e.key === 'Escape') {
      setSearchTerm('')
      setIsSearchOpen(false)
    }
  }

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
          {!isAdminUser && (
            <div ref={searchRef} className="flex items-center">
              {/* Ô nhập bung ra bên trái nút kính lúp */}
              <div
                className={`overflow-hidden transition-all duration-300 ease-out ${
                  isSearchOpen
                    ? 'w-44 md:w-64 opacity-100 mr-1'
                    : 'w-0 opacity-0'
                }`}
              >
                <div className="flex items-center gap-1 bg-surface-container-lowest border border-outline-variant/40 rounded-full pl-4 pr-1 py-1.5 shadow-sm">
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                    placeholder="Tìm tác phẩm, tác giả..."
                    aria-label="Tìm kiếm tác phẩm"
                    // Đang thu lại (w-0) thì bỏ khỏi luồng Tab, tránh focus vào ô vô hình
                    tabIndex={isSearchOpen ? 0 : -1}
                    className="w-full bg-transparent text-sm text-primary placeholder:text-on-surface-variant/60 focus:outline-none"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm('')
                        searchInputRef.current?.focus()
                      }}
                      aria-label="Xóa từ khóa"
                      className="p-1 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                    >
                      <X size={14} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>

              <button
                onClick={handleSearchClick}
                aria-label={isSearchOpen ? 'Tìm kiếm' : 'Mở ô tìm kiếm'}
                className="text-on-surface-variant hover:text-primary p-2 rounded-full hover:bg-surface-container transition-colors cursor-pointer flex-shrink-0"
              >
                <Search size={20} strokeWidth={2} />
              </button>
            </div>
          )}
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
                  {/* Hồ sơ cá nhân — dùng chung cho cả admin lẫn user thường */}
                  <Link
                    to="/ca-nhan"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-2 w-full px-4 py-2.5 text-left text-on-surface-variant hover:bg-surface-container hover:text-primary transition-colors font-semibold text-[15px]"
                  >
                    <UserCog size={18} strokeWidth={2} />
                    Hồ sơ cá nhân
                  </Link>
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
