import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { getCVDetail } from "@/service/cvService";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";

type CVDetail = {
  uuid: string;
  studentUuid: string;
  cloudinaryPublicId: string;
  url: string;
  uploadAt: string;
};

export default function DetailCVScreen() {
  const router = useRouter();
  const { uuid } = useLocalSearchParams();
  const [cvDetail, setCvDetail] = useState<CVDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getCVDetail(uuid as string);
        if (response.error.code === 0) {
          setCvDetail(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [uuid]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!cvDetail) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text className="text-lg text-gray-500">Không tìm thấy CV</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="bg-white shadow-lg px-5 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => router.back()} className="p-2">
          <Ionicons name="chevron-back" size={28} color="#2563eb" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-gray-800 ml-3">Chi tiết CV</Text>
      </View>

      {/* WebView để hiển thị CV */}
      <View className="flex-1">
        <WebView 
          source={{ uri: cvDetail.url }} 
          className="flex-1"
          startInLoadingState={true}
          renderLoading={() => (
            <ActivityIndicator size="large" color="#2563eb" className="mt-10" />
          )}
        />
      </View>
    </View>
  );
}
