import { useParams, Link } from 'react-router-dom'
import { useAuthorDetail } from '../hooks/useAuthor'
import { Loader2, ArrowLeft, User, BookMarked, PenTool } from 'lucide-react'

export const AuthorDetailPage = () => {
  const { slug } = useParams()
  const { data: author, isLoading } = useAuthorDetail(slug)

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary/50" />
      </div>
    )
  }

  if (!author) {
    return (
      <div className="p-10 text-center font-title text-2xl">
        Không tìm thấy tác giả.
      </div>
    )
  }

  return (
    <div className="bg-background min-h-screen font-body relative pb-16">
      {/* Nút Back */}
      <div className="max-w-5xl mx-auto px-6 pt-8 relative z-20">
        <Link
          to="/tac-gia"
          className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Trở về Danh sách Tác giả
        </Link>
      </div>

      <main className="max-w-5xl mx-auto px-6 py-8 relative z-10">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Ảnh chân dung */}
          <div className="w-full md:w-2/5 flex-shrink-0 sticky top-28">
            <div className="aspect-[3/4] w-full rounded-[24px] overflow-hidden shadow-2xl border border-outline-variant/30 bg-surface-container-high relative group">
              {author.portraitUrl ? (
                <img
                  src={author.portraitUrl}
                  alt={author.name}
                  className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 transition-all duration-700"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center opacity-30 watermark-pattern">
                  <User size={80} className="text-primary" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
            </div>
          </div>

          {/* Thông tin chi tiết */}
          <div className="flex-1 flex flex-col mt-4 md:mt-0">
            <h1 className="font-title text-5xl md:text-6xl font-bold text-primary mb-2">
              {author.name}
            </h1>

            <p className="font-title text-2xl text-[#ab3429] mb-8">
              ({author.birthYear || '?'} - {author.deathYear || '?'})
            </p>

            {/* Trích dẫn ngắn / Mô tả ngắn */}
            {(author.shortDescription || author.notableWorks) && (
              <div className="bg-surface-container-lowest border-l-4 border-[#004943] p-6 rounded-r-2xl mb-10 shadow-sm">
                {author.shortDescription && (
                  <p className="font-quote text-lg text-primary italic leading-relaxed mb-3">
                    "{author.shortDescription}"
                  </p>
                )}
                {author.notableWorks && (
                  <div className="flex items-start gap-2 text-sm text-on-surface-variant">
                    <BookMarked
                      size={18}
                      className="text-[#004943] mt-0.5 flex-shrink-0"
                    />
                    <p>
                      <strong className="text-primary">Tiêu biểu:</strong>{' '}
                      {author.notableWorks}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tiểu sử đầy đủ */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4 border-b border-outline-variant/30 pb-4">
                <PenTool className="text-[#ab3429]" size={24} />
                <h2 className="font-title text-3xl font-bold text-primary">
                  Cuộc đời & Sự nghiệp
                </h2>
              </div>

              <div className="text-on-surface-variant leading-relaxed text-lg space-y-4 whitespace-pre-wrap font-quote">
                {author.bio || 'Đang cập nhật tiểu sử chi tiết...'}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
