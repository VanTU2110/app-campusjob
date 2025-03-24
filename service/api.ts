import axios from "axios";

const API_BASE_URL = "http://192.168.0.107:5109/api"; // Thay bằng URL backend của bạn

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor thêm token vào request (sau khi đăng nhập)
api.interceptors.request.use(
  async (config) => {
    const token = ""; // Lấy token từ AsyncStorage hoặc Redux (tạm thời để trống)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
