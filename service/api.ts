import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const API_BASE_URL = "http:/192.168.1.14:5109/api"; // Thay bằng URL backend của bạn

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor để thêm token vào headers và keyCert, time vào request
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Thêm keyCert và time vào request
      const extraData = {
        keyCert: "yourKeyCertValue", // Thay thế bằng giá trị thực tế
        time: new Date().toISOString(),
      };

      if (config.method === "get") {
        config.params = { ...config.params, ...extraData };
      } else {
        config.data = { ...config.data, ...extraData };
      }
    } catch (error) {
      console.log("Lỗi khi lấy token hoặc thêm dữ liệu:", error);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
