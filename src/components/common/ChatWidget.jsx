import { useLocation } from 'react-router-dom'
import { useChatStore } from '../../features/library/store/chat.store'
import { AIAssistantPopup } from '../../features/library/components/AIAssistantPopup'
import chatbotIcon from '../../assets/images/chatbot-icon.png'

// Các trang KHÔNG hiển thị chatbot: toàn bộ luồng đăng nhập / đăng ký.
const HIDDEN_PATH_PREFIXES = [
  '/dang-nhap',
  '/dang-ky',
  '/xac-thuc-otp',
  '/quen-mat-khau',
  '/dat-lai-mat-khau',
]

// Widget chatbot dùng chung: nút nổi góc dưới phải + popup chat.
// Đặt 1 lần ở App nên xuất hiện trên mọi trang (trừ các trang đăng nhập).
export const ChatWidget = () => {
  const location = useLocation()
  const isOpen = useChatStore((s) => s.isOpen)
  const initialPrompt = useChatStore((s) => s.initialPrompt)
  const openChat = useChatStore((s) => s.openChat)
  const closeChat = useChatStore((s) => s.closeChat)

  const isHidden = HIDDEN_PATH_PREFIXES.some((p) =>
    location.pathname.startsWith(p),
  )
  if (isHidden) return null

  return (
    <>
      {/* Nút nổi mở chatbot (dùng ảnh chatbot-icon) — ẩn khi popup đang mở */}
      {!isOpen && (
        <button
          onClick={() => openChat()}
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[70] group transition-transform duration-300 hover:-translate-y-1 hover:scale-105 active:scale-95"
          title="Hỏi Mộc Bản AI"
          aria-label="Mở trợ lý Mộc Bản AI"
        >
          {/* drop-shadow đổ bóng theo đúng hình robot (không phải khối vuông) cho đỡ chìm */}
          <img
            src={chatbotIcon}
            alt="Mộc Bản AI"
            className="w-35 h-35 md:w-40d:h-40 object-contain drop-shadow-[0_10px_18px_rgba(43,33,28,0.5)] group-hover:drop-shadow-[0_16px_26px_rgba(43,33,28,0.6)] transition-all duration-300"
          />
        </button>
      )}

      <AIAssistantPopup
        isOpen={isOpen}
        onClose={closeChat}
        initialPrompt={initialPrompt}
      />
    </>
  )
}
