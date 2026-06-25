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

// Hai model tương ứng 2 endpoint của chatbot Python.
// id dùng làm key chọn model trong UI, endpoint là path gọi API.
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
