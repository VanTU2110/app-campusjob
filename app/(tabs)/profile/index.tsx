import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Image} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStudentProfile } from "@/service/studentService";
import TabLayout from "../_layout";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
interface StudentProfile {
  uuid?: string;
  userUuid: string;
  fullname: string;
  phoneNumber: string;
  gender: number;
  birthday: string;
  university: string;
  major: string;
  tp: { code: string; name: string; uuid: string };
  qh: { code: string; name: string; uuid: string };
  xa: { code: string; name: string; uuid: string };
}

const StudentProfileScreen = ({ navigation }: { navigation: any }) => {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();
  useEffect(() => {
    const fetchUserData = async () => {
      const userUuid = await AsyncStorage.getItem("uuid");
      if (userUuid) {
        fetchStudentProfile(userUuid);
      }
    };
    fetchUserData();
  }, []);

  const fetchStudentProfile = async (userUuid: string) => {
    try {
      const response = await getStudentProfile(userUuid);
      if (response?.data) {
        setProfile(response.data);
      }
    } catch (error) {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return <ActivityIndicator size="large" color="#2563eb" className="mt-10" />;
  }
 
  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-white shadow-lg px-5 py-4 flex-row items-center">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Ionicons name="chevron-back" size={28} color="#2563eb" />
        </TouchableOpacity>
        <Text className="text-xl font-semibold text-gray-800 ml-3">Hồ Sơ Sinh Viên</Text>
      </View>

      <ScrollView className="flex-1 px-5 pt-6">
        {profile ? (
          <View className="bg-white p-6 rounded-xl shadow-2xl">
            {/* Avatar */}
            <View className="items-center mb-5">
              <Image
                source={{ uri: profile.avatar || "https://via.placeholder.com/150" }}
                className="w-28 h-28 rounded-full border-4 border-blue-500"
              />
              <Text className="text-xl font-semibold text-gray-900 mt-3">{profile.fullname}</Text>
              <Text className="text-gray-600">{profile.university}</Text>
            </View>

            {/* Thông tin cá nhân */}
            <View className="space-y-4">
              {[
                { label: "Số điện thoại", value: profile.phoneNumber, icon: "call" },
                { label: "Giới tính", value: profile.gender === 0 ? "Nam" : "Nữ", icon: "male-female" },
                { label: "Ngày sinh", value: profile.birthday, icon: "calendar" },
                { label: "Chuyên ngành", value: profile.major, icon: "book" },
                { label: "Tỉnh/Thành phố", value: profile.tp?.name, icon: "location" },
                { label: "Quận/Huyện", value: profile.qh?.name, icon: "business" },
                { label: "Xã/Phường", value: profile.xa?.name, icon: "home" },
              ].map((item, index) => (
                <View key={index} className="flex-row items-center bg-gray-100 px-4 py-3 rounded-lg">
                  <Ionicons name={item.icon} size={22} color="#2563eb" className="mr-3" />
                  <View>
                    <Text className="text-gray-500 text-sm">{item.label}</Text>
                    <Text className="text-gray-900 font-medium">{item.value || "Chưa cập nhật"}</Text>
                  </View>
                </View>
              ))}
            </View>

            {/* Nút chỉnh sửa */}
            <TouchableOpacity
              onPress={() => router.push("/profile/edit")}
              className="bg-blue-600 py-3 rounded-xl flex-row items-center justify-center mt-6 active:bg-blue-700 shadow-md"
            >
              <Ionicons name="pencil" size={22} color="#ffffff" />
              <Text className="text-white font-bold text-lg ml-2">Chỉnh sửa hồ sơ</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <Text className="text-center text-gray-500 mt-10">Chưa có hồ sơ sinh viên.</Text>
        )}
      </ScrollView>
    </View>
  );
};

export default StudentProfileScreen;
