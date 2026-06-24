import { useState } from 'react'
import { useWorks } from '../hooks/useLibrary'
import { useTags } from '../../tag/hooks/useTag'
import { BookCard } from '../components/BookCard'
import {
  Loader2,
  X,
  BookOpen,
  ScrollText,
  Feather,
  LibraryBig,
} from 'lucide-react'

export const LibraryPage = () => {
  // 1. STATE BỘ LỌC SIDEBAR (Cần bấm Áp dụng)
  const [tempGenre, setTempGenre] = useState('')
  const [tempPeriods, setTempPeriods] = useState([])
  const [appliedFilters, setAppliedFilters] = useState({
    genre: '',
    periods: [],
  })
  const [activeTag, setActiveTag] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  // Gọi API
  const { data: tags } = useTags({ size: 1000 })
  const { data: worksPage, isLoading: isLoadingWorks } = useWorks({
    genre: appliedFilters.genre || undefined,
    period:
      appliedFilters.periods.length > 0
        ? appliedFilters.periods.join(',')
        : undefined,
    tag: activeTag || undefined, // Đảm bảo API Backend bác đang nhận param tên là "tag" nhé
    // sort: sortBy,
    page: currentPage,
    size: 3,
  })

  // DATA CỨNG CHO SIDEBAR
  const genres = [
    { label: 'Truyện ngắn', value: 'Truyện ngắn', icon: BookOpen },
    { label: 'Thơ ca', value: 'Thơ ca', icon: Feather },
    { label: 'Tiểu thuyết', value: 'Tiểu thuyết', icon: ScrollText },
  ]

  const periods = [
    { label: 'Văn học dân gian', value: 'dan_gian' },
    { label: 'Văn học trung đại', value: 'trung_dai' },
    { label: 'Văn học hiện đại', value: 'hien_dai' },
  ]

  // Hàm xóa filter bên sidebar
  const removeFilter = (type, value) => {
    setCurrentPage(0)
    if (type === 'genre') {
      setTempGenre('')
      setAppliedFilters((prev) => ({ ...prev, genre: '' }))
    } else {
      const newPeriods = tempPeriods.filter((p) => p !== value)
      setTempPeriods(newPeriods)
      setAppliedFilters((prev) => ({ ...prev, periods: newPeriods }))
    }
  }
  return (
    <div className="bg-background min-h-screen flex px-6 w-full max-w-[1440px] mx-auto py-8 gap-10 lg:gap-12">
      {/* SIDEBAR BỘ LỌC */}
      <aside className="w-[280px] flex-shrink-0 sticky top-8 h-fit">
        <div className="mb-8">
          <h1 className="font-title text-4xl font-bold text-primary mb-2">
            Thư viện
          </h1>
          <p className="text-sm text-on-surface-variant">
            Khám phá di sản văn học Việt Nam.
          </p>
        </div>

        <div className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant/20">
          <h2 className="font-title font-bold text-lg mb-4 text-primary">
            Bộ lọc di sản
          </h2>

          {/* Thể loại */}
          <div className="mb-6">
            <button
              onClick={() => setTempGenre('')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm mb-2 font-medium ${tempGenre === '' ? 'bg-[#004943] text-white shadow-md' : 'hover:bg-surface-container-high text-on-surface-variant'}`}
            >
              <LibraryBig size={18} /> Tất cả thể loại
            </button>
            {genres.map((g) => {
              const Icon = g.icon
              return (
                <button
                  key={g.value}
                  onClick={() => setTempGenre(g.value)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm mb-2 font-medium transition-colors ${tempGenre === g.value ? 'bg-[#004943] text-white shadow-md' : 'hover:bg-surface-container-high text-on-surface-variant'}`}
                >
                  <Icon size={18} /> {g.label}
                </button>
              )
            })}
          </div>

          {/* Thời kỳ */}
          <div className="mb-8">
            <h3 className="font-bold text-sm mb-3 text-primary">Thời kỳ</h3>
            {periods.map((p) => (
              <label
                key={p.value}
                className="flex items-center gap-3 py-2 cursor-pointer group"
              >
                <input
                  type="checkbox"
                  checked={tempPeriods.includes(p.value)}
                  onChange={() =>
                    setTempPeriods((prev) =>
                      prev.includes(p.value)
                        ? prev.filter((i) => i !== p.value)
                        : [...prev, p.value],
                    )
                  }
                  className="w-4 h-4 rounded border-outline-variant accent-[#004943] focus:ring-[#004943]"
                />
                <span className="text-sm font-medium text-on-surface-variant group-hover:text-primary transition-colors">
                  {p.label}
                </span>
              </label>
            ))}
          </div>

          <button
            onClick={() => {
              setAppliedFilters({ genre: tempGenre, periods: tempPeriods })
              setCurrentPage(0)
            }}
            className="w-full bg-[#EAECE6] text-primary py-3 rounded-xl font-bold hover:bg-[#d2d6ce] transition-colors shadow-sm"
          >
            Áp dụng bộ lọc
          </button>
        </div>
      </aside>

      {/* CONTENT CHÍNH */}
      <section className="flex-[1_1_0%] min-w-0 flex flex-col w-full">
        {/* THANH TOP: BREADCRUMB, BỘ SƯU TẬP & SẮP XẾP */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
          {/* BÊN TRÁI: Breadcrumbs lọc Sidebar */}
          <div className="flex items-center gap-2 flex-wrap min-h-[32px]">
            <span className="text-sm text-on-surface-variant font-medium">
              Đang lọc theo:
            </span>
            {!(appliedFilters.genre || appliedFilters.periods.length > 0) && (
              <span className="text-sm font-bold text-primary">Tất cả</span>
            )}

            {appliedFilters.genre && (
              <span className="bg-[#004943]/10 text-[#004943] px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 border border-[#004943]/20">
                {genres.find((g) => g.value === appliedFilters.genre)?.label}
                <X
                  size={14}
                  className="cursor-pointer hover:bg-[#004943]/20 rounded-full p-0.5 transition-colors"
                  onClick={() => removeFilter('genre')}
                />
              </span>
            )}
            {appliedFilters.periods.map((p) => {
              return (
                <span
                  key={p}
                  className="bg-[#004943]/10 text-[#004943] px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 border border-[#004943]/20"
                >
                  {periods.find((pe) => pe.value === p)?.label}
                  <X
                    size={14}
                    className="cursor-pointer hover:bg-[#004943]/20 rounded-full p-0.5 transition-colors"
                    onClick={() => removeFilter('period', p)}
                  />
                </span>
              )
            })}
          </div>

          {/* BÊN PHẢI: Nhóm Dropdown (Bộ sưu tập + Sắp xếp) */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Dropdown Bộ sưu tập */}
            <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-xl border border-outline-variant/30 shadow-sm">
              <span className="text-xs font-medium text-on-surface-variant whitespace-nowrap">
                Bộ sưu tập:
              </span>
              <select
                value={activeTag}
                onChange={(e) => {
                  setActiveTag(e.target.value)
                  setCurrentPage(0)
                }}
                className="text-sm border-none bg-transparent font-bold text-primary focus:ring-0 cursor-pointer outline-none max-w-[140px] truncate"
              >
                <option value="">Tất cả sách</option>

                {/* Kiểm tra tags và tags.content trước khi map */}
                {tags?.content && tags.content.length > 0 ? (
                  tags.content.map((t) => (
                    <option key={t.id} value={t.slug}>
                      {t.name}
                    </option>
                  ))
                ) : (
                  <option disabled>Đang tải danh mục...</option>
                )}
              </select>
            </div>

            {/* Dropdown Sắp xếp
            <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-xl border border-outline-variant/30 shadow-sm">
              <span className="text-xs font-medium text-on-surface-variant whitespace-nowrap">
                Sắp xếp:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="text-sm border-none bg-transparent font-bold text-primary focus:ring-0 cursor-pointer outline-none"
              >
                <option value="viewCount,desc">Nổi bật nhất</option>
                <option value="createdAt,desc">Mới thêm gần đây</option>
                <option value="title,asc">Tên (A-Z)</option>
              </select>
            </div> */}
          </div>
        </div>

        {/* LƯỚI TÁC PHẨM */}
        <div className="w-full flex flex-col flex-grow min-h-[calc(100vh-250px)]">
          {isLoadingWorks ? (
            <div className="w-full flex flex-col items-center justify-center flex-grow py-20">
              <Loader2
                className="animate-spin text-primary/60 mb-4"
                size={36}
              />
              <p className="text-sm text-on-surface-variant italic font-medium">
                Đang tải tàng thư...
              </p>
            </div>
          ) : worksPage?.content?.length === 0 ? (
            <div className="w-full flex flex-col items-center justify-center flex-grow border-2 border-dashed border-outline-variant/40 rounded-[24px] bg-surface-container-lowest/50 mt-4 min-h-[400px]">
              <LibraryBig
                className="text-outline-variant mb-4"
                size={48}
                strokeWidth={1}
              />
              <p className="text-on-surface-variant font-medium text-lg">
                Không tìm thấy tác phẩm nào phù hợp.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {worksPage?.content?.map((w) => (
                  <BookCard key={w.id} work={w} />
                ))}
              </div>

              {worksPage?.totalPages > 1 && (
                <div className="mt-auto pt-12">
                  <div className="flex justify-center items-center gap-6 mb-8 border-t border-outline-variant/30 pt-8">
                    <button
                      onClick={() => {
                        setCurrentPage((prev) => prev - 1)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      disabled={worksPage.first}
                      className="px-6 py-2.5 rounded-xl font-bold border border-[#004943]/20 text-[#004943] hover:bg-[#004943]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      &larr; Trang trước
                    </button>

                    <div className="text-sm font-medium text-on-surface-variant bg-surface-container-lowest px-4 py-2 rounded-lg border border-outline-variant/20 shadow-sm">
                      Trang{' '}
                      <span className="font-bold text-primary">
                        {worksPage.number + 1}
                      </span>{' '}
                      / {worksPage.totalPages}
                    </div>

                    <button
                      onClick={() => {
                        setCurrentPage((prev) => prev + 1)
                        window.scrollTo({ top: 0, behavior: 'smooth' })
                      }}
                      disabled={worksPage.last}
                      className="px-6 py-2.5 rounded-xl font-bold border border-[#004943]/20 text-[#004943] hover:bg-[#004943]/10 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                    >
                      Trang sau &rarr;
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  )
}
