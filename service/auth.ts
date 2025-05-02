import api from "./api";

// Đăng ký tài khoản
export const register = async (email: string, password: string) => {
  try {
    const response = await api.post("/Auth/register-student", { email, password });
    return response.data; // Trả về dữ liệu từ backend
  } catch (error: any) {
    throw error.response?.data?.message || "Registration failed!";
  }
};

// Đăng nhập
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post("/Auth/login", { email, password });
    return response.data; // Trả về token hoặc thông tin user
  } catch (error: any) {
    throw error.response?.data?.message || "Login failed!";
  }
};
