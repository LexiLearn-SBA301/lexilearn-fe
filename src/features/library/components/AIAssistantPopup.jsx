import { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Loader2,
  Maximize2,
  Minimize2,
} from 'lucide-react'

export const AIAssistantPopup = ({ isOpen, onClose, work, initialPrompt }) => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Xin chào! Tôi là Mộc Bản AI. Tôi có thể giúp bạn giải đáp các thắc mắc, tóm tắt nội dung hoặc phân tích nghệ thuật về tác phẩm **${work?.title || 'này'}**. Bạn muốn tôi giúp gì nào?`,
    },
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const messagesEndRef = useRef(null)

  const handleSend = (text) => {
    const messageText = typeof text === 'string' ? text : input
    if (!messageText.trim()) return

    const userMessage = { role: 'user', content: messageText.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Mô phỏng AI trả lời
    setTimeout(() => {
      setIsTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            'Hiện tại tôi đang trong quá trình học hỏi và sẽ sớm có thể trả lời chi tiết các câu hỏi của bạn. Cảm ơn bạn đã trải nghiệm Mộc Bản AI!',
        },
      ])
    }, 1500)
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
            ? 'top-8 bottom-8 left-8 right-8 md:left-auto md:right-8 md:w-[600px] rounded-[32px]'
            : 'bottom-24 right-6 w-[400px] h-[600px] max-h-[80vh] rounded-[32px]'
        }
      `}
    >
      {/* Texture nền giấy */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.15] mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] rounded-[inherit]"></div>

      {/* Header Premium Light */}
      <div className="relative px-7 py-6 bg-white/40 backdrop-blur-xl border-b border-[#83746d]/10 flex items-center justify-between rounded-t-[inherit] z-10 flex-shrink-0">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#ab3429] to-[#8a1c14] flex items-center justify-center shadow-[0_4px_15px_rgba(171,52,41,0.25)] border border-[#8a1c14]/50">
            <Bot size={24} className="text-white" />
          </div>
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

      {/* Chat Area */}
      <div className="relative flex-1 overflow-y-auto p-5 custom-scrollbar flex flex-col gap-6 z-10">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center mt-1 shadow-sm border ${
                msg.role === 'user'
                  ? 'bg-white border-[#83746d]/20 text-[#ab3429]'
                  : 'bg-[#ab3429] border-[#8a1c14] text-white shadow-[0_4px_10px_rgba(171,52,41,0.2)]'
              }`}
            >
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>

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
            <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center mt-1 bg-[#ab3429] border border-[#8a1c14] text-white shadow-[0_4px_10px_rgba(171,52,41,0.2)]">
              <Bot size={16} />
            </div>
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
