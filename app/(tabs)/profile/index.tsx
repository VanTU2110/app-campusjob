import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStudentProfile } from "@/service/studentService";
import TabLayout from "../_layout";
import { useRouter } from "expo-router";

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
    <View className="flex-1 p-5 bg-gray-100 pt-10">
      <View className="flex-row items-center mb-4">
        <TouchableOpacity onPress={() => navigation.goBack(TabLayout)} className="p-2">
          <Ionicons name="chevron-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 ml-2">Hồ Sơ Sinh Viên</Text>
      </View>
      
      {profile ? (
        <View className="bg-white p-4 rounded-lg shadow">
          <Text className="text-gray-700 font-bold">Họ và tên: <Text className="font-normal">{profile.fullname}</Text></Text>
          <Text className="text-gray-700 font-bold">Số điện thoại: <Text className="font-normal">{profile.phoneNumber}</Text></Text>
          <Text className="text-gray-700 font-bold">Giới tính: <Text className="font-normal">{profile.gender === 0 ? "Nam" : "Nữ"}</Text></Text>
          <Text className="text-gray-700 font-bold">Ngày sinh: <Text className="font-normal">{profile.birthday}</Text></Text>
          <Text className="text-gray-700 font-bold">Trường đại học: <Text className="font-normal">{profile.university}</Text></Text>
          <Text className="text-gray-700 font-bold">Chuyên ngành: <Text className="font-normal">{profile.major}</Text></Text>
          <Text className="text-gray-700 font-bold">Tỉnh/Thành phố: <Text className="font-normal">{profile.tp.name}</Text></Text>
          <Text className="text-gray-700 font-bold">Quận/Huyện: <Text className="font-normal">{profile.qh.name}</Text></Text>
          <Text className="text-gray-700 font-bold">Xã/Phường: <Text className="font-normal">{profile.xa.name}</Text></Text>
          <TouchableOpacity onPress={() => router.push("/profile/edit")} className="bg-blue-600 py-3 mt-4 rounded-lg flex-row items-center justify-center">
            <Ionicons name="pencil" size={20} color="#ffffff" className="mr-2" />
            <Text className="text-white font-bold text-lg">Chỉnh sửa hồ sơ</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text className="text-center text-gray-500">Chưa có hồ sơ sinh viên.</Text>
      )}
    </View>
  );
};

export default StudentProfileScreen;
