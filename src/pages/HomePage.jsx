import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchWorks } from '../services/library.service'
import { useChatStore } from '../features/library/store/chat.store'
import { Search, BookOpen, Sparkles, Loader2 } from 'lucide-react' // Đã bỏ Mic

export const HomePage = () => {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const navigate = useNavigate()
  const openChat = useChatStore((state) => state.openChat)

  const { data: featuredWorks, isLoading: isFeaturedLoading } = useQuery({
    queryKey: ['featured-works'],
    queryFn: () => fetchWorks({ sort: 'viewCount,desc', size: 3, page: 0 }),
  })

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearch(value)
    if (!value.trim()) {
      setResults([])
    }
  }

  useEffect(() => {
    if (!search.trim()) return

    const handler = setTimeout(async () => {
      setIsSearching(true)
      try {
        const data = await fetchWorks({ search: search, size: 5 })
        setResults(data.content || [])
      } catch (error) {
        console.error('Lỗi tìm kiếm:', error)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => clearTimeout(handler)
  }, [search])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/thu-vien?search=${search}`)
  }

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center bg-[#fff9ef] relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03] watermark-pattern pointer-events-none"></div>

      <main className="max-w-5xl mx-auto px-6 w-full flex flex-col md:flex-row items-center gap-12 relative z-10 py-20">
        <div className="flex-1 space-y-8">
          <h1 className="font-title text-5xl md:text-6xl font-bold text-primary leading-tight">
            Khám phá kho tàng văn học Việt Nam bằng một cách hoàn toàn mới
          </h1>
          <p className="text-lg text-on-surface-variant leading-relaxed">
            Đắm chìm vào di sản văn chương dân tộc với sự đồng hành của AI
            Chatbot thông minh. Phân tích sâu sắc, gợi ý cá nhân hóa và trải
            nghiệm đọc tinh tế.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/thu-vien')}
              className="px-8 py-4 bg-[#ab3429] text-white rounded-xl font-bold hover:bg-[#8a1c14] transition-all flex items-center gap-2"
            >
              <BookOpen size={20} /> Bắt đầu đọc
            </button>
            <button
              onClick={() => openChat()}
              className="px-8 py-4 bg-transparent border-2 border-primary text-primary rounded-xl font-bold hover:bg-primary/5 transition-all flex items-center gap-2"
            >
              <Sparkles size={20} /> Hỏi chatbot
            </button>
          </div>
        </div>

        <div className="hidden md:block flex-1">
          <div className="aspect-square bg-surface-container-high rounded-[40px] flex items-center justify-center shadow-2xl border border-white/50 overflow-hidden">
            {/* Bạn thay ảnh phù hợp ở đây */}
          </div>
        </div>
      </main>

      <div className="w-full max-w-3xl px-6 pb-20 relative">
        <form onSubmit={handleSearchSubmit} className="relative group">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm tác phẩm..."
            // Chỉnh pr-14 cho cân đối
            className="w-full bg-white border border-outline-variant/30 text-primary rounded-2xl py-5 pl-14 pr-14 shadow-lg focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
          />
          <Search
            className="absolute left-5 top-1/2 -translate-y-1/2 text-outline-variant"
            size={24}
          />

          {isSearching && (
            <Loader2
              className="absolute right-5 top-1/2 -translate-y-1/2 animate-spin text-primary"
              size={20}
            />
          )}
        </form>

        {results.length > 0 && (
          <div className="absolute w-[calc(100%-48px)] mt-2 bg-white rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden z-50">
            {results.map((work) => (
              <button
                key={work.id}
                onClick={() => navigate(`/thu-vien/${work.slug}`)}
                className="w-full text-left px-6 py-4 hover:bg-surface-container-high transition-colors border-b border-outline-variant/10 last:border-0"
              >
                <div className="font-semibold text-primary">{work.title}</div>
                <div className="text-xs text-on-surface-variant/70">
                  {work.authorName}
                </div>
              </button>
            ))}
          </div>
        )}

        {!search && (
          <div className="mt-6 text-center text-sm text-on-surface-variant/80 h-8 flex items-center justify-center gap-2">
            {isFeaturedLoading ? (
              <Loader2 className="animate-spin text-primary" size={16} />
            ) : (
              <>
                <span className="mr-2">Gợi ý nổi bật:</span>
                {featuredWorks?.content?.map((work) => (
                  <button
                    key={work.id}
                    onClick={() => navigate(`/thu-vien/${work.slug}`)}
                    className="px-4 py-1 bg-white border border-outline-variant/20 rounded-full hover:border-secondary hover:text-secondary transition-all"
                  >
                    {work.title}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
