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
} from 'lucide-react'
import {
  sendChatMessage,
  CHAT_MODELS,
  DEFAULT_CHAT_MODEL,
} from '../api/chat.api'
import chatbotInsideIcon from '../../../assets/images/chatbot-inside-icon.png'

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

  const activeModel =
    CHAT_MODELS.find((m) => m.id === selectedModel) ?? CHAT_MODELS[0]

  const handleSend = async (text) => {
    const messageText = typeof text === 'string' ? text : input
    if (!messageText.trim() || isTyping) return

    const userMessage = { role: 'user', content: messageText.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      // Gọi API chatbot Python với model đang chọn, body { message }
      const { answer } = await sendChatMessage({
        message: userMessage.content,
        modelId: selectedModel,
      })
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!isOpen) return null

  return (
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
            onClick={onClose}
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
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar — khách hàng giữ icon người, bot dùng ảnh chatbot-inside-icon */}
            {msg.role === 'user' ? (
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

            {/* Message Bubble */}
            <div
              className={`max-w-[85%] rounded-3xl p-4 md:p-5 text-[14.5px] leading-[1.85] relative ${
                msg.role === 'user'
                  ? 'bg-[#ab3429] text-white rounded-tr-sm shadow-[0_6px_20px_rgba(171,52,41,0.2)] border border-[#8a1c14] font-body'
                  : 'bg-white text-[#2b211c] rounded-tl-sm border border-[#83746d]/15 shadow-sm font-quote'
              }`}
            >
              <span
                dangerouslySetInnerHTML={{
                  __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>'),
                }}
              />
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
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
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="w-12 h-12 rounded-xl bg-[#ab3429] text-white flex items-center justify-center hover:bg-[#8a1c14] hover:shadow-[0_4px_15px_rgba(171,52,41,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95 transition-all duration-300 disabled:opacity-40 disabled:hover:shadow-none disabled:hover:translate-y-0 disabled:active:scale-100 mb-0.5 mr-0.5 flex-shrink-0"
          >
            {isTyping ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Send size={18} className="-ml-1" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
