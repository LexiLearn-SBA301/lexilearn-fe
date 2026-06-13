import { useState, useMemo } from 'react'
import { useAuthors } from '../hooks/useAuthor'
import { AuthorCard } from '../components/AuthorCard'
import { Loader2, Search } from 'lucide-react'

export const AuthorListPage = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const PERIOD_OPTIONS = [
    { label: 'Văn học dân gian', value: 'dan_gian' },
    { label: 'Văn học trung đại', value: 'trung_dai' },
    { label: 'Văn học hiện đại', value: 'hien_dai' },
  ]

  /* 
  const GENRE_OPTIONS = [
    { label: 'Thơ ca', value: 'tho_ca' },
    { label: 'Truyện ngắn', value: 'truyen_ngan' },
    { label: 'Tiểu thuyết', value: 'tieu_thuyet' }
  ];
  */

  const [selectedPeriods, setSelectedPeriods] = useState([])
  // const [selectedGenres, setSelectedGenres] = useState([]); // [TƯƠNG LAI]

  const [appliedFilters, setAppliedFilters] = useState({
    periods: [] /*, genres: [] */,
  })

  const { data: authorsPage, isLoading } = useAuthors({ search: searchQuery })

  // 2. LOGIC FILTER
  const filteredAuthors = useMemo(() => {
    if (!authorsPage?.content) return []

    return authorsPage.content.filter((author) => {
      const matchPeriod =
        appliedFilters.periods.length === 0 ||
        appliedFilters.periods.includes(author.period)

      /* 
      const matchGenre = appliedFilters.genres.length === 0 || appliedFilters.genres.includes(author.genre);
      return matchPeriod && matchGenre;
      */

      return matchPeriod
    })
  }, [authorsPage, appliedFilters])

  // Hàm toggle checkbox
  const toggleSelection = (value, type) => {
    if (type === 'period') {
      setSelectedPeriods((prev) =>
        prev.includes(value)
          ? prev.filter((i) => i !== value)
          : [...prev, value],
      )
    }
    /* 
    else {
      setSelectedGenres(prev => prev.includes(value) ? prev.filter(i => i !== value) : [...prev, value]);
    } 
    */
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
              placeholder="Tìm kiếm tác giả..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-outline-variant/40 text-primary rounded-2xl py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-tertiary-container transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-[260px] flex-shrink-0">
            <div className="bg-bright-cream border border-outline-variant/30 rounded-[24px] p-6 sticky top-8">
              <h2 className="font-title text-2xl font-bold text-primary mb-1">
                Bộ lọc
              </h2>
              <p className="text-xs text-on-surface-variant mb-6">
                Khám phá theo chuyên mục
              </p>

              {/* FILTER THỜI KỲ */}
              <div className="mb-6">
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
                        checked={selectedPeriods.includes(p.value)}
                        onChange={() => toggleSelection(p.value, 'period')}
                        className="w-4 h-4 rounded border-outline-variant text-[#ab3429] focus:ring-[#ab3429] bg-transparent"
                      />
                      <span className="text-sm font-medium group-hover:text-primary">
                        {p.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/*  FILTER THỂ LOẠI */}
              {/* <div className="mb-8">
                <h3 className="text-sm font-bold text-primary mb-3 uppercase tracking-wider">Thể loại</h3>
                <div className="flex flex-col gap-3">
                  {GENRE_OPTIONS.map((g) => (
                    <label key={g.value} className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={selectedGenres.includes(g.value)}
                        onChange={() => toggleSelection(g.value, 'genre')}
                        className="w-4 h-4 rounded border-outline-variant text-[#ab3429] focus:ring-[#ab3429] bg-transparent" 
                      />
                      <span className="text-sm font-medium group-hover:text-primary">{g.label}</span>
                    </label>
                  ))}
                </div>
              </div>
              */}

              {/* NÚT ÁP DỤNG BỘ LỌC */}
              <button
                onClick={() =>
                  setAppliedFilters({
                    periods: selectedPeriods /*, genres: selectedGenres */,
                  })
                }
                className="w-full bg-[#ab3429] text-white py-3 rounded-xl font-bold hover:bg-[#8a1c14] transition-colors text-sm shadow-md mt-4"
              >
                Áp dụng bộ lọc
              </button>
            </div>
          </aside>

          <section className="flex-grow min-w-0">
            {isLoading ? (
              <div className="flex min-h-[400px] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary/50" />
              </div>
            ) : filteredAuthors.length === 0 ? (
              <div className="flex min-h-[400px] items-center justify-center rounded-[24px] border border-dashed border-outline-variant bg-surface">
                <p className="text-on-surface-variant font-medium">
                  Không tìm thấy tác giả nào.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredAuthors.map((author) => (
                  <AuthorCard key={author.id} author={author} />
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
}
