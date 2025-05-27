import { Feather } from '@expo/vector-icons';
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useAuth } from '../../contexts/AuthContext';

const LoginScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <View className="flex-1 justify-center items-center bg-blue-50 px-6 py-12">
          {/* Logo và hình ảnh */}
                    <View className="w-24 h-24 bg-blue-100 rounded-full items-center justify-center mb-6 overflow-hidden">
            <Image
              source={require("../../assets/images/campusjob-logo.png")}
              style={{ width: 96, height: 96, borderRadius: 48, resizeMode: 'cover' }}
            />
          </View>
          
          {/* Tiêu đề */}
          <Text className="text-3xl font-bold text-blue-700 mb-2">Đăng Nhập</Text>
          <Text className="text-base text-blue-600 mb-8 text-center">Hệ thống tìm việc cho sinh viên</Text>
          
          {/* Form đăng nhập */}
          <View className="w-full bg-white p-6 rounded-2xl shadow-md mb-6">
            {/* Ô nhập email */}
            <View className="mb-4">
              <Text className="text-gray-700 mb-2 font-medium">Email</Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
                <Feather name="mail" size={20} color="#3B82F6" />
                <TextInput
                  className="flex-1 p-3 ml-2"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>
            
            {/* Ô nhập mật khẩu */}
            <View className="mb-6">
              <Text className="text-gray-700 mb-2 font-medium">Mật khẩu</Text>
              <View className="flex-row items-center border border-gray-300 rounded-lg bg-gray-50 px-3">
                <Feather name="lock" size={20} color="#3B82F6" />
                <TextInput
                  className="flex-1 p-3 ml-2"
                  placeholder="Nhập mật khẩu của bạn"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={toggleShowPassword}>
                  <Feather 
                    name={showPassword ? "eye-off" : "eye"} 
                    size={20} 
                    color="#64748B" 
                  />
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Nút Đăng nhập */}
            <TouchableOpacity
              className="bg-blue-600 p-4 rounded-lg items-center shadow-sm"
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">Đăng Nhập</Text>
              )}
            </TouchableOpacity>
          </View>
          
          {/* Phần dưới */}
          <View className="items-center">
            {/* Chuyển sang màn Đăng ký */}
            <TouchableOpacity onPress={() => router.push("./register")} className="mb-6">
              <Text className="text-gray-600">
                Chưa có tài khoản?{" "}
                <Text className="text-blue-600 font-semibold">Đăng ký ngay</Text>
              </Text>
            </TouchableOpacity>
            
            {/* Quay lại Onboarding */}
            <TouchableOpacity
              onPress={() => router.replace("/onboarding")}
              className="bg-white border border-blue-200 px-5 py-3 rounded-lg flex-row items-center"
            >
              <Feather name="arrow-left" size={16} color="#3B82F6" />
              <Text className="text-blue-600 font-semibold ml-2">Quay lại màn Onboarding</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;