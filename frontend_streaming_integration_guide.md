# Hướng dẫn kết nối Streaming (Backend → Frontend)

> **Đối tượng đọc:** một AI/dev làm Frontend, CHƯA biết backend này. Tài liệu tự chứa:
> đọc xong là ráp được UI chat có "thinking timeline" realtime + câu trả lời cuối.
> Backend đã xong (xem `streaming_realtime_plan.md`); FE **không cần sửa backend**.

---

## 0. Bức tranh tổng (bạn sẽ build gì)

Người dùng gõ câu hỏi → FE mở 1 kết nối **SSE** tới backend → nhận về **một chuỗi
event JSON realtime** mô tả hệ thống đang nghĩ/làm gì (phân tích câu hỏi → truy hồi tài
liệu → 4 nhà phê bình tranh luận 2 vòng → giám khảo chấm → xong), rồi **event cuối
`done` chứa câu trả lời**. FE vẽ các event thành 1 timeline có màu/icon, và hiện câu
trả lời khi `done`.

```
[Ô chat] --POST /chat/stream--> [BE] --SSE: data:{event}\n\n (nhiều lần)--> [FE vẽ timeline]
                                                                             --done: hiện answer
```

Mỗi event đã kèm sẵn **màu/icon/nhãn** (`payload.ui`) → FE không phải tự chọn màu.

---

## 1. Endpoint & cấu hình

Backend chạy (mặc định): **`http://127.0.0.1:8000`** (uvicorn). CORS đã mở cho
**`http://localhost:5173`** (Vite dev). Nếu FE chạy port khác → báo BE thêm origin vào
`main.py` (`allow_origins`).

| Endpoint             | Method | Dùng khi                                                                                     |
| -------------------- | ------ | -------------------------------------------------------------------------------------------- |
| **`/chat/stream`**   | POST   | ⭐ CHÍNH — stream realtime timeline + answer (SSE)                                           |
| `/chat/llm-extended` | POST   | Fallback/không stream: chạy xong trả **1 cục** `AgentState` (có sẵn `events` để replay tĩnh) |

### Body request (giống nhau cho cả 2)

```jsonc
{
  "message": "Phân tích tâm lý nhân vật Tràng trong Vợ Nhặt", // BẮT BUỘC, 1..2000 ký tự
  "thread_id": "abc123", // TÙY CHỌN: giữ để nối nhiều lượt cùng hội thoại; bỏ trống -> BE tự sinh
  // "system","filters","limit" có trong schema nhưng /chat/stream KHÔNG dùng -> bỏ qua
}
```

- **`thread_id`**: lần đầu có thể bỏ trống. Muốn hội thoại nhiều lượt nhớ ngữ cảnh thì
  lưu lại `thread_id` (tự sinh 1 lần ở FE hoặc lấy từ lượt trước) và gửi kèm mỗi lượt.

---

## 2. Giao thức SSE (đọc kỹ — có 1 cái bẫy)

- Backend trả `Content-Type: text/event-stream`, mỗi event là **1 dòng**:
  `data: {<json>}\n\n` (ngăn cách nhau bằng dòng trống).
- ⚠️ **KHÔNG dùng `EventSource`.** `EventSource` **chỉ GET được**, mà endpoint này là
  **POST** (cần body `message`). → Phải dùng **`fetch()` + đọc `response.body` (ReadableStream)**.
  Code mẫu ở §7.
- Kết thúc: BE gửi event `type: "done"` rồi **đóng stream** (fetch reader `done=true`).
- Lỗi giữa chừng: BE gửi 1 event `{"type":"error","content":"..."}` rồi đóng.

---

## 3. Hợp đồng dữ liệu — 1 `StreamEvent` trông như thế nào

Mỗi dòng `data:` parse ra 1 object:

```jsonc
{
  "seq": 6,                       // số thứ tự (xem §5 về cách dùng)
  "type": "critic_turn",          // LOẠI event -> quyết định cách hiển thị (xem §4)
  "node": "critic:tam_ly:r1",     // nguồn phát (dùng để gom lane nếu muốn)
  "actor": "Nhà phê bình Tâm lý",  // TÊN hiển thị (ai đang nói) — có thể rỗng ""
  "title": "",                    // nhãn ngắn (thường rỗng)
  "content": "Luận đề: ...",      // NỘI DUNG chính để hiện ra
  "payload": {                    // data cấu trúc kèm theo (khác nhau theo type — xem §4)
     "round": 1,
     "arguments": [ ... ],
     "ui": {                      // ⭐ metadata render — LUÔN có (trừ event error)
        "variant": "tam_ly",      //   token ngữ nghĩa (nếu FE muốn tự map palette)
        "color": "#8b5cf6",       //   MÀU sẵn dùng (đổ thẳng vào style là đẹp)
        "severity": "info",       //   info | success | warning | error
        "icon": "🧠",             //   emoji gợi ý
        "group": "debate"         //   LANE để gom timeline: intent|retrieval|debate|judge|final
     }
  },
  "is_partial": false,            // true = mẩu token đang gõ dở (xem §6, hiện chưa dùng)
  "parent_seq": null,             // (dành sẵn để lồng UI; hiện luôn null)
  "ts": "2026-07-04T10:11:12.13Z" // timestamp ISO — dùng để sắp xếp bản LIVE
}
```

**Quy tắc vàng cho FE:** để tô màu/icon/nhãn, **chỉ cần đọc `payload.ui`** — không tự
đoán từ `type`. `payload.ui.color` dùng được ngay; `payload.ui.variant` là token nếu FE
có palette riêng (dark mode/rebrand).

### Bảng màu (do BE quyết, FE có thể override qua `variant`)

| variant                                                         | color              | severity | icon           | ý nghĩa                     |
| --------------------------------------------------------------- | ------------------ | -------- | -------------- | --------------------------- |
| `supervisor` / `status` / `retrieval` / `bulletin` / `citation` | `#64748b` (slate)  | info     | 🧭/💭/🔎/📋/🔖 | bước trung gian trung tính  |
| `hinh_thuc`                                                     | `#14b8a6` (teal)   | info     | 🎨             | Nhà phê bình Hình thức      |
| `lich_su`                                                       | `#3b82f6` (blue)   | info     | 🏛️             | Nhà phê bình Lịch sử        |
| `tam_ly`                                                        | `#8b5cf6` (violet) | info     | 🧠             | Nhà phê bình Tâm lý         |
| `tiep_nhan`                                                     | `#ec4899` (pink)   | info     | 👥             | Nhà phê bình Tiếp nhận      |
| `judge` (pass/approve)                                          | `#22c55e` (green)  | success  | ⚖️             | Giám khảo DUYỆT             |
| `judge` (retry)                                                 | `#f59e0b` (amber)  | warning  | ⚖️             | Giám khảo YÊU CẦU LÀM LẠI   |
| `judge` (reject)                                                | `#ef4444` (red)    | error    | ⚖️             | Hết lượt, dùng bản tốt nhất |
| `done`                                                          | `#22c55e` (green)  | success  | ✅             | xong                        |
| `error`                                                         | `#ef4444` (red)    | error    | ⚠️             | lỗi                         |

> Ghi chú: mọi event `severity: "info"` đều dùng chung màu slate `#64748b` — chỉ critic
> (4 màu) và trạng thái judge/done/error mới có màu riêng. Cố ý vậy để 4 critic nổi bật
> còn các bước phụ thì trung tính.

---

## 4. Danh mục event bạn sẽ nhận (theo thứ tự thời gian)

Với câu hỏi **phân tích sâu (deep)**, thứ tự điển hình:

| #     | `type`        | `actor`        | `content` (ví dụ)                           | `payload` (ngoài `ui`)                                     | `group`   |
| ----- | ------------- | -------------- | ------------------------------------------- | ---------------------------------------------------------- | --------- |
| 1     | `intent`      | Điều phối      | "Câu hỏi phân tích tâm lý… → phân tích sâu" | `work_title, author, route, confidence, detected_entities` | intent    |
| 2     | `route`       | (rỗng)         | "deep_analysis"                             | `route`                                                    | intent    |
| 3     | `retrieval`   | (rỗng)         | "Đã truy hồi 8 đoạn trích từ: Vợ Nhặt"      | `count, works[]`                                           | retrieval |
| 4     | `status`      | (rỗng)         | "Đang phân tích & tóm tắt ngữ cảnh…"        | —                                                          | intent    |
| 5     | `status`      | (rỗng)         | "Đã dựng ngữ cảnh: 5 thực thể, chủ đề: …"   | `themes[], entities[]`                                     | intent    |
| 6–9   | `critic_turn` | Nhà phê bình … | "Luận đề: …" (vòng 1)                       | `round:1, parsed_ok, arguments:[{arg_id,point,support}]`   | debate    |
| 10    | `bulletin`    | (rỗng)         | "Bảng tin chung đã sẵn sàng."               | `entries:[{critic,thesis,key_points}]`                     | debate    |
| 11–14 | `critic_turn` | Nhà phê bình … | "…" (vòng 2)                                | `round:2, rebuttals:[{target_critic,stance,reason}]`       | debate    |
| 15    | `judge`       | Giám khảo      | lý do chấm                                  | `verdict(pass/retry/reject), scores:{}, feedback`          | judge     |
|       | `retry`\*     | Giám khảo      | feedback sửa                                | `stage, attempt, limit`                                    | judge     |
| 16    | `done`        | (rỗng)         | "Hoàn tất."                                 | **`answer`** (text cuối), `route, chars, citations`        | final     |

\* Nếu `judge` = **retry**: sẽ có thêm event `retry`, rồi **lặp lại** cụm `critic_turn`
(vòng 1→2) + `judge` một lần nữa (tối đa theo `limit`). FE cứ append tiếp như bình thường.

Với câu hỏi **tra cứu (factual)**: hiện chỉ có `intent → route → done` (nhánh factual
đang mock, chưa emit bước trung gian).

**Câu trả lời cuối** nằm ở **`done.payload.answer`** → hiện ra bong bóng chat của AI.

Các loại khác có thể gặp về sau (đã định nghĩa sẵn, FE nên handle "mềm"):
`token` (is_partial=true, mẩu chữ đang gõ khi Tool 3/viết luận có token-stream — xem §6),
`citation_check` (kết quả kiểm trích dẫn), `error`.

---

## 5. Sắp xếp thứ tự — QUY TẮC QUAN TRỌNG

- **Bản LIVE (qua `/chat/stream`):** **hiển thị theo ĐÚNG THỨ TỰ NHẬN ĐƯỢC** (append dần).
  ⚠️ **ĐỪNG sort theo `seq`** ở bản live — các event của debate được phát từ subgraph với
  `seq` "best-effort" có thể **trùng số** với event ngoài. Nếu muốn chắc, sort theo **`ts`**.
  Thứ tự nhận = thứ tự thời gian, nên cứ append là đúng.
- **Bản REPLAY (qua `/chat/llm-extended`):** response là `AgentState`, lấy mảng
  **`state.events`** — mảng này có `seq` **tuần tự sạch**, sort theo `seq` để dựng lại
  timeline y như lúc chạy (dùng khi user reload trang / xem lại lượt cũ). (Lưu ý: bản
  blocking này KHÔNG có các mẩu `token`, chỉ có milestone.)

---

## 6. Gợi ý render UI (UX)

1. **Chia lane theo `payload.ui.group`**: `intent` (hiểu câu hỏi) · `retrieval` (tìm tài
   liệu) · `debate` (tranh luận) · `judge` (chấm) · `final`. Mỗi lane 1 khối/accordion.
   (Nếu cần chính xác hơn có thể gom theo tiền tố `node`: `supervisor:`, `prepare_context`,
   `critic:`, `debate:`, `judge:`, `finalize`.)
2. **Mỗi dòng event**: `[icon] [actor hoặc nhãn lane] — content`, viền/nền = `ui.color`.
3. **`severity`** để nhấn trạng thái: `warning` (retry) nền vàng, `error` nền đỏ,
   `success` (done) nền xanh.
4. **Debate**: 4 critic mỗi người 1 màu riêng (theo `variant`), gom 8 `critic_turn` +
   `bulletin` vào khối "Tranh luận"; phân vòng bằng `payload.round` (1/2). `arguments`
   (vòng 1) và `rebuttals` (vòng 2) render thành bullet.
5. **Con trỏ "đang xử lý"**: khi chưa nhận `done`, hiện spinner ở cuối; nhận `done` thì
   tắt spinner + hiện `done.payload.answer` như tin nhắn AI.
6. **`token` (tương lai)**: nếu sau này nhận event `type:"token"` với `is_partial:true`,
   **nối `content` vào bong bóng answer** đang gõ (hiệu ứng đánh máy). Hiện backend CHƯA
   phát token (chờ Tool 3 viết luận). Handle sẵn cho khỏi sửa sau: `case "token": answer += content`.
7. **`parent_seq`**: hiện luôn `null` — chưa cần lồng. Cứ gom theo `group`.

---

## 7. Code mẫu — copy chạy được

### 7.1 TypeScript types

```ts
export type EventType =
  | 'intent'
  | 'route'
  | 'retrieval'
  | 'status'
  | 'thinking'
  | 'critic_turn'
  | 'bulletin'
  | 'judge'
  | 'retry'
  | 'token'
  | 'citation_check'
  | 'done'
  | 'error'

export interface UiMeta {
  variant: string
  color: string
  severity: 'info' | 'success' | 'warning' | 'error'
  icon: string
  group: 'intent' | 'retrieval' | 'debate' | 'judge' | 'final'
}

export interface StreamEvent {
  seq: number
  type: EventType
  node: string
  actor: string
  title: string
  content: string
  payload: Record<string, any> & { ui?: UiMeta }
  is_partial: boolean
  parent_seq: number | null
  ts: string
}
```

### 7.2 Đọc SSE qua fetch (vanilla — dùng được ở mọi framework)

```ts
const API = 'http://127.0.0.1:8000'

/** Gọi /chat/stream, gọi onEvent cho MỖI StreamEvent nhận được. */
export async function streamChat(
  message: string,
  threadId: string | undefined,
  onEvent: (ev: StreamEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const res = await fetch(`${API}/chat/stream`, {
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

    // Event ngăn cách bằng dòng trống "\n\n"
    let sep: number
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const raw = buffer.slice(0, sep)
      buffer = buffer.slice(sep + 2)
      // mỗi block có thể nhiều dòng; lấy các dòng "data:"
      const dataLine = raw
        .split('\n')
        .filter((l) => l.startsWith('data:'))
        .map((l) => l.slice(5).trim())
        .join('')
      if (!dataLine) continue
      try {
        onEvent(JSON.parse(dataLine) as StreamEvent)
      } catch {
        /* bỏ qua dòng lỗi parse */
      }
    }
  }
}
```

### 7.3 React hook + component tối giản

```tsx
import { useCallback, useRef, useState } from 'react'

export function useChatStream() {
  const [events, setEvents] = useState<StreamEvent[]>([])
  const [answer, setAnswer] = useState('')
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const threadId = useRef<string | undefined>(undefined)

  const send = useCallback(async (message: string) => {
    setEvents([])
    setAnswer('')
    setError(null)
    setRunning(true)
    try {
      await streamChat(message, threadId.current, (ev) => {
        setEvents((prev) => [...prev, ev]) // GIỮ THỨ TỰ NHẬN (đừng sort theo seq)
        if (ev.type === 'token' && ev.is_partial)
          // tương lai: gõ dần
          setAnswer((a) => a + ev.content)
        if (ev.type === 'done') setAnswer(ev.payload?.answer ?? '') // ⭐ câu trả lời cuối
        if (ev.type === 'error') setError(ev.content || 'stream error')
      })
    } catch (e: any) {
      setError(e?.message ?? 'network error')
    } finally {
      setRunning(false)
    }
  }, [])

  return { events, answer, running, error, send }
}

// --- Component ví dụ ---
export function Timeline({ events }: { events: StreamEvent[] }) {
  return (
    <div>
      {events.map((ev, i) => {
        const ui = ev.payload?.ui
        if (ev.type === 'done') return null // answer hiện riêng
        return (
          <div
            key={i}
            style={{
              borderLeft: `3px solid ${ui?.color ?? '#64748b'}`,
              padding: '4px 8px',
              margin: '4px 0',
            }}
          >
            <span>{ui?.icon} </span>
            <strong>{ev.actor || ui?.group}</strong>
            <span>: {ev.content}</span>
            {/* debate: hiện arguments/rebuttals nếu có */}
            {ev.payload?.arguments?.map((a: any, k: number) => (
              <div key={k} style={{ marginLeft: 16, opacity: 0.85 }}>
                • {a.point}
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}

export function ChatBox() {
  const { events, answer, running, error, send } = useChatStream()
  const [text, setText] = useState('')
  return (
    <div>
      <Timeline events={events} />
      {running && <div>⏳ Đang xử lý…</div>}
      {error && <div style={{ color: '#ef4444' }}>⚠️ {error}</div>}
      {answer && (
        <div style={{ padding: 12, background: '#f1f5f9' }}>{answer}</div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (text.trim()) {
            send(text)
            setText('')
          }
        }}
      >
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Hỏi về tác phẩm văn học…"
          disabled={running}
        />
        <button disabled={running}>Gửi</button>
      </form>
    </div>
  )
}
```

---

## 8. Hội thoại nhiều lượt (thread_id)

- Lần đầu gửi không kèm `thread_id`. Muốn giữ ngữ cảnh cho các lượt sau: sinh 1 id ở FE
  (vd `crypto.randomUUID()`) và gửi cùng mọi lượt của cùng cuộc chat. Backend
  checkpoint theo `thread_id` (Redis) nên nhớ được lịch sử.
- Xem lại 1 cuộc chat cũ mà không chạy lại: gọi `POST /chat/llm-extended` với cùng
  `thread_id` → lấy `state.events` (sort theo `seq`) để dựng lại timeline tĩnh, và
  `state.final_ai_response` cho câu trả lời.

---

## 9. Xử lý lỗi & ca đặc biệt

- **Event `error`**: shape tối giản `{"type":"error","content":"..."}` — **không có
  `payload`/`ui`** → code phải phòng thủ (`ev.payload?.ui`), đừng giả định luôn có.
- **Stream đứt giữa chừng** (mạng): `fetch`/reader ném lỗi → bắt ở `catch`, hiện thông
  báo, cho phép gửi lại.
- **`content` rỗng**: một số event (vd `route`) content ngắn/kỹ thuật — có thể ẩn hoặc
  hiện gọn.
- **Nhiều `critic_turn` đến gần như đồng thời**: bình thường (4 critic chạy song song).
  Cứ append; nhóm theo `group=debate` + `payload.round`.

---

## 10. Checklist cho AI làm FE

- [ ] Gọi `POST /chat/stream` bằng **fetch + ReadableStream** (KHÔNG EventSource).
- [ ] Parse SSE: tách theo `\n\n`, lấy dòng `data:`, `JSON.parse`.
- [ ] Append event theo **thứ tự nhận** (không sort theo `seq` ở bản live).
- [ ] Render mỗi event dùng `payload.ui` (color/icon/severity), gom lane theo `ui.group`.
- [ ] Lấy câu trả lời cuối từ **`done.payload.answer`**.
- [ ] Handle `error` (thiếu `payload`/`ui`) + stream đứt.
- [ ] Handle sẵn `type:"token"` (nối vào answer) cho tương lai — dù BE chưa phát.
- [ ] (Tùy) lưu `thread_id` để hội thoại nhiều lượt; dùng `/chat/llm-extended` để replay.
- [ ] Đảm bảo origin FE nằm trong CORS của BE (mặc định `http://localhost:5173`).

---

## Phụ lục — ví dụ 1 phiên stream (rút gọn) cho câu hỏi deep

```
data: {"type":"intent","actor":"Điều phối","content":"...phân tích sâu","payload":{"route":"deep_analysis","ui":{"variant":"supervisor","color":"#64748b","severity":"info","icon":"🧭","group":"intent"}}, ...}
data: {"type":"route","content":"deep_analysis","payload":{"route":"deep_analysis","ui":{...,"group":"intent"}}}
data: {"type":"retrieval","content":"Đã truy hồi 8 đoạn trích từ: Vợ Nhặt","payload":{"count":8,"works":["Vợ Nhặt"],"ui":{...,"group":"retrieval"}}}
data: {"type":"status","content":"Đang phân tích & tóm tắt ngữ cảnh…","payload":{"ui":{...,"group":"intent"}}}
data: {"type":"status","content":"Đã dựng ngữ cảnh: 5 thực thể, chủ đề: số phận, khát vọng sống","payload":{"themes":[...],"ui":{...}}}
data: {"type":"critic_turn","actor":"Nhà phê bình Tâm lý","content":"Luận đề: ...","payload":{"round":1,"arguments":[{"arg_id":"tam_ly-a1","point":"...","support":"..."}],"ui":{"variant":"tam_ly","color":"#8b5cf6","icon":"🧠","group":"debate"}}}
... (3 critic R1 khác) ...
data: {"type":"bulletin","content":"Bảng tin chung đã sẵn sàng.","payload":{"entries":[...],"ui":{...,"group":"debate"}}}
... (4 critic R2, payload.round=2, rebuttals=[...]) ...
data: {"type":"judge","actor":"Giám khảo","content":"Debate đủ chiều sâu…","payload":{"verdict":"pass","scores":{"depth":0.8},"feedback":"","ui":{"variant":"judge","color":"#22c55e","severity":"success","icon":"⚖️","group":"judge"}}}
data: {"type":"done","content":"Hoàn tất.","payload":{"route":"deep_analysis","answer":"<TEXT BÀI PHÂN TÍCH>","chars":1234,"citations":0,"ui":{"variant":"done","color":"#22c55e","severity":"success","icon":"✅","group":"final"}}}
```
