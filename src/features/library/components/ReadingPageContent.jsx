import { useState, useEffect } from 'react'
import {
  Book,
  Eye,
  Menu,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react'

export const ReadingPageContent = ({
  work,
  currentSection,
  prevSection,
  nextSection,
  isSidebarOpen,
  setIsSidebarOpen,
  sidebarWidth,
  isResizing,
  scrollProgress,
  handleNavigate,
  openChat,
}) => {
  const [selectionRect, setSelectionRect] = useState(null)
  const [selectedText, setSelectedText] = useState('')

  const handleMouseUp = () => {
    const selection = window.getSelection()
    const text = selection.toString().trim()

    if (text && text.length > 5) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      setSelectionRect({
        top: rect.top - 50, // Nổi lên trên đoạn bôi đen một chút
        left: rect.left + rect.width / 2,
      })
      setSelectedText(text)
    } else {
      setSelectionRect(null)
      setSelectedText('')
    }
  }

  // --- LOGIC HIỆU ỨNG LẬT TRANG SÁCH ---
  const [navDirection, setNavDirection] = useState('next')
  const [lastId, setLastId] = useState(currentSection?.id)
  const [lastNumber, setLastNumber] = useState(currentSection?.number || 0)

  if (currentSection && currentSection.id !== lastId) {
    const isNext = currentSection.number > lastNumber
    setNavDirection(isNext ? 'next' : 'prev')
    setLastId(currentSection.id)
    setLastNumber(currentSection.number)
  }

  // Tắt Tooltip nếu người dùng click ra ngoài hoặc scroll làm mất bôi đen
  useEffect(() => {
    const handleSelectionChange = () => {
      if (!window.getSelection().toString().trim()) {
        setSelectionRect(null)
        setSelectedText('')
      }
    }
    document.addEventListener('selectionchange', handleSelectionChange)
    return () =>
      document.removeEventListener('selectionchange', handleSelectionChange)
  }, [])

  return (
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
          <div className="hidden sm:flex flex-col justify-center">
            <div className="text-[10px] font-bold text-[#50443e]/50 uppercase tracking-widest mb-0.5">
              {work?.title}
            </div>
            <div className="flex items-center gap-3">
              <h1 className="font-title text-[15px] font-bold text-[#412311] truncate max-w-[200px] md:max-w-[400px]">
                {currentSection?.title || `Chương ${currentSection?.number}`}
              </h1>

              {/* Nút chuyển chương Inline */}
              <div className="flex items-center gap-0.5 bg-[#412311]/5 rounded-full p-0.5 border border-[#412311]/10">
                <button
                  onClick={() => prevSection && handleNavigate(prevSection.id)}
                  disabled={!prevSection}
                  className="p-1 text-[#412311]/70 hover:text-[#412311] hover:bg-white rounded-full transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Chương trước"
                >
                  <ChevronLeft size={14} />
                </button>
                <div className="w-[1px] h-3 bg-[#412311]/10"></div>
                <button
                  onClick={() => nextSection && handleNavigate(nextSection.id)}
                  disabled={!nextSection}
                  className="p-1 text-[#412311]/70 hover:text-[#412311] hover:bg-white rounded-full transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Chương tiếp theo"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Nội dung Văn Bản */}
      <article
        key={currentSection?.id}
        onMouseUp={handleMouseUp}
        className={`flex-1 w-full max-w-3xl mx-auto px-6 py-12 md:py-20 relative animate-in fade-in duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          navDirection === 'next'
            ? 'slide-in-from-right-16'
            : 'slide-in-from-left-16'
        }`}
      >
        {/* TOOLTIP: BÔI ĐEN HỎI AI */}
        {selectionRect && (
          <div
            className="fixed z-[100] transform -translate-x-1/2 animate-in fade-in zoom-in-95 duration-200"
            style={{ top: selectionRect.top, left: selectionRect.left }}
          >
            <button
              onClick={() => {
                openChat(
                  `Giải thích cho tôi đoạn văn sau:\n\n"${selectedText}"`,
                )
                setSelectionRect(null)
                window.getSelection()?.removeAllRanges()
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#ab3429] text-white rounded-xl shadow-[0_8px_20px_rgba(171,52,41,0.3)] hover:bg-[#8a1c14] hover:-translate-y-1 transition-all group border border-white/20 after:content-[''] after:absolute after:bottom-[-6px] after:left-1/2 after:-translate-x-1/2 after:border-[6px] after:border-transparent after:border-t-[#ab3429]"
            >
              <Sparkles
                size={14}
                className="group-hover:rotate-12 transition-transform"
              />
              <span className="font-bold text-[11px] tracking-wider uppercase">
                Hỏi Mộc Bản AI
              </span>
            </button>
          </div>
        )}

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
  )
}
