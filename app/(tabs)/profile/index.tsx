import { JobSuggestions } from "@/components/JobSuggestion";
import { useAuth } from "@/contexts/AuthContext";
import { useStudent } from "@/contexts/StudentContext";
import { getStudentProfile } from "@/service/studentService";
import { detailUser } from "@/service/userService";
import { StudentDetail } from "@/types/student";
import { User } from "@/types/user";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";

const StudentProfileScreen = ({ navigation }: { navigation: any }) => {
  const [profile, setProfile] = useState<StudentDetail | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [refreshing, setRefreshing] = useState(false);
  const { logout } = useAuth();
  const { clearStudentData } = useStudent();
  const router = useRouter();

  const handleLogout = async () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất khỏi hệ thống?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              clearStudentData();
              await logout();
            } catch (error) {
              console.error('Lỗi khi đăng xuất:', error);
              Alert.alert('Lỗi', 'Không thể đăng xuất. Vui lòng thử lại.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const navigateToVerifyOTP = () => {
    try {
      if (!userData) {
        throw new Error("Không tìm thấy thông tin người dùng");
      }
      
      if (!userData.email) {
        throw new Error("Không tìm thấy email");
      }
  
      router.push({
        pathname: "/auth/verifyOTP",
        params: { 
          email: userData.email,
          // Có thể thêm các params khác nếu cần
          uuid: userData.uuid 
        }
      });
    } catch (error) {
      console.error("Lỗi khi chuyển đến màn hình xác thực:", error);
     
    }
  };
  
  const VerifyBadge = ({ isVerified }: { isVerified: boolean }) => {
    if (isVerified) {
      return (
        <View className="flex-row items-center ml-1">
          <Ionicons name="checkmark-circle" size={16} color="#10B981" />
          <Text className="text-xs text-green-600 ml-1">Đã xác thực</Text>
        </View>
      );
    }
  
    return (
      <TouchableOpacity 
        onPress={navigateToVerifyOTP}
        className="flex-row items-center ml-1 bg-yellow-50 px-2 py-1 rounded-full"
      >
        <Ionicons name="alert-circle" size={14} color="#F59E0B" />
        <Text className="text-xs text-yellow-700 ml-1">Chưa xác thực</Text>
      </TouchableOpacity>
    );
  };

  const fetchData = async () => {
    setLoading(true);
    const userUuid = await AsyncStorage.getItem("uuid");
    if (userUuid) {
      try {
        // Fetch user data for verification status
        const userResponse = await detailUser(userUuid);
        if (userResponse?.data) {
          setUserData(userResponse.data);
        }

        // Fetch student profile
        const profileResponse = await getStudentProfile(userUuid);
        if (profileResponse?.data) {
          setProfile(profileResponse.data);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatTime = (time: string) => {
    return time ? time.substring(0, 5) : "";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Chưa cập nhật";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  const renderAvailabilitySchedule = () => {
    if (!profile?.availabilities || profile.availabilities.length === 0) {
      return (
        <View className="bg-gray-50 p-4 rounded-lg">
          <Text className="text-gray-500 text-center">Chưa có lịch trống</Text>
        </View>
      );
    }

    const daysOfWeek = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const vietnameseDays = {
      "monday": "Thứ Hai",
      "tuesday": "Thứ Ba",
      "wednesday": "Thứ Tư",
      "thursday": "Thứ Năm",
      "friday": "Thứ Sáu",
      "saturday": "Thứ Bảy",
      "sunday": "Chủ Nhật"
    };

    return (
      <View className="space-y-2">
        {daysOfWeek.map(day => {
          const daySchedules = profile.availabilities.filter(a => a.dayOfWeek?.toLowerCase() === day);
          if (daySchedules.length === 0) return null;

          return (
            <View key={day} className="bg-gray-50 p-3 rounded-lg">
              <Text className="font-bold text-gray-800 mb-1">{vietnameseDays[day as keyof typeof vietnameseDays]}</Text>
              {daySchedules.map((schedule, index) => (
                <View key={index} className="flex-row items-center ml-2 mt-1">
                  <Ionicons name="time-outline" size={16} color="#6366f1" />
                  <Text className="text-gray-700 ml-2">
                    {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}
      </View>
    );
  };

  const renderSkills = () => {
    if (!profile?.listSkill || profile.listSkill.length === 0) {
      return (
        <View className="bg-gray-50 p-4 rounded-lg">
          <Text className="text-gray-500 text-center">Chưa có kỹ năng</Text>
        </View>
      );
    }

    const proficiencyColor = {
      "beginner": "bg-yellow-100 text-yellow-800",
      "intermediate": "bg-blue-100 text-blue-800",
      "advanced": "bg-green-100 text-green-800",
      "expert": "bg-purple-100 text-purple-800"
    };

    return (
      <View className="flex-row flex-wrap gap-2">
        {profile.listSkill.map((skill, index) => (
          <View key={index} className="bg-gray-50 p-3 rounded-lg">
            <Text className="font-medium text-gray-800">{skill.skill.name}</Text>
            <View className="flex-row items-center mt-1">
              <View className={`px-2 py-1 rounded-full ${proficiencyColor[skill.proficiency.toLowerCase() as keyof typeof proficiencyColor] || "bg-gray-100 text-gray-800"}`}>
                <Text className="text-xs font-medium">{skill.proficiency}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  const fixUnicodeText = (text: string | undefined) => {
    if (!text) return "Chưa cập nhật";

    if (/Ä|á»|á»|á»|á»|áº|áº|á»|á»/.test(text)) {
      if (text.includes("Äáº¡i há»c")) return "Đại học" + text.split("Äáº¡i há»c")[1];
      return "Đã cập nhật";
    }

    return text;
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-100">
      {/* Header */}
      <View className="bg-indigo-600 px-5 py-6 shadow-lg">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
            <Ionicons name="chevron-back" size={28} color="#ffffff" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-white ml-3">Hồ Sơ Sinh Viên</Text>
        </View>
      </View>

      <ScrollView 
  className="flex-1"
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      colors={["#6366f1"]} // Màu sắc của indicator (tuỳ chọn)
      tintColor="#6366f1" // Màu sắc của indicator (tuỳ chọn)
    />
  }
>

        {profile ? (
          <>
            {/* Profile Card */}
            <View className="bg-white mx-4 -mt-4 rounded-xl shadow-xl p-6">
              <View className="flex-row items-center">
                <Image
                  source={{ uri: "https://via.placeholder.com/150" }}
                  className="w-20 h-20 rounded-full border-4 border-indigo-100"
                />
                <View className="ml-4 flex-1">
                  <View className="flex-row items-center">
                    <Text className="text-xl font-bold text-gray-900">{profile.fullname}</Text>
                    {userData && <VerifyBadge isVerified={userData.isVerify} />}
                  </View>
                  <Text className="text-gray-600">{fixUnicodeText(profile.major)}</Text>
                  <Text className="text-gray-600">{fixUnicodeText(profile.university)}</Text>
                </View>
              </View>

              {userData && !userData.isVerify && (
                <View className="bg-yellow-50 p-3 rounded-lg mt-4 flex-row items-center">
                  <Ionicons name="warning" size={20} color="#F59E0B" />
                  <Text className="text-yellow-700 ml-2 flex-1">
      Tài khoản chưa được xác thực. Vui lòng xác thực email {userData.email} để sử dụng đầy đủ tính năng.
    </Text>
                  <TouchableOpacity 
                    onPress={navigateToVerifyOTP}
                    className="bg-yellow-100 px-3 py-1 rounded-full"
                  >
                    <Text className="text-yellow-700 text-sm">Xác thực ngay</Text>
                  </TouchableOpacity>
                </View>
              )}

              <View className="flex-row justify-evenly mt-6">
                <TouchableOpacity
                  onPress={() => router.push({ pathname: "./profile/cv", params: { studentUuid: profile.uuid } })}
                  className="items-center"
                >
                  <View className="bg-indigo-100 w-12 h-12 rounded-full items-center justify-center mb-1">
                    <Ionicons name="document-text" size={22} color="#6366f1" />
                  </View>
                  <Text className="text-xs font-medium text-gray-700">CV</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push({ pathname: "./profile/freetime", params: { studentUuid: profile.uuid } })}
                  className="items-center"
                >
                  <View className="bg-indigo-100 w-12 h-12 rounded-full items-center justify-center mb-1">
                    <Ionicons name="time" size={22} color="#6366f1" />
                  </View>
                  <Text className="text-xs font-medium text-gray-700">Lịch Trống</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/profile/edit")}
                  className="items-center"
                >
                  <View className="bg-indigo-100 w-12 h-12 rounded-full items-center justify-center mb-1">
                    <Ionicons name="pencil" size={22} color="#6366f1" />
                  </View>
                  <Text className="text-xs font-medium text-gray-700">Chỉnh Sửa</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => router.push("/skills")}
                  className="items-center w-[18%]"
                >
                  <View className="bg-indigo-100 w-12 h-12 rounded-full items-center justify-center mb-1">
                    <Ionicons name="calendar-outline" size={22} color="#6366f1" />
                  </View>
                  <Text className="text-xs font-medium text-center text-gray-700">Kĩ năng</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleLogout}
                  className="items-center w-[18%]"
                >
                  <View className="bg-red-100 w-12 h-12 rounded-full items-center justify-center mb-1">
                    <Ionicons name="log-out-outline" size={22} color="#ef4444" />
                  </View>
                  <Text className="text-xs font-medium text-center text-red-500">Đăng xuất</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Content Tabs */}
            <View className="flex-row justify-around bg-white mx-4 mt-4 rounded-xl overflow-hidden">
              <TouchableOpacity
                className={`flex-1 py-3 ${activeTab === "personal" ? "border-b-2 border-indigo-600" : ""}`}
                onPress={() => setActiveTab("personal")}
              >
                <Text className={`text-center font-medium ${activeTab === "personal" ? "text-indigo-600" : "text-gray-600"}`}>
                  Thông Tin
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 py-3 ${activeTab === "skills" ? "border-b-2 border-indigo-600" : ""}`}
                onPress={() => setActiveTab("skills")}
              >
                <Text className={`text-center font-medium ${activeTab === "skills" ? "text-indigo-600" : "text-gray-600"}`}>
                  Kỹ Năng
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className={`flex-1 py-3 ${activeTab === "schedule" ? "border-b-2 border-indigo-600" : ""}`}
                onPress={() => setActiveTab("schedule")}
              >
                <Text className={`text-center font-medium ${activeTab === "schedule" ? "text-indigo-600" : "text-gray-600"}`}>
                  Lịch Trống
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tab Content */}
            <View className="mx-4 my-4 bg-white p-5 rounded-xl shadow-md">
              {activeTab === "personal" && (
                <View className="space-y-4">
                  {/* Section: Contact */}
                  <View className="mb-4">
                    <Text className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-indigo-500 pl-2">
                      Thông Tin Liên Hệ
                    </Text>
                    <View className="space-y-3">
                      <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center">
                          <Ionicons name="call-outline" size={18} color="#6366f1" />
                        </View>
                        <View className="ml-3">
                          <Text className="text-gray-500 text-xs">Số điện thoại</Text>
                          <Text className="text-gray-800 font-medium">{profile.phoneNumber || "Chưa cập nhật"}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Section: Personal Info */}
                  <View className="mb-4">
                    <Text className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-indigo-500 pl-2">
                      Thông Tin Cá Nhân
                    </Text>
                    <View className="space-y-3">
                      <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center">
                          <Ionicons name="male-female-outline" size={18} color="#6366f1" />
                        </View>
                        <View className="ml-3">
                          <Text className="text-gray-500 text-xs">Giới tính</Text>
                          <Text className="text-gray-800 font-medium">{profile.gender === 0 ? "Nam" : "Nữ"}</Text>
                        </View>
                      </View>

                      <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center">
                          <Ionicons name="calendar-outline" size={18} color="#6366f1" />
                        </View>
                        <View className="ml-3">
                          <Text className="text-gray-500 text-xs">Ngày sinh</Text>
                          <Text className="text-gray-800 font-medium">{formatDate(profile.birthday)}</Text>
                        </View>
                      </View>
                    </View>
                  </View>

                  {/* Section: Address */}
                  <View className="mb-4">
                    <Text className="text-lg font-bold text-gray-800 mb-3 border-l-4 border-indigo-500 pl-2">
                      Địa Chỉ
                    </Text>
                    <View className="space-y-3">
                      <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center">
                          <Ionicons name="location-outline" size={18} color="#6366f1" />
                        </View>
                        <View className="ml-3">
                          <Text className="text-gray-500 text-xs">Tỉnh/Thành phố</Text>
                          <Text className="text-gray-800 font-medium">{fixUnicodeText(profile.tp?.name)}</Text>
                        </View>
                      </View>

                      <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center">
                          <Ionicons name="business-outline" size={18} color="#6366f1" />
                        </View>
                        <View className="ml-3">
                          <Text className="text-gray-500 text-xs">Quận/Huyện</Text>
                          <Text className="text-gray-800 font-medium">{fixUnicodeText(profile.qh?.name)}</Text>
                        </View>
                      </View>

                      <View className="flex-row items-center">
                        <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center">
                          <Ionicons name="home-outline" size={18} color="#6366f1" />
                        </View>
                        <View className="ml-3">
                          <Text className="text-gray-500 text-xs">Xã/Phường</Text>
                          <Text className="text-gray-800 font-medium">{fixUnicodeText(profile.xa?.name)}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </View>
              )}

              {activeTab === "skills" && (
                <View>
                  <Text className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-indigo-500 pl-2">
                    Kỹ Năng
                  </Text>
                  {renderSkills()}
                </View>
              )}

              {activeTab === "schedule" && (
                <View>
                  <Text className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-indigo-500 pl-2">
                    Lịch Trống
                  </Text>
                  {renderAvailabilitySchedule()}
                </View>
              )}
            </View>
          </>
        ) : (
          <View className="p-6 bg-white mx-4 my-4 rounded-xl shadow-md items-center">
            <MaterialCommunityIcons name="account-alert" size={60} color="#d1d5db" />
            <Text className="text-center text-gray-500 mt-4 text-lg">
              Chưa có hồ sơ sinh viên.
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/profile/add")}
              className="bg-indigo-600 py-3 px-6 rounded-xl mt-6 active:bg-indigo-700"
            >
              <Text className="text-white font-bold text-center">Tạo hồ sơ</Text>
            </TouchableOpacity>
          </View>
        )}
        <JobSuggestions></JobSuggestions>
      </ScrollView>
    </View>
  );
};

export default StudentProfileScreen;