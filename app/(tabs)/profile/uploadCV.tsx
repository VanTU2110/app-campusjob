import { View, Text, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import {  insertCV } from "@/service/cvService"; // Import service
import { uploadFile } from "@/service/fileService"; // Import service
import { FontAwesome } from "@expo/vector-icons";

export default function UploadCVScreen() {
  const router = useRouter();
  const { studentUuid } = useLocalSearchParams(); // Lấy studentUuid từ params
  const [file, setFile] = useState<DocumentPicker.DocumentPickerResult | null>(null);
  const [loading, setLoading] = useState(false);

  const pickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
      });
      if (!result.canceled) {
        setFile(result);
      }
    } catch (error) {
      console.error("Lỗi chọn file:", error);
    }
  };

  const handleUpload = async () => {
    if (!file || !file.assets || file.assets.length === 0) {
      Alert.alert("Lỗi", "Vui lòng chọn một file trước!");
      return;
    }
  
    try {
      setLoading(true);
      const uploadResponse = await uploadFile(file.assets[0]); // Gửi file lên server
  
      if (!uploadResponse.url || !uploadResponse.cloudinaryPublicId) {
        throw new Error("Upload không thành công");
      }
  
      const cvData = {
        studentUuid,
        cloudinaryPublicId: uploadResponse.cloudinaryPublicId,
        url: uploadResponse.url,
      };
  
      await insertCV(cvData); // Gửi thông tin CV lên server
      Alert.alert("Thành công", "CV đã được tải lên!", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error: any) {
      Alert.alert("Lỗi", error.toString());
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <View className="flex-1 bg-white p-4 justify-center items-center">
      <Text className="text-xl font-bold text-gray-800 mb-4">Tải lên CV</Text>

      {/* Chọn file */}
      <TouchableOpacity
        className="flex-row items-center justify-center bg-gray-200 px-4 py-3 rounded-lg w-full mb-4"
        onPress={pickFile}
      >
        <FontAwesome name="file" size={20} color="#333" />
        <Text className="text-gray-800 text-lg font-semibold ml-2">
          {file && file.assets && file.assets[0] ? file.assets[0].name : "Chọn file PDF"}
        </Text>
      </TouchableOpacity>

      {/* Nút Upload */}
      <TouchableOpacity
        className={`w-full p-3 rounded-lg flex-row items-center justify-center ${
          file ? "bg-blue-600" : "bg-gray-400"
        }`}
        disabled={!file || loading}
        onPress={handleUpload}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <FontAwesome name="upload" size={20} color="#fff" />
            <Text className="text-white text-lg font-semibold ml-2">Tải lên</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
