import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { TouchableOpacity } from "react-native-gesture-handler";

export default function FreetimeScreen() {
  const router = useRouter();
  
  return (
    <View className="flex-1 items-center justify-center bg-gray-100">
      <Text className="text-lg font-semibold mb-4">Lịch rảnh của bạn</Text>

      <TouchableOpacity
        onPress={() => router.back()}
        className="bg-blue-600 py-3 px-5 rounded-xl flex-row items-center justify-center shadow-md"
      >
        <Ionicons name="arrow-back" size={22} color="#ffffff" />
        <Text className="text-white font-bold text-lg ml-2">Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
}
