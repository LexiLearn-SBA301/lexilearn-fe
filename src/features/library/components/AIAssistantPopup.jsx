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
  History,
  Plus,
  Trash2,
  Lock,
} from 'lucide-react'
import {
  sendChatMessage,
  streamChat,
  stopStream,
  formatRichText,
  CHAT_MODELS,
  DEFAULT_CHAT_MODEL,
  listConversations,
  openConversation,
  deleteConversation,
  debateOptin,
  debateReply,
} from '../../../services/chat.service'
import { ThinkingSummaryChip } from './ThinkingSummaryChip'
import { ThinkingProcessPanel } from './ThinkingProcessPanel'
import { useAuthStore } from '../../auth/store/auth.store'
import chatbotInsideIcon from '../../../assets/images/chatbot-inside-icon.png'

// Nhận diện event "bắt đầu viết bài luận" -> mốc để mở 1 bong bóng bản thảo mới trong
// panel suy nghĩ. Quan trọng khi judge YÊU CẦU LÀM LẠI: write_essay chạy lại và phát 1
// CỤM token mới -> mỗi lượt là 1 bản thảo riêng, GIỮ LẠI được trong panel.
const isEssayStart = (ev) =>
  ev?.type === 'status' &&
  ev?.node === 'write_essay' &&
  /đang viết/i.test(ev.content || '')

// Ba chấm nhảy — báo hiệu AI đang xử lý. Dùng cho cả model blocking (chờ trả lời) lẫn
// model streaming trong khoảng chờ event SSE ĐẦU TIÊN (lúc này chưa có timeline để hiện).
const TypingDots = () => (
  <div className="w-fit bg-white border border-[#83746d]/15 shadow-sm rounded-3xl rounded-tl-sm px-5 py-4 flex items-center gap-2">
    <div className="w-2 h-2 rounded-full bg-[#ab3429]/60 animate-bounce"></div>
    <div className="w-2 h-2 rounded-full bg-[#ab3429]/60 animate-bounce [animation-delay:0.2s]"></div>
    <div className="w-2 h-2 rounded-full bg-[#ab3429]/60 animate-bounce [animation-delay:0.4s]"></div>
  </div>
)

// Cập nhật bong bóng assistant cuối cùng trong mảng messages (dùng khi stream đổ event dần).
const updateLastAssistant = (messages, fn) => {
  const idx = messages.map((m) => m.role).lastIndexOf('assistant')
  if (idx === -1) return messages
  const next = messages.slice()
  next[idx] = fn(next[idx])
  return next
}

// Lời chào mở đầu (bong bóng client-side, KHÔNG lưu DB). Dùng cho cả khởi tạo lẫn "đoạn mới".
const greetingFor = (work) => ({
  role: 'assistant',
  content: work?.title
    ? `Xin chào! Tôi là Mộc Bản AI. Tôi có thể giúp bạn giải đáp các thắc mắc, tóm tắt nội dung hoặc phân tích nghệ thuật về tác phẩm **${work.title}**. Bạn muốn tôi giúp gì nào?`
    : `Xin chào! Tôi là **Mộc Bản AI** — trợ lý văn học của bạn. Tôi có thể tóm tắt, phân tích tác phẩm, giải nghĩa từ Hán–Việt hay trả lời các câu hỏi về văn học Việt Nam. Bạn muốn hỏi gì nào?`,
})

export const AIAssistantPopup = ({ isOpen, onClose, work, initialPrompt }) => {
  const [messages, setMessages] = useState(() => [greetingFor(work)])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  // Model đang chọn + trạng thái mở dropdown chọn model (giống Claude/Gemini)
  const [selectedModel, setSelectedModel] = useState(DEFAULT_CHAT_MODEL)
  const [isModelOpen, setIsModelOpen] = useState(false)
  const messagesEndRef = useRef(null)
  // Index tin nhắn đang mở panel "quá trình suy nghĩ" bên trái (null = đóng).
  const [thinkingIndex, setThinkingIndex] = useState(null)
  // conversationId do BE cấp (event "conversation" đầu stream). null = đoạn mới chưa tạo DB.
  // Ref: đọc/ghi đồng bộ trong luồng stream (không gây re-render). State: chỉ để highlight
  // đoạn đang mở trong dropdown lịch sử lúc render. Luôn set qua setConversationId để 2 giá
  // trị không lệch nhau.
  const conversationIdRef = useRef(null)
  const [activeConversationId, setActiveConversationId] = useState(null)
  const setConversationId = (id) => {
    conversationIdRef.current = id
    setActiveConversationId(id)
  }
  // Lịch sử hội thoại (dropdown trên header).
  const [historyOpen, setHistoryOpen] = useState(false)
  const [conversations, setConversations] = useState([])
  // Cho phép hủy stream đang chạy khi đóng popup / rời trang.
  const abortRef = useRef(null)

  // --- Tranh luận cùng hội đồng AI ---
  // optedIn: đã bấm nút xin tham gia (cửa sổ bấm = lúc AI chuẩn bị ngữ cảnh).
  // locked:  hội đồng đã bắt đầu -> bấm nữa cũng vô nghĩa (AI đã đọc & xoá cờ).
  // awaitHuman: != null nghĩa là hội đồng đang DỪNG chờ mình phát biểu.
  const [debateOptedIn, setDebateOptedIn] = useState(false)
  const [debateLocked, setDebateLocked] = useState(false)
  const [awaitHuman, setAwaitHuman] = useState(null)
  const [humanTurns, setHumanTurns] = useState(0)
  const [debateSending, setDebateSending] = useState(false)
  const [debateError, setDebateError] = useState(null)
  // Chỉ luồng deep mới có hội đồng để tranh luận cùng. Supervisor chốt route rồi mới bắn
  // event `route` -> trước đó chưa biết, nên KHÔNG mời. Thiếu cờ này thì nút hiện cả ở
  // lượt route=factual, bấm vào chẳng có tác dụng gì.
  const [isDeepRun, setIsDeepRun] = useState(false)
  // Index bong bóng assistant của lượt stream hiện tại -> tự bung panel suy nghĩ khi tới
  // lượt người học (không bung thì họ chẳng thấy lời mời lẫn luận điểm để phản biện).
  const streamIndexRef = useRef(null)

  const resetDebate = () => {
    setDebateOptedIn(false)
    setDebateLocked(false)
    setAwaitHuman(null)
    setHumanTurns(0)
    setDebateError(null)
    setIsDeepRun(false)
  }

  // Trạng thái đăng nhập: có accessToken = đã đăng nhập. Lịch sử trò chuyện là dữ liệu
  // riêng theo user (BE gắn theo tài khoản) nên chỉ mở cho người đã đăng nhập.
  const accessToken = useAuthStore((s) => s.accessToken)
  const isAuthenticated = Boolean(accessToken)

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
    resetDebate()
    setMessages((prev) => {
      streamIndexRef.current = prev.length // index bong bóng vừa thêm (để tự mở panel)
      return [
        ...prev,
        {
          role: 'assistant',
          content: '',
          events: [],
          streaming: true,
          error: null,
        },
      ]
    })

    // Reset bộ gõ bản thảo cho lượt mới (dừng interval cũ nếu còn sót).
    stopDraft()
    draftRef.current = { target: '', shown: 0, timer: null, done: false }

    const controller = new AbortController()
    abortRef.current = controller

    try {
      await streamChat({
        message,
        conversationId: conversationIdRef.current,
        signal: controller.signal,
        onEvent: (ev) => {
          // Event đầu của BE: conversationId thực (đoạn mới vừa tạo / đoạn đang chat) -> lưu lại.
          if (ev.type === 'conversation') {
            setConversationId(ev.conversationId)
            return
          }
          // token = mẩu chữ bản thảo bài luận -> gõ vào PANEL SUY NGHĨ (bong bóng 'essay'
          // đang mở), KHÔNG vào box chat. (BE tua cả cụm token ngay trước `done`.)
          if (ev.type === 'token' && ev.is_partial) {
            draftRef.current.target += ev.content || ''
            startDraft()
            return
          }
          // Supervisor vừa chốt hướng xử lý. Chỉ 'deep_analysis' mới có hội đồng tranh
          // luận -> đây là lúc nút "Tranh luận cùng AI" được phép hiện.
          if (ev.type === 'route') {
            setIsDeepRun((ev.payload?.route ?? ev.content) === 'deep_analysis')
            return
          }
          // Hội đồng đã bắt đầu -> ẩn nút xin tham gia (tín hiệu điều khiển, không hiện
          // trên timeline).
          if (ev.type === 'debate_lock') {
            setDebateLocked(true)
            return
          }
          // Lưới an toàn cho việc khoá nút: `debate_lock` CHỈ được AI bắn khi người học đã
          // ghi danh ĐÚNG LÚC (cờ opt-in còn sống khi node debate đọc). Ghi danh trễ hoặc
          // không ghi danh -> KHÔNG có event đó, nút "Tranh luận cùng AI"/"Đã ghi danh" sẽ
          // treo lại suốt lúc hội đồng đang nói. Vậy nên coi MỌI dấu hiệu hội đồng đã lên
          // tiếng (critic_turn/bulletin/await_human) là mốc chốt: qua đây thì ghi danh đằng
          // nào cũng trễ -> khoá nút. KHÔNG return: các event này vẫn phải chảy vào timeline.
          if (
            ev.type === 'critic_turn' ||
            ev.type === 'bulletin' ||
            ev.type === 'await_human'
          ) {
            setDebateLocked(true)
          }
          // Tới lượt người học: mở ô nhập + tự bung panel (lời mời và các luận điểm cần
          // phản biện đều nằm trong panel, không bung thì họ không thấy gì để trả lời).
          if (ev.type === 'await_human') {
            if (ev.payload?.closed) {
              setAwaitHuman(null)
            } else {
              setAwaitHuman({
                round: ev.payload?.round ?? 1,
                max_turns: ev.payload?.max_turns ?? 10,
                valid_arg_ids: ev.payload?.valid_arg_ids ?? [],
              })
              setHumanTurns(0)
              setDebateError(null)
              if (streamIndexRef.current != null)
                setThinkingIndex(streamIndexRef.current)
            }
            // KHÔNG return: vẫn cho event chảy vào timeline làm dấu mốc "chỗ tôi được mời".
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
      // Stream đóng (xong / lỗi / bị dừng) -> chắc chắn không còn ai chờ mình phát biểu.
      setAwaitHuman(null)
      // Nếu stream đóng mà chưa kịp có done -> vẫn tắt trạng thái đang chạy.
      setMessages((prev) =>
        updateLastAssistant(prev, (m) =>
          m.streaming ? { ...m, streaming: false } : m,
        ),
      )
    }
  }

  // --- Tranh luận cùng hội đồng ---

  // Xin tham gia. Chỉ bấm được khi đã có conversationId (event đầu của BE) — chưa có thì
  // AI chưa biết thread nào để gắn cờ.
  const handleDebateOptin = async () => {
    const id = conversationIdRef.current
    if (!id || debateOptedIn || debateLocked) return
    setDebateOptedIn(true) // lạc quan: phản hồi tức thì, hỏng thì trả lại bên dưới
    try {
      await debateOptin(id)
    } catch {
      setDebateOptedIn(false)
    }
  }

  const sendDebate = async (payload) => {
    const id = conversationIdRef.current
    if (!id) return false
    setDebateSending(true)
    setDebateError(null)
    try {
      await debateReply(id, payload)
      return true
    } catch (e) {
      // 409 = hết giờ chờ / đã kết thúc -> đóng luôn ô nhập, gõ thêm cũng vô ích.
      const status = e?.response?.status
      const detail =
        e?.response?.data?.message || e?.response?.data?.detail || e?.message
      if (status === 409) setAwaitHuman(null)
      setDebateError(
        status === 409
          ? 'Hội đồng đã tiếp tục — lượt phát biểu đã khép lại.'
          : detail || 'Không gửi được, thử lại nhé.',
      )
      return false
    } finally {
      setDebateSending(false)
    }
  }

  const handleDebateSend = async (text, { targetArgId, stance }) => {
    const ok = await sendDebate({ message: text, targetArgId, stance })
    if (ok) setHumanTurns((n) => n + 1)
  }

  // "Bỏ qua" và "Kết thúc phản biện" là CÙNG một tín hiệu (message rỗng) — khác nhau đúng
  // ở nhãn nút. Đóng ô nhập ngay, không đợi AI xác nhận.
  const handleDebateEnd = async () => {
    setAwaitHuman(null)
    await sendDebate({ message: null })
  }

  // Model blocking (2 model đơn): gọi 1 phát, nhận nguyên câu trả lời.
  const handleBlocking = async (message, modelId) => {
    try {
      const { conversationId, answer } = await sendChatMessage({
        message,
        modelId,
        conversationId: conversationIdRef.current,
      })
      // Đã đăng nhập -> BE trả conversationId (đoạn mới vừa tạo / đoạn đang chat) -> lưu để chat tiếp.
      if (conversationId) setConversationId(conversationId)
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

  // Đang tới lượt người học mà rời trang -> MẤT TRẮNG cả lượt tranh luận: hội đồng sống
  // trong RAM của AI theo kết nối stream này, F5 là stream đứt, 8 lượt critic đã chạy cũng
  // đi theo. Cảnh báo trước khi họ mất công gõ.
  useEffect(() => {
    if (!awaitHuman) return
    const warn = (e) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [awaitHuman])

  // Hủy stream đang chạy khi đóng popup. (Không cần tự tắt awaitHuman ở đây: abort làm
  // streamChat reject -> khối finally của handleStream đã setAwaitHuman(null).)
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

  // Đăng xuất: xóa sạch lịch sử + đoạn chat của phiên trước để người dùng sau KHÔNG thấy
  // dữ liệu người trước (popup mount 1 lần toàn app, không tự remount khi logout nên state
  // cũ còn nguyên). Lắng nghe store và chỉ reset khi accessToken chuyển từ CÓ -> null (đăng
  // xuất); token refresh đổi accessToken sang giá trị MỚI khác null nên không kích hoạt reset
  // -> đang chat không bị xoá oan.
  useEffect(
    () =>
      useAuthStore.subscribe((state, prev) => {
        if (!prev.accessToken || state.accessToken) return
        abortRef.current?.abort()
        abortRef.current = null
        stopDraft()
        setConversations([])
        setConversationId(null)
        setThinkingIndex(null)
        setHistoryOpen(false)
        setMessages([greetingFor(work)])
        // Đang dùng model cần token mà đăng xuất -> về model mặc định, tránh gửi rồi dính 401.
        setSelectedModel((prev) =>
          CHAT_MODELS.find((m) => m.id === prev)?.requiresAuth
            ? DEFAULT_CHAT_MODEL
            : prev,
        )
      }),
    [work],
  )

  // Đóng popup: reset panel suy nghĩ để lần mở sau không tự bung lại panel cũ.
  const handleClose = () => {
    setThinkingIndex(null)
    onClose()
  }

  // Dừng lượt streaming đang chạy: abort fetch -> backend cancel luôn workflow deep
  // (LangGraph hủy node đang chạy, request tới Ollama bị hủy theo).
  const handleStop = () => {
    // Báo BE huỷ THẬT (đóng BE↔AI -> Ollama dừng, KHÔNG lưu câu trả lời) rồi mới abort fetch.
    // Có conversationId mới gọi được; chưa có (rớt cửa sổ <1s đầu) thì chỉ abort -> BE coi như
    // rớt tạm thời và vẫn lưu final. best-effort: lỗi /stop không được chặn việc dừng UI.
    const id = conversationIdRef.current
    if (id) stopStream(id).catch(() => {})
    abortRef.current?.abort()
    abortRef.current = null
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // --- Lịch sử hội thoại ---
  const refreshHistory = async () => {
    try {
      setConversations(await listConversations())
    } catch {
      // chưa đăng nhập / lỗi mạng -> xóa danh sách để không hiện dữ liệu cũ của phiên trước
      setConversations([])
    }
  }

  const handleToggleHistory = () => {
    setHistoryOpen((v) => {
      const next = !v
      if (next) refreshHistory()
      return next
    })
  }

  // Đoạn chat mới: quên conversationId để lượt gửi sau BE tạo đoạn mới; reset về lời chào.
  const handleNewChat = () => {
    if (isTyping) return
    setConversationId(null)
    setMessages([greetingFor(work)])
    setThinkingIndex(null)
    setHistoryOpen(false)
  }

  // Mở lại 1 đoạn cũ: nạp transcript từ BE (BE cũng seed lại AI để chat tiếp).
  const handleLoadConversation = async (id) => {
    if (isTyping) return
    try {
      const detail = await openConversation(id)
      setConversationId(detail.id)
      const loaded = (detail.messages || []).map((m) => ({
        role:
          String(m.role).toLowerCase() === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      }))
      setMessages(loaded.length ? loaded : [greetingFor(work)])
      setThinkingIndex(null)
      setHistoryOpen(false)
    } catch {
      /* lỗi -> giữ nguyên màn hình hiện tại */
    }
  }

  const handleDeleteConversation = async (id, e) => {
    e.stopPropagation()
    try {
      await deleteConversation(id)
      setConversations((prev) => prev.filter((c) => c.id !== id))
      if (conversationIdRef.current === id) handleNewChat()
    } catch {
      /* ignore */
    }
  }

  if (!isOpen) return null

  // Chỉ model streaming mới hủy được giữa chừng (2 model blocking không có kết nối để đóng).
  const canStop =
    isTyping && !!CHAT_MODELS.find((m) => m.id === selectedModel)?.streaming

  // Cửa sổ bấm "Tranh luận cùng AI": từ lúc supervisor chốt route=deep tới lúc hội đồng
  // khai mạc (debate_lock). Cần cả conversationId (AI gắn cờ theo thread) — chưa có thì
  // chưa bấm được. Ngoài cửa sổ này nút biến mất thay vì để đó cho bấm hụt.
  const canOptinDebate =
    canStop &&
    isDeepRun &&
    !debateLocked &&
    !!activeConversationId &&
    !awaitHuman

  const thinkingMsg = thinkingIndex != null ? messages[thinkingIndex] : null

  // Bộ chọn model (nút + dropdown) — tách riêng để đặt CHUNG hàng với cụm nút action trên
  // header (cả khi thu nhỏ lẫn mở rộng), bỏ thanh chọn model riêng cho gọn màn hình chat.
  // Dropdown mở về phía có chỗ: thu nhỏ (nút bên trái) -> xổ sang phải (left-0); mở rộng
  // (nút bên phải) -> xổ sang trái (right-0), tránh tràn mép popup.
  const modelSelector = (
    <div className="relative">
      <button
        onClick={() => setIsModelOpen((v) => !v)}
        className="group flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#83746d]/20 shadow-sm hover:border-[#ab3429]/50 hover:bg-[#ab3429]/[0.03] transition-all"
        title="Chọn mô hình AI"
      >
        <Cpu size={14} className="text-[#ab3429]" />
        <span className="text-[12px] font-bold text-[#412311] tracking-wide whitespace-nowrap">
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
          <div
            className={`absolute top-full mt-1.5 w-[260px] bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_12px_40px_rgba(65,35,17,0.18)] border border-[#83746d]/15 z-40 p-1.5 animate-in fade-in slide-in-from-top-1 duration-200 ${
              isExpanded ? 'right-0' : 'left-0'
            }`}
          >
            {CHAT_MODELS.map((model) => {
              const isActive = model.id === selectedModel
              // Model cần token (Trạng Nguyên): khách chưa đăng nhập -> làm mờ, khoá chọn
              // và đổi mô tả thành lời mời đăng nhập thay vì để họ chọn rồi dính 401.
              const isLocked = model.requiresAuth && !isAuthenticated
              return (
                <button
                  key={model.id}
                  disabled={isLocked}
                  onClick={() => {
                    setSelectedModel(model.id)
                    setIsModelOpen(false)
                  }}
                  className={`w-full flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${
                    isLocked
                      ? 'opacity-45 cursor-not-allowed'
                      : isActive
                        ? 'bg-[#ab3429]/[0.08]'
                        : 'hover:bg-[#83746d]/[0.08]'
                  }`}
                >
                  {isLocked ? (
                    <Lock
                      size={16}
                      className="mt-0.5 flex-shrink-0 text-[#83746d]"
                    />
                  ) : (
                    <Cpu
                      size={16}
                      className={`mt-0.5 flex-shrink-0 ${
                        isActive ? 'text-[#ab3429]' : 'text-[#83746d]'
                      }`}
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <span
                      className={`block text-[13px] font-bold ${
                        isActive && !isLocked
                          ? 'text-[#ab3429]'
                          : 'text-[#412311]'
                      }`}
                    >
                      {model.label}
                    </span>
                    <span className="block text-[11px] text-[#83746d] mt-0.5 leading-snug">
                      {isLocked
                        ? 'Đăng nhập để trải nghiệm'
                        : model.description}
                    </span>
                  </div>
                  {isActive && !isLocked && (
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
  )

  const actionButtons = (
    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md rounded-full p-1 border border-[#83746d]/10 shadow-sm">
      <button
        onClick={handleNewChat}
        className="p-2 rounded-full hover:bg-white transition-all text-[#83746d] hover:text-[#412311]"
        title="Đoạn chat mới"
      >
        <Plus size={16} />
      </button>
      {/* Lịch sử trò chuyện chỉ dành cho người đã đăng nhập (dữ liệu theo tài khoản) */}
      {isAuthenticated && (
        <button
          onClick={handleToggleHistory}
          className={`p-2 rounded-full hover:bg-white transition-all ${
            historyOpen
              ? 'text-[#ab3429] bg-white'
              : 'text-[#83746d] hover:text-[#412311]'
          }`}
          title="Lịch sử trò chuyện"
        >
          <History size={16} />
        </button>
      )}
      <div className="w-[1px] h-4 bg-[#83746d]/20 mx-0.5"></div>
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
  )

  return (
    <>
      {/* Lớp phủ tối bên trái — hiện quá trình suy nghĩ khi bấm chip trong chat */}
      <ThinkingProcessPanel
        open={!!thinkingMsg}
        events={thinkingMsg?.events || []}
        streaming={thinkingMsg?.streaming}
        isExpanded={isExpanded}
        onClose={() => setThinkingIndex(null)}
        // Ô nhập chỉ gắn vào ĐÚNG bong bóng đang stream: mở panel của lượt chat CŨ trong
        // lúc lượt mới đang chờ thì không được phép gõ vào đó. `streaming` của chính bong
        // bóng đang mở là câu trả lời cho việc đó (khỏi so index với ref lúc render).
        awaitHuman={thinkingMsg?.streaming ? awaitHuman : null}
        humanTurns={humanTurns}
        debateSending={debateSending}
        debateError={debateError}
        onDebateSend={handleDebateSend}
        onDebateEnd={handleDebateEnd}
        // Nút xin tranh luận sống trong header panel (cạnh nút đóng) — chỗ người dùng
        // đang ngồi xem hội đồng chuẩn bị, tức đúng lúc cửa sổ bấm còn mở. GIỐNG ô nhập
        // ở trên: nút CHỈ thuộc về bong bóng ĐANG stream. Mở lại panel của lượt chat CŨ
        // (đã xong) trong lúc lượt MỚI đang chạy -> `canOptinDebate` (tính từ state stream
        // hiện tại) vẫn true, nhưng ghi danh cho lượt cũ là vô nghĩa -> chặn bằng
        // `thinkingMsg.streaming` để nút không lọt sang panel đã đóng.
        canOptinDebate={thinkingMsg?.streaming ? canOptinDebate : false}
        debateOptedIn={debateOptedIn}
        onDebateOptin={handleDebateOptin}
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

        {/* Header — MỞ RỘNG: 1 hàng (tiêu đề trái | model + action bên phải) kèm dòng phụ.
            THU NHỎ: 2 hàng (tiêu đề trên; model bên trái + action bên phải ở hàng dưới).
            Gộp bộ chọn model vào header, bỏ thanh model riêng -> tối ưu chiều cao khung chat.
            z-30 để dropdown model xổ xuống nổi TRÊN khung chat (khung chat z-10). */}
        <div
          className={`relative bg-white/40 backdrop-blur-xl border-b border-[#83746d]/10 rounded-t-[inherit] z-30 flex-shrink-0 ${
            isExpanded
              ? 'px-7 py-6 flex items-center justify-between'
              : 'px-5 py-4 flex flex-col gap-3'
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={chatbotInsideIcon}
              alt="Mộc Bản AI"
              className={`rounded-2xl object-contain drop-shadow-[0_4px_12px_rgba(65,35,17,0.22)] flex-shrink-0 ${
                isExpanded ? 'w-15 h-15' : 'w-11 h-11'
              }`}
            />
            <div className="min-w-0">
              <h3 className="font-title text-[18px] font-black flex items-center gap-2 tracking-wide text-[#412311] whitespace-nowrap">
                Mộc Bản AI
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#ab3429]/10 flex-shrink-0">
                  <Sparkles size={12} className="text-[#ab3429]" />
                </span>
              </h3>
              {/* Dòng phụ chỉ hiện khi mở rộng — thu nhỏ bỏ đi cho gọn chiều cao */}
              {isExpanded && (
                <p className="text-[10.5px] text-[#83746d] font-bold tracking-[0.15em] uppercase mt-1">
                  Trợ lý Văn học Cao cấp
                </p>
              )}
            </div>
          </div>
          {/* Cụm bộ chọn model + nút action. Thu nhỏ: chiếm cả hàng (model trái, action phải);
              mở rộng: nằm gọn bên phải, model sát trái cụm action. */}
          <div
            className={`flex items-center gap-2 ${
              isExpanded ? '' : 'w-full justify-between'
            }`}
          >
            {modelSelector}
            {actionButtons}
          </div>
        </div>

        {/* Dropdown lịch sử hội thoại (chỉ cho người đã đăng nhập) */}
        {isAuthenticated && historyOpen && (
          <>
            <div
              className="fixed inset-0 z-30"
              onClick={() => setHistoryOpen(false)}
            />
            <div
              className={`absolute right-6 w-[300px] max-h-[360px] overflow-y-auto bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_12px_40px_rgba(65,35,17,0.18)] border border-[#83746d]/15 z-40 p-1.5 custom-scrollbar animate-in fade-in slide-in-from-top-1 duration-200 ${
                isExpanded ? 'top-[96px]' : 'top-[132px]'
              }`}
            >
              <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#83746d]">
                Lịch sử trò chuyện
              </div>
              {conversations.length === 0 ? (
                <div className="px-3 py-4 text-[12.5px] text-[#83746d]">
                  Chưa có đoạn hội thoại nào.
                </div>
              ) : (
                conversations.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => handleLoadConversation(c.id)}
                    className={`group flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
                      activeConversationId === c.id
                        ? 'bg-[#ab3429]/[0.08]'
                        : 'hover:bg-[#83746d]/[0.08]'
                    }`}
                  >
                    <History
                      size={14}
                      className="text-[#83746d] flex-shrink-0"
                    />
                    <span className="flex-1 min-w-0 truncate text-[13px] text-[#412311]">
                      {c.title || 'Đoạn chat'}
                    </span>
                    <span
                      onClick={(e) => handleDeleteConversation(c.id, e)}
                      title="Xóa"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-[#ab3429]/10 text-[#83746d] hover:text-[#ab3429] transition-all"
                    >
                      <Trash2 size={13} />
                    </span>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Chat Area */}
        <div className="relative flex-1 overflow-y-auto p-5 custom-scrollbar flex flex-col gap-6 z-10">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user'
            // Hiện chip ngay từ lúc bắt đầu stream (dù chưa có event nào) -> người dùng
            // thấy "Mộc Bản đang suy nghĩ…" thay vì avatar trơ trọi trong lúc chờ SSE.
            const hasEvents =
              !isUser && (msg.events?.length > 0 || msg.streaming)
            // Chưa có chữ nào để hiện -> gõ ba chấm cho biết AI vẫn đang chạy.
            const isPending =
              !isUser && msg.streaming && !msg.content && !msg.error
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

                  {isPending && <TypingDots />}

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
              <TypingDots />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Gợi ý câu hỏi nhanh (Quick Prompts) — chỉ hiện khi MỞ RỘNG. Thu nhỏ thì ẩn để
            ưu tiên không gian cho khung chat (ở 400px không đủ chỗ cho cả 3 nút chữ hoa,
            nút cuối luôn bị cắt). */}
        {isExpanded && (
          <div className="relative px-6 py-4 flex gap-2.5 overflow-x-auto custom-scrollbar no-scrollbar border-t border-[#83746d]/10 bg-white/40 backdrop-blur-md z-10 flex-shrink-0">
            {['Tóm tắt', 'Phân tích nhân vật', 'Nghệ thuật'].map(
              (prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(prompt)}
                  className="whitespace-nowrap px-5 py-2.5 bg-white border border-[#83746d]/20 text-[#412311] text-[11px] font-bold uppercase tracking-[0.1em] rounded-full hover:border-[#ab3429] hover:text-[#ab3429] hover:bg-[#ab3429]/5 transition-all duration-300 shadow-sm"
                >
                  {prompt}
                </button>
              ),
            )}
          </div>
        )}

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
