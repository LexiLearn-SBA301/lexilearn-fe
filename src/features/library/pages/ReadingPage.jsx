import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useGetSections,
  useGetSectionDetail,
  useGetArtisticFeatures,
  useGetCharacters,
} from '../hooks/useWorkSection'
import { useWorkDetail } from '../hooks/useLibrary'
import { Loader2, Sparkles } from 'lucide-react'
import { ReadingPageSidebar } from '../components/ReadingPageSidebar'
import { ReadingPageContent } from '../components/ReadingPageContent'
import { AIAssistantPopup } from '../components/AIAssistantPopup'

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
  const [isAIOpen, setIsAIOpen] = useState(false) // Quản lý đóng mở AI Popup
  const [aiPrompt, setAiPrompt] = useState('') // Lưu đoạn text bôi đen để gửi cho AI
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
      {/* Lớp Texture Nền */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>

      <ReadingPageSidebar
        work={work}
        slug={slug}
        sections={sections}
        currentSectionId={currentSectionId}
        handleNavigate={handleNavigate}
        artisticFeatures={artisticFeatures}
        isFeaturesLoading={isFeaturesLoading}
        characters={characters}
        isCharactersLoading={isCharactersLoading}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        sidebarTab={sidebarTab}
        setSidebarTab={setSidebarTab}
        featureFilter={featureFilter}
        setFeatureFilter={setFeatureFilter}
        isFilterDropdownOpen={isFilterDropdownOpen}
        setIsFilterDropdownOpen={setIsFilterDropdownOpen}
        sidebarWidth={sidebarWidth}
        handleResizeStart={handleResizeStart}
      />

      <ReadingPageContent
        work={work}
        slug={slug}
        currentSection={currentSection}
        prevSection={prevSection}
        nextSection={nextSection}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        sidebarWidth={sidebarWidth}
        isResizing={isResizing}
        scrollProgress={scrollProgress}
        handleNavigate={handleNavigate}
        setIsAIOpen={setIsAIOpen}
        setAiPrompt={setAiPrompt}
      />

      {/* Nút Trợ lý AI (Góc Dưới Phải - Premium FAB) */}
      <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-40">
        {/* Vòng sáng Glowing background */}
        <div className="absolute inset-0 bg-[#ab3429] rounded-full blur-xl opacity-30 animate-pulse"></div>
        <button
          onClick={() => setIsAIOpen(true)}
          className="relative flex items-center justify-center w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-[#ab3429] to-[#6b1610] text-white rounded-full shadow-[0_8px_25px_rgba(171,52,41,0.5)] hover:shadow-[0_15px_35px_rgba(171,52,41,0.6)] hover:-translate-y-1 transition-all duration-300 group border border-white/20"
          title="Hỏi Mộc Bản AI"
        >
          <Sparkles
            size={26}
            className="group-hover:rotate-12 group-hover:scale-110 transition-transform duration-500"
          />
        </button>
      </div>

      {/* TÍCH HỢP TRỢ LÝ AI (POPUP GÓC DƯỚI PHẢI) */}
      <AIAssistantPopup
        isOpen={isAIOpen}
        onClose={() => {
          setIsAIOpen(false)
          setAiPrompt('')
        }}
        work={work}
        currentSection={currentSection}
        initialPrompt={aiPrompt}
      />
    </div>
  )
}
