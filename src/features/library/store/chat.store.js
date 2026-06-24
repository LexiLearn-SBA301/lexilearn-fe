import { create } from 'zustand'

// Store điều khiển đóng/mở popup chatbot dùng chung toàn app.
// Không persist vì trạng thái mở popup chỉ cần trong phiên hiện tại.
// Nhờ store này mà mọi nơi (nút nổi, link "Chatbot" trên header, nút ở trang chủ,
// hay nút "Hỏi Mộc Bản AI" khi bôi đen trong trang đọc) đều mở chung 1 popup.
export const useChatStore = create((set) => ({
  // Popup đang mở hay không
  isOpen: false,
  // Câu hỏi gửi sẵn khi mở (vd: đoạn văn bôi đen ở trang đọc). '' = không gửi sẵn.
  initialPrompt: '',

  // Mở popup; có thể kèm sẵn một câu hỏi để tự động gửi
  openChat: (prompt = '') => set({ isOpen: true, initialPrompt: prompt }),

  // Đóng popup và xóa câu hỏi gửi sẵn
  closeChat: () => set({ isOpen: false, initialPrompt: '' }),
}))
