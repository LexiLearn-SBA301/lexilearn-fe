import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useGetSections,
  useGetSectionDetail,
  useGetFullSections,
  useGetArtisticFeatures,
  useGetCharacters,
} from '../hooks/useWorkSection'
import { useWorkDetail } from '../hooks/useLibrary'
import { Loader2 } from 'lucide-react'
import { ReadingPageSidebar } from '../components/ReadingPageSidebar'
import { ReadingPageContent } from '../components/ReadingPageContent'
import { useChatStore } from '../store/chat.store'
import { useAuthStore } from '../../auth/store/auth.store'
import { useGetBookmarks, useUpsertBookmark } from '../hooks/useReading'

export const ReadingPage = () => {
  const { slug, sectionId } = useParams()
  const navigate = useNavigate()
  const scrollRef = useRef(null)

  const { data: work, isLoading: isWorkLoading } = useWorkDetail(slug)
  const { data: sections, isLoading: isSectionsLoading } = useGetSections(
    work?.id,
  )

  const isPurePoetry =
    sections &&
    sections.length > 0 &&
    sections.every((s) => s.contentType === 'POETRY')

  const { data: fullSections, isLoading: isFullSectionsLoading } =
    useGetFullSections(work?.id, isPurePoetry)

  const currentSectionId =
    sectionId || (sections && sections.length > 0 ? sections[0].id : null)
  const { data: currentSectionDetail, isLoading: isSectionLoading } =
    useGetSectionDetail(work?.id, currentSectionId, !isPurePoetry)

  const [activeSectionId, setActiveSectionId] = useState(null)

  const currentSection = isPurePoetry
    ? fullSections?.find(
        (s) => s.id === (activeSectionId || currentSectionId),
      ) ||
      fullSections?.[0] ||
      null
    : currentSectionDetail

  const sectionsToRender = isPurePoetry
    ? fullSections || []
    : currentSection
      ? [currentSection]
      : []

  // Fetch Nghệ thuật & Nhân vật (Cho Sidebar)
  const { data: artisticFeatures, isLoading: isFeaturesLoading } =
    useGetArtisticFeatures(work?.id)
  const { data: characters, isLoading: isCharactersLoading } = useGetCharacters(
    work?.id,
  )

  const user = useAuthStore((s) => s.user)
  const { data: bookmarks, isLoading: isBookmarksLoading } =
    useGetBookmarks(!!user)
  const { mutate: upsertBookmark } = useUpsertBookmark()

  // Mở popup chatbot dùng chung (kèm sẵn đoạn văn bôi đen nếu có)
  const openChat = useChatStore((s) => s.openChat)

  // States
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [sidebarTab, setSidebarTab] = useState('muc-luc') // 'muc-luc' | 'nghe-thuat' | 'nhan-vat'
  const [scrollProgress, setScrollProgress] = useState(0)
  const [featureFilter, setFeatureFilter] = useState('ALL') // Lọc phần nghệ thuật
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false)
  const [hasPromptedRestore, setHasPromptedRestore] = useState(false)
  const [targetScrollRatio, setTargetScrollRatio] = useState(null)
  const [isCompleted, setIsCompleted] = useState(false)

  // -- FOCUS MODE --
  const [isFocusMode, setIsFocusMode] = useState(false)

  // Toggle Fullscreen when isFocusMode changes
  useEffect(() => {
    if (isFocusMode) {
      document.documentElement.requestFullscreen?.().catch((err) => {
        console.warn('Cannot enter fullscreen', err)
      })
    } else {
      if (document.fullscreenElement) {
        document.exitFullscreen?.().catch((err) => {
          console.warn('Cannot exit fullscreen', err)
        })
      }
    }
  }, [isFocusMode])

  // --- RESTORE BOOKMARK LOGIC ---
  useEffect(() => {
    if (!work || !bookmarks || hasPromptedRestore || !user) return
    const bookmark = bookmarks.find((b) => b.work?.id === work.id)

    if (bookmark) {
      // eslint-disable-next-line
      setIsCompleted(bookmark.isCompleted)

      if (isPurePoetry) {
        if (bookmark.currentSection?.id) {
          setActiveSectionId(bookmark.currentSection.id)
          setTimeout(() => {
            const el = document.getElementById(
              `section-${bookmark.currentSection.id}`,
            )
            if (el) {
              el.scrollIntoView({ behavior: 'auto', block: 'start' })
            }
          }, 300)
        }
      } else if (!sectionId && bookmark.currentSection) {
        // User opened book without specific section, restore automatically
        setTargetScrollRatio(
          bookmark.position / (currentSection?.content?.length || 1),
        )
        navigate(`/thu-vien/${slug}/doc/${bookmark.currentSection.id}`, {
          replace: true,
        })
      } else if (
        sectionId &&
        bookmark.currentSection &&
        bookmark.currentSection.id !== sectionId
      ) {
        // User navigated to a specific section different from bookmark
        const wantsToRestore = window.confirm(
          `Bạn đang đọc dở chương "${bookmark.currentSection.title}". Bạn có muốn tiếp tục đọc từ đó không?`,
        )
        if (wantsToRestore) {
          setTargetScrollRatio(
            bookmark.position / (currentSection?.content?.length || 1),
          )
          navigate(`/thu-vien/${slug}/doc/${bookmark.currentSection.id}`)
        }
      } else if (
        sectionId &&
        bookmark.currentSection &&
        bookmark.currentSection.id === sectionId
      ) {
        setTargetScrollRatio(
          bookmark.position / (currentSection?.content?.length || 1),
        )
      }
    }
    setHasPromptedRestore(true)
  }, [
    work,
    bookmarks,
    sectionId,
    hasPromptedRestore,
    navigate,
    slug,
    user,
    currentSection,
    isPurePoetry,
  ])

  // Restore scroll when targetScrollRatio is set and content is ready
  useEffect(() => {
    if (targetScrollRatio !== null && scrollRef.current && currentSection) {
      const timeout = setTimeout(() => {
        const target = scrollRef.current
        const scrollAmount =
          (target.scrollHeight - target.clientHeight) * targetScrollRatio
        if (scrollAmount > 0) {
          target.scrollTo({ top: scrollAmount, behavior: 'smooth' })
        }
        setTargetScrollRatio(null)
      }, 300) // Small delay to ensure text is rendered
      return () => clearTimeout(timeout)
    }
  }, [targetScrollRatio, currentSection])

  // --- SAVE PROGRESS LOGIC ---
  const latestScrollRef = useRef(scrollProgress)
  const isCompletedRef = useRef(isCompleted)
  const bookmarksRef = useRef(bookmarks)

  useEffect(() => {
    latestScrollRef.current = scrollProgress
  }, [scrollProgress])

  useEffect(() => {
    isCompletedRef.current = isCompleted
  }, [isCompleted])

  useEffect(() => {
    bookmarksRef.current = bookmarks
  }, [bookmarks])

  useEffect(() => {
    if (!user || !work || !currentSection || !bookmarks) return
    if (isCompletedRef.current) return

    const activeSection = currentSection

    const saveProgress = () => {
      if (!activeSection?.content || isCompletedRef.current) return

      const existingBookmark = bookmarksRef.current?.find(
        (b) => b.work?.id === work.id,
      )

      // Double check DB status to prevent race conditions during restore
      if (existingBookmark?.isCompleted) return

      const sp = latestScrollRef.current

      if (isPurePoetry) {
        const activeId =
          activeSectionId || currentSectionId || fullSections?.[0]?.id
        if (!activeId) return
        upsertBookmark({
          workId: work.id,
          data: {
            currentSectionId: activeId,
            position: 0,
            progressPercent: parseFloat(sp.toFixed(2)),
            isCompleted: false,
          },
        })
        return
      }

      if (!activeSection?.content) return

      const position = Math.floor(activeSection.content.length * (sp / 100))
      const totalSections = sections?.length || 1
      const currentIdx =
        sections?.findIndex((s) => s.id === activeSection.id) || 0
      const calculatedProgressPercent =
        (currentIdx / totalSections) * 100 + (sp / 100 / totalSections) * 100

      const maxProgress = existingBookmark?.progressPercent || 0
      const finalProgressPercent = Math.max(
        maxProgress,
        calculatedProgressPercent,
      )

      upsertBookmark({
        workId: work.id,
        data: {
          currentSectionId: activeSection.id,
          position,
          progressPercent: parseFloat(finalProgressPercent.toFixed(2)),
          isCompleted: false,
        },
      })
    }

    // Auto-save progress every 5 seconds
    const intervalId = setInterval(saveProgress, 5000)

    // Save progress when user leaves or changes section
    return () => {
      clearInterval(intervalId)
      saveProgress()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentSection?.id,
    user,
    work?.id,
    sections?.length,
    upsertBookmark,
    isPurePoetry,
    activeSectionId,
  ])

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
    if (scrollRef.current && targetScrollRatio === null)
      scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentSectionId, targetScrollRatio])

  const activeId = isPurePoetry
    ? activeSectionId || currentSectionId
    : currentSectionId
  const currentIndex = sections?.findIndex((s) => s.id === activeId) ?? -1
  const prevSection = currentIndex > 0 ? sections[currentIndex - 1] : null
  const nextSection =
    currentIndex < (sections?.length || 0) - 1
      ? sections[currentIndex + 1]
      : null

  const isNavigatingRef = useRef(false)
  const navTimeoutRef = useRef(null)

  const handleNavigate = (id) => {
    if (isPurePoetry) {
      isNavigatingRef.current = true
      if (navTimeoutRef.current) clearTimeout(navTimeoutRef.current)
      navTimeoutRef.current = setTimeout(() => {
        isNavigatingRef.current = false
      }, 700)

      setActiveSectionId(id)
      const el = document.getElementById(`section-${id}`)
      if (el && scrollRef.current) {
        const containerRect = scrollRef.current.getBoundingClientRect()
        const elRect = el.getBoundingClientRect()
        const offsetTop =
          elRect.top - containerRect.top + scrollRef.current.scrollTop - 90
        scrollRef.current.scrollTo({
          top: Math.max(0, offsetTop),
          behavior: 'auto',
        })
      } else if (el) {
        el.scrollIntoView({ behavior: 'auto', block: 'start' })
      }
      if (window.innerWidth < 1024) setIsSidebarOpen(false)
      return
    }
    navigate(`/thu-vien/${slug}/doc/${id}`)
    if (window.innerWidth < 1024) setIsSidebarOpen(false)
  }

  // Lắng nghe sự kiện chuyển trang bằng phím mũi tên
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Bỏ qua nếu người dùng đang gõ phím vào input/textarea (ví dụ chat AI)
      if (
        e.target.tagName === 'INPUT' ||
        e.target.tagName === 'TEXTAREA' ||
        e.target.isContentEditable
      ) {
        return
      }

      if (e.key === 'ArrowLeft' && prevSection) {
        e.preventDefault()
        handleNavigate(prevSection.id)
      } else if (e.key === 'ArrowRight' && nextSection) {
        e.preventDefault()
        handleNavigate(nextSection.id)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevSection?.id, nextSection?.id])

  if (
    isWorkLoading ||
    isSectionsLoading ||
    (isPurePoetry ? isFullSectionsLoading : isSectionLoading) ||
    isBookmarksLoading
  ) {
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
      className={`fixed inset-0 z-50 overflow-y-auto custom-scrollbar font-body flex transition-colors duration-500 ${
        isFocusMode
          ? 'bg-[#121212] text-[#e8e6e3]'
          : 'bg-[#FAF3E7] text-[#2b211c]'
      }`}
    >
      {/* Lớp Texture Nền & Background Hình tác phẩm */}
      {!isFocusMode && (
        <>
          {work?.coverUrl && (
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
              <img
                src={work.coverUrl}
                alt=""
                className="w-full h-full object-cover opacity-35 select-none"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#FAF3E7]/30 via-[#FAF3E7]/55 to-[#FAF3E7]/75"></div>
            </div>
          )}
          <div className="fixed inset-0 pointer-events-none z-0 opacity-30 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>
        </>
      )}

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
        isPurePoetry={isPurePoetry}
        activeSectionId={activeSectionId}
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
        targetScrollRatio={targetScrollRatio}
        setTargetScrollRatio={setTargetScrollRatio}
        isCompleted={isCompleted}
        setIsCompleted={setIsCompleted}
        upsertBookmark={upsertBookmark}
        isFocusMode={isFocusMode}
        setIsFocusMode={setIsFocusMode}
        totalSections={sections?.length || 1}
        sectionsToRender={sectionsToRender}
        isPurePoetry={isPurePoetry}
        activeSectionId={activeSectionId}
        setActiveSectionId={setActiveSectionId}
        isNavigatingRef={isNavigatingRef}
      />

      {/* Nút nổi + popup chatbot do <ChatWidget /> ở App quản lý chung cho mọi trang */}
    </div>
  )
}
