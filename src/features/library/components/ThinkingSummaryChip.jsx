import { ChevronRight, Loader2, BrainCircuit } from 'lucide-react'

// Cùng bộ lọc với ThinkingProcessPanel để đếm số "bước" thật sự hiện ra.
const HIDDEN_TYPES = new Set(['done', 'route', 'error', 'token'])
const countSteps = (events = []) =>
  events.filter((ev) => !HIDDEN_TYPES.has(ev.type)).length

/**
 * Chip gọn nằm trong khung chat. Bấm vào -> mở panel messenger bên trái để xem
 * chi tiết quá trình suy nghĩ (thay cho việc bung timeline ngay trong khung chat chật).
 */
export const ThinkingSummaryChip = ({
  events = [],
  streaming = false,
  active = false,
  onOpen,
}) => {
  const steps = countSteps(events)
  if (!steps && !streaming) return null

  return (
    <button
      onClick={onOpen}
      className={`group w-full flex items-center gap-2.5 px-4 py-3 rounded-2xl border bg-white/60 backdrop-blur-sm shadow-sm text-left transition-all hover:bg-white hover:shadow-md hover:-translate-y-px ${
        active
          ? 'border-[#ab3429]/40 ring-2 ring-[#ab3429]/10'
          : 'border-[#83746d]/15'
      }`}
    >
      <span className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 bg-[#ab3429]/[0.08]">
        {streaming ? (
          <Loader2 size={15} className="text-[#ab3429] animate-spin" />
        ) : (
          <BrainCircuit size={15} className="text-[#ab3429]" />
        )}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[12.5px] font-bold text-[#412311] tracking-wide">
          {streaming ? 'Mộc Bản đang suy nghĩ…' : 'Quá trình suy nghĩ'}
        </span>
        <span className="block text-[11px] text-[#83746d] mt-0.5">
          {steps} bước · bấm để xem hội đồng tranh luận
        </span>
      </span>
      <ChevronRight
        size={16}
        className="text-[#83746d] group-hover:text-[#ab3429] group-hover:translate-x-0.5 transition-all flex-shrink-0"
      />
    </button>
  )
}
