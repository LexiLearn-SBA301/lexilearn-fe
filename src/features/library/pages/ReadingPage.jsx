import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useGetSections,
  useGetSectionDetail,
  useGetArtisticFeatures,
  useGetCharacters,
} from '../hooks/useWorkSection'
import { useWorkDetail } from '../hooks/useLibrary'
import { Loader2 } from 'lucide-react'
import { ReadingPageSidebar } from '../components/ReadingPageSidebar'
import { ReadingPageContent } from '../components/ReadingPageContent'
import { useChatStore } from '../store/chat.store'

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
    useGetSectionDetail(work?.id, currentSectionId)

  // Fetch Nghệ thuật & Nhân vật (Cho Sidebar)
  const { data: artisticFeatures, isLoading: isFeaturesLoading } =
    useGetArtisticFeatures(work?.id)
  const { data: characters, isLoading: isCharactersLoading } = useGetCharacters(
    work?.id,
  )

  // Mở popup chatbot dùng chung (kèm sẵn đoạn văn bôi đen nếu có)
  const openChat = useChatStore((s) => s.openChat)

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
        openChat={openChat}
      />

      {/* Nút nổi + popup chatbot do <ChatWidget /> ở App quản lý chung cho mọi trang */}
    </div>
  )
}
