import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Menu,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
  ArrowLeft,
} from 'lucide-react'
import {
  useGetSectionNotes,
  useCreateNote,
  useDeleteNote,
} from '../hooks/useReading'
import { useAuthStore } from '../../auth/store/auth.store'

let sessionGuestNotes = []

const getGlobalOffset = (node, offset) => {
  if (node.nodeType === 3) {
    const parent = node.parentElement
    if (parent.hasAttribute('data-offset')) {
      return parseInt(parent.getAttribute('data-offset'), 10) + offset
    }
  } else if (node.nodeType === 1) {
    if (offset < node.childNodes.length) {
      const child = node.childNodes[offset]
      if (child && child.nodeType === 1 && child.hasAttribute('data-offset')) {
        return parseInt(child.getAttribute('data-offset'), 10)
      } else if (
        child &&
        child.nodeType === 3 &&
        child.parentElement.hasAttribute('data-offset')
      ) {
        return parseInt(child.parentElement.getAttribute('data-offset'), 10)
      }
    } else if (node.childNodes.length > 0) {
      const lastChild = node.childNodes[node.childNodes.length - 1]
      if (lastChild.nodeType === 1 && lastChild.hasAttribute('data-offset')) {
        return (
          parseInt(lastChild.getAttribute('data-offset'), 10) +
          lastChild.textContent.length
        )
      }
    }
    if (node.hasAttribute('data-offset')) {
      return parseInt(node.getAttribute('data-offset'), 10) + offset
    }
  }
  return null
}

const renderTextWithHiddenTags = (text, baseOffset) => {
  const parts = text.split(/(\[THO\]|\[\/THO\])/)
  let currentOffset = baseOffset
  return parts.map((part, i) => {
    if (!part) return null
    const offset = currentOffset
    currentOffset += part.length
    if (part === '[THO]' || part === '[/THO]') {
      return (
        <span key={i} data-offset={offset} style={{ display: 'none' }}>
          {part}
        </span>
      )
    }
    return (
      <span key={i} data-offset={offset}>
        {part}
      </span>
    )
  })
}

const getParagraphs = (content, notes) => {
  if (!content) return []
  const paragraphs = []
  let offset = 0
  const parts = content.split('\n\n')

  let isInsidePoetry = false

  parts.forEach((p) => {
    const pStart = offset
    const pEnd = offset + p.length

    const hasStartTag = p.includes('[THO]')
    const hasEndTag = p.includes('[/THO]')

    if (hasStartTag) isInsidePoetry = true
    const currentIsPoetry = isInsidePoetry
    if (hasEndTag) isInsidePoetry = false

    const overlappingNotes = (notes || []).filter(
      (n) => n.startOffset < pEnd && n.endOffset > pStart,
    )

    let segments = []
    let currentIdx = pStart

    const sorted = [...overlappingNotes].sort(
      (a, b) => a.startOffset - b.startOffset,
    )

    for (const note of sorted) {
      const markStart = Math.max(pStart, note.startOffset)
      const markEnd = Math.min(pEnd, note.endOffset)

      const effectiveMarkStart = Math.max(markStart, currentIdx)

      if (effectiveMarkStart > currentIdx) {
        segments.push({
          text: content.substring(currentIdx, effectiveMarkStart),
          isMark: false,
          globalOffset: currentIdx,
        })
      }

      if (markEnd > effectiveMarkStart) {
        segments.push({
          text: content.substring(effectiveMarkStart, markEnd),
          isMark: true,
          note,
          globalOffset: effectiveMarkStart,
        })
      }
      currentIdx = Math.max(currentIdx, markEnd)
    }

    if (currentIdx < pEnd) {
      segments.push({
        text: content.substring(currentIdx, pEnd),
        isMark: false,
        globalOffset: currentIdx,
      })
    }

    paragraphs.push({
      startOffset: pStart,
      segments,
      isPoetry: currentIsPoetry,
    })

    offset += p.length + 2 // +2 for \n\n
  })

  return paragraphs
}

export const ReadingPageContent = ({
  work,
  slug,
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
  isCompleted,
  setIsCompleted,
  upsertBookmark,
}) => {
  const [selectionRect, setSelectionRect] = useState(null)
  const [selectedText, setSelectedText] = useState('')
  const [selectionRange, setSelectionRange] = useState(null)

  const user = useAuthStore((s) => s.user)
  const [localNotes, setLocalNotes] = useState(sessionGuestNotes)

  const { data: serverNotes } = useGetSectionNotes(currentSection?.pIdx)
  const notes = [
    ...(serverNotes || []),
    ...localNotes.filter((n) => n.sectionId === currentSection?.id),
  ]

  const { mutate: createNote } = useCreateNote()
  const { mutate: deleteNote } = useDeleteNote()
  const [activeNote, setActiveNote] = useState(null)

  const parsedParagraphs = useMemo(() => {
    return getParagraphs(currentSection?.content, notes)
  }, [currentSection?.content, notes])

  const handleMouseUp = () => {
    const selection = window.getSelection()
    const text = selection.toString().trim()

    if (text && text.length > 0) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      const startOffset = getGlobalOffset(
        range.startContainer,
        range.startOffset,
      )
      const endOffset = getGlobalOffset(range.endContainer, range.endOffset)

      if (
        startOffset !== null &&
        endOffset !== null &&
        startOffset < endOffset
      ) {
        // Use raw content to make sure it matches perfectly
        const exactText = currentSection.content.substring(
          startOffset,
          endOffset,
        )
        setSelectionRect({
          top: rect.top - 50,
          left: rect.left + rect.width / 2,
        })
        setSelectedText(exactText)
        setSelectionRange({ startOffset, endOffset })
      } else {
        setSelectionRect(null)
        setSelectedText('')
        setSelectionRange(null)
      }
    } else {
      setSelectionRect(null)
      setSelectedText('')
      setSelectionRange(null)
    }
  }

  const handleCreateNote = (color) => {
    if (selectionRange && currentSection) {
      if (user) {
        createNote({
          sectionId: currentSection.id,
          data: {
            startOffset: selectionRange.startOffset,
            endOffset: selectionRange.endOffset,
            highlightedText: selectedText,
            userNote: null,
            color: color,
          },
        })
      } else {
        const newNote = {
          id: `local-${Date.now()}`,
          sectionId: currentSection.id,
          startOffset: selectionRange.startOffset,
          endOffset: selectionRange.endOffset,
          highlightedText: selectedText,
          color: color,
        }
        setLocalNotes((prev) => {
          const next = [...prev, newNote]
          sessionGuestNotes = next
          return next
        })
      }
      setSelectionRect(null)
      window.getSelection()?.removeAllRanges()
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
        setSelectionRange(null)
      }
    }
    const handleClickOutside = () => {
      setActiveNote(null)
    }
    document.addEventListener('selectionchange', handleSelectionChange)
    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  return (
    <main
      className={`flex-1 flex flex-col min-h-screen relative z-10 ${isResizing ? '' : 'transition-[margin] duration-500 cubic-bezier(0.4,0,0.2,1)'} ${isSidebarOpen ? 'lg:ml-[var(--sidebar-width)]' : 'ml-0'}`}
      style={{ '--sidebar-width': `${sidebarWidth}px` }}
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
            className="p-3 rounded-full hover:bg-white text-[#ab3429] transition-all shadow-sm border border-white bg-white/60 group"
          >
            <Menu
              size={24}
              className="group-hover:scale-110 transition-transform"
            />
          </button>
          <div className="hidden sm:flex flex-col justify-center">
            <div className="text-xs font-bold text-[#50443e]/70 uppercase tracking-wider mb-0.5">
              {work?.title}
            </div>
            <div className="flex items-center gap-3.5">
              <h1 className="font-title text-lg md:text-xl font-bold text-[#412311] truncate max-w-[220px] md:max-w-[450px]">
                {currentSection?.title || `Chương ${currentSection?.number}`}
              </h1>

              {/* Nút chuyển chương Inline */}
              <div className="flex items-center gap-1 bg-[#412311]/5 rounded-full p-1 border border-[#412311]/10">
                <button
                  onClick={() => prevSection && handleNavigate(prevSection.id)}
                  disabled={!prevSection}
                  className="p-1.5 text-[#412311]/70 hover:text-[#412311] hover:bg-white rounded-full transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Chương trước"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="w-[1px] h-4 bg-[#412311]/15"></div>
                <button
                  onClick={() => nextSection && handleNavigate(nextSection.id)}
                  disabled={!nextSection}
                  className="p-1.5 text-[#412311]/70 hover:text-[#412311] hover:bg-white rounded-full transition-all disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Chương tiếp theo"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <Link
          to={slug ? `/thu-vien/${slug}` : '/thu-vien'}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#412311]/5 hover:bg-[#ab3429] text-[#412311] hover:text-white transition-all text-sm font-bold border border-[#412311]/10 hover:border-transparent shadow-sm group"
          title="Thoát chế độ đọc"
        >
          <ArrowLeft
            size={16}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          <span>Thoát</span>
        </Link>
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
        {/* TOOLTIP: BÔI ĐEN HỎI AI & HIGHLIGHT */}
        {selectionRect && (
          <div
            className="fixed z-[100] transform -translate-x-1/2 animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center gap-2"
            style={{ top: selectionRect.top, left: selectionRect.left }}
          >
            <div className="flex items-center bg-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] rounded-xl p-1.5 border border-black/5 gap-1.5">
              <button
                onClick={() => handleCreateNote('YELLOW')}
                className="w-6 h-6 rounded-full bg-yellow-200 hover:scale-110 transition-transform shadow-sm"
              />
              <button
                onClick={() => handleCreateNote('GREEN')}
                className="w-6 h-6 rounded-full bg-green-200 hover:scale-110 transition-transform shadow-sm"
              />
              <button
                onClick={() => handleCreateNote('BLUE')}
                className="w-6 h-6 rounded-full bg-blue-200 hover:scale-110 transition-transform shadow-sm"
              />
              <button
                onClick={() => handleCreateNote('RED')}
                className="w-6 h-6 rounded-full bg-red-200 hover:scale-110 transition-transform shadow-sm"
              />
              <div className="w-[1px] h-6 bg-black/10 mx-1"></div>
              <button
                onClick={() => {
                  openChat(
                    `Giải thích cho tôi đoạn văn sau:\n\n"${selectedText}"`,
                  )
                  setSelectionRect(null)
                  window.getSelection()?.removeAllRanges()
                }}
                className="flex items-center gap-1 px-3 py-1 bg-[#ab3429] text-white rounded-lg hover:bg-[#8a1c14] transition-all shadow-sm"
              >
                <Sparkles size={12} />
                <span className="font-bold text-[10px] tracking-wider uppercase">
                  AI
                </span>
              </button>
            </div>
            {/* Mũi tên trỏ xuống */}
            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-white absolute -bottom-[7px] left-1/2 -translate-x-1/2 filter drop-shadow-sm"></div>
          </div>
        )}

        {/* TOOLTIP: XOÁ HIGHLIGHT */}
        {activeNote && (
          <div
            className="fixed z-[100] transform -translate-x-1/2 animate-in fade-in zoom-in-95 duration-200 flex flex-col items-center gap-2"
            style={{ top: activeNote.rect.top, left: activeNote.rect.left }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center bg-white shadow-[0_8px_20px_rgba(0,0,0,0.15)] rounded-xl p-1.5 border border-black/5">
              <button
                onClick={() => {
                  if (String(activeNote.note.id).startsWith('local-')) {
                    setLocalNotes((prev) => {
                      const next = prev.filter(
                        (n) => n.id !== activeNote.note.id,
                      )
                      sessionGuestNotes = next
                      return next
                    })
                  } else {
                    deleteNote(activeNote.note.id)
                  }
                  setActiveNote(null)
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-all shadow-sm"
              >
                <X size={14} />
                <span className="font-bold text-[11px] tracking-wider uppercase">
                  Xoá Highlight
                </span>
              </button>
            </div>
            {/* Mũi tên trỏ xuống */}
            <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-transparent border-t-white absolute -bottom-[7px] left-1/2 -translate-x-1/2 filter drop-shadow-sm"></div>
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

          <div className="mt-10 mb-2 flex items-center justify-center gap-4 opacity-80">
            <div className="w-16 md:w-32 h-[1px] bg-gradient-to-r from-transparent to-[#ab3429]/60"></div>
            <div className="w-1.5 h-1.5 rotate-45 bg-[#ab3429]"></div>
            <div className="w-16 md:w-32 h-[1px] bg-gradient-to-l from-transparent to-[#ab3429]/60"></div>
          </div>
        </div>

        {/* Typography chuẩn mực: Phân loại Thơ và Văn xuôi */}
        <div
          className={`w-full ${
            currentSection?.contentType !== 'POETRY'
              ? 'prose prose-lg md:prose-xl text-lg md:text-xl max-w-none text-[#231a0c] font-quote leading-[2.2] tracking-wide text-justify hyphens-auto first-letter:text-[72px] first-letter:font-title first-letter:font-black first-letter:text-[#ab3429] first-letter:mr-2 first-letter:float-left first-letter:mt-1 first-letter:leading-[0.85] first-letter:[text-shadow:2px_2px_4px_rgba(171,52,41,0.25)]'
              : ''
          }`}
        >
          {parsedParagraphs.map((p, pIdx) => {
            const isPoetry =
              currentSection?.contentType === 'POETRY' ||
              (currentSection?.contentType === 'MIXED' && p.isPoetry)

            const renderSegments = p.segments.map((seg, sIdx) => {
              if (seg.isMark) {
                const colorMap = {
                  YELLOW: 'bg-yellow-200',
                  GREEN: 'bg-green-200',
                  BLUE: 'bg-blue-200',
                  RED: 'bg-red-200',
                }
                return (
                  <mark
                    key={sIdx}
                    data-offset={seg.globalOffset}
                    className={`${colorMap[seg.note.color]} text-inherit bg-opacity-70 rounded-sm px-0.5 mx-px cursor-pointer hover:opacity-80 transition-opacity`}
                    onClick={(e) => {
                      e.stopPropagation()
                      const rect = e.target.getBoundingClientRect()
                      setActiveNote({
                        note: seg.note,
                        rect: {
                          top: rect.top - 40,
                          left: rect.left + rect.width / 2,
                        },
                      })
                      setSelectionRect(null)
                    }}
                  >
                    {renderTextWithHiddenTags(seg.text, seg.globalOffset)}
                  </mark>
                )
              }
              return (
                <span key={sIdx}>
                  {renderTextWithHiddenTags(seg.text, seg.globalOffset)}
                </span>
              )
            })

            if (isPoetry) {
              return (
                <div key={pIdx} className="flex justify-center my-8 w-full">
                  <div className="font-quote text-lg md:text-xl text-[#501b17] leading-[1.8] tracking-wide whitespace-pre-wrap italic opacity-95 text-left min-w-[200px] border-l-2 border-[#ab3429]/30 pl-6 py-2 relative">
                    <div className="absolute -left-[5px] top-0 w-2 h-2 rounded-full bg-[#ab3429]/20" />
                    <div className="absolute -left-[5px] bottom-0 w-2 h-2 rounded-full bg-[#ab3429]/20" />
                    {renderSegments}
                  </div>
                </div>
              )
            } else {
              return (
                <p key={pIdx} className="mb-6">
                  {renderSegments}
                </p>
              )
            }
          })}
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
            <div className="flex-1 flex flex-col items-center justify-center p-6 rounded-3xl bg-white/20 border border-[#83746d]/10 shadow-sm gap-4">
              <span className="text-[#50443e]/40 font-bold italic">
                Đã đọc hết tác phẩm
              </span>
              {!isCompleted && (
                <button
                  onClick={() => {
                    setIsCompleted(true)
                    upsertBookmark({
                      workId: work.id,
                      data: {
                        currentSectionId: currentSection.id,
                        position: currentSection.content?.length || 0,
                        progressPercent: 100,
                        isCompleted: true,
                      },
                    })
                  }}
                  className="px-6 py-2 bg-green-600 text-white rounded-full font-bold shadow hover:bg-green-700 transition"
                >
                  Đánh dấu hoàn thành
                </button>
              )}
              {isCompleted && (
                <span className="text-green-600 font-bold px-6 py-2 bg-green-50 rounded-full">
                  ✓ Đã hoàn thành
                </span>
              )}
            </div>
          )}
        </div>
      </article>
    </main>
  )
}
