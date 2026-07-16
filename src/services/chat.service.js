import axios from 'axios'
import { apiClient } from '../lib/api'

// Chatbot AI (Python) chạy ở host riêng, KHÁC với Spring backend (localhost:8080).
// 2 model blocking (only-llm/base-llm): đã đăng nhập -> QUA BE (lưu lịch sử, xem sendChatMessage);
// chưa đăng nhập -> gọi THẲNG AI để test (không lưu). Luồng chính (stream-deep) luôn qua BE.
const chatbotBaseURL =
  import.meta.env.VITE_CHATBOT_API_URL ?? 'http://localhost:8000'

// Base URL của BE (Spring), tái dùng của apiClient cho nhất quán.
const beBaseURL = apiClient.defaults.baseURL // http://localhost:8080/api/

// Đọc accessToken (cùng cách interceptor apiClient đọc từ localStorage 'auth-storage').
// fetch (stream) KHÔNG đi qua interceptor của axios -> phải tự gắn Authorization.
const getAccessToken = () => {
  try {
    const raw = localStorage.getItem('auth-storage')
    return raw ? JSON.parse(raw)?.state?.accessToken : null
  } catch {
    return null
  }
}

// Bóc envelope ApiResponse của BE: { code, message, result, ... } -> result.
const unwrap = (res) => res?.data?.result

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
    endpoint: '/chat/only-llm', // gọi thẳng AI (khách chưa đăng nhập)
    beModel: 'ONLY_LLM', // enum model khi đi qua BE (đã đăng nhập, có lưu lịch sử)
  },
  {
    id: 'base-llm',
    label: 'HuKai 4.5',
    description: 'Mô hình ngôn ngữ nền tảng',
    endpoint: '/chat/base-llm', // gọi thẳng AI (khách chưa đăng nhập)
    beModel: 'BASE_LLM', // enum model khi đi qua BE (đã đăng nhập, có lưu lịch sử)
  },
  {
    id: 'stream-deep',
    label: 'Trạng Nguyên',
    description:
      'Phân tích sâu — hội đồng tranh luận, hiện quá trình tư duy realtime',
    endpoint: '/chat/stream',
    streaming: true,
    requiresAuth: true, // BE bắt buộc token -> khách chưa đăng nhập không gọi được
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

// Gửi 1 tin nhắn tới model blocking (only-llm/base-llm).
//  - Đã đăng nhập -> QUA BE /conversations/messages/sync: BE lưu transcript (USER+ASSISTANT) và
//    trả conversationId để chat tiếp / hiện ở lịch sử. KHÔNG nhớ ngữ cảnh (mỗi lượt độc lập).
//  - Chưa đăng nhập -> gọi THẲNG AI như cũ (lịch sử gắn theo tài khoản nên không có chỗ lưu).
// Trả { conversationId, answer, model }: conversationId=null khi không lưu (khách chưa đăng nhập).
export const sendChatMessage = async ({ message, modelId, conversationId }) => {
  const model = CHAT_MODELS.find((m) => m.id === modelId) ?? CHAT_MODELS[0]

  if (getAccessToken()) {
    const result = await apiClient
      .post('/v1/chat/conversations/messages/sync', {
        conversationId: conversationId ?? null,
        message,
        model: model.beModel,
      })
      .then(unwrap)
    return {
      conversationId: result?.conversationId ?? null,
      answer: result?.answer ?? '',
      model: result?.model ?? model.label,
    }
  }

  const response = await chatbotClient.post(model.endpoint, { message })
  return {
    conversationId: null,
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

// Escape HTML rồi áp vài định dạng markdown tối giản (**đậm**, tiêu đề #, xuống dòng).
// Escape TRƯỚC để nội dung AI trả về không chèn được HTML tùy ý vào dangerouslySetInnerHTML.
// Bài luận (write_essay) trả về dạng markdown -> dòng tiêu đề "## …" chuyển thành in đậm.
// Dùng chung cho bong bóng câu trả lời (box chat) và bản thảo bài luận (panel suy nghĩ).
export const formatRichText = (text = '') =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/^#{1,6}\s+(.*)$/gm, '<b>$1</b>')
    .replace(/\n/g, '<br/>')

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
 * Gửi 1 tin nhắn QUA BACKEND. BE relay stream từ AI về, đồng thời auth + lưu lịch sử.
 * FE chỉ nói chuyện với BE (không chạm AI) -> bảo mật, AI ẩn nội bộ.
 *
 * Hợp đồng:
 *  - POST /api/v1/chat/conversations/messages, body { conversationId, message }.
 *    conversationId=null -> BE tạo đoạn mới (lazy-create).
 *  - Auth bằng accessToken (tự gắn vì fetch không qua interceptor axios).
 *  - Đọc SSE thủ công (POST nên không dùng EventSource); event cách nhau "\n\n", lấy dòng "data:".
 *  - Event ĐẦU TIÊN của BE có type="conversation" mang conversationId thực -> onEvent nhận,
 *    caller lưu lại để chat tiếp. Các event sau (status/intent/token/done...) do AI sinh, BE
 *    chuyền tay realtime -> shape y hệt như gọi thẳng AI trước đây.
 */
export const streamChat = async ({
  message,
  conversationId,
  onEvent,
  signal,
}) => {
  const token = getAccessToken()
  const res = await fetch(`${beBaseURL}v1/chat/conversations/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ conversationId: conversationId ?? null, message }),
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

// ---------------------------------------------------------------------------
// Lịch sử hội thoại (qua BE, apiClient tự gắn auth + refresh token)
// ---------------------------------------------------------------------------

/** Danh sách hội thoại của người dùng (sidebar), mới nhất trước. */
export const listConversations = async () =>
  (await apiClient.get('/v1/chat/conversations').then(unwrap)) ?? []

/** Mở lại 1 đoạn cũ: BE trả { id, title, messages } và seed lại AI để chat tiếp. */
export const openConversation = async (conversationId) =>
  apiClient.get(`/v1/chat/conversations/${conversationId}`).then(unwrap)

/** Xóa 1 đoạn hội thoại. */
export const deleteConversation = async (conversationId) =>
  apiClient.delete(`/v1/chat/conversations/${conversationId}`)

/**
 * Dừng luồng stream đang chạy của 1 đoạn: BE huỷ AI (đóng kết nối BE↔AI -> Ollama dừng) và
 * KHÔNG lưu câu trả lời. FE gọi cái này rồi mới abort fetch (đóng FE↔BE). Nếu KHÔNG gọi (chỉ
 * rớt mạng) thì BE vẫn đọc nốt và lưu final message.
 */
export const stopStream = async (conversationId) =>
  apiClient.post(`/v1/chat/conversations/${conversationId}/stop`)
