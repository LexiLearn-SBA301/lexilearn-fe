import { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  X,
  Send,
  User,
  Loader2,
  Maximize2,
  Minimize2,
  Cpu,
  ChevronDown,
  Check,
  Square,
} from 'lucide-react'
import {
  sendChatMessage,
  streamChat,
  formatRichText,
  CHAT_MODELS,
  DEFAULT_CHAT_MODEL,
} from '../../../services/chat.service'
import { ThinkingSummaryChip } from './ThinkingSummaryChip'
import { ThinkingProcessPanel } from './ThinkingProcessPanel'
import chatbotInsideIcon from '../../../assets/images/chatbot-inside-icon.png'

// Nhận diện event "bắt đầu viết bài luận" -> mốc để mở 1 bong bóng bản thảo mới trong
// panel suy nghĩ. Quan trọng khi judge YÊU CẦU LÀM LẠI: write_essay chạy lại và phát 1
// CỤM token mới -> mỗi lượt là 1 bản thảo riêng, GIỮ LẠI được trong panel.
const isEssayStart = (ev) =>
  ev?.type === 'status' &&
  ev?.node === 'write_essay' &&
  /đang viết/i.test(ev.content || '')

// Cập nhật bong bóng assistant cuối cùng trong mảng messages (dùng khi stream đổ event dần).
const updateLastAssistant = (messages, fn) => {
  const idx = messages.map((m) => m.role).lastIndexOf('assistant')
  if (idx === -1) return messages
  const next = messages.slice()
  next[idx] = fn(next[idx])
  return next
}

export const AIAssistantPopup = ({ isOpen, onClose, work, initialPrompt }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: work?.title
        ? `Xin chào! Tôi là Mộc Bản AI. Tôi có thể giúp bạn giải đáp các thắc mắc, tóm tắt nội dung hoặc phân tích nghệ thuật về tác phẩm **${work.title}**. Bạn muốn tôi giúp gì nào?`
        : `Xin chào! Tôi là **Mộc Bản AI** — trợ lý văn học của bạn. Tôi có thể tóm tắt, phân tích tác phẩm, giải nghĩa từ Hán–Việt hay trả lời các câu hỏi về văn học Việt Nam. Bạn muốn hỏi gì nào?`,
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  // Model đang chọn + trạng thái mở dropdown chọn model (giống Claude/Gemini)
  const [selectedModel, setSelectedModel] = useState(DEFAULT_CHAT_MODEL)
  const [isModelOpen, setIsModelOpen] = useState(false)
  const messagesEndRef = useRef(null)
  // Index tin nhắn đang mở panel "quá trình suy nghĩ" bên trái (null = đóng).
  const [thinkingIndex, setThinkingIndex] = useState(null)
  // Giữ nguyên thread_id suốt phiên chat để backend nhớ ngữ cảnh nhiều lượt.
  const threadIdRef = useRef(undefined)
  // Cho phép hủy stream đang chạy khi đóng popup / rời trang.
  const abortRef = useRef(null)

  // Bộ gõ chữ (typewriter) cho BẢN THẢO bài luận — hiển thị trong PANEL SUY NGHĨ bên
  // trái, KHÔNG vào box chat. Backend tạo xong bài rồi "tua" token ra gần như MỘT CỤM
  // ngay trước `done`; ta đệm token vào buffer rồi hé lộ dần cho mượt. Mỗi lượt viết
  // (kể cả retry) là 1 bong bóng bản thảo riêng -> lượt bị YÊU CẦU LÀM LẠI vẫn được
  // GIỮ LẠI trong panel thay vì biến mất. Box chat chỉ hiện câu trả lời cuối (done.answer).
  const draftRef = useRef({ target: '', shown: 0, timer: null, done: false })

  const stopDraft = () => {
    if (draftRef.current.timer) {
      clearInterval(draftRef.current.timer)
      draftRef.current.timer = null
    }
  }

  // Ghi text vào event bản thảo đang stream (event 'essay' cuối cùng của bong bóng hiện tại).
  const paintDraft = (text) =>
    setMessages((prev) =>
      updateLastAssistant(prev, (m) => {
        if (!m.events?.length) return m
        const events = m.events.slice()
        for (let i = events.length - 1; i >= 0; i--) {
          if (events[i].type === 'essay') {
            events[i] = { ...events[i], content: text }
            return { ...m, events }
          }
        }
        return m
      }),
    )

  const startDraft = () => {
    if (draftRef.current.timer) return
    draftRef.current.timer = setInterval(() => {
      const t = draftRef.current
      if (t.shown < t.target.length) {
        // Hé lộ nhanh khi còn nhiều chữ, chậm dần về cuối -> cảm giác "gõ" tự nhiên.
        const remaining = t.target.length - t.shown
        t.shown = Math.min(
          t.target.length,
          t.shown + Math.max(4, Math.ceil(remaining / 20)),
        )
        paintDraft(t.target.slice(0, t.shown))
      } else if (t.done) {
        stopDraft()
      }
    }, 24)
  }

  // Chốt NGAY bản thảo hiện tại: dừng gõ + hiện đủ toàn bộ text đã nhận. Dùng khi bắt
  // đầu lượt mới (retry) — phải khoá bong bóng cũ trước khi mở bong bóng mới, tránh gõ
  // nhầm phần còn lại vào bản thảo mới.
  const snapDraft = () => {
    stopDraft()
    const t = draftRef.current
    t.shown = t.target.length
    if (t.target) paintDraft(t.target)
  }

  // Chốt bản thảo cuối (gõ nốt phần còn lại rồi dừng). Dùng khi nhận `done` / kết thúc
  // sớm — lúc này không còn bong bóng mới nào mở nữa nên cứ để gõ hết cho mượt.
  const finalizeDraft = () => {
    const t = draftRef.current
    t.done = true
    if (t.shown >= t.target.length) {
      t.shown = t.target.length
      if (t.target) paintDraft(t.target)
      stopDraft()
    } else {
      startDraft()
    }
  }

  const activeModel =
    CHAT_MODELS.find((m) => m.id === selectedModel) ?? CHAT_MODELS[0]

  // Model streaming (SSE): đổ timeline tư duy realtime rồi mới có câu trả lời cuối.
  const handleStream = async (message) => {
    // Thêm 1 bong bóng assistant rỗng để đổ event vào dần.
    setMessages((prev) => [
      ...prev,
      {
        role: 'assistant',
        content: '',
        events: [],
        streaming: true,
        error: null,
      },
    ])

    // Reset bộ gõ bản thảo cho lượt mới (dừng interval cũ nếu còn sót).
    stopDraft()
    draftRef.current = { target: '', shown: 0, timer: null, done: false }

    if (!threadIdRef.current) threadIdRef.current = crypto.randomUUID()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      await streamChat({
        message,
        threadId: threadIdRef.current,
        signal: controller.signal,
        onEvent: (ev) => {
          // token = mẩu chữ bản thảo bài luận -> gõ vào PANEL SUY NGHĨ (bong bóng 'essay'
          // đang mở), KHÔNG vào box chat. (BE tua cả cụm token ngay trước `done`.)
          if (ev.type === 'token' && ev.is_partial) {
            draftRef.current.target += ev.content || ''
            startDraft()
            return
          }
          // Bắt đầu 1 lượt viết bài mới (kể cả khi judge YÊU CẦU LÀM LẠI): chốt bản thảo
          // cũ rồi mở 1 bong bóng 'essay' mới trong timeline -> mọi lượt đều được giữ lại.
          const essayStart = isEssayStart(ev)
          if (essayStart) {
            snapDraft()
            draftRef.current = {
              target: '',
              shown: 0,
              timer: null,
              done: false,
            }
          }
          setMessages((prev) =>
            updateLastAssistant(prev, (m) => {
              const events = [...(m.events || []), ev]
              // Ngay sau status "Đang viết bài luận…" -> chèn 1 bong bóng bản thảo rỗng
              // để token đổ dần vào (hiển thị trong panel suy nghĩ).
              if (essayStart)
                events.push({
                  type: 'essay',
                  node: 'write_essay',
                  content: '',
                  is_partial: true,
                  payload: { ui: { group: 'final' } },
                })
              // Câu trả lời cuối CHỈ hiện ở box chat, lấy từ done.answer (nguồn sự thật).
              if (ev.type === 'done')
                return {
                  ...m,
                  events,
                  streaming: false,
                  content: ev.payload?.answer ?? m.content,
                }
              if (ev.type === 'error')
                return {
                  ...m,
                  events,
                  streaming: false,
                  error: ev.content || 'Lỗi stream',
                }
              return { ...m, events }
            }),
          )
          // done -> gõ nốt bản thảo cuối trong panel (không đụng vào box chat).
          if (ev.type === 'done') finalizeDraft()
        },
      })
    } catch (e) {
      // Người dùng chủ động hủy (bấm Dừng / đóng popup): tắt bộ gõ bản thảo và chốt
      // bong bóng lại — nếu chưa kịp có câu trả lời thì ghi rõ là đã dừng.
      if (e?.name === 'AbortError') {
        stopDraft()
        setMessages((prev) =>
          updateLastAssistant(prev, (m) => ({
            ...m,
            streaming: false,
            content: m.content || 'Đã dừng theo yêu cầu của bạn.',
          })),
        )
        return
      }
      const detail = e?.message || 'Lỗi không xác định'
      setMessages((prev) =>
        updateLastAssistant(prev, (m) => ({
          ...m,
          streaming: false,
          error: m.content ? null : `Mất kết nối stream (${detail}).`,
        })),
      )
      // Chốt bản thảo đang gõ dở (nếu có) rồi dừng bộ gõ.
      finalizeDraft()
    } finally {
      abortRef.current = null
      // Nếu stream đóng mà chưa kịp có done -> vẫn tắt trạng thái đang chạy.
      setMessages((prev) =>
        updateLastAssistant(prev, (m) =>
          m.streaming ? { ...m, streaming: false } : m,
        ),
      )
    }
  }

  // Model blocking (2 model cũ): gọi 1 phát, nhận nguyên câu trả lời.
  const handleBlocking = async (message, modelId) => {
    try {
      const { answer } = await sendChatMessage({ message, modelId })
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: answer || 'Xin lỗi, tôi chưa nhận được nội dung trả lời.',
        },
      ])
    } catch (error) {
      const detail =
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        'Lỗi không xác định'
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Không kết nối được tới chatbot (${detail}). Vui lòng kiểm tra server AI đang chạy.`,
        },
      ])
    }
  }

  const handleSend = async (text) => {
    const messageText = typeof text === 'string' ? text : input
    if (!messageText.trim() || isTyping) return

    const model =
      CHAT_MODELS.find((m) => m.id === selectedModel) ?? CHAT_MODELS[0]
    const content = messageText.trim()
    setMessages((prev) => [...prev, { role: 'user', content }])
    setInput('')
    setIsTyping(true)

    try {
      if (model.streaming) await handleStream(content)
      else await handleBlocking(content, model.id)
    } finally {
      setIsTyping(false)
    }
  }

  // Xử lý khi có initialPrompt từ việc bôi đen
  useEffect(() => {
    if (initialPrompt && isOpen) {
      setTimeout(() => handleSend(initialPrompt), 0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt, isOpen])

  // Tự động scroll xuống cuối
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Hủy stream đang chạy khi đóng popup.
  useEffect(() => {
    if (!isOpen) {
      abortRef.current?.abort()
      abortRef.current = null
      stopDraft()
    }
  }, [isOpen])
  useEffect(
    () => () => {
      abortRef.current?.abort()
      stopDraft()
    },
    [],
  )

  // Đóng popup: reset panel suy nghĩ để lần mở sau không tự bung lại panel cũ.
  const handleClose = () => {
    setThinkingIndex(null)
    onClose()
  }

  // Dừng lượt streaming đang chạy: abort fetch -> backend cancel luôn workflow deep
  // (LangGraph hủy node đang chạy, request tới Ollama bị hủy theo).
  const handleStop = () => {
    abortRef.current?.abort()
    abortRef.current = null
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) return null

  // Chỉ model streaming mới hủy được giữa chừng (2 model blocking không có kết nối để đóng).
  const canStop =
    isTyping && !!CHAT_MODELS.find((m) => m.id === selectedModel)?.streaming

  const thinkingMsg = thinkingIndex != null ? messages[thinkingIndex] : null

  return (
    <>
      {/* Lớp phủ tối bên trái — hiện quá trình suy nghĩ khi bấm chip trong chat */}
      <ThinkingProcessPanel
        open={!!thinkingMsg}
        events={thinkingMsg?.events || []}
        streaming={thinkingMsg?.streaming}
        isExpanded={isExpanded}
        onClose={() => setThinkingIndex(null)}
      />

      <div
        className={`fixed z-[80] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex flex-col bg-[#FAF3E7]/95 backdrop-blur-3xl shadow-[0_20px_80px_rgba(65,35,17,0.15),0_0_0_1px_rgba(131,116,109,0.1)] animate-in fade-in slide-in-from-bottom-12 zoom-in-[0.98]
        ${
          isExpanded
            ? 'inset-0 md:inset-y-0 md:left-auto md:right-0 md:w-[640px] rounded-none md:rounded-l-[32px]'
            : 'bottom-24 right-6 w-[400px] h-[600px] max-h-[80vh] rounded-[32px]'
        }
      `}
      >
        {/* Texture nền giấy */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] rounded-[inherit]"></div>

        {/* Header Premium Light */}
        <div className="relative px-7 py-6 bg-white/40 backdrop-blur-xl border-b border-[#83746d]/10 flex items-center justify-between rounded-t-[inherit] z-10 flex-shrink-0">
          <div className="flex items-center gap-4">
            <img
              src={chatbotInsideIcon}
              alt="Mộc Bản AI"
              className="w-15 h-15 rounded-2xl object-contain drop-shadow-[0_4px_12px_rgba(65,35,17,0.22)]"
            />
            <div>
              <h3 className="font-title text-[18px] font-black flex items-center gap-2 tracking-wide text-[#412311]">
                Mộc Bản AI
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#ab3429]/10">
                  <Sparkles size={12} className="text-[#ab3429]" />
                </span>
              </h3>
              <p className="text-[10.5px] text-[#83746d] font-bold tracking-[0.15em] uppercase mt-1">
                Trợ lý Văn học Cao cấp
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md rounded-full p-1 border border-[#83746d]/10 shadow-sm">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 rounded-full hover:bg-white transition-all text-[#83746d] hover:text-[#412311]"
              title={isExpanded ? 'Thu nhỏ' : 'Mở rộng'}
            >
              {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
            <div className="w-[1px] h-4 bg-[#83746d]/20 mx-0.5"></div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-white transition-all text-[#83746d] hover:text-[#ab3429]"
              title="Đóng"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Thanh chọn Model (giống bộ chọn model của Claude/Gemini) */}
        <div className="relative px-6 py-3 bg-white/30 backdrop-blur-md border-b border-[#83746d]/10 z-30 flex-shrink-0">
          <button
            onClick={() => setIsModelOpen((v) => !v)}
            className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#83746d]/20 shadow-sm hover:border-[#ab3429]/50 hover:bg-[#ab3429]/[0.03] transition-all"
            title="Chọn mô hình AI"
          >
            <Cpu size={14} className="text-[#ab3429]" />
            <span className="text-[12px] font-bold text-[#412311] tracking-wide">
              {activeModel.label}
            </span>
            <ChevronDown
              size={14}
              className={`text-[#83746d] transition-transform duration-300 ${
                isModelOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {isModelOpen && (
            <>
              {/* Lớp phủ bắt click ra ngoài để đóng dropdown */}
              <div
                className="fixed inset-0 z-30"
                onClick={() => setIsModelOpen(false)}
              />
              <div className="absolute left-6 top-full mt-1.5 w-[260px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_12px_40px_rgba(65,35,17,0.18)] border border-[#83746d]/15 z-40 p-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                {CHAT_MODELS.map((model) => {
                  const isActive = model.id === selectedModel
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        setSelectedModel(model.id)
                        setIsModelOpen(false)
                      }}
                      className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${
                        isActive
                          ? 'bg-[#ab3429]/[0.08]'
                          : 'hover:bg-[#83746d]/[0.08]'
                      }`}
                    >
                      <Cpu
                        size={16}
                        className={`mt-0.5 flex-shrink-0 ${
                          isActive ? 'text-[#ab3429]' : 'text-[#83746d]'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <span
                          className={`block text-[13px] font-bold ${
                            isActive ? 'text-[#ab3429]' : 'text-[#412311]'
                          }`}
                        >
                          {model.label}
                        </span>
                        <span className="block text-[11px] text-[#83746d] mt-0.5 leading-snug">
                          {model.description}
                        </span>
                      </div>
                      {isActive && (
                        <Check
                          size={16}
                          className="text-[#ab3429] mt-0.5 flex-shrink-0"
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* Chat Area */}
        <div className="relative flex-1 overflow-y-auto p-5 custom-scrollbar flex flex-col gap-6 z-10">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user'
            const hasEvents = !isUser && msg.events?.length > 0
            return (
              <div
                key={index}
                className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar — khách hàng giữ icon người, bot dùng ảnh chatbot-inside-icon */}
                {isUser ? (
                  <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center mt-1 shadow-sm border bg-white border-[#83746d]/20 text-[#ab3429]">
                    <User size={16} />
                  </div>
                ) : (
                  <img
                    src={chatbotInsideIcon}
                    alt="Mộc Bản AI"
                    className="w-9 h-9 rounded-xl object-contain flex-shrink-0 mt-1 drop-shadow-[0_3px_8px_rgba(65,35,17,0.18)]"
                  />
                )}

                {/* Cột nội dung: chip mở panel suy nghĩ (nếu có) + bong bóng trả lời */}
                <div
                  className={`flex flex-col gap-2 min-w-0 max-w-[85%] ${
                    isUser ? 'items-end' : 'items-start'
                  }`}
                >
                  {hasEvents && (
                    <ThinkingSummaryChip
                      events={msg.events}
                      streaming={msg.streaming}
                      active={thinkingIndex === index}
                      onOpen={() =>
                        setThinkingIndex((cur) =>
                          cur === index ? null : index,
                        )
                      }
                    />
                  )}

                  {msg.error && (
                    <div className="w-fit max-w-full rounded-3xl rounded-tl-sm p-4 text-[14px] leading-relaxed bg-[#ef4444]/[0.08] border border-[#ef4444]/25 text-[#b91c1c] font-body">
                      ⚠️ {msg.error} Vui lòng kiểm tra server AI đang chạy rồi
                      thử lại.
                    </div>
                  )}

                  {msg.content && (
                    <div
                      className={`w-fit max-w-full rounded-3xl p-4 md:p-5 text-[14.5px] leading-[1.85] break-words relative ${
                        isUser
                          ? 'bg-[#ab3429] text-white rounded-tr-sm shadow-[0_6px_20px_rgba(171,52,41,0.2)] border border-[#8a1c14] font-body'
                          : 'bg-white text-[#2b211c] rounded-tl-sm border border-[#83746d]/15 shadow-sm font-quote'
                      }`}
                    >
                      <span
                        dangerouslySetInnerHTML={{
                          __html: formatRichText(msg.content),
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )
          })}

          {/* Typing Indicator — chỉ cho model blocking; model streaming đã có spinner ở timeline */}
          {isTyping && !messages[messages.length - 1]?.streaming && (
            <div className="flex gap-3 flex-row animate-in fade-in duration-500 pl-2">
              <img
                src={chatbotInsideIcon}
                alt="Mộc Bản AI"
                className="w-9 h-9 rounded-xl object-contain flex-shrink-0 mt-1 drop-shadow-[0_3px_8px_rgba(65,35,17,0.18)]"
              />
              <div className="bg-white border border-[#83746d]/15 shadow-sm rounded-3xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#ab3429]/60 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-[#ab3429]/60 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-2 h-2 rounded-full bg-[#ab3429]/60 animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Gợi ý câu hỏi nhanh (Quick Prompts) */}
        <div className="relative px-6 py-4 flex gap-2.5 overflow-x-auto custom-scrollbar no-scrollbar border-t border-[#83746d]/10 bg-white/40 backdrop-blur-md z-10 flex-shrink-0">
          {['Tóm tắt', 'Phân tích nhân vật', 'Nghệ thuật'].map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleSend(prompt)}
              className="whitespace-nowrap px-5 py-2.5 bg-white border border-[#83746d]/20 text-[#412311] text-[11px] font-bold uppercase tracking-[0.1em] rounded-full hover:border-[#ab3429] hover:text-[#ab3429] hover:bg-[#ab3429]/5 transition-all duration-300 shadow-sm"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="relative p-6 pt-3 bg-white/60 backdrop-blur-xl border-t border-[#83746d]/10 rounded-b-[inherit] z-10 flex-shrink-0">
          <div className="relative flex items-end gap-3 bg-white rounded-2xl border border-[#83746d]/20 shadow-sm p-2 focus-within:border-[#ab3429]/50 focus-within:ring-4 focus-within:ring-[#ab3429]/10 transition-all duration-300">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Hỏi Mộc Bản AI bất cứ điều gì..."
              className="w-full max-h-[150px] min-h-[48px] bg-transparent border-none focus:ring-0 resize-none py-3 px-4 text-[14.5px] text-[#412311] font-body placeholder:text-[#83746d]/50 custom-scrollbar leading-[1.6]"
              rows={1}
            />
            <button
              onClick={canStop ? handleStop : handleSend}
              disabled={canStop ? false : !input.trim() || isTyping}
              title={canStop ? 'Dừng' : 'Gửi'}
              className="w-12 h-12 rounded-xl bg-[#ab3429] text-white flex items-center justify-center hover:bg-[#8a1c14] hover:shadow-[0_4px_15px_rgba(171,52,41,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 disabled:opacity-40 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:active:scale-100 mb-0.5 mr-0.5 flex-shrink-0"
            >
              {canStop ? (
                <Square size={16} fill="currentColor" />
              ) : isTyping ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={18} className="-ml-1" />
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
