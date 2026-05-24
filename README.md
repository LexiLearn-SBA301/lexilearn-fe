# LexiLearn Frontend

Dự án Frontend cho hệ thống LexiLearn, xây dựng dựa trên React 19 và Vite 8.

---

## 🛠️ Công nghệ & Thư viện Core (Tech Stack)

Để đảm bảo tính nhất quán của mã nguồn và tránh việc cài đặt các thư viện trùng lặp hoặc không đồng nhất, dự án thống nhất sử dụng các thư viện cốt lõi sau:

### 1. Nền tảng (Core Stack)
- **React 19**: Phiên bản React mới nhất tối ưu hiệu năng.
- **Vite 8**: Công cụ build siêu nhanh hỗ trợ Hot Module Replacement (HMR).

### 2. Định dạng & Giao diện (Styling & Icons)
- **Tailwind CSS v4**: Phiên bản Tailwind CSS mới nhất, xử lý compile-time nhanh vượt trội.
- **Lucide React**: Bộ icon SVG nhẹ, đồng bộ và đẹp mắt cho giao diện.
- **tw-animate-css**: Thư viện hỗ trợ các chuyển động (animations) mượt mà cho Tailwind.

### 3. Điều hướng & Quản lý State (Routing & State Management)
- **React Router DOM**: Quản lý định tuyến (routing) cho Single Page Application (SPA).
- **Zustand**: Quản lý state toàn cục nhẹ nhàng, dễ sử dụng, thay thế cho Redux/Context khi cần chia sẻ state phức tạp.

### 4. Truy vấn dữ liệu (Data Fetching & Caching)
- **TanStack React Query (@tanstack/react-query)**: Quản lý việc gọi API, tự động lưu bộ nhớ đệm (caching), đồng bộ hóa và cập nhật trạng thái dữ liệu từ server. *Tất cả các lệnh gọi API lấy dữ liệu nên được viết qua React Query.*

### 5. Biểu mẫu (Form Handling & Validation)
- **React Hook Form**: Quản lý form hiệu năng cao, giảm số lần re-render.
- **Zod**: Khai báo và xác thực (validate) schema dữ liệu đầu vào của form một cách chặt chẽ.

---

## 🧑‍💻 Quy tắc làm việc nhóm (Team Workflow Guidelines)

Để tránh tình trạng xung đột phiên bản thư viện hoặc cài đặt các gói không đồng nhất giữa các máy của lập trình viên:

1. **Sử dụng `npm ci` thay vì `npm install`**:
   - Khi bạn kéo code mới từ Git về, hãy chạy **`npm ci`** (Clean Install). Lệnh này sẽ cài đặt chính xác các phiên bản được cố định trong file `package-lock.json`.
   - **Tuyệt đối KHÔNG** tự ý xóa hoặc bỏ qua việc commit file `package-lock.json` lên Git.

2. **Không tự ý cài đặt thư viện mới**:
   - Mọi thư viện mới cài thêm cần được thảo luận trước với Team Lead hoặc thảo luận chung trong nhóm để thống nhất.
   - Khi cài thư viện mới, cần cài phiên bản ổn định (`@latest`), tuyệt đối không cài các gói không rõ nguồn gốc.

3. **Đồng bộ phiên bản Node.js**:
   - Dự án khuyến nghị sử dụng Node.js phiên bản **`>=20.0.0`** (LTS).

---

## 🚀 Các lệnh chạy dự án (Commands)

Trong thư mục dự án, bạn có thể chạy các lệnh sau:

### Chạy môi trường phát triển (Development)
```bash
npm run dev
```
Mở [http://localhost:5173](http://localhost:5173) trên trình duyệt để xem kết quả.

### Build dự án (Production)
```bash
npm run build
```
Biên dịch dự án tối ưu hóa cho môi trường Production vào thư mục `dist/`.

### Kiểm tra Code (Linting)
```bash
npm run lint
```
Chạy ESLint để quét lỗi cú pháp và định dạng code.
