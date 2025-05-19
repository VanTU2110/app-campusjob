
import { register } from "@/service/auth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

const RegistrationScreen = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !rePassword) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin!");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Lỗi", "Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }
    if (password !== rePassword) {
      Alert.alert("Lỗi", "Mật khẩu nhập lại không khớp!");
      return;
    }

    setLoading(true);
    try {
      const response = await register(email, password);
     
      if (response.error?.code !== "success") {
        Alert.alert("Lỗi", response.error?.message || "Đăng ký thất bại!");
        return;
      }
      Alert.alert("Thành công", "Đăng ký thành công! Vui lòng đăng nhập.");
      router.push("./login"); // Chuyển hướng đến màn hình đăng nhập
    } catch (error) {
      if (error instanceof Error) {
        Alert.alert("Đăng ký thất bại", error.message);
      } else {
        Alert.alert("Đăng ký thất bại", "Đã xảy ra lỗi không xác định.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center items-center bg-blue-50 px-6 py-10">
          {/* Header */}
          <View className="w-full items-center mb-8">
            <Text className="text-4xl font-bold text-blue-600">Đăng Ký</Text>
            <Text className="text-base text-blue-600 mb-8 text-center">Hệ thống tìm việc cho sinh viên</Text>
            <Text className="text-gray-500 mt-2 text-center">
              Tạo tài khoản mới để sử dụng tất cả tính năng
            </Text>
          </View>

          {/* Form Container */}
          <View className="w-full bg-white p-6 rounded-2xl shadow-md">
            {/* Email Input */}
            <View className="mb-5">
              <Text className="text-gray-700 mb-2 font-medium">Email</Text>
              <TextInput
                className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="Nhập địa chỉ email của bạn"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* Password Input */}
            <View className="mb-5">
              <Text className="text-gray-700 mb-2 font-medium">Mật khẩu</Text>
              <TextInput
                className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {/* Re-Password Input */}
            <View className="mb-6">
              <Text className="text-gray-700 mb-2 font-medium">Xác nhận mật khẩu</Text>
              <TextInput
                className="w-full p-4 border border-gray-200 rounded-lg bg-gray-50"
                placeholder="Nhập lại mật khẩu"
                value={rePassword}
                onChangeText={setRePassword}
                secureTextEntry
              />
            </View>

            {/* Register Button */}
            <TouchableOpacity
              className={`w-full ${loading ? 'bg-blue-400' : 'bg-blue-600'} p-4 rounded-lg items-center shadow-sm mt-2`}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <Text className="text-white font-bold text-lg">Đăng Ký</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <TouchableOpacity 
            onPress={() => router.push("./login")} 
            className="mt-8 p-2"
          >
            <Text className="text-gray-600 text-center">
              Đã có tài khoản?{" "}
              <Text className="text-blue-600 font-bold">Đăng nhập ngay</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export default RegistrationScreen;