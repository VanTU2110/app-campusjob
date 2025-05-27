import { UserResponse, verifyUserParams } from "@/types/user";
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
export const logout = async () => {
  try {
    const response = await api.post(`/Auth/logout`);
    return response.data; // Trả về thông tin logout thành công
  } catch (error: any) {
    throw error.response?.data?.message || "Logout failed!";  
  }
};
export const verifyUser = async(params:verifyUserParams):Promise<UserResponse> =>{
  try {
      const response = await api.post<UserResponse>(`Auth/verify-user`,params)
      return response.data;
  } catch (error) {
      console.error("Error verify user",error);
      throw error;
  }
}
