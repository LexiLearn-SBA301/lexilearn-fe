import axios from 'axios'
import { useAuthStore } from '../features/auth/store/auth.store'

// Cấu hình base URL trỏ thẳng vào backend Spring Boot của bạn
export const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor tự động gắn accessToken vào header Authorization trước mỗi request.
// Token được đọc từ localStorage theo đúng key mà zustand persist dùng ('auth-storage').
// Cấu trúc envelope của zustand persist: { "state": { "accessToken": "...", ... }, "version": 0 }
// nên phải parse JSON và đào vào .state.accessToken, không đọc thẳng key 'accessToken'.
apiClient.interceptors.request.use(
  (config) => {
    try {
      const raw = localStorage.getItem('auth-storage')
      const token = raw ? JSON.parse(raw)?.state?.accessToken : null
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`
      }
    } catch {
      // Bỏ qua nếu localStorage không đọc được hoặc JSON lỗi — request vẫn tiếp tục
    }
    return config
  },
  (error) => Promise.reject(error),
)

// --- Response interceptor: tự động refresh token khi gặp 401 ---
// Cờ và hàng đợi dùng để chỉ gọi refresh 1 lần dù nhiều request cùng thất bại 401
let isRefreshing = false
let pendingQueue = []

// Giải phóng hàng đợi: truyền token mới (thành công) hoặc lỗi (thất bại)
const processQueue = (error, token = null) => {
  pendingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  pendingQueue = []
}

// Các endpoint auth công khai: 401 ở đây nghĩa là "sai email/mật khẩu" (INVALID_CREDENTIALS),
// KHÔNG phải access token hết hạn — không được để interceptor refresh-token xử lý,
// nếu không message lỗi thật (vd "Email hoặc mật khẩu không đúng") sẽ bị nuốt mất và
// thay bằng redirect về /dang-nhap (xóa luôn banner lỗi vừa hiện).
const PUBLIC_AUTH_PATHS = [
  '/v1/auth/login',
  '/v1/auth/register',
  '/v1/auth/verify-otp',
  '/v1/auth/resend-otp',
  '/v1/auth/forgot-password',
  '/v1/auth/reset-password',
  '/v1/auth/refresh',
]

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config
    const isPublicAuthRequest = PUBLIC_AUTH_PATHS.some((path) =>
      originalConfig?.url?.includes(path),
    )

    // Bỏ qua nếu không phải 401, nếu request này đã thử retry một lần rồi
    // (cờ _retry ngăn vòng lặp vô hạn cho chính request bị 401), hoặc nếu 401 này
    // đến từ chính các endpoint auth công khai (login/register/...) — 401 ở đó là lỗi
    // nghiệp vụ bình thường (sai mật khẩu, sai OTP...), không liên quan access token.
    if (
      error.response?.status !== 401 ||
      originalConfig._retry ||
      isPublicAuthRequest
    ) {
      return Promise.reject(error)
    }

    // Đánh dấu đã retry để request này không bị xử lý lại
    originalConfig._retry = true

    // Nếu refresh đang chạy, thêm request này vào hàng chờ
    // Khi refresh xong, request sẽ được retry tự động với token mới
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject })
      })
        .then((token) => {
          originalConfig.headers['Authorization'] = `Bearer ${token}`
          return apiClient(originalConfig)
        })
        .catch((err) => Promise.reject(err))
    }

    isRefreshing = true

    try {
      // Đọc refreshToken từ store tại thời điểm gọi (không capture lúc module load)
      const { refreshToken } = useAuthStore.getState()

      if (!refreshToken) {
        throw new Error('Không có refresh token')
      }

      // Gọi thẳng axios (KHÔNG qua apiClient) để tránh đệ quy vào response interceptor này.
      // Backend rotate refresh token — response trả về { result: { accessToken, refreshToken, expiresIn } }
      const { data } = await axios.post(
        `${apiClient.defaults.baseURL}v1/auth/refresh`,
        { refreshToken },
      )
      const tokenData = data.result

      // Lưu cặp token mới (bao gồm refreshToken đã được rotate) vào store và localStorage
      useAuthStore.getState().setTokens(tokenData)

      // Giải phóng hàng đợi với accessToken mới — các request chờ sẽ được retry
      processQueue(null, tokenData.accessToken)

      // Retry request gốc với token mới
      originalConfig.headers['Authorization'] =
        `Bearer ${tokenData.accessToken}`
      return apiClient(originalConfig)
    } catch (refreshError) {
      // Refresh thất bại (token hết hạn hoặc bị revoke) → reject toàn bộ hàng chờ,
      // xóa token, và chuyển user về trang đăng nhập để đăng nhập lại
      processQueue(refreshError, null)
      useAuthStore.getState().clearTokens()
      window.location.href = '/dang-nhap'
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)
