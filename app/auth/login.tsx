import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from '../../contexts/AuthContext';

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập email và mật khẩu!");
      return;
    }

    setLoading(true);

    try {
      console.log("🔄 Đang gửi request đăng nhập...");
      // Sử dụng login từ AuthContext
      const success = await login(email, password);
      
      if (success) {
        console.log("🚀 Đăng nhập thành công, điều hướng tới trang chính!");
        router.replace("/(tabs)");
      } else {
        Alert.alert("Đăng nhập thất bại", "Email hoặc mật khẩu không chính xác.");
      }
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
    <ScrollView>
      <View className="flex-1 justify-center items-center bg-gray-100 px-6">
        <Text className="text-3xl font-bold text-blue-600 mb-6">Đăng Nhập</Text>
        <Text className="text-xl font-bold text-blue-600 mb-6">Hệ thống tìm việc cho sinh viên</Text>
        
        {/* Ô nhập email */}
        <TextInput
          className="w-full p-4 border border-gray-300 rounded-lg mb-4 bg-white shadow-sm"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        {/* Ô nhập mật khẩu */}
        <TextInput
          className="w-full p-4 border border-gray-300 rounded-lg mb-4 bg-white shadow-sm"
          placeholder="Mật khẩu"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        {/* Nút Đăng nhập hoặc Loading */}
        <TouchableOpacity
          className="w-full bg-blue-500 p-4 rounded-lg items-center shadow-md"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-lg">Đăng Nhập</Text>
          )}
        </TouchableOpacity>
        
        {/* Chuyển sang màn Đăng ký */}
        <TouchableOpacity onPress={() => router.push("./register")} className="mt-4">
          <Text className="text-gray-500">
            Chưa có tài khoản?{" "}
            <Text className="text-blue-500 font-semibold">Đăng ký ngay</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default LoginScreen;