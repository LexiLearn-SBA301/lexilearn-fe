import axios from 'axios'

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
