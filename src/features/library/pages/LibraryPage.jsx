import { useState } from 'react'
import { useTags, useWorks } from '../hooks/useLibrary'
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
  const [sortBy, setSortBy] = useState('viewCount,desc')

  // Gọi API
  const { data: tags } = useTags()
  const { data: worksPage, isLoading: isLoadingWorks } = useWorks({
    genre: appliedFilters.genre || undefined,
    period:
      appliedFilters.periods.length > 0
        ? appliedFilters.periods.join(',')
        : undefined,
    tag: activeTag || undefined,
    sort: sortBy,
    page: 0,
    size: 24,
  })

  // DATA CỨNG CHO SIDEBAR
  const genres = [
    { label: 'Truyện ngắn', value: 'truyen_ngan', icon: BookOpen },
    { label: 'Thơ ca', value: 'tho_ca', icon: Feather },
    { label: 'Kịch bản', value: 'kich_ban', icon: ScrollText },
    { label: 'Khảo cứu', value: 'khao_cuu', icon: LibraryBig },
  ]

  const periods = [
    { label: 'Văn học dân gian', value: 'dan_gian' },
    { label: 'Văn học trung đại', value: 'trung_dai' },
    { label: 'Văn học hiện đại', value: 'hien_dai' },
  ]

  // Hàm xóa filter bên sidebar
  const removeFilter = (type, value) => {
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
    <div className="bg-background min-h-screen flex px-6 max-w-7xl mx-auto py-8 gap-8">
      {/* SIDEBAR BỘ LỌC */}
      <aside className="w-[280px] flex-shrink-0">
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
            onClick={() =>
              setAppliedFilters({ genre: tempGenre, periods: tempPeriods })
            }
            className="w-full bg-[#EAECE6] text-primary py-3 rounded-xl font-bold hover:bg-[#d2d6ce] transition-colors shadow-sm"
          >
            Áp dụng bộ lọc
          </button>
        </div>
      </aside>

      {/* CONTENT CHÍNH */}
      <section className="flex-grow min-w-0 flex flex-col">
        {/* THANH TOP: BREADCRUMB & SẮP XẾP */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          {/* Breadcrumbs lọc Sidebar */}
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

          {/* Dropdown Sắp xếp */}
          <div className="flex items-center gap-2 bg-surface-container-lowest px-4 py-2 rounded-xl border border-outline-variant/30 shadow-sm">
            <span className="text-xs font-medium text-on-surface-variant">
              Sắp xếp:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm border-none bg-transparent font-bold text-primary focus:ring-0 cursor-pointer outline-none"
            >
              <option value="view_count,desc">Nổi bật nhất</option>
              <option value="created_at,desc">Mới thêm gần đây</option>
              <option value="title,asc">Tên (A-Z)</option>
            </select>
          </div>
        </div>

        {/* BỘ SƯU TẬP (TAGS) - HIỂN THỊ DẠNG CHIPS */}
        <div className="mb-6">
          <div className="flex items-center gap-3 overflow-x-auto custom-scrollbar pb-2">
            <button
              onClick={() => setActiveTag('')}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                activeTag === ''
                  ? 'bg-surface-container-lowest border-outline-variant shadow-sm text-primary'
                  : 'bg-transparent border-transparent text-on-surface-variant hover:bg-surface-container-low'
              }`}
            >
              Tất cả sách
            </button>
            {tags?.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTag(t.slug)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border ${
                  activeTag === t.slug
                    ? 'bg-surface-container-lowest border-outline-variant shadow-sm text-primary'
                    : 'bg-transparent border-transparent text-on-surface-variant hover:bg-surface-container-low'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        {/* LƯỚI TÁC PHẨM */}
        <div className="min-h-[600px] relative">
          {isLoadingWorks ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Loader2
                className="animate-spin text-primary/60 mb-4"
                size={36}
              />
              <p className="text-sm text-on-surface-variant italic font-medium">
                Đang tải tàng thư...
              </p>
            </div>
          ) : worksPage?.content?.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-outline-variant/40 rounded-[24px] bg-surface-container-lowest/50">
              <LibraryBig
                className="text-outline-variant mb-4"
                size={48}
                strokeWidth={1}
              />
              <p className="text-on-surface-variant font-medium">
                Không tìm thấy tác phẩm nào phù hợp.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {worksPage?.content?.map((w) => (
                <BookCard key={w.id} work={w} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
