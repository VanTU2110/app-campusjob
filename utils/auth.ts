import AsyncStorage from "@react-native-async-storage/async-storage";

export const isLoggedIn = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("token");
    const uuid = await AsyncStorage.getItem("uuid");
    return !!(token && uuid); // Nếu có cả token & uuid => đăng nhập
  } catch (error) {
    console.error("Lỗi kiểm tra đăng nhập:", error);
    return false;
  }
};
