Bản FE gửi trong docs/prompt.md:1 nhìn chung đúng hướng, nhưng có 3 điểm cần chỉnh rõ trước khi code.

1. position không nên là scroll pixel
   Trong plan FE có nói lưu scroll offset ở docs/prompt.md:5. BE hiện validate:

- nếu có currentSectionId
- thì position <= section.content.length()

Nên nếu FE gửi scroll pixel kiểu position = 2800, mà content length chỉ 500 ký tự thì BE sẽ reject. Cách hợp lý hơn:

position = Math.floor(sectionContent.length \* sectionReadRatio)

Tức position là offset tương đối theo text content, không phải pixel scroll thật. Khi restore thì FE có thể map lại thành scroll ratio:

scrollRatio = position / sectionContent.length

2. Highlight offset: không nên dùng dangerouslySetInnerHTML làm hướng chính
   Open question ở docs/prompt.md:12 là đúng vấn đề. Nhưng mình không khuyên dùng dangerouslySetInnerHTML + tự nhét <mark> trước, vì dễ lệch offset, khó escape kỹ, và sau này note overlap sẽ mệt.

Hướng tốt hơn:

- Giữ raw content làm source of truth.
- Render thành text segments dựa trên notes đã sort theo startOffset.
- Mỗi segment là text thường hoặc <mark>.
- Khi user select, dùng Range API/TreeWalker để tính offset trên text node.
- mark.js chỉ giúp mark text trên DOM, nhưng không tự giải quyết bài toán lưu offset chuẩn theo raw content.

Quan trọng nhất: BE đang check content.substring(startOffset, endOffset) === highlightedText, nên FE phải tính offset theo raw content.

3. Scope AI popup nên giữ nguyên hoặc bổ sung, đừng thay thế
   Ở docs/prompt.md:14, FE hỏi thay popup “Hỏi Mộc Bản AI”. Vì phần AI không thuộc bạn, mình sẽ phản hồi là: không thay thế, chỉ bổ sung option highlight/note vào popup nếu UI cho phép. Tránh đụng flow của team AI.

Phản hồi đề xuất cho FE:

- API service/hooks họ đề xuất ở dòng 17-33 là ổn.
- Restore bằng bookmark ở dòng 35-38 là ổn, nên ưu tiên hỏi user “Tiếp tục đọc từ section X?” thay vì auto redirect nếu user đang vào section cụ thể.
- Save progress ở dòng 39-41 ổn, nhưng position phải là text offset/ratiomapped offset, không phải scroll pixel.
- Highlight ở dòng 42-49 đúng hướng nếu dùng TreeWalker/Range API; tránh dangerouslySetInnerHTML làm core.
- Danh sách “Đang đọc” MVP nên đặt thành block “Tiếp tục đọc” ở trang thư viện/profile trước, chưa cần page riêng /dang-doc.
- Nút “Đánh dấu hoàn thành” nên đặt cuối section/tác phẩm hoặc trong thanh action của reader, không cần làm nổi quá.

Tóm lại: cho FE code được, nhưng cần dặn lại rõ position và highlight offset. Đây là hai chỗ dễ fail BE nhất.
