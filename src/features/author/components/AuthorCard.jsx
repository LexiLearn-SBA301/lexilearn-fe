import { User } from 'lucide-react'
import { Link } from 'react-router-dom'

export const AuthorCard = ({ author }) => {
  const periodMap = {
    trung_dai: 'Trung đại',
    can_dai: 'Cận đại',
    hien_dai: 'Hiện đại',
  }

  return (
    <Link
      to={`/tac-gia/${author.slug}`}
      className="bg-bright-cream rounded-[24px] overflow-hidden border border-outline-variant/30 flex flex-col group hover:-translate-y-2 transition-transform duration-300 shadow-sm hover:shadow-xl"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-surface-container-high border-b border-outline-variant/20">
        {author.portraitUrl ? (
          <img
            src={author.portraitUrl}
            alt={author.name}
            className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 transition-all duration-700"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-30 watermark-pattern">
            <User size={64} className="text-primary" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent"></div>
        <div className="absolute bottom-4 left-5 right-5 text-white">
          <h3 className="font-title text-2xl md:text-3xl font-bold tracking-wide">
            {author.name}
          </h3>
          <p className="text-sm opacity-80 mt-1 font-medium">
            ({author.birthYear || '?'} - {author.deathYear || '?'})
          </p>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <p className="font-quote italic text-on-surface-variant text-[15px] leading-relaxed mb-6 line-clamp-4">
          {author.bio || 'Đang cập nhật tiểu sử...'}
        </p>

        <div className="mt-auto pt-4 border-t border-outline-variant/30">
          <span className="text-[11px] text-on-surface-variant uppercase tracking-widest font-bold block mb-1">
            Thời kỳ
          </span>
          <p className="text-sm text-primary font-semibold truncate">
            {periodMap[author.period] || author.period}
          </p>
        </div>
      </div>
    </Link>
  )
}
