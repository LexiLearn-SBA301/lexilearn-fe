import { BookOpen, Sparkles, Feather } from 'lucide-react'
import { Link } from 'react-router-dom'

export const BookCard = ({ work }) => {
  return (
    <article className="literature-card h-full bg-bright-cream rounded-[24px] overflow-hidden border border-outline-variant/30 flex flex-col group relative font-body">
      <div className="aspect-[3/2] w-full shrink-0 overflow-hidden relative bg-surface-container-high flex items-center justify-center">
        {work.coverUrl ? (
          <img
            src={work.coverUrl}
            alt={work.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center opacity-30 watermark-pattern">
            <Feather size={56} className="text-primary" />
          </div>
        )}
      </div>

      <div className="p-6 flex flex-col flex-grow bg-gradient-to-b from-transparent to-surface/40">
        <div className="mb-4">
          <div className="h-6 mb-2">
            {work.subGenre && (
              <span className="inline-block bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                {work.subGenre}
              </span>
            )}
          </div>

          <h3
            className="text-xl font-bold text-primary mb-1 line-clamp-1 leading-tight font-title group-hover:text-secondary transition-colors"
            title={work.title}
          >
            {work.title}
          </h3>

          <p
            className="text-primary/70 font-medium text-sm mb-3 truncate"
            title={work.authorName}
          >
            {work.authorName}
          </p>

          {work.famousQuote && (
            <p
              className="text-on-surface-variant/80 italic text-sm line-clamp-2 font-quote border-l-2 border-earth-beige pl-3 mt-2"
              title={work.famousQuote}
            >
              "{work.famousQuote}"
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 mt-auto pt-4 border-t border-outline-variant/10">
          <Link
            to={`/thu-vien/${work.slug}`}
            className="w-full bg-surface text-primary border border-outline-variant/60 py-2 rounded-xl hover:bg-surface-container transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
          >
            <BookOpen size={16} /> Đọc tài liệu
          </Link>
          <button className="w-full bg-transparent text-tertiary-container py-2 rounded-xl hover:bg-tertiary-container/10 transition-colors text-sm font-bold flex items-center justify-center gap-2">
            <Sparkles size={16} /> Hỏi AI
          </button>
        </div>
      </div>
    </article>
  )
}
