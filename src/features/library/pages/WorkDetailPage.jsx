import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useWorkDetail } from '../hooks/useLibrary'
import {
  BookOpen,
  Sparkles,
  Loader2,
  Feather,
  ArrowLeft,
  BarChart3,
  Calendar,
} from 'lucide-react'

export const WorkDetailPage = () => {
  const { slug } = useParams()
  const { data: work, isLoading } = useWorkDetail(slug)
  const [activeTab, setActiveTab] = useState('tong-quan')

  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary/50" />
      </div>
    )

  if (!work)
    return (
      <div className="p-10 text-center font-title text-2xl">
        Không tìm thấy tác phẩm.
      </div>
    )

  return (
    <div className="bg-background min-h-screen font-body relative pb-16">
      <div className="absolute inset-0 opacity-30 watermark-pattern pointer-events-none"></div>

      <main className="max-w-5xl mx-auto px-6 py-8 relative z-10">
        <div className="mb-8">
          <Link
            to="/thu-vien"
            className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft size={20} /> Trở về Thư viện
          </Link>
        </div>

        <div className="flex flex-col md:flex-row gap-10 mb-16 items-start">
          <div className="w-full md:w-1/3 flex-shrink-0">
            <div className="aspect-[3/4] w-full rounded-[16px] overflow-hidden shadow-2xl border border-outline-variant/30 bg-surface-container-high">
              {work.coverUrl ? (
                <img
                  src={work.coverUrl}
                  alt={work.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-50">
                  <Feather size={64} className="text-primary" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center mt-4 md:mt-0">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-surface-container-high text-on-surface-variant px-4 py-1 rounded-full text-xs font-bold uppercase">
                {work.subGenre}
              </span>

              {/* TỐI ƯU UX: Thêm title và cursor-help */}
              <div className="flex items-center gap-4 text-xs text-on-surface-variant/70 font-medium">
                <span
                  className="flex items-center gap-1 cursor-help"
                  title="Số lượt đọc"
                >
                  <BarChart3 size={14} /> {work.viewCount || 0}
                </span>
                <span
                  className="flex items-center gap-1 cursor-help"
                  title="Năm xuất bản"
                >
                  <Calendar size={14} /> {work.publishYear || 'Không rõ'}
                </span>
              </div>
            </div>

            <h1 className="font-title text-5xl font-bold text-primary mb-1 leading-tight">
              {work.title}
            </h1>
            {work.originalTitle && (
              <p className="text-on-surface-variant/60 font-medium italic mb-2">
                Tên gốc: {work.originalTitle}
              </p>
            )}
            <h2 className="font-title text-2xl text-on-surface-variant mb-6">
              {work.authorSlug ? (
                <Link
                  to={`/tac-gia/${work.authorSlug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary hover:underline underline-offset-4 transition-colors cursor-pointer"
                >
                  {work.authorName}
                </Link>
              ) : (
                work.authorName
              )}
            </h2>

            <p className="text-on-surface-variant leading-relaxed text-lg mb-8 font-medium">
              {work.summary}
            </p>

            <div className="flex gap-4">
              {/* ======================================================= */}
              {/* PHẦN CODE ĐÃ SỬA BỞI THÀNH VIÊN C (UI Work Section)     */}
              {/* Mục đích: Chuyển nút Đọc Ngay thành thẻ Link trỏ sang ReadingPage */}
              <Link
                to={`/thu-vien/${slug}/doc`}
                className="bg-[#ab3429] text-white px-8 py-3.5 rounded-xl hover:bg-[#8a1c14] transition-all shadow-md font-bold flex items-center gap-2"
              >
                <BookOpen size={20} /> Đọc ngay
              </Link>
              {/* KẾT THÚC PHẦN CODE CỦA THÀNH VIÊN C                       */}
              {/* ======================================================= */}

              <button className="bg-[#004943] text-white px-8 py-3.5 rounded-xl hover:bg-[#02504a] transition-all shadow-md font-bold flex items-center gap-2">
                <Sparkles size={20} /> Hỏi chatbot
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Điều hướng*/}
        <div className="flex justify-center border-b border-outline-variant/30 mb-10 gap-12">
          {[
            { id: 'tong-quan', label: 'Tổng quan' },
            { id: 'nghe-thuat', label: 'Nghệ thuật' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === tab.id ? 'text-primary scale-105' : 'text-on-surface-variant hover:text-primary'}`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <span className="absolute bottom-0 left-0 w-full h-[2px] bg-primary rounded-t-md animate-in fade-in duration-300"></span>
              )}
            </button>
          ))}
        </div>

        {/* Nội dung Tabs */}
        <div className="min-h-[300px]">
          {activeTab === 'tong-quan' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="bg-white border border-outline-variant/20 rounded-[24px] p-8 md:p-10 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <Feather className="text-[#ab3429]" size={28} />
                  <h3 className="font-title text-3xl font-bold text-primary">
                    Hoàn cảnh sáng tác
                  </h3>
                </div>
                <p className="text-on-surface-variant leading-relaxed text-lg font-quote whitespace-pre-wrap">
                  {work.historicalContext}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#FAF3E7] rounded-[24px] p-8 border border-outline-variant/10">
                  <h4 className="font-title text-2xl font-bold text-primary mb-4">
                    Giá trị hiện thực
                  </h4>
                  <p className="text-on-surface-variant leading-relaxed">
                    {work.realisticValue}
                  </p>
                </div>
                <div className="bg-[#FAF3E7] rounded-[24px] p-8 border border-outline-variant/10">
                  <h4 className="font-title text-2xl font-bold text-primary mb-4">
                    Giá trị nhân đạo
                  </h4>
                  <p className="text-on-surface-variant leading-relaxed">
                    {work.humanisticValue}
                  </p>
                </div>
              </div>

              {work.famousQuote && (
                <div className="bg-[#EAECE6] rounded-[24px] p-10 mt-12 text-center border border-outline-variant/20">
                  <p className="font-quote text-2xl md:text-3xl text-[#004943] italic leading-relaxed mb-4">
                    "{work.famousQuote}"
                  </p>
                  <p className="text-[#004943] font-bold">
                    – {work.quoteAttribution}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'nghe-thuat' && (
            <div className="bg-white border border-outline-variant/20 rounded-[24px] p-8 md:p-10 shadow-sm animate-in fade-in duration-500">
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="text-[#ab3429]" size={28} />
                <h3 className="font-title text-3xl font-bold text-primary">
                  Đặc sắc nghệ thuật
                </h3>
              </div>
              <p className="text-on-surface-variant leading-relaxed text-lg font-quote whitespace-pre-wrap">
                {work.artisticValue || 'Đang cập nhật nội dung nghệ thuật...'}
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
