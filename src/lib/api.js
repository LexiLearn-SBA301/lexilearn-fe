import axios from 'axios'

// Cấu hình base URL trỏ thẳng vào backend Spring Boot của bạn
export const apiClient = axios.create({
  baseURL: 'http://localhost:8080/api/',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Đồng đội làm Auth sẽ chèn đoạn add Token vào đây sau:
// apiClient.interceptors.request.use(...)
