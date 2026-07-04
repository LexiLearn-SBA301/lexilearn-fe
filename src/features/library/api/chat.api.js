import axios from 'axios'

// Chatbot AI (Python) chạy ở host riêng, KHÁC với Spring backend (localhost:8080),
// và không cần auth token -> dùng axios instance riêng thay vì apiClient chung.
// Có thể override host qua biến môi trường VITE_CHATBOT_API_URL khi deploy.
const chatbotBaseURL =
  import.meta.env.VITE_CHATBOT_API_URL ?? 'http://localhost:8000'

const chatbotClient = axios.create({
  baseURL: chatbotBaseURL,
  headers: { 'Content-Type': 'application/json' },
})

// Các model tương ứng endpoint của chatbot Python.
// id dùng làm key chọn model trong UI, endpoint là path gọi API.
// `streaming: true` -> dùng SSE (/chat/stream) và hiển thị timeline tư duy realtime.
export const CHAT_MODELS = [
  {
    id: 'only-llm',
    label: 'Mythis 5',
    description: 'Mô hình ngôn ngữ đã huấn luyện văn học',
    endpoint: '/chat/only-llm',
  },
  {
    id: 'base-llm',
    label: 'HuKai 4.5',
    description: 'Mô hình ngôn ngữ nền tảng',
    endpoint: '/chat/base-llm',
  },
  {
    id: 'stream-deep',
    label: 'Trạng Nguyên',
    description:
      'Phân tích sâu — hội đồng tranh luận, hiện quá trình tư duy realtime',
    endpoint: '/chat/stream',
    streaming: true,
  },
]

export const DEFAULT_CHAT_MODEL = CHAT_MODELS[0].id

// Backend trả về ChatResponse: { answer: str, model: str }.
// Ưu tiên lấy `answer`; có thêm vài fallback phòng khi format đổi để UI không vỡ.
const extractReply = (data) => {
  if (typeof data === 'string') return data
  if (data && typeof data === 'object') {
    return (
      data.answer ??
      data.response ??
      data.reply ??
      data.message ??
      data.content ??
      data.result ??
      data.text ??
      JSON.stringify(data)
    )
  }
  return String(data ?? '')
}

// Gửi 1 tin nhắn tới model được chọn. Body đúng định dạng { message } như yêu cầu.
// Trả về { answer, model } để UI vừa hiển thị câu trả lời vừa biết model thực sự xử lý.
export const sendChatMessage = async ({ message, modelId }) => {
  const model = CHAT_MODELS.find((m) => m.id === modelId) ?? CHAT_MODELS[0]
  const response = await chatbotClient.post(model.endpoint, { message })
  return {
    answer: extractReply(response.data),
    model: response.data?.model ?? model.label,
  }
}

// ---------------------------------------------------------------------------
// Streaming (SSE) — endpoint /chat/stream
// ---------------------------------------------------------------------------

// Metadata render dự phòng khi event thiếu payload.ui (vd event `error` shape tối
// giản). Không được giả định payload.ui luôn có -> luôn đi qua getEventUi().
const FALLBACK_EVENT_UI = {
  variant: 'status',
  color: '#64748b',
  severity: 'info',
  icon: '💭',
  group: 'intent',
}

const ERROR_EVENT_UI = {
  variant: 'error',
  color: '#ef4444',
  severity: 'error',
  icon: '⚠️',
  group: 'final',
}

// Lấy metadata hiển thị (color/icon/severity/group) của 1 StreamEvent một cách an toàn.
export const getEventUi = (ev) => {
  if (ev?.payload?.ui) return ev.payload.ui
  if (ev?.type === 'error') return ERROR_EVENT_UI
  return FALLBACK_EVENT_UI
}

// Các loại event KHÔNG hiển thị trên timeline "quá trình suy nghĩ":
//  - done: câu trả lời cuối hiện ở bong bóng riêng
//  - route: chỉ là mã kỹ thuật, trùng ý với intent
//  - error: hiện ở bong bóng lỗi riêng
//  - token: mẩu chữ đang gõ dở, nối thẳng vào câu trả lời
const HIDDEN_STREAM_TYPES = new Set(['done', 'route', 'error', 'token'])

// True nếu event nên bị ẩn khỏi timeline. Dùng chung cho cả panel lẫn chip đếm bước
// để số "bước" luôn khớp với số bong bóng thực sự hiển thị.
export const isHiddenThinkingEvent = (ev) => {
  if (!ev || HIDDEN_STREAM_TYPES.has(ev.type)) return true
  // Ẩn dòng "Đã dựng ngữ cảnh: N thực thể…" (ít thông tin, thường 0 thực thể).
  if (ev.type === 'status' && (ev.content || '').includes('dựng ngữ cảnh'))
    return true
  return false
}

/**
 * Mở SSE tới /chat/stream và gọi onEvent cho MỖI StreamEvent nhận được.
 *
 * Lưu ý quan trọng (theo hợp đồng với backend):
 *  - KHÔNG dùng EventSource: nó chỉ GET được, còn endpoint này là POST (cần body
 *    `message`). Phải dùng fetch() + đọc response.body (ReadableStream) thủ công.
 *  - Event ngăn cách nhau bằng dòng trống "\n\n"; mỗi block lấy các dòng "data:".
 *  - Gọi onEvent theo ĐÚNG THỨ TỰ NHẬN (không sort theo seq — seq của debate có thể trùng).
 *  - Kết thúc: BE gửi event type "done" rồi đóng stream (reader done=true).
 */
export const streamChat = async ({ message, threadId, onEvent, signal }) => {
  const res = await fetch(`${chatbotBaseURL}/chat/stream`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, thread_id: threadId }),
    signal,
  })
  if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)

  const reader = res.body.getReader()
  const decoder = new TextDecoder()
  let buffer = ''

  while (true) {
    const { value, done } = await reader.read()
    if (done) break
    buffer += decoder.decode(value, { stream: true })

    // Event cách nhau bằng "\n\n"
    let sep
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const rawBlock = buffer.slice(0, sep)
      buffer = buffer.slice(sep + 2)
      // 1 block có thể nhiều dòng; gom nội dung các dòng "data:"
      const dataLine = rawBlock
        .split('\n')
        .filter((l) => l.startsWith('data:'))
        .map((l) => l.slice(5).trim())
        .join('')
      if (!dataLine) continue
      try {
        onEvent(JSON.parse(dataLine))
      } catch {
        /* bỏ qua dòng lỗi parse */
      }
    }
  }
}
