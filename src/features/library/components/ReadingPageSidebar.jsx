import { Link } from 'react-router-dom'
import {
  Loader2,
  X,
  BookOpen,
  ChevronDown,
  Route,
  Feather,
  ImageIcon,
  LayoutTemplate,
  Star,
  Sparkles,
  ArrowLeft,
} from 'lucide-react'

const FEATURE_MAP = {
  NARRATIVE: {
    icon: Route,
    color: 'text-[#412311]',
    border: 'border-[#412311]/15',
    label: 'Cốt truyện & Tự sự',
  },
  LANGUAGE: {
    icon: Feather,
    color: 'text-[#ab3429]',
    border: 'border-[#ab3429]/15',
    label: 'Ngôn từ & Giọng điệu',
  },
  IMAGERY: {
    icon: ImageIcon,
    color: 'text-[#004943]',
    border: 'border-[#004943]/15',
    label: 'Hình ảnh & Biểu tượng',
  },
  STRUCTURE: {
    icon: LayoutTemplate,
    color: 'text-[#83746d]',
    border: 'border-[#83746d]/20',
    label: 'Bố cục & Cấu trúc',
  },
  SYMBOLISM: {
    icon: Star,
    color: 'text-[#b45309]',
    border: 'border-[#b45309]/20',
    label: 'Ý nghĩa biểu trưng',
  },
  DEFAULT: {
    icon: Sparkles,
    color: 'text-[#ab3429]',
    border: 'border-[#ab3429]/15',
    label: 'Đặc sắc nghệ thuật',
  },
}

export const ReadingPageSidebar = ({
  work,
  slug,
  sections,
  currentSectionId,
  handleNavigate,
  artisticFeatures,
  isFeaturesLoading,
  characters,
  isCharactersLoading,
  isSidebarOpen,
  setIsSidebarOpen,
  sidebarTab,
  setSidebarTab,
  featureFilter,
  setFeatureFilter,
  isFilterDropdownOpen,
  setIsFilterDropdownOpen,
  sidebarWidth,
  handleResizeStart,
  isPurePoetry,
  activeSectionId,
}) => {
  return (
    <>
      {/* LỚP PHỦ KHI MỞ SIDEBAR (Chỉ hiện trên Mobile/Tablet) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden bg-[#2b211c]/20 backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* ================================================== */}
      {/* SIDEBAR TRÁI: MỤC LỤC TÁC PHẨM (Premium UI) */}
      {/* ================================================== */}
      <aside
        className={`fixed top-0 left-0 h-full bg-[#FAF3E7]/95 backdrop-blur-xl border-r border-[#83746d]/20 shadow-[20px_0_40px_rgba(0,0,0,0.05)] z-50 flex flex-col transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1)
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        style={{ width: `${sidebarWidth}px`, maxWidth: '85vw' }}
      >
        {/* DRAG HANDLE BÊN PHẢI (Để kéo giãn kích thước Sidebar) */}
        <div
          className="absolute top-0 right-0 w-4 h-full cursor-col-resize z-[60] flex items-center justify-end pr-1 group hover:bg-[#ab3429]/5 transition-colors"
          onMouseDown={handleResizeStart}
          onTouchStart={handleResizeStart}
        >
          <div className="w-1 h-12 bg-[#83746d]/30 rounded-full group-hover:bg-[#ab3429] transition-colors"></div>
        </div>

        {/* Nền Texture cho Sidebar */}
        <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')]"></div>

        {/* Header Sidebar có màu sắc nổi bật */}
        <div className="relative p-6 bg-gradient-to-br from-[#412311] to-[#5a3825] text-white flex items-center justify-between shadow-md">
          <div>
            <div className="text-[10px] text-[#ffdbca]/70 uppercase tracking-widest mb-1 font-bold">
              Tác phẩm đang đọc
            </div>
            <h3 className="font-title text-xl font-bold text-white truncate pr-4 max-w-[220px]">
              {work?.title}
            </h3>
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 hover:rotate-90 transition-all text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* TABS SIDEBAR (Segmented Control Style) */}
        <div className="px-4 py-3 bg-[#FAF3E7]/80 border-b border-[#83746d]/10 z-10">
          <div className="flex bg-[#83746d]/10 p-1 rounded-xl relative">
            <button
              onClick={() => setSidebarTab('muc-luc')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 relative z-10 ${sidebarTab === 'muc-luc' ? 'text-[#ab3429] shadow-sm' : 'text-[#83746d] hover:text-[#412311]'}`}
            >
              Mục lục
            </button>
            <button
              onClick={() => setSidebarTab('nghe-thuat')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 relative z-10 ${sidebarTab === 'nghe-thuat' ? 'text-[#ab3429] shadow-sm' : 'text-[#83746d] hover:text-[#412311]'}`}
            >
              Nghệ thuật
            </button>
            <button
              onClick={() => setSidebarTab('nhan-vat')}
              className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all duration-300 relative z-10 ${sidebarTab === 'nhan-vat' ? 'text-[#ab3429] shadow-sm' : 'text-[#83746d] hover:text-[#412311]'}`}
            >
              Nhân vật
            </button>

            {/* Sliding Background cho Active Tab */}
            <div
              className="absolute top-1 bottom-1 w-[32%] bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition-all duration-300 ease-out z-0"
              style={{
                left:
                  sidebarTab === 'muc-luc'
                    ? '1%'
                    : sidebarTab === 'nghe-thuat'
                      ? '34%'
                      : '67%',
              }}
            ></div>
          </div>
        </div>

        {/* Body Sidebar */}
        <div className="relative flex-1 overflow-y-auto p-4 custom-scrollbar">
          {/* TAB MỤC LỤC */}
          {sidebarTab === 'muc-luc' && (
            <div className="flex flex-col gap-2 animate-in fade-in duration-300">
              <div className="mb-2 mt-1 text-[10px] font-bold uppercase tracking-widest text-[#83746d] ml-2 flex items-center gap-2">
                <BookOpen size={12} /> {sections?.length || 0}{' '}
                {isPurePoetry ? 'Phần' : 'Chương'}
              </div>
              {sections?.map((section) => {
                const isActive =
                  (isPurePoetry ? activeSectionId : currentSectionId) ===
                  section.id
                const unitLabel = isPurePoetry ? 'Phần' : 'Chương'
                return (
                  <button
                    key={section.id}
                    onClick={() => handleNavigate(section.id)}
                    className={`
                      text-left px-4 py-4 rounded-2xl transition-all duration-300 border
                      ${
                        isActive
                          ? 'bg-gradient-to-r from-[#ab3429] to-[#c74c40] text-white border-transparent shadow-[0_4px_15px_rgba(171,52,41,0.3)] scale-[1.02] ml-2 mr-1'
                          : 'bg-white/40 border-[#83746d]/10 text-[#412311] hover:bg-white/80 hover:shadow-sm hover:-translate-y-0.5'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full transition-all flex-shrink-0 ${isActive ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-[#83746d]/30'}`}
                      ></div>
                      <div className="flex flex-col">
                        {!isActive && section.title && (
                          <span className="text-[10px] font-bold uppercase tracking-wider opacity-50 mb-0.5">
                            {unitLabel} {section.number}
                          </span>
                        )}
                        <span
                          className={`line-clamp-2 ${isActive ? 'font-bold text-[15px]' : 'font-medium text-sm'}`}
                        >
                          {section.title || `${unitLabel} ${section.number}`}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}

          {/* TAB NGHỆ THUẬT */}
          {sidebarTab === 'nghe-thuat' && (
            <div className="animate-in fade-in duration-300">
              {/* BỘ LỌC TỪ KHÓA NGHỆ THUẬT (DẠNG DROPDOWN TỐI ƯU) */}
              {!isFeaturesLoading && artisticFeatures?.length > 0 && (
                <div className="relative z-50 flex items-center justify-between mb-5 bg-white/50 backdrop-blur-sm border border-[#83746d]/15 px-4 py-2.5 rounded-[14px] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-[#83746d]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#83746d]">
                      Phân loại
                    </span>
                  </div>
                  <div className="relative">
                    {/* Nút bấm Custom Dropdown */}
                    <button
                      onClick={() =>
                        setIsFilterDropdownOpen(!isFilterDropdownOpen)
                      }
                      className="flex items-center gap-1.5 bg-transparent text-[11px] font-bold text-[#ab3429] uppercase tracking-wider pl-2 outline-none cursor-pointer text-right group"
                    >
                      {featureFilter === 'ALL'
                        ? 'Tất cả'
                        : FEATURE_MAP[featureFilter]?.label || featureFilter}
                      <ChevronDown
                        size={14}
                        className={`text-[#ab3429] opacity-70 transition-transform ${isFilterDropdownOpen ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {/* Bảng Menu thả xuống (Custom) */}
                    {isFilterDropdownOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-10"
                          onClick={() => setIsFilterDropdownOpen(false)}
                        ></div>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-xl rounded-[16px] shadow-[0_12px_40px_rgba(0,0,0,0.15)] border border-[#83746d]/15 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200 p-1.5 flex flex-col gap-0.5">
                          {[
                            'ALL',
                            ...Array.from(
                              new Set(
                                artisticFeatures.map((f) => f.featureType),
                              ),
                            ),
                          ].map((type) => {
                            const isActive = featureFilter === type
                            return (
                              <button
                                key={type}
                                onClick={() => {
                                  setFeatureFilter(type)
                                  setIsFilterDropdownOpen(false)
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-[10px] text-[10px] font-bold uppercase tracking-widest transition-all
                                  ${isActive ? 'bg-[#ab3429] text-white shadow-md shadow-[#ab3429]/20' : 'text-[#83746d] hover:bg-[#83746d]/10 hover:text-[#412311]'}
                                `}
                              >
                                <span>
                                  {type === 'ALL'
                                    ? 'Tất cả'
                                    : FEATURE_MAP[type]?.label || type}
                                </span>
                                {isActive && (
                                  <Star size={12} className="fill-white" />
                                )}
                              </button>
                            )
                          })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-5">
                {isFeaturesLoading ? (
                  <div className="flex justify-center py-10 col-span-full">
                    <Loader2 className="animate-spin text-[#ab3429]" />
                  </div>
                ) : artisticFeatures?.length > 0 ? (
                  (featureFilter === 'ALL'
                    ? artisticFeatures
                    : artisticFeatures.filter(
                        (f) => f.featureType === featureFilter,
                      )
                  ).map((f, i) => {
                    const config =
                      FEATURE_MAP[f.featureType] || FEATURE_MAP.DEFAULT
                    const Icon = config.icon
                    return (
                      <div
                        key={i}
                        className={`relative p-6 rounded-[24px] bg-white/70 backdrop-blur-md border ${config.border} shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all duration-500 group overflow-hidden flex flex-col h-full animate-in zoom-in-95`}
                      >
                        <div
                          className={`absolute top-0 right-0 p-4 opacity-5 group-hover:scale-[2] group-hover:opacity-[0.08] group-hover:-rotate-12 transition-all duration-700 ${config.color}`}
                        >
                          <Icon size={80} />
                        </div>
                        <div className="flex-none mb-4">
                          <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1 bg-white/80 backdrop-blur-sm border ${config.border} rounded-md text-[9px] uppercase font-bold ${config.color} tracking-[0.15em] shadow-[0_2px_8px_rgba(0,0,0,0.03)] relative z-10`}
                          >
                            <Icon size={10} strokeWidth={3} />{' '}
                            {config.label || f.featureType}
                          </div>
                        </div>
                        <h4 className="font-title font-bold text-[#412311] text-[20px] mb-3 leading-tight relative z-10 group-hover:text-[#ab3429] transition-colors duration-300">
                          {f.title}
                        </h4>
                        <p className="text-[13.5px] font-quote text-[#50443e] leading-[1.8] relative z-10 text-justify flex-1">
                          {f.description}
                        </p>
                      </div>
                    )
                  })
                ) : (
                  <div className="text-sm text-[#83746d] italic text-center py-10 font-quote col-span-full">
                    {work?.artisticValue || 'Chưa có phân tích nghệ thuật...'}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB NHÂN VẬT */}
          {sidebarTab === 'nhan-vat' && (
            <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 animate-in fade-in duration-300">
              {isCharactersLoading ? (
                <div className="flex justify-center py-10 col-span-full">
                  <Loader2 className="animate-spin text-[#ab3429]" />
                </div>
              ) : characters?.length > 0 ? (
                characters.map((c, i) => {
                  const firstLetter = c.name
                    ? c.name.charAt(0).toUpperCase()
                    : ''

                  return (
                    <div
                      key={i}
                      className="relative p-6 rounded-[24px] bg-white/70 backdrop-blur-md border border-white/80 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_30px_rgba(171,52,41,0.08)] hover:-translate-y-1 transition-all duration-500 group overflow-hidden flex flex-col h-full"
                    >
                      <div className="absolute -bottom-4 -right-2 text-[120px] font-title font-black text-[#ab3429] opacity-[0.03] leading-none pointer-events-none group-hover:scale-110 group-hover:-rotate-3 group-hover:opacity-[0.06] transition-all duration-700 origin-bottom-right">
                        {firstLetter}
                      </div>

                      <div className="relative z-10 flex-none">
                        <div className="flex items-center justify-between mb-3">
                          {c.role ? (
                            <div className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-[#ab3429] to-[#d94a3d] rounded-full text-[9px] uppercase font-bold text-white tracking-[0.2em] shadow-[0_2px_8px_rgba(171,52,41,0.3)]">
                              {c.role}
                            </div>
                          ) : (
                            <div className="w-12 h-[2px] bg-[#ab3429]/20 rounded-full"></div>
                          )}
                          <div className="h-[1px] flex-1 bg-gradient-to-r from-[#ab3429]/20 to-transparent ml-4"></div>
                        </div>

                        <h4 className="font-title font-black text-[#412311] text-[24px] leading-tight mb-4 group-hover:text-[#ab3429] transition-colors duration-300">
                          {c.name}
                        </h4>
                      </div>

                      <p className="text-[13.5px] font-quote text-[#50443e] leading-[1.85] text-justify relative z-10 flex-1">
                        {c.description}
                      </p>
                    </div>
                  )
                })
              ) : (
                <div className="text-sm text-[#83746d] italic text-center py-10 font-quote col-span-full">
                  Chưa có dữ liệu nhân vật...
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Sidebar */}
        <div className="relative p-5 border-t border-[#83746d]/20 bg-white/40 backdrop-blur-md">
          <Link
            to={`/thu-vien/${slug}`}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-white border border-[#ab3429]/20 text-[#ab3429] hover:bg-[#ab3429] hover:text-white transition-all duration-300 font-bold shadow-sm"
          >
            <ArrowLeft size={18} /> Thoát chế độ đọc
          </Link>
        </div>
      </aside>
    </>
  )
}
