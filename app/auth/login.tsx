import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity,Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { login } from "@/service/auth";
import { useRouter } from "expo-router"; 
import AsyncStorage from "@react-native-async-storage/async-storage";


const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu!");
      return;
    }
    setLoading(true);
  
    try {
      console.log("🔄 Đang gửi request đăng nhập...");
      const response = await login(email, password);
      console.log("✅ Phản hồi từ API:", response);
  
      if (response.error?.code !== 0) {
        console.log("❌ Lỗi đăng nhập từ server:", response.error);
        Alert.alert("Lỗi", response.error?.message || "Đăng nhập thất bại!");
        return;
      }
  
      const { token, uuid, role } = response.data;
  
      if (role !== 0) {
        console.log("⚠ Công ty đang cố gắng đăng nhập, từ chối truy cập.");
        Alert.alert("Công ty không thể đăng nhập", "Ứng dụng này chỉ dành cho sinh viên.");
        return;
      }
  
      // Lưu token và uuid vào AsyncStorage
      console.log("💾 Lưu token và UUID vào AsyncStorage...");
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("uuid", uuid);
  
      console.log("🚀 Đăng nhập thành công, điều hướng về trang chính!");
      router.push("/(tabs)");
    } catch (error) {
      console.log("❌ Lỗi khi đăng nhập:", error);
  
      if (error instanceof Error) {
        Alert.alert("Đăng nhập thất bại", error.message);
      } else {
        Alert.alert("Đăng nhập thất bại", "Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setLoading(false);
      console.log("⏳ Kết thúc quá trình đăng nhập.");
    }
  };
  

  return (
    <View className="flex-1 justify-center items-center bg-gray-100 px-6">
      <Text className="text-3xl font-bold text-blue-600 mb-6">Đăng Nhập</Text>
      <TextInput
        className="w-full p-4 border border-gray-300 rounded-lg mb-4 bg-white shadow-sm"
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />
      <TextInput
        className="w-full p-4 border border-gray-300 rounded-lg mb-4 bg-white shadow-sm"
        placeholder="Mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {/* Nút Đăng Nhập */}
      <TouchableOpacity
        className="w-full bg-blue-500 p-4 rounded-lg items-center shadow-md"
        onPress={handleLogin}
      >
        <Text className="text-white font-bold text-lg">Đăng Nhập</Text>
      </TouchableOpacity>

      {/* Chuyển sang Đăng ký */}
      <TouchableOpacity onPress={() => router.push("./register")} className="mt-4">
        <Text className="text-gray-500">
          Chưa có tài khoản?{" "}
          <Text className="text-blue-500 font-semibold">Đăng ký ngay</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default LoginScreen;