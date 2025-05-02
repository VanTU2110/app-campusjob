import { useState } from "react";
import { View, Text, TextInput, TouchableOpacity,Alert } from "react-native";
import { Button } from "@/components/ui";
import { useRouter } from "expo-router";
import { register } from "@/service/auth";
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
    <View className="flex-1 justify-center items-center bg-gray-100 px-6">
      <Text className="text-3xl font-bold text-blue-600 mb-6">Đăng Ký</Text>

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
      <TextInput
        className="w-full p-4 border border-gray-300 rounded-lg mb-4 bg-white shadow-sm"
        placeholder="Nhập lại mật khẩu"
        value={rePassword}
        onChangeText={setRePassword}
        secureTextEntry
      />

      {/* Nút Đăng Ký */}
      <TouchableOpacity
        className="w-full bg-blue-500 p-4 rounded-lg items-center shadow-md"
        onPress={handleRegister}
      >
        <Text className="text-white font-bold text-lg">Đăng Ký</Text>
      </TouchableOpacity>

      {/* Chuyển sang Đăng nhập */}
      <TouchableOpacity onPress={() => router.push("./login")} className="mt-4">
        <Text className="text-gray-500">
          Đã có tài khoản?{" "}
          <Text className="text-blue-500 font-semibold">Đăng nhập ngay</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

export default RegistrationScreen;