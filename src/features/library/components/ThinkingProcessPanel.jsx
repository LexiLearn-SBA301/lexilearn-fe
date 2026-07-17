import { useEffect, useRef, useState } from 'react'
import {
  X,
  Loader2,
  RefreshCw,
  Compass,
  Sparkles,
  Search,
  ClipboardList,
  Bookmark,
  Palette,
  Landmark,
  Brain,
  Users,
  Scale,
  CircleCheck,
  TriangleAlert,
  Reply,
  FileText,
  GraduationCap,
  Hand,
  Send,
  CornerDownLeft,
  MessagesSquare,
  Check,
} from 'lucide-react'
import {
  getEventUi,
  isHiddenThinkingEvent,
  formatRichText,
} from '../../../services/chat.service'

// ============================================================================
// 🎛️  CHỈNH NHANH LỚP PHỦ (sửa trực tiếp 2 dòng dưới đây)
// ----------------------------------------------------------------------------
// Độ tối của nền: đổi số sau dấu "/" (0–100). Càng cao càng tối. VD: /25 nhạt, /50 đậm.
const OVERLAY_DARKNESS = 'bg-[#241a12]/85'
// Độ mờ hậu cảnh (blur): đổi số trong [] theo px. Càng cao càng mờ.
// Không muốn mờ -> đổi thành 'backdrop-blur-none'.
const OVERLAY_BLUR = 'backdrop-blur-[2px]'
// ============================================================================

// ============================================================================
// 🎨  BẢNG ICON (sửa trực tiếp ở đây)
// ----------------------------------------------------------------------------
// Icon của mỗi agent do FE tự quyết theo `payload.ui.variant` (BE không gửi emoji nữa).
// Muốn đổi icon của agent nào -> đổi component tương ứng với `variant`
// (danh sách icon: https://lucide.dev/icons).
const VARIANT_ICON = {
  supervisor: Compass, // Điều phối
  status: Sparkles, // Đang phân tích / tóm tắt
  thinking: Sparkles,
  retrieval: Search, // Truy hồi tài liệu
  bulletin: ClipboardList, // Bảng tin chung
  citation: Bookmark, // Kiểm trích dẫn
  hinh_thuc: Palette, // Nhà phê bình Hình thức
  lich_su: Landmark, // Nhà phê bình Lịch sử
  tam_ly: Brain, // Nhà phê bình Tâm lý
  tiep_nhan: Users, // Nhà phê bình Tiếp nhận
  human: GraduationCap, // Người học (thành viên thứ 5 — người thật)
  await_human: Hand, // Hội đồng đang chờ người học phát biểu
  judge: Scale, // Giám khảo
  done: CircleCheck,
  error: TriangleAlert,
}
// ============================================================================

// Render icon vector theo variant. Variant lạ chưa map -> dùng emoji BE (nếu còn),
// còn nếu BE đã bỏ emoji thì dùng icon mặc định để KHÔNG bao giờ render trống.
const VariantIcon = ({ variant, emoji, size = 16, className, style }) => {
  const Cmp = VARIANT_ICON[variant]
  if (Cmp) return <Cmp size={size} className={className} style={style} />
  if (emoji)
    return (
      <span
        className={className}
        style={{ fontSize: size, lineHeight: 1, ...style }}
      >
        {emoji}
      </span>
    )
  return <Sparkles size={size} className={className} style={style} />
}

// Mỗi nhà phê bình thuộc 1 "phe" -> bong bóng nằm bên trái hay phải, tạo cảm giác
// tranh luận qua lại như group chat messenger.
const CRITIC_SIDE = {
  tam_ly: 'left',
  tiep_nhan: 'left',
  hinh_thuc: 'right',
  lich_su: 'right',
  human: 'right', // Người học đứng cùng phía nút gửi -> đọc như "lời của mình"
}

const VERDICT_LABEL = {
  pass: 'DUYỆT',
  approve: 'DUYỆT',
  retry: 'YÊU CẦU LÀM LẠI',
  reject: 'HẾT LƯỢT — DÙNG BẢN TỐT NHẤT',
}

// 3 cổng giám khảo. Phân biệt qua node "judge:<stage>" (event judge) hoặc
// payload.stage (event retry). Giúp người xem biết đang chấm khâu nào.
const JUDGE_STAGE_LABEL = {
  prepare_context: 'Ngữ cảnh',
  critics_debate: 'Tranh luận',
  write_essay: 'Bài luận',
}
const judgeStageLabel = (stage) => JUDGE_STAGE_LABEL[stage] ?? null

// Tên + màu của từng nhà phê bình (để hiện "reply tới ai" ở Vòng 2, vì rebuttal
// chỉ cho biết variant của critic bị nhắm tới). Màu khớp bảng màu của BE.
const CRITIC_META = {
  tam_ly: { name: 'Tâm lý', color: '#8b5cf6' },
  hinh_thuc: { name: 'Hình thức', color: '#14b8a6' },
  lich_su: { name: 'Lịch sử', color: '#3b82f6' },
  tiep_nhan: { name: 'Tiếp nhận', color: '#ec4899' },
  human: { name: 'Người học', color: '#ab3429' },
}

// Nhãn quan điểm của phản biện. 3 khoá đầu là stance THẬT của backend
// (Rebuttal.stance = agree | disagree | qualify).
const STANCE = {
  agree: { label: 'đồng tình', color: '#22c55e' },
  disagree: { label: 'phản bác', color: '#ef4444' },
  qualify: { label: 'bổ sung', color: '#f59e0b' },
  partial: { label: 'một phần', color: '#f59e0b' },
  neutral: { label: 'trung lập', color: '#64748b' },
}

// 3 lựa chọn quan điểm cho người học (khớp Literal của backend).
const STANCE_CHOICES = ['agree', 'qualify', 'disagree']

// Bong bóng "reply" kiểu Messenger: 1 phản biện của critic hiện tại nhắm tới critic
// khác. Header cho biết đang trả lời AI nào (tên + màu + icon) + quan điểm, phía dưới
// là nội dung phản biện -> nhìn phát biết ai phản biện ai.
const ReplyBubble = ({ rebuttal, isRight, targetId, onJump }) => {
  const target = CRITIC_META[rebuttal.target_critic]
  const TargetIcon = VARIANT_ICON[rebuttal.target_critic] ?? Sparkles
  const stance = STANCE[rebuttal.stance]
  const clickable = Boolean(targetId && onJump)
  const HeaderTag = clickable ? 'button' : 'div'
  return (
    <div
      className={`flex flex-col gap-0.5 max-w-full ${isRight ? 'items-end' : 'items-start'}`}
    >
      {/* Header "↩ Trả lời [critic]" — bấm để nhảy lên phát biểu bị phản biện */}
      <HeaderTag
        {...(clickable
          ? {
              type: 'button',
              onClick: () => onJump(targetId),
              title: `Xem phát biểu của ${target?.name ?? 'critic'}`,
            }
          : {})}
        className={`flex items-center gap-1 px-2 py-0.5 flex-wrap rounded-full ${
          clickable
            ? 'cursor-pointer hover:bg-white/12 active:bg-white/20 transition-colors'
            : ''
        }`}
      >
        <Reply size={11} className="text-white/50" />
        <span className="text-[10.5px] font-semibold text-white/55">
          Trả lời
        </span>
        {target && (
          <span
            className={`flex items-center gap-0.5 ${clickable ? 'underline decoration-dotted underline-offset-2' : ''}`}
            style={{ color: target.color }}
          >
            <TargetIcon size={11} />
            <span className="text-[10.5px] font-bold">{target.name}</span>
          </span>
        )}
        {stance && (
          <span
            style={{ color: stance.color, borderColor: `${stance.color}66` }}
            className="text-[9px] font-bold uppercase tracking-wide border rounded-full px-1.5 py-[1px] bg-black/25"
          >
            {stance.label}
          </span>
        )}
      </HeaderTag>
      {/* Nội dung phản biện */}
      <div
        className={`bg-white/95 px-3.5 py-2 shadow-md rounded-2xl ${
          isRight ? 'rounded-tr-sm' : 'rounded-tl-sm'
        }`}
      >
        <p className="text-[12.5px] leading-relaxed text-[#4b3d34]">
          {rebuttal.reason || rebuttal.stance}
        </p>
      </div>
    </div>
  )
}

// Bong bóng của 1 nhà phê bình: avatar màu + tên + phát biểu chính. Ở Vòng 2, các
// phản biện được tách ra thành từng bong bóng "reply" riêng (kiểu Messenger).
// Nền bong bóng màu trắng đặc để nổi rõ trên lớp phủ tối.
const CriticBubble = ({
  ev,
  ui,
  targetIds,
  onJump,
  highlighted,
  onReplyTo,
  replyingTo,
}) => {
  const isRight = (CRITIC_SIDE[ui.variant] ?? 'left') === 'right'
  const args = ev.payload?.arguments
  const rebuttals = ev.payload?.rebuttals
  // Chỉ luận điểm VÒNG 1 mới có arg_id -> chỉ chúng mới bị nhắm tới được (Rebuttal không
  // có id riêng). Không cho tự phản biện luận điểm của chính mình (backend cũng chặn).
  const canReply = Boolean(onReplyTo) && ui.variant !== 'human'
  return (
    <div
      className={`flex items-start gap-2 animate-in fade-in slide-in-from-bottom-3 duration-500 ${
        isRight ? 'flex-row-reverse' : 'flex-row'
      }`}
    >
      <div
        style={{ backgroundColor: ui.color }}
        className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ring-2 ring-white/25"
      >
        <VariantIcon
          variant={ui.variant}
          emoji={ui.icon}
          size={16}
          className="text-white"
        />
      </div>
      <div
        className={`flex flex-col max-w-[82%] gap-1.5 ${isRight ? 'items-end' : 'items-start'}`}
      >
        <span
          style={{ color: ui.color }}
          className="text-[13.5px] font-bold tracking-wide px-1 leading-8 [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]"
        >
          {ev.actor}
        </span>

        {/* Phát biểu chính của critic (+ luận điểm ở Vòng 1) */}
        {(ev.content || args?.length > 0) && (
          <div
            style={{
              borderColor: `${ui.color}80`,
              ...(highlighted
                ? {
                    boxShadow: `0 0 0 3px ${ui.color}, 0 8px 30px ${ui.color}66`,
                  }
                : {}),
            }}
            className={`bg-white border px-4 py-3 shadow-xl rounded-2xl transition-shadow duration-300 ${
              isRight ? 'rounded-br-md' : 'rounded-bl-md'
            }`}
          >
            {ev.content && (
              <p className="text-[13px] leading-relaxed text-[#2b211c]">
                {ev.content}
              </p>
            )}
            {args?.length > 0 && (
              <ul className="mt-2 space-y-1.5">
                {args.map((a, k) => (
                  <li
                    key={`a${k}`}
                    className="group/arg flex gap-1.5 text-[12.5px] leading-snug text-[#4b3d34]"
                  >
                    <span style={{ color: ui.color }}>▸</span>
                    <span className="flex-1">{a.point}</span>
                    {/* Nút "Trả lời" chỉ mọc khi hội đồng đang chờ người học ở VÒNG 2 */}
                    {canReply && a.arg_id && (
                      <button
                        type="button"
                        onClick={() => onReplyTo(a.arg_id)}
                        title="Phản biện luận điểm này"
                        style={
                          replyingTo === a.arg_id
                            ? {
                                backgroundColor: `${ui.color}1a`,
                                color: ui.color,
                              }
                            : undefined
                        }
                        className={`flex items-center gap-1 self-start px-1.5 py-0.5 rounded-md text-[10.5px] font-bold transition-all flex-shrink-0 ${
                          replyingTo === a.arg_id
                            ? 'opacity-100'
                            : 'text-[#83746d] opacity-0 group-hover/arg:opacity-100 hover:bg-[#83746d]/10'
                        }`}
                      >
                        <Reply size={10} />
                        Trả lời
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Vòng 2: mỗi phản biện là 1 bong bóng reply riêng */}
        {rebuttals?.map((r, k) => (
          <ReplyBubble
            key={`r${k}`}
            rebuttal={r}
            isRight={isRight}
            targetId={targetIds?.[k]}
            onJump={onJump}
          />
        ))}
      </div>
    </div>
  )
}

// Thẻ chấm điểm của giám khảo (đặt giữa, viền màu theo verdict).
const JudgeCard = ({ ev, ui }) => {
  const verdict = ev.payload?.verdict
  const scores = ev.payload?.scores
  const stageLabel = judgeStageLabel(ev.node?.replace('judge:', ''))
  return (
    <div className="flex justify-center animate-in fade-in zoom-in-95 duration-500">
      <div
        style={{ borderColor: `${ui.color}99` }}
        className="bg-white border-2 rounded-2xl px-4 py-3 max-w-[92%] shadow-xl"
      >
        <div className="flex items-center gap-2 justify-center">
          <VariantIcon
            variant={ui.variant}
            emoji={ui.icon}
            size={17}
            style={{ color: ui.color }}
          />
          <span
            style={{ color: ui.color }}
            className="text-[11.5px] font-black tracking-wider uppercase"
          >
            Giám khảo{stageLabel ? ` · ${stageLabel}` : ''} ·{' '}
            {VERDICT_LABEL[verdict] ?? verdict ?? 'chấm điểm'}
          </span>
        </div>
        {ev.content && (
          <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#4b3d34] text-center">
            {ev.content}
          </p>
        )}
        {scores && Object.keys(scores).length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5 justify-center">
            {Object.entries(scores).map(([k, v]) => (
              <span
                key={k}
                className="text-[10.5px] font-bold text-[#83746d] bg-[#f5efe4] border border-[#83746d]/15 rounded-full px-2 py-0.5"
              >
                {k}: {typeof v === 'number' ? v.toFixed(1) : String(v)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Thông báo giám khảo yêu cầu làm lại. Hiện rõ khâu bị làm lại + số lượt (attempt/limit)
// để người xem hiểu vì sao cụm event của tool tương ứng sắp XUẤT HIỆN LẠI.
const RetryNote = ({ ev }) => {
  const { stage, attempt, limit } = ev.payload ?? {}
  const stageLabel = judgeStageLabel(stage)
  const loop = attempt && limit ? ` · Lượt ${attempt}/${limit}` : ''
  return (
    <div className="flex justify-center animate-in fade-in duration-500">
      <div className="flex items-center gap-2 bg-[#fef3c7] border border-[#f59e0b]/50 rounded-full px-4 py-1.5 shadow-lg">
        <RefreshCw size={13} className="text-[#b45309]" />
        <span className="text-[11.5px] font-bold text-[#b45309]">
          Làm lại{stageLabel ? ` ${stageLabel}` : ''}
          {loop}
          {ev.content ? `: ${ev.content}` : ''}
        </span>
      </div>
    </div>
  )
}

// Bước trung gian trung tính (điều phối / truy hồi / trạng thái / bảng tin).
const SystemNote = ({ ev, ui }) => (
  <div className="flex justify-center animate-in fade-in duration-500">
    <div className="flex items-start gap-2 max-w-[94%] bg-white/92 border border-[#83746d]/15 rounded-xl px-3.5 py-2 shadow-lg">
      <VariantIcon
        variant={ui.variant}
        emoji={ui.icon}
        size={15}
        style={{ color: ui.color }}
        className="mt-0.5 flex-shrink-0"
      />
      <div className="min-w-0">
        {ev.actor && (
          <span className="text-[11px] font-bold text-[#64748b] mr-1.5">
            {ev.actor}
          </span>
        )}
        <span className="text-[12px] leading-relaxed text-[#5b4b42]">
          {ev.content}
        </span>
      </div>
    </div>
  </div>
)

// Bản thảo bài luận đang được viết (event 'essay'). Hiển thị NGAY TRONG panel suy nghĩ
// dưới dạng 1 "trang giấy" — mỗi lượt viết (kể cả lượt bị YÊU CẦU LÀM LẠI) là 1 bản
// thảo riêng, GIỮ LẠI trong timeline. Câu trả lời cuối cùng vẫn nằm ở box chat.
const EssayDraftBubble = ({ ev }) => {
  const text = ev.content || ''
  return (
    <div className="flex flex-col gap-1.5 animate-in fade-in slide-in-from-bottom-3 duration-500">
      <div className="flex items-center gap-2 px-1">
        <div className="w-7 h-7 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 ring-2 ring-white/25 bg-[#b45309]">
          <FileText size={14} className="text-white" />
        </div>
        <span className="text-[12.5px] font-bold text-white/90 [text-shadow:0_1px_3px_rgba(0,0,0,0.35)]">
          Bản thảo bài luận
        </span>
      </div>
      <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3.5 shadow-xl border border-[#83746d]/15 max-h-[440px] overflow-y-auto custom-scrollbar">
        {text ? (
          <div
            className="text-[13px] leading-[1.75] text-[#2b211c] font-quote"
            dangerouslySetInnerHTML={{ __html: formatRichText(text) }}
          />
        ) : (
          <span className="text-[12.5px] text-[#83746d] italic">
            Đang soạn bản thảo…
          </span>
        )}
      </div>
    </div>
  )
}

/**
 * Khung soạn phát biểu của người học — hiện khi hội đồng tạm dừng chờ (event await_human).
 *
 * Vòng 1: ô text tự do (nêu luận điểm của mình -> 4 critic sẽ bắt bẻ lại ở vòng 2).
 * Vòng 2: chọn nhà phê bình (bấm = cuộn màn hình tới phát biểu của họ để vừa đọc vừa viết)
 *         -> chọn luận điểm cụ thể của họ -> chọn quan điểm -> gõ.
 *         Phải xuống tận luận điểm vì backend nhắm theo `target_arg_id`, không nhắn theo
 *         critic: mỗi nhà phê bình có 2–4 luận điểm, gửi thiếu id là 400.
 * Enter gửi, Shift+Enter xuống dòng (giống ô chat chính).
 */
const HumanComposer = ({
  round,
  argsByCritic, // { variant: [{ argId, point }] } — luận điểm vòng 1 để nhắm tới
  pickedCritic,
  onPickCritic, // bấm nhà phê bình -> chọn + cuộn tới phát biểu của họ
  target,
  stance,
  onStanceChange,
  onPickArg,
  turnsLeft,
  hasSpoken,
  sending,
  error,
  onSend,
  onEnd,
}) => {
  const [text, setText] = useState('')
  const inputRef = useRef(null)
  const needTarget = round === 2 && !target
  const canSend = text.trim() && !needTarget && !sending
  const critics = Object.keys(argsByCritic ?? {})

  // Chọn xong luận điểm -> nhảy con trỏ xuống ô nhập luôn, khỏi phải click thêm lần nữa.
  useEffect(() => {
    if (target) inputRef.current?.focus()
  }, [target])

  const submit = () => {
    if (!canSend) return
    onSend(text.trim())
    setText('')
  }

  return (
    <div className="sticky bottom-0 -mx-5 px-5 pt-3 pb-4 bg-gradient-to-t from-[#241a12] via-[#241a12]/95 to-transparent">
      <div className="rounded-2xl border-2 border-[#ab3429]/60 bg-white shadow-2xl overflow-hidden">
        {/* Đầu khung: bạn đang ở vòng nào + còn bao nhiêu lượt */}
        <div className="flex items-center justify-between gap-2 px-3.5 py-2 bg-[#ab3429]/[0.07] border-b border-[#ab3429]/15">
          <span className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-[#ab3429]">
            <GraduationCap size={13} />
            {round === 1
              ? 'Lượt của bạn · Nêu luận điểm'
              : 'Lượt của bạn · Phản biện'}
          </span>
          <span className="text-[10.5px] font-bold text-[#83746d]">
            còn {turnsLeft} lượt
          </span>
        </div>

        {/* Vòng 2 — 3 nấc: ai → luận điểm nào → quan điểm gì */}
        {round === 2 && (
          <div className="px-3.5 pt-2.5 space-y-2">
            {/* Nấc 1: nhà phê bình. Bấm = chọn + CUỘN tới phát biểu của họ -> vừa đọc vừa viết. */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wide text-[#83746d] mr-0.5">
                Phản biện
              </span>
              {critics.map((v) => {
                const meta = CRITIC_META[v] ?? { name: v, color: '#83746d' }
                const Icon = VARIANT_ICON[v] ?? Sparkles
                const on = pickedCritic === v
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => onPickCritic(v)}
                    title={`Xem phát biểu của ${meta.name}`}
                    style={
                      on
                        ? {
                            backgroundColor: meta.color,
                            borderColor: meta.color,
                          }
                        : { borderColor: `${meta.color}66`, color: meta.color }
                    }
                    className={`flex items-center gap-1 text-[10.5px] font-bold border rounded-full px-2 py-[3px] transition-all ${
                      on ? 'text-white shadow-sm' : 'hover:bg-black/[0.03]'
                    }`}
                  >
                    <Icon size={11} />
                    {meta.name}
                  </button>
                )
              })}
            </div>

            {/* Nấc 2: luận điểm CỦA nhà phê bình vừa chọn (backend nhắm theo arg_id). */}
            {pickedCritic && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#83746d] mr-0.5">
                  Luận điểm
                </span>
                {(argsByCritic[pickedCritic] ?? []).map((a, i) => {
                  const on = target?.argId === a.argId
                  const color = CRITIC_META[pickedCritic]?.color ?? '#83746d'
                  return (
                    <button
                      key={a.argId}
                      type="button"
                      onClick={() => onPickArg(a.argId)}
                      title={a.point}
                      style={
                        on
                          ? {
                              backgroundColor: `${color}18`,
                              borderColor: color,
                              color,
                            }
                          : { borderColor: '#83746d55' }
                      }
                      className={`flex items-center gap-1 max-w-[240px] text-[10.5px] border rounded-full px-2 py-[3px] transition-all ${
                        on
                          ? 'font-bold'
                          : 'text-[#5b4b42] hover:bg-black/[0.03]'
                      }`}
                    >
                      <span className="font-black opacity-60">{i + 1}</span>
                      <span className="truncate">{a.point}</span>
                    </button>
                  )
                })}
              </div>
            )}

            {/* Nấc 3: quan điểm — chỉ hỏi khi đã biết nhắm vào đâu. */}
            {target && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[#83746d] mr-0.5">
                  Quan điểm
                </span>
                {STANCE_CHOICES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => onStanceChange(s)}
                    style={
                      stance === s
                        ? {
                            backgroundColor: STANCE[s].color,
                            borderColor: STANCE[s].color,
                          }
                        : {
                            borderColor: `${STANCE[s].color}66`,
                            color: STANCE[s].color,
                          }
                    }
                    className={`text-[10px] font-bold uppercase tracking-wide border rounded-full px-2 py-[3px] transition-all ${
                      stance === s
                        ? 'text-white shadow-sm'
                        : 'hover:bg-black/[0.03]'
                    }`}
                  >
                    {STANCE[s].label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-end gap-2 p-2">
          <textarea
            ref={inputRef}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                submit()
              }
            }}
            disabled={needTarget}
            rows={1}
            placeholder={
              needTarget
                ? 'Chọn nhà phê bình và luận điểm muốn phản biện…'
                : round === 1
                  ? 'Quan điểm của bạn về câu hỏi này…'
                  : 'Vì sao bạn nghĩ vậy? Dẫn chứng trong văn bản…'
            }
            className="w-full max-h-[110px] min-h-[40px] bg-transparent border-none focus:ring-0 resize-none py-2 px-2.5 text-[13px] text-[#412311] placeholder:text-[#83746d]/50 custom-scrollbar leading-[1.6] disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={submit}
            disabled={!canSend}
            title="Gửi (Enter)"
            className="w-9 h-9 rounded-lg bg-[#ab3429] text-white flex items-center justify-center hover:bg-[#8a1c14] active:scale-95 transition-all disabled:opacity-35 disabled:active:scale-100 flex-shrink-0 mb-0.5"
          >
            {sending ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Send size={15} />
            )}
          </button>
        </div>

        {error && (
          <p className="px-3.5 pb-2 text-[11px] font-semibold text-[#b91c1c]">
            ⚠️ {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 px-3.5 py-2 bg-[#f5efe4] border-t border-[#83746d]/12">
          <span className="flex items-center gap-1 text-[10px] text-[#83746d]">
            <CornerDownLeft size={10} /> Enter để gửi · Shift+Enter xuống dòng
          </span>
          {/* Cùng một tín hiệu tới backend (message rỗng); chỉ đổi nhãn theo việc đã nói hay
              chưa. Viền đỏ (không tô đặc) để nổi ngang nút Gửi mà vẫn đọc ra là hành động
              KHÁC — tô đặc cả hai thì dễ bấm nhầm cái kết thúc lượt. */}
          <button
            type="button"
            onClick={onEnd}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border-2 border-[#ab3429] text-[#ab3429] text-[11.5px] font-bold hover:bg-[#ab3429] hover:text-white active:scale-95 transition-all flex-shrink-0"
          >
            <X size={13} />
            {hasSpoken ? 'Kết thúc phản biện' : 'Bỏ qua lượt này'}
          </button>
        </div>
      </div>
    </div>
  )
}

const RoundDivider = ({ label }) => (
  <div className="flex items-center gap-3 py-1">
    <span className="flex-1 h-px bg-white/25" />
    <span className="text-[10.5px] font-black uppercase tracking-[0.15em] text-[#83746d] bg-white/90 rounded-full px-3 py-1 shadow-md">
      {label}
    </span>
    <span className="flex-1 h-px bg-white/25" />
  </div>
)

const renderRow = (ev, criticProps) => {
  const ui = getEventUi(ev)
  if (ev.type === 'critic_turn')
    return <CriticBubble ev={ev} ui={ui} {...criticProps} />
  if (ev.type === 'judge') return <JudgeCard ev={ev} ui={ui} />
  if (ev.type === 'retry') return <RetryNote ev={ev} />
  if (ev.type === 'essay') return <EssayDraftBubble ev={ev} />
  return <SystemNote ev={ev} ui={ui} />
}

/**
 * arg_id -> { name, color, point } lấy từ các event VÒNG 1 đã nhận.
 * Dùng để chip "đang trả lời ..." hiện được TÊN và NỘI DUNG luận điểm, vì event await_human
 * chỉ mang danh sách id trần.
 */
const buildArgIndex = (events) => {
  const index = {}
  for (const ev of events) {
    if (ev.type !== 'critic_turn' || ev.payload?.round !== 1) continue
    const variant = getEventUi(ev).variant
    for (const a of ev.payload?.arguments ?? []) {
      if (!a.arg_id) continue
      index[a.arg_id] = {
        variant,
        name: CRITIC_META[variant]?.name ?? ev.actor,
        color: CRITIC_META[variant]?.color ?? '#83746d',
        point: a.point,
      }
    }
  }
  return index
}

/**
 * Gom luận điểm vòng 1 theo nhà phê bình -> { variant: [{argId, point}] }.
 * BỎ luận điểm của chính người học: tự phản biện mình là vô nghĩa (backend cũng chặn,
 * xem debate_session._validate).
 */
const groupArgsByCritic = (argIndex) => {
  const byCritic = {}
  for (const [argId, meta] of Object.entries(argIndex)) {
    if (meta.variant === 'human') continue
    ;(byCritic[meta.variant] ??= []).push({ argId, point: meta.point })
  }
  return byCritic
}

/**
 * Lớp phủ "quá trình suy nghĩ": làm tối nhẹ toàn bộ vùng bên trái (từ mép màn hình
 * đến sát viền khung chat chính) bằng hiệu ứng fade-in, rồi cho các bong bóng chat
 * của từng agent nổi lên trên nền tối đó — KHÔNG có khung/nền giấy bao quanh.
 *
 * Lớp phủ nằm dưới popup chat (z < 80) nên popup vẫn sáng; bề rộng chừa đúng
 * bằng bề ngang popup (khác nhau giữa chế độ mở rộng / thu nhỏ).
 */
export const ThinkingProcessPanel = ({
  open,
  events = [],
  streaming = false,
  isExpanded = false,
  onClose,
  // --- tranh luận cùng người học (do AIAssistantPopup lái) ---
  awaitHuman = null, // { round, max_turns, valid_arg_ids } | null
  humanTurns = 0, // số lượt đã gửi ở vòng hiện tại
  debateSending = false,
  debateError = null,
  onDebateSend, // (text, { targetArgId, stance }) => void
  onDebateEnd, // () => void  (Bỏ qua / Kết thúc — cùng 1 tín hiệu)
  canOptinDebate = false, // còn trong cửa sổ bấm (deep + hội đồng chưa khai mạc)
  debateOptedIn = false,
  onDebateOptin,
}) => {
  const endRef = useRef(null)
  // Row đang được highlight sau khi bấm "Trả lời ..." để nhảy tới.
  const [jumpId, setJumpId] = useState(null)
  // Vòng 2: nhà phê bình đang chọn -> luận điểm đang nhắm -> quan điểm.
  const [pickedCritic, setPickedCritic] = useState(null)
  const [replyTo, setReplyTo] = useState(null)
  const [stance, setStance] = useState('disagree')

  // Cuộn xuống cuối khi có event mới (lúc đang stream) hoặc khi mới mở. Lúc đang chờ người
  // học thì THÔI tự cuộn: họ vừa bấm xem phát biểu của 1 critic để đọc mà mình giật xuống
  // đáy thì đúng là phá.
  useEffect(() => {
    if (open && !awaitHuman)
      endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events, open, streaming, awaitHuman])

  // Sang vòng khác / hết lượt chờ -> quên lựa chọn đang dở, tránh gửi nhầm id của vòng
  // trước sang vòng sau (backend sẽ trả 400, nhưng đừng để tới đó). Điều chỉnh ngay trong
  // lúc render (pattern chính thức của React cho "state phụ thuộc prop") thay vì useEffect
  // — effect sẽ render thừa một nhịp với luận điểm cũ còn dính.
  const activeRound = awaitHuman?.round ?? null
  const [prevRound, setPrevRound] = useState(activeRound)
  if (prevRound !== activeRound) {
    setPrevRound(activeRound)
    setPickedCritic(null)
    setReplyTo(null)
    setStance('disagree')
  }

  // Cuộn lên phát biểu bị phản biện + nháy highlight nhẹ.
  const scrollToId = (id) => {
    if (!id) return
    const el = document.getElementById(id)
    if (!el) return
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setJumpId(id)
    window.setTimeout(() => setJumpId(null), 1500)
  }

  if (!open) return null

  const visible = events.filter((ev) => !isHiddenThinkingEvent(ev))
  // Chỉ cho reply khi hội đồng ĐANG chờ ở vòng 2 (vòng 1 là nêu luận điểm, không nhắm ai).
  const canReplyNow = Boolean(awaitHuman) && awaitHuman.round === 2
  const argIndex = canReplyNow ? buildArgIndex(visible) : {}
  const argsByCritic = canReplyNow ? groupArgsByCritic(argIndex) : {}
  const target = replyTo ? { ...argIndex[replyTo], argId: replyTo } : null

  // Chèn vạch ngăn "Vòng N" mỗi khi vòng tranh luận thay đổi.
  // r1Index: index bong bóng VÒNG 1 của mỗi critic -> reply luôn nhảy về phát biểu
  // gốc (Vòng 1) của critic bị phản biện, KHÔNG phải bong bóng Vòng 2 gần nhất.
  const rows = []
  let lastRound = null
  const r1Index = {}
  visible.forEach((ev, i) => {
    const ui = getEventUi(ev)
    const round = ev.payload?.round
    if (ev.type === 'critic_turn' && round && round !== lastRound) {
      lastRound = round
      rows.push(<RoundDivider key={`round-${i}`} label={`Vòng ${round}`} />)
    }

    const rowId = `think-row-${i}`

    // Với critic: tìm id row phát biểu Vòng 1 của critic bị phản biện + cờ highlight
    // (chỉ tô sáng đúng bong bóng chính, không phải cả row).
    let criticProps
    if (ev.type === 'critic_turn') {
      const targetIds = ev.payload?.rebuttals?.map((r) => {
        const j = r1Index[r.target_critic]
        return j != null ? `think-row-${j}` : null
      })
      criticProps = {
        targetIds,
        onJump: scrollToId,
        highlighted: jumpId === rowId,
        // Nút "Trả lời" CHỈ mọc ở vòng 2 và chỉ trên luận điểm vòng 1 (Rebuttal không có
        // id riêng nên không thể bị nhắm tới). Lối tắt song song với hàng nút dưới khung
        // soạn -> phải set CẢ pickedCritic, nếu không hàng chip luận điểm bên dưới lại
        // hiện của người khác trong khi đang nhắm luận điểm này.
        onReplyTo:
          canReplyNow && round === 1
            ? (argId) => {
                setPickedCritic(ui.variant)
                setReplyTo(argId)
              }
            : undefined,
        replyingTo: replyTo,
      }
    }

    rows.push(
      <div key={i} id={rowId} className="scroll-mt-6">
        {renderRow(ev, criticProps)}
      </div>,
    )

    // Chỉ ghi nhận bong bóng Vòng 1 làm đích nhảy tới.
    if (ev.type === 'critic_turn' && round === 1) r1Index[ui.variant] = i
  })

  // variant -> id row phát biểu vòng 1, để hàng nút nhà phê bình cuộn tới đúng chỗ.
  const r1Rows = Object.fromEntries(
    Object.entries(r1Index).map(([v, i]) => [v, `think-row-${i}`]),
  )

  // Chừa bề rộng đúng bằng popup để lớp tối dừng lại ở viền khung chat chính.
  const rightInset = isExpanded
    ? 'right-0 md:right-[640px]'
    : 'right-0 md:right-[424px]'

  return (
    <>
      {/* Nền mờ TOÀN màn hình, nằm DƯỚI popup chat (z < 80) nên popup nổi lên trên. Nhờ
          phủ kín cả phía sau popup mà góc bo tròn và cạnh trên–dưới của popup KHÔNG còn
          lộ mép cứng của lớp phủ (bug cũ: lớp phủ chỉ chiếm nửa trái -> hở viền). Bấm ra
          vùng nền -> đóng panel. */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[78] ${OVERLAY_DARKNESS} ${OVERLAY_BLUR} animate-in fade-in duration-500`}
      />

      {/* Nội dung "quá trình suy nghĩ" — chỉ chiếm vùng bên trái box chat để bong bóng
          không luồn xuống dưới popup. Nền trong suốt (độ mờ do lớp nền phía dưới lo). */}
      <div
        className={`fixed inset-y-0 left-0 z-[79] flex flex-col animate-in fade-in duration-500 ${rightInset}`}
      >
        {/* Header trên nền tối */}
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-lg">
              {streaming ? (
                <Loader2 size={16} className="text-white animate-spin" />
              ) : (
                <Brain size={16} className="text-white" />
              )}
            </div>
            <div>
              <h4 className="font-title text-[15px] font-black text-white leading-tight [text-shadow:0_1px_4px_rgba(0,0,0,0.4)]">
                Quá trình suy nghĩ
              </h4>
              <p className="text-[10px] text-white/65 font-bold tracking-[0.12em] uppercase mt-0.5">
                Hội đồng phê bình tranh luận
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Xin tranh luận cùng hội đồng. Chỉ sống trong cửa sổ từ lúc chốt route=deep
                tới lúc hội đồng khai mạc (event debate_lock) -> qua mốc đó là BIẾN MẤT,
                vì bấm cũng vô nghĩa (AI đã đọc & xoá cờ rồi). */}
            {canOptinDebate && (
              <button
                onClick={onDebateOptin}
                disabled={debateOptedIn}
                title={
                  debateOptedIn
                    ? 'Hội đồng sẽ mời bạn phát biểu'
                    : 'Cùng tranh luận với hội đồng'
                }
                className={`flex items-center gap-1.5 px-3 py-2 rounded-full backdrop-blur-md border text-[11.5px] font-bold shadow-lg transition-all ${
                  debateOptedIn
                    ? 'bg-[#22c55e] border-[#22c55e] text-white cursor-default'
                    : 'bg-white/15 border-white/25 text-white/90 hover:bg-white/30'
                }`}
              >
                {debateOptedIn ? (
                  <>
                    <Check size={13} />
                    Đã ghi danh
                  </>
                ) : (
                  <>
                    <MessagesSquare size={13} />
                    Tranh luận cùng AI
                  </>
                )}
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/15 backdrop-blur-md border border-white/20 hover:bg-white/30 text-white/90 shadow-lg transition-all"
              title="Đóng"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Danh sách bong bóng nổi trên nền tối. Bấm vùng tối trống -> đóng. */}
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
          className="flex-1 overflow-y-auto custom-scrollbar px-5 pb-8 pt-1 space-y-3"
        >
          {rows}

          {/* Ẩn ba chấm "đang chạy" lúc đang chờ người học: hội đồng đứng yên chờ MÌNH,
              để ba chấm nhảy thì trông như AI vẫn đang nghĩ. */}
          {streaming && !awaitHuman && (
            <div className="flex items-center gap-1.5 pl-3 pt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-bounce" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 rounded-full bg-white/80 animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
          <div ref={endRef} />

          {awaitHuman && (
            <HumanComposer
              round={awaitHuman.round}
              argsByCritic={argsByCritic}
              pickedCritic={pickedCritic}
              onPickCritic={(v) => {
                setPickedCritic(v)
                setReplyTo(null) // đổi người -> luận điểm cũ không còn thuộc về ai
                // Cuộn tới phát biểu vòng 1 của họ: mục đích của hàng nút này là để vừa
                // ĐỌC lý lẽ vừa viết phản biện, không phải chỉ để chọn.
                scrollToId(r1Rows[v])
              }}
              target={target}
              stance={stance}
              onStanceChange={setStance}
              onPickArg={setReplyTo}
              turnsLeft={(awaitHuman.max_turns ?? 10) - humanTurns}
              hasSpoken={humanTurns > 0}
              sending={debateSending}
              error={debateError}
              onSend={(text) => {
                onDebateSend?.(text, {
                  targetArgId: replyTo,
                  stance: awaitHuman.round === 2 ? stance : null,
                })
                setReplyTo(null) // mỗi phản biện nhắm 1 luận điểm -> chọn lại cho lượt sau
              }}
              onEnd={() => onDebateEnd?.()}
            />
          )}
        </div>
      </div>
    </>
  )
}
