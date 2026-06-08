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

- **TanStack React Query (@tanstack/react-query)**: Quản lý việc gọi API, tự động lưu bộ nhớ đệm (caching), đồng bộ hóa và cập nhật trạng thái dữ liệu từ server. _Tất cả các lệnh gọi API lấy dữ liệu nên được viết qua React Query._

### 5. Biểu mẫu (Form Handling & Validation)

- **React Hook Form**: Quản lý form hiệu năng cao, giảm số lần re-render.
- **Zod**: Khai báo và xác thực (validate) schema dữ liệu đầu vào của form một cách chặt chẽ.

---

## 📁 Cấu trúc thư mục (Project Structure)

Dự án theo kiến trúc **feature-based**: code được gom theo _tính năng_ thay vì theo _loại file_, giúp dễ scale khi team đông và app lớn dần.

```
src/
├─ app/             # Khởi tạo app: providers (QueryClient...), cấu hình router
├─ assets/          # Ảnh, font, file tĩnh
├─ components/
│  ├─ ui/           # Component UI cơ bản từ shadcn/ui (button, input...)
│  ├─ common/       # Component dùng chung (spinner, error boundary...)
│  └─ layout/       # Khung layout (header, sidebar, footer)
├─ features/        # MỖI tính năng 1 folder, tự chứa mọi thứ của nó (xem bên dưới)
├─ hooks/           # Custom hooks dùng chung toàn app
├─ lib/             # Tiện ích: api client, utils (hàm `cn`), helpers
├─ routes/          # Cấu hình route tập trung + route guard (protected route)
├─ App.jsx          # Root component
├─ main.jsx         # Điểm vào (entry point)
└─ index.css        # Tailwind + design tokens (biến màu, radius, font)
```

### Quy ước cho mỗi feature

Mỗi tính năng trong `src/features/` nên tự chứa (self-contained) theo khung sau, chỉ tạo folder con khi thực sự cần:

```
features/<ten-feature>/      # ví dụ: auth, vocabulary, lesson...
├─ api/          # Hàm gọi API của feature (bọc lại bằng React Query)
├─ hooks/        # Hooks riêng của feature (useLogin, useVocabularies...)
├─ store/        # State cục bộ của feature (Zustand) nếu cần
├─ components/   # Component chỉ dùng trong feature này
├─ schemas/      # Schema Zod để validate form/dữ liệu
└─ pages/        # Component cấp trang, gắn vào router
```

Repo đã có sẵn folder mẫu **`src/features/_example/`** dựng đúng khung trên — chỉ cần **copy, đổi tên** thành feature thật (vd `auth`, `vocabulary`) rồi điền code. Xoá folder con nào feature không dùng tới.

> **Nguyên tắc:** Cái gì chỉ 1 feature dùng → đặt trong feature đó. Khi ≥ 2 feature dùng chung → nâng lên `src/components`, `src/hooks` hoặc `src/lib`.

---
