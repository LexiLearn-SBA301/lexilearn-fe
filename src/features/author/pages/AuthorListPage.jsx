import { useState } from 'react'
import { useAuthors } from '../hooks/useAuthor'
import { AuthorCard } from '../components/AuthorCard'
import { Loader2, Search } from 'lucide-react'

export const AuthorListPage = () => {
  const [searchQuery, setSearchQuery] = useState('')

  // TRẢ VALUE VỀ KHỚP VỚI DATABASE
  const PERIOD_OPTIONS = [
    { label: 'Văn học dân gian', value: 'dan_gian' },
    { label: 'Văn học trung đại', value: 'trung_dai' },
    { label: 'Văn học hiện đại', value: 'hien_dai' },
  ]

  // ĐỔI STATE TỪ MẢNG SANG CHUỖI ĐỂ TRUYỀN LÊN API
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [appliedPeriod, setAppliedPeriod] = useState('')

  const [currentPage, setCurrentPage] = useState(0)
  // Khớp với lưới bên dưới (2 cột ở sm, 3 cột ở xl) -> 6 lấp đầy trang, không để ô trống
  const ITEMS_PER_PAGE = 6

  const { data: authorsPage, isLoading } = useAuthors({
    search: searchQuery,
    period: appliedPeriod || undefined,
    page: currentPage,
    size: ITEMS_PER_PAGE,
    sort: 'name,asc',
  })

  const displayedAuthors = authorsPage?.content || []
  const totalPages = authorsPage?.totalPages || 0

  const toggleSelection = (value) => {
    setSelectedPeriod((prev) => (prev === value ? '' : value))
  }

  const handleApplyFilter = () => {
    setAppliedPeriod(selectedPeriod)
    setCurrentPage(0)
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(0)
  }

  return (
    <div className="bg-background text-on-surface-variant min-h-screen font-body w-full">
      <div className="absolute inset-0 opacity-30 watermark-pattern pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 pt-12 pb-16 relative z-10">
        <div className="text-center mb-12">
          <h1 className="font-title text-4xl md:text-5xl font-bold text-primary mb-4">
            Tác giả văn học Việt Nam
          </h1>
          <p className="text-lg text-on-surface-variant mb-8">
            Gặp gỡ những tâm hồn lớn đã đặt nền móng cho nền văn chương dân tộc.
          </p>

          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={20} className="text-outline-variant" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm tên tác giả..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full bg-white border border-outline-variant/40 text-primary rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-tertiary-container transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-[260px] flex-shrink-0">
            <div className="bg-bright-cream border border-outline-variant/30 rounded-[24px] p-6 sticky top-8 h-fit">
              <h2 className="font-title text-2xl font-bold text-primary mb-1">
                Bộ lọc
              </h2>

              <div className="mt-6 mb-6">
                <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">
                  Thời kỳ
                </h3>
                <div className="flex flex-col gap-3">
                  {PERIOD_OPTIONS.map((p) => (
                    <label
                      key={p.value}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPeriod === p.value}
                        onChange={() => toggleSelection(p.value)}
                        className="w-4 h-4 rounded border-outline-variant text-[#ab3429] focus:ring-[#ab3429] bg-transparent cursor-pointer"
                      />
                      <span className="text-sm font-medium group-hover:text-primary">
                        {p.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <button
                onClick={handleApplyFilter}
                className="w-full bg-[#ab3429] text-white py-3 rounded-xl font-bold hover:bg-[#8a1c14] transition-colors text-sm shadow-md mt-4"
              >
                Áp dụng bộ lọc
              </button>
            </div>
          </aside>

          <section className="flex-grow min-w-0 flex flex-col min-h-[calc(100vh-350px)]">
            {isLoading ? (
              <div className="flex flex-grow items-center justify-center min-h-[400px]">
                <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
              </div>
            ) : displayedAuthors.length === 0 ? (
              <div className="flex flex-grow items-center justify-center min-h-[400px] rounded-[24px] border border-dashed border-outline-variant bg-surface">
                <p className="text-on-surface-variant font-medium">
                  Không tìm thấy tác giả nào.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {displayedAuthors.map((author) => (
                    <AuthorCard key={author.id} author={author} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="mt-auto pt-12">
                    <div className="flex justify-center items-center gap-6 mb-4 border-t border-outline-variant/30 pt-8">
                      <button
                        onClick={() => {
                          setCurrentPage((prev) => prev - 1)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        disabled={currentPage === 0}
                        className="px-6 py-2.5 rounded-xl font-bold border border-[#ab3429]/20 text-[#ab3429] hover:bg-[#ab3429]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer"
                      >
                        &larr; Trang trước
                      </button>

                      <div className="text-sm font-medium text-on-surface-variant bg-surface-container-lowest px-4 py-2 rounded-lg border border-outline-variant/20 shadow-sm">
                        Trang{' '}
                        <span className="font-bold text-primary">
                          {currentPage + 1}
                        </span>{' '}
                        / {totalPages}
                      </div>

                      <button
                        onClick={() => {
                          setCurrentPage((prev) => prev + 1)
                          window.scrollTo({ top: 0, behavior: 'smooth' })
                        }}
                        disabled={currentPage >= totalPages - 1}
                        className="px-6 py-2.5 rounded-xl font-bold border border-[#ab3429]/20 text-[#ab3429] hover:bg-[#ab3429]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2 cursor-pointer"
                      >
                        Trang sau &rarr;
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
