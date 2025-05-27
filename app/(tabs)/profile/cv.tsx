import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, Modal, SafeAreaView } from "react-native";
import { useEffect, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import { WebView } from 'react-native-webview';
import { getListCV } from "@/service/cvService"; // Import service
import { FontAwesome } from "@expo/vector-icons"; // Dùng để hiển thị icon
import { CVItem } from "@/types/cv";

export default function ListCVScreen() {
  const router = useRouter();
  const { studentUuid } = useLocalSearchParams(); // Lấy studentUuid từ params
  const [cvList, setCvList] = useState<CVItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCV, setSelectedCV] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await getListCV(studentUuid as string);
        if (response.error.code === "success") {
          setCvList(response.data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [studentUuid]);

  const openPDFViewer = (url: string) => {
    setSelectedCV(url);
    setModalVisible(true);
  };

  const closePDFViewer = () => {
    setModalVisible(false);
    setSelectedCV(null);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <Text className="text-xl font-bold text-gray-800 mb-4">Danh sách CV</Text>

      {/* Nút thêm CV nằm trên danh sách */}
      <TouchableOpacity
        className="flex-row items-center justify-center bg-blue-600 p-3 rounded-lg mb-4"
        onPress={() => router.push({
          pathname: "/(tabs)/profile/uploadCV",
          params: { studentUuid: studentUuid }, // Truyền tham số qua params
        })}
      >
        <FontAwesome name="plus" size={20} color="#fff" />
        <Text className="text-white text-lg font-semibold ml-2">Thêm CV</Text>
      </TouchableOpacity>

      {cvList.length === 0 ? (
        <Text className="text-center text-gray-500">Không có CV nào</Text>
      ) : (
        <FlatList
          data={cvList}
          keyExtractor={(item) => item.uuid}
          renderItem={({ item }) => (
            <TouchableOpacity
              className="flex-row items-center p-4 border-b border-gray-200"
              onPress={() => openPDFViewer(item.url)} // Mở PDF trong WebView
            >
              <FontAwesome name="file-pdf-o" size={24} color="#007AFF" className="mr-3" />
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-900">CV #{item.uuid.slice(0, 6)}</Text>
                <Text className="text-gray-500 text-sm">
                  Ngày tải lên: {new Date(item.uploadAt).toLocaleDateString()}
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={18} color="#ccc" />
            </TouchableOpacity>
          )}
        />
      )}

      {/* Modal với WebView để hiển thị PDF */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        onRequestClose={closePDFViewer}
      >
        <SafeAreaView className="flex-1 bg-white">
          {/* Header với nút đóng */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-lg font-semibold text-gray-800">Xem CV</Text>
            <TouchableOpacity
              onPress={closePDFViewer}
              className="p-3 bg-gray-100 rounded-full"
            >
              <FontAwesome name="times" size={20} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {/* WebView để hiển thị PDF */}
          {selectedCV && (
            <WebView
              source={{ uri: selectedCV }}
              style={{ flex: 1 }}
              startInLoadingState={true}
              renderLoading={() => (
                <View className="flex-1 justify-center items-center">
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text className="mt-2 text-gray-600">Đang tải PDF...</Text>
                </View>
              )}
              onError={(syntheticEvent) => {
                const { nativeEvent } = syntheticEvent;
                console.warn('WebView error: ', nativeEvent);
              }}
            />
          )}
        </SafeAreaView>
      </Modal>
    </View>
  );
}