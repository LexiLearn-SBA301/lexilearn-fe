import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  useGetSections,
  useGetSectionDetail,
  useGetArtisticFeatures,
  useGetCharacters,
} from '../hooks/useWorkSection'
import { useWorkDetail } from '../hooks/useLibrary'
import {
  Loader2,
  ChevronRight,
  Book,
  Eye,
  ArrowLeft,
  Menu,
  X,
  ChevronLeft,
  BookOpen,
  ChevronDown,
  Route,
  Feather,
  ImageIcon,
  LayoutTemplate,
  Star,
  Sparkles,
} from 'lucide-react'

const FEATURE_MAP = {
  NARRATIVE: {
    icon: Route,
    color: 'text-[#412311]',
    border: 'border-[#412311]/15',
  },
  LANGUAGE: {
    icon: Feather,
    color: 'text-[#ab3429]',
    border: 'border-[#ab3429]/15',
  },
  IMAGERY: {
    icon: ImageIcon,
    color: 'text-[#004943]',
    border: 'border-[#004943]/15',
  },
  STRUCTURE: {
    icon: LayoutTemplate,
    color: 'text-[#83746d]',
    border: 'border-[#83746d]/20',
  },
  SYMBOLISM: {
    icon: Star,
    color: 'text-[#b45309]',
    border: 'border-[#b45309]/20',
  },
  DEFAULT: {
    icon: Sparkles,
    color: 'text-[#ab3429]',
    border: 'border-[#ab3429]/15',
  },
}

export const ReadingPage = () => {
  const { slug, sectionId } = useParams()
  const navigate = useNavigate()
  const scrollRef = useRef(null)

  const { data: work, isLoading: isWorkLoading } = useWorkDetail(slug)
  const { data: sections, isLoading: isSectionsLoading } = useGetSections(
    work?.id,
  )

  const currentSectionId =
    sectionId || (sections && sections.length > 0 ? sections[0].id : null)
  const { data: currentSection, isLoading: isSectionLoading } =
    useGetSectionDetail(currentSectionId)

  // Fetch Nghệ thuật & Nhân vật (Cho Sidebar)
  const { data: artisticFeatures, isLoading: isFeaturesLoading } =
    useGetArtisticFeatures(work?.id)
  const { data: characters, isLoading: isCharactersLoading } = useGetCharacters(
    work?.id,
  )

  // States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [sidebarTab, setSidebarTab] = useState('muc-luc') // 'muc-luc' | 'nghe-thuat' | 'nhan-vat'
  const [scrollProgress, setScrollProgress] = useState(0)
  const [featureFilter, setFeatureFilter] = useState('ALL') // Lọc phần nghệ thuật
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)

  // --- RESIZABLE SIDEBAR LOGIC ---
  const [sidebarWidth, setSidebarWidth] = useState(380) // Default width 380px (đẹp như hình)
  const [isResizing, setIsResizing] = useState(false) // Thêm state để UI re-render khi đang kéo
  const isResizingRef = useRef(false)

  const handleResizeStart = (e) => {
    if (!isSidebarOpen) return
    e.preventDefault()
    isResizingRef.current = true
    setIsResizing(true)
  }

  useEffect(() => {
    const handleMove = (e) => {
      if (!isResizingRef.current) return
      const clientX = e.type.includes('mouse')
        ? e.clientX
        : e.touches[0].clientX
      // Giới hạn thu nhỏ tối thiểu là 360px để giao diện không bị bóp méo, hiển thị text và ảnh hoàn hảo
      const minWidth = 360
      const maxWidth = Math.min(800, window.innerWidth * 0.85) // Max 85% màn hình
      setSidebarWidth(Math.max(minWidth, Math.min(maxWidth, clientX)))
    }

    const handleEnd = () => {
      isResizingRef.current = false
      setIsResizing(false)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleMove, { passive: false })
    window.addEventListener('touchend', handleEnd)

    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [isSidebarOpen])

  // Tính toán tiến trình đọc (Reading Progress Bar)
  const handleScroll = (e) => {
    const target = e.target
    const scroll =
      target.scrollTop / (target.scrollHeight - target.clientHeight)
    setScrollProgress(scroll * 100 || 0)
  }

  useEffect(() => {
    if (scrollRef.current)
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentSectionId])

  const currentIndex =
    sections?.findIndex((s) => s.id === currentSectionId) ?? -1
  const prevSection = currentIndex > 0 ? sections[currentIndex - 1] : null
  const nextSection =
    currentIndex < (sections?.length || 0) - 1
      ? sections[currentIndex + 1]
      : null

  const handleNavigate = (id) => {
    navigate(`/thu-vien/${slug}/doc/${id}`)
    if (window.innerWidth < 1024) setIsSidebarOpen(false)
  }

  if (isWorkLoading || isSectionsLoading || isSectionLoading) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#F4ECE1]">
        <Loader2 className="h-12 w-12 animate-spin text-[#ab3429]" />
      </div>
    )
  }

  return (
    <div
      ref={scrollRef}
      onScroll={handleScroll}
      className="fixed inset-0 z-50 overflow-y-auto custom-scrollbar bg-[#FAF3E7] text-[#2b211c] font-body flex transition-colors duration-500"
    >
      {/* Nền Texture Giấy Nhám */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>

      {/* LỚP PHỦ VÔ HÌNH KHI MỞ MỤC LỤC (Bắt sự kiện click để đóng, không làm mờ nền) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ================================================== */}
      {/* SIDEBAR TRÁI: MỤC LỤC TÁC PHẨM (Premium UI) */}
      {/* ================================================== */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[#FAF3E7]/95 backdrop-blur-xl border-r border-[#83746d]/20 shadow-[20px_0_40px_rgba(0,0,0,0.05)] z-50 flex flex-col transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ width: `${sidebarWidth}px` }}
      >
        {/* DRAG HANDLE BÊN PHẢI (Để kéo giãn kích thước Sidebar) */}
        <div
          className="absolute top-0 right-0 w-4 h-full cursor-col-resize z-[60] flex items-center justify-end pr-1 group hover:bg-[#ab3429]/5 transition-colors"
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
        >
          <div className="w-1 h-12 bg-[#83746d]/30 rounded-full group-hover:bg-[#ab3429] transition-colors"></div>
        </div>

        {/* Nền Texture cho Sidebar */}
        <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>

        {/* Header Sidebar có màu sắc nổi bật */}
        <div className="relative p-6 bg-gradient-to-br from-[#412311] to-[#5a3825] text-white flex items-center justify-between shadow-md">
          <div>
            <div className="text-[10px] text-[#ffdbca]/70 uppercase tracking-widest mb-1 font-bold">
              Tác phẩm đang đọc
            </div>
            <h3 className="font-title text-xl font-bold text-white truncate pr-4 max-w-[220px]">
              {work?.title}
            </h3>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 hover:rotate-90 transition-all text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* TABS SIDEBAR (Segmented Control Style) */}
        <div className="px-4 py-3 bg-[#FAF3E7]/80 border-b border-[#83746d]/10 z-10">
          <div className="flex bg-[#83746d]/10 p-1 rounded-xl relative">
            <button
              onClick={() => setSidebarTab('muc-luc')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 relative z-10 ${sidebarTab === 'muc-luc' ? 'text-[#ab3429] shadow-sm' : 'text-[#83746d] hover:text-[#412311]'}`}
            >
              Mục lục
            </button>
            <button
              onClick={() => setSidebarTab('nghe-thuat')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 relative z-10 ${sidebarTab === 'nghe-thuat' ? 'text-[#ab3429] shadow-sm' : 'text-[#83746d] hover:text-[#412311]'}`}
            >
              Nghệ thuật
            </button>
            <button
              onClick={() => setSidebarTab('nhan-vat')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 relative z-10 ${sidebarTab === 'nhan-vat' ? 'text-[#ab3429] shadow-sm' : 'text-[#83746d] hover:text-[#412311]'}`}
            >
              Nhân vật
            </button>

            {/* Sliding Background cho Active Tab */}
            <div
              className="absolute top-1 bottom-1 w-[32%] bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out z-0"
              style={{
                left:
                  sidebarTab === 'muc-luc'
                    ? '1%'
                    : sidebarTab === 'nghe-thuat'
                      ? '34%'
                      : '67%',
              }}
            ></div>
          </div>
        </div>

        {/* Body Sidebar */}
        <div className="relative flex-1 overflow-y-auto p-4 custom-scrollbar">
          {/* TAB MỤC LỤC */}
          {sidebarTab === 'muc-luc' && (
            <div className="flex flex-col gap-2 animate-in fade-in duration-300">
              <div className="mb-2 mt-1 text-[10px] font-bold uppercase tracking-widest text-[#83746d] ml-2 flex items-center gap-2">
                <BookOpen size={12} /> {sections?.length || 0} Chương
              </div>
              {sections?.map((section) => {
                const isActive = currentSectionId === section.id
                return (
                  <button
                    key={section.id}
                    onClick={() => handleNavigate(section.id)}
                    className={`
                      text-left px-4 py-4 rounded-2xl transition-all duration-300 border
                      ${
                        isActive
                          ? 'bg-gradient-to-r from-[#ab3429] to-[#c74c40] text-white border-transparent shadow-[0_4px_15px_rgba(171,52,41,0.3)] scale-[1.02] ml-2 mr-1'
                          : 'bg-white/40 border-[#83746d]/10 text-[#412311] hover:bg-white/80 hover:shadow-sm hover:-translate-y-0.5'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full transition-all flex-shrink-0 ${isActive ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-[#83746d]/30'}`}
                      ></div>
                      <div className="flex flex-col">
                        {!isActive && section.title && (
                          <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-0.5">
                            Chương {section.number}
                          </span>
                        )}
                        <span
                          className={`line-clamp-2 ${isActive ? 'font-bold text-[15px]' : 'font-medium text-sm'}`}
                        >
                          {section.title || `Chương ${section.number}`}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* TAB NGHỆ THUẬT */}
          {sidebarTab === 'nghe-thuat' && (
            <div className="animate-in fade-in duration-300">
              {/* BỘ LỌC TỪ KHÓA NGHỆ THUẬT (DẠNG DROPDOWN TỐI ƯU) */}
              {!isFeaturesLoading && artisticFeatures?.length > 0 && (
                <div className="relative z-50 flex items-center justify-between mb-5 bg-white/50 backdrop-blur-sm border border-[#83746d]/15 px-4 py-2.5 rounded-[14px] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[#83746d]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#83746d]">
                      Phân loại
                    </span>
                  </div>
                  <div className="relative">
                    {/* Nút bấm Custom Dropdown */}
                    <button
                      onClick={() =>
                        setIsFilterDropdownOpen(!isFilterDropdownOpen)
                      }
                      className="flex items-center gap-1.5 bg-transparent text-[11px] font-bold text-[#ab3429] uppercase tracking-wider pl-2 outline-none cursor-pointer text-right group"
                    >
                      {featureFilter === 'ALL' ? 'Tất cả' : featureFilter}
                      <ChevronDown
                        size={14}
                        className={`text-[#ab3429] opacity-70 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Bảng Menu thả xuống (Custom) */}
                    {isFilterDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsFilterDropdownOpen(false)}
                        ></div>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-[16px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-[#83746d]/15 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200 p-1.5 flex flex-col gap-0.5">
                          {[
                            'ALL',
                            ...Array.from(
                              new Set(
                                artisticFeatures.map((f) => f.featureType),
                              ),
                            ),
                          ].map((type) => {
                            const isActive = featureFilter === type
                            return (
                              <button
                                key={type}
                                onClick={() => {
                                  setFeatureFilter(type)
                                  setIsFilterDropdownOpen(false)
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[10px] text-[10px] font-bold uppercase tracking-widest transition-all
                                  ${isActive ? 'bg-[#ab3429] text-white shadow-md shadow-[#ab3429]/20' : 'text-[#83746d] hover:bg-[#83746d]/10 hover:text-[#412311]'}
                                `}
                              >
                                <span>{type === 'ALL' ? 'Tất cả' : type}</span>
                                {isActive && (
                                  <Star size={12} className="fill-white" />
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
                {isFeaturesLoading ? (
                  <div className="flex justify-center py-10 col-span-full">
                    <Loader2 className="animate-spin text-[#ab3429]" />
                  </div>
                ) : artisticFeatures?.length > 0 ? (
                  (featureFilter === 'ALL'
                    ? artisticFeatures
                    : artisticFeatures.filter(
                        (f) => f.featureType === featureFilter,
                      )
                  ).map((f, i) => {
                    const config =
                      FEATURE_MAP[f.featureType] || FEATURE_MAP.DEFAULT
                    const Icon = config.icon
                    return (
                      <div
                        key={i}
                        className={`relative p-6 rounded-[24px] bg-white/70 backdrop-blur-md border ${config.border} shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 group overflow-hidden flex flex-col h-full animate-in zoom-in-95`}
                      >
                        <div
                          className={`absolute top-0 right-0 p-4 opacity-5 group-hover:scale-[2] group-hover:opacity-[0.08] group-hover:-rotate-12 transition-all duration-700 ${config.color}`}
                        >
                          <Icon size={80} />
                        </div>
                        <div className="flex-none mb-4">
                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-sm border ${config.border} rounded-md text-[9px] uppercase font-bold ${config.color} tracking-[0.15em] shadow-[0_2px_8px_rgba(0,0,0,0.03)] relative z-10`}
                          >
                            <Icon size={10} strokeWidth={3} /> {f.featureType}
                          </div>
                        </div>
                        <h4 className="font-title font-bold text-[#412311] text-[20px] mb-3 leading-tight relative z-10 group-hover:text-[#ab3429] transition-colors duration-300">
                          {f.title}
                        </h4>
                        <p className="text-[13.5px] font-quote text-[#50443e] leading-[1.8] relative z-10 text-justify flex-1">
                          {f.description}
                        </p>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-sm text-[#83746d] italic text-center py-10 font-quote col-span-full">
                    {work?.artisticValue || 'Chưa có phân tích nghệ thuật...'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB NHÂN VẬT */}
          {sidebarTab === 'nhan-vat' && (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 animate-in fade-in duration-300">
              {isCharactersLoading ? (
                <div className="flex justify-center py-10 col-span-full">
                  <Loader2 className="animate-spin text-[#ab3429]" />
                </div>
              ) : characters?.length > 0 ? (
                characters.map((c, i) => {
                  const firstLetter = c.name
                    ? c.name.charAt(0).toUpperCase()
                    : ''

                  return (
                    <div
                      key={i}
                      className="relative p-6 rounded-[24px] bg-white/70 backdrop-blur-md border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(171,52,41,0.08)] hover:-translate-y-1 transition-all duration-500 group overflow-hidden flex flex-col h-full"
                    >
                      <div className="absolute -bottom-4 -right-2 text-[120px] font-title font-black text-[#ab3429] opacity-[0.03] leading-none pointer-events-none group-hover:scale-110 group-hover:-rotate-3 group-hover:opacity-[0.06] transition-all duration-700 origin-bottom-right">
                        {firstLetter}
                      </div>

                      <div className="relative z-10 flex-none">
                        <div className="flex items-center justify-between mb-3">
                          {c.role ? (
                            <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-[#ab3429] to-[#d94a3d] rounded-full text-[9px] uppercase font-bold text-white tracking-[0.2em] shadow-[0_2px_8px_rgba(171,52,41,0.3)]">
                              {c.role}
                            </div>
                          ) : (
                            <div className="w-12 h-[2px] bg-[#ab3429]/20 rounded-full"></div>
                          )}
                          <div className="h-[1px] flex-1 bg-gradient-to-r from-[#ab3429]/20 to-transparent ml-4"></div>
                        </div>

                        <h4 className="font-title font-black text-[#412311] text-[24px] leading-tight mb-4 group-hover:text-[#ab3429] transition-colors duration-300">
                          {c.name}
                        </h4>
                      </div>

                      <p className="text-[13.5px] font-quote text-[#50443e] leading-[1.85] text-justify relative z-10 flex-1">
                        {c.description}
                      </p>
                    </div>
                  )
                })
              ) : (
                <div className="text-sm text-[#83746d] italic text-center py-10 font-quote col-span-full">
                  Chưa có dữ liệu nhân vật...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Sidebar */}
        <div className="relative p-5 border-t border-[#83746d]/20 bg-white/40 backdrop-blur-md">
          <Link
            to={`/thu-vien/${slug}`}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-white border border-[#ab3429]/20 text-[#ab3429] hover:bg-[#ab3429] hover:text-white transition-all duration-300 font-bold shadow-sm"
          >
            <ArrowLeft size={18} /> Thoát chế độ đọc
          </Link>
        </div>
      </aside>

      {/* ================================================== */}
      {/* MAIN READING AREA (CĂN GIỮA - ZEN MODE) */}
      {/* ================================================== */}
      <main
        className={`flex-1 flex flex-col min-h-screen relative z-10 ${isResizing ? '' : 'transition-[margin] duration-500 cubic-bezier(0.4,0,0.2,1)'}`}
        style={{
          marginLeft:
            window.innerWidth >= 1024 && isSidebarOpen
              ? `${sidebarWidth}px`
              : '0px',
        }}
      >
        {/* Header Nổi */}
        <header className="sticky top-0 z-30 bg-white/60 backdrop-blur-xl border-b border-white/40 px-4 md:px-8 py-4 flex items-center justify-between shadow-[0_4px_30px_rgba(0,0,0,0.03)] transition-all">
          <div
            className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-[#ab3429] to-[#ff7261] rounded-r-full transition-all"
            style={{ width: `${scrollProgress}%` }}
          />

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 rounded-full hover:bg-white text-[#ab3429] transition-all shadow-sm border border-white bg-white/60 group"
            >
              <Menu
                size={22}
                className="group-hover:scale-110 transition-transform"
              />
            </button>
            <div className="hidden sm:block">
              <div className="text-[10px] font-bold text-[#50443e]/50 uppercase tracking-widest mb-0.5">
                {work?.title}
              </div>
              <h1 className="font-title text-[15px] font-bold text-[#412311] truncate max-w-[300px]">
                {currentSection?.title || `Chương ${currentSection?.number}`}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <Link
              to={`/thu-vien/${slug}`}
              className="text-sm font-bold text-[#ab3429] hover:bg-[#ab3429]/10 px-4 py-1.5 rounded-full transition-colors flex items-center gap-1"
            >
              Đóng
            </Link>
          </div>
        </header>

        {/* Nội dung Văn Bản */}
        <article className="flex-1 w-full max-w-3xl mx-auto px-6 py-12 md:py-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {/* Tiêu đề */}
          <div className="text-center mb-16 relative">
            <div className="inline-block px-4 py-1.5 bg-[#412311]/5 border border-[#412311]/10 rounded-full text-[#ab3429] text-xs font-bold tracking-widest uppercase mb-6 shadow-sm">
              Trích đoạn Tác phẩm
            </div>
            <h2 className="font-title text-4xl md:text-[52px] font-extrabold text-[#412311] leading-tight relative z-10">
              {currentSection?.title || `Chương ${currentSection?.number}`}
            </h2>

            {/* Lượt xem và thời gian đọc */}
            <div className="mt-8 flex justify-center items-center gap-8 text-sm text-[#83746d] font-medium">
              <div className="flex items-center gap-2">
                <Book size={18} /> 12 phút đọc
              </div>
              <div className="flex items-center gap-2">
                <Eye size={18} /> 45,201 lượt xem
              </div>
            </div>
            <div className="w-20 h-[2px] bg-gradient-to-r from-transparent via-[#ab3429]/30 to-transparent mx-auto mt-8"></div>
          </div>

          {/* Typography chuẩn mực */}
          <div
            className="prose prose-lg md:prose-xl max-w-none text-[#231a0c] font-quote leading-[2.2] tracking-wide text-justify
                          first-letter:text-[80px] first-letter:font-title first-letter:font-black first-letter:text-[#ab3429] 
                          first-letter:mr-4 first-letter:float-left first-letter:mt-2 first-letter:leading-[0.8]
                          first-line:uppercase first-line:tracking-[0.1em] first-line:font-bold"
          >
            {currentSection?.content?.split('\n\n').map((paragraph, idx) => (
              <p key={idx} className="mb-6">
                {paragraph}
              </p>
            ))}
          </div>

          {/* Nút Điều hướng Cuối bài */}
          <div className="mt-28 pt-10 border-t border-[#83746d]/20 flex flex-col sm:flex-row items-stretch justify-between gap-6">
            {prevSection ? (
              <button
                onClick={() => handleNavigate(prevSection.id)}
                className="flex-1 flex flex-col items-start p-6 rounded-3xl hover:bg-white/60 transition-all duration-300 group border border-[#83746d]/10 bg-white/40 hover:shadow-lg hover:-translate-y-1"
              >
                <span className="text-[11px] font-bold uppercase tracking-widest text-[#50443e]/50 mb-2 flex items-center gap-1">
                  <ChevronLeft
                    size={14}
                    className="group-hover:-translate-x-1 transition-transform"
                  />{' '}
                  Chương trước
                </span>
                <span className="font-title text-xl font-bold text-[#412311] text-left line-clamp-2 leading-tight">
                  {prevSection.title || `Chương ${prevSection.number}`}
                </span>
              </button>
            ) : (
              <div className="flex-1" />
            )}

            {nextSection ? (
              <button
                onClick={() => handleNavigate(nextSection.id)}
                className="flex-1 flex flex-col items-end p-6 rounded-3xl bg-gradient-to-br from-[#ab3429] to-[#8a1c14] text-white hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group border border-[#ab3429]/20"
              >
                <span className="text-[11px] font-bold uppercase tracking-widest text-white/60 mb-2 flex items-center gap-1">
                  Chương tiếp theo{' '}
                  <ChevronRight
                    size={14}
                    className="group-hover:translate-x-1 transition-transform"
                  />
                </span>
                <span className="font-title text-xl font-bold text-right line-clamp-2 leading-tight">
                  {nextSection.title || `Chương ${nextSection.number}`}
                </span>
              </button>
            ) : (
              <div className="flex-1 flex items-center justify-center p-6 rounded-3xl bg-white/20 border border-[#83746d]/10 text-[#50443e]/40 font-bold italic shadow-sm">
                Đã đọc hết tác phẩm
              </div>
            )}
          </div>
        </article>
      </main>

      {/* Floating Navigation Widget (Góc Dưới Phải) - UX Đẳng Cấp */}
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-40 flex items-center bg-white/80 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-[#83746d]/20 p-1.5 transition-all hover:bg-white hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <button
          onClick={() => prevSection && handleNavigate(prevSection.id)}
          disabled={!prevSection}
          className="p-2.5 text-[#412311] hover:bg-[#f8e6ce] rounded-full transition-all disabled:opacity-30 disabled:hover:bg-transparent"
          title="Chương trước"
        >
          <ChevronLeft size={22} />
        </button>
        <div className="w-[1px] h-6 bg-[#83746d]/20 mx-1"></div>
        <button
          onClick={() => nextSection && handleNavigate(nextSection.id)}
          disabled={!nextSection}
          className="p-2.5 text-[#412311] hover:bg-[#f8e6ce] rounded-full transition-all disabled:opacity-30 disabled:hover:bg-transparent"
          title="Chương tiếp theo"
        >
          <ChevronRight size={22} />
        </button>
      </div>
    </div>
  )
}
