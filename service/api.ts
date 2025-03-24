import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

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
    try {
      const token = await AsyncStorage.getItem("token"); // Lấy token từ AsyncStorage
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log("Lỗi khi lấy token từ AsyncStorage:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);
export default api;
