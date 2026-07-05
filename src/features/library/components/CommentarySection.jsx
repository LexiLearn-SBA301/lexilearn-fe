import { useState } from 'react'
import {
  MessageSquare,
  Calendar,
  Link as LinkIcon,
  Star,
  User,
} from 'lucide-react'
import { useGetPublicCommentaries } from '../hooks/useCommentary'

const COMMENTATOR_MAP = {
  CRITIC: 'Nhà phê bình',
  SCHOLAR: 'Học giả',
  WRITER: 'Nhà văn',
  TEACHER: 'Giáo viên',
  EDITORIAL: 'Ban biên tập',
  READER: 'Độc giả',
}

export const CommentarySection = ({ workId, isFocusMode }) => {
  const [page, setPage] = useState(0)
  const size = 5

  const { data, isLoading, isError } = useGetPublicCommentaries(workId, {
    page,
    size,
    sortDir: 'asc',
    sortBy: 'displayOrder',
  })

  if (isLoading) {
    return (
      <div
        className={`mt-16 pt-10 border-t flex justify-center ${isFocusMode ? 'border-white/10' : 'border-[#83746d]/20'}`}
      >
        <div className="animate-pulse flex gap-2 items-center text-[#ab3429]">
          <MessageSquare size={20} />
          <span>Đang tải bình phẩm...</span>
        </div>
      </div>
    )
  }

  if (isError || !data || !data.content || data.content.length === 0) {
    return null // Ẩn phần này nếu không có bình phẩm
  }

  const { content: commentaries, totalPages } = data

  return (
    <div
      className={`mt-20 pt-16 border-t ${isFocusMode ? 'border-white/10 text-[#d4d4d4]' : 'border-[#83746d]/20 text-[#2b211c]'}`}
    >
      <div className="flex items-center gap-3 mb-10">
        <div
          className={`p-3 rounded-xl ${isFocusMode ? 'bg-[#ff7261]/20 text-[#ff7261]' : 'bg-[#ab3429]/10 text-[#ab3429]'}`}
        >
          <MessageSquare size={24} />
        </div>
        <h3
          className={`font-title text-3xl font-extrabold ${isFocusMode ? 'text-white' : 'text-[#412311]'}`}
        >
          Bình phẩm & Nhận định
        </h3>
      </div>

      <div className="space-y-8">
        {commentaries.map((commentary) => (
          <div
            key={commentary.id}
            className={`p-6 md:p-8 rounded-3xl relative border transition-all ${
              commentary.isFeatured
                ? isFocusMode
                  ? 'bg-gradient-to-br from-[#ff7261]/10 to-transparent border-[#ff7261]/30'
                  : 'bg-gradient-to-br from-[#ab3429]/5 to-transparent border-[#ab3429]/20'
                : isFocusMode
                  ? 'bg-white/5 border-white/10'
                  : 'bg-white/60 border-[#83746d]/10'
            }`}
          >
            {commentary.isFeatured && (
              <div
                className={`absolute top-0 right-8 -translate-y-1/2 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm ${
                  isFocusMode
                    ? 'bg-[#ff7261] text-white'
                    : 'bg-[#ab3429] text-white'
                }`}
              >
                <Star size={12} className="fill-current" />
                <span>Nổi bật</span>
              </div>
            )}

            {commentary.title && (
              <h4
                className={`text-xl font-bold mb-4 ${isFocusMode ? 'text-[#ff7261]' : 'text-[#8a1c14]'}`}
              >
                {commentary.title}
              </h4>
            )}

            <div
              className={`text-lg md:text-xl font-quote leading-relaxed mb-6 italic border-l-4 pl-4 ${
                isFocusMode
                  ? 'border-[#ff7261]/40 text-[#e8e6e3]'
                  : 'border-[#ab3429]/40 text-[#50443e]'
              }`}
            >
              {commentary.content.split('\n').map((para, i) => (
                <p key={i} className="mb-2 last:mb-0">
                  {para}
                </p>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mt-6 pt-4 border-t border-current border-opacity-10 text-sm font-medium opacity-80">
              <div className="flex items-center gap-2">
                <User size={16} />
                <span className="font-bold">{commentary.commentatorName}</span>
                <span className="opacity-60">
                  ({COMMENTATOR_MAP[commentary.commentatorType] || 'Khác'})
                </span>
              </div>

              {(commentary.sourceTitle || commentary.publishedYear) && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>
                    Trích từ{' '}
                    <span className="italic">
                      "{commentary.sourceTitle || 'Không rõ nguồn'}"
                    </span>
                    {commentary.publishedYear
                      ? ` (${commentary.publishedYear})`
                      : ''}
                  </span>
                </div>
              )}

              {commentary.sourceUrl && (
                <a
                  href={commentary.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:underline decoration-dashed underline-offset-4"
                >
                  <LinkIcon size={14} />
                  <span>Xem nguồn gốc</span>
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-10">
          <button
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isFocusMode
                ? 'bg-white/10 hover:bg-white/20'
                : 'bg-[#412311]/5 hover:bg-[#412311]/10'
            }`}
          >
            Trang trước
          </button>
          <span className="text-sm font-bold opacity-60">
            {page + 1} / {totalPages}
          </span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
            className={`px-4 py-2 rounded-full font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              isFocusMode
                ? 'bg-white/10 hover:bg-white/20'
                : 'bg-[#412311]/5 hover:bg-[#412311]/10'
            }`}
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  )
}
