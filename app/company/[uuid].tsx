import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator, 
  TouchableOpacity, 
  Linking, 
  RefreshControl,
  Image
} from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { getCompanyDetail } from '../../service/companyService';
import { CompanyDetail } from '@/types/company';
import { createConversation } from '../../service/conversationService';
import { useStudent } from '../../contexts/StudentContext';

const CompanyDetailScreen = () => {
  const { uuid } = useLocalSearchParams<{ uuid: string }>();
  const [company, setCompany] = useState<CompanyDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);

   const { student, loading: studentLoading } = useStudent();// Get student data from context
  const router = useRouter();

  const fetchCompanyDetail = async () => {
    try {
      setError(null);
      const response = await getCompanyDetail(uuid);
      
      if (response.data) {
        setCompany(response.data);
      } else {
        setError(response.error.message || 'Không thể tải thông tin công ty');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi khi tải thông tin công ty');
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (uuid) {
      fetchCompanyDetail();
    } else {
      setError('Không tìm thấy mã công ty');
      setLoading(false);
    }
  }, [uuid]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCompanyDetail();
  };

  const handleCallPhone = () => {
    if (company?.phoneNumber) {
      Linking.openURL(`tel:${company.phoneNumber}`);
    }
  };
  const handleCreateConversation = async () => {
    if (!student?.data.uuid || !company?.uuid) return;
  
    try {
      setIsCreatingConversation(true);
  
      const response = await createConversation({
        studentUuid: student.data.uuid,
        companyUuid: company.uuid,
      });
  
      if (response.data) {
        router.push(`/conversations/${response.data.uuid}`);
      } else {
        alert(response.error?.message || 'Không thể tạo cuộc trò chuyện');
      }
    } catch (error) {
      alert('Đã xảy ra lỗi khi tạo cuộc trò chuyện');
      console.error(error);
    } finally {
      setIsCreatingConversation(false);
    }
  };
  
  const handleSendEmail = () => {
    if (company?.email) {
      Linking.openURL(`mailto:${company.email}`);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Stack.Screen options={{ title: 'Chi tiết công ty' }} />
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text className="mt-4 text-gray-600">Đang tải thông tin công ty...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 px-4">
        <Stack.Screen options={{ title: 'Chi tiết công ty' }} />
        <MaterialIcons name="error-outline" size={64} color="#EF4444" />
        <Text className="mt-4 text-red-500 font-medium text-lg text-center">{error}</Text>
        <TouchableOpacity 
          className="mt-6 bg-blue-500 py-2 px-6 rounded-full" 
          onPress={fetchCompanyDetail}
        >
          <Text className="text-white font-medium">Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!company) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <Stack.Screen options={{ title: 'Chi tiết công ty' }} />
        <MaterialIcons name="business" size={64} color="#9CA3AF" />
        <Text className="mt-4 text-gray-500 font-medium text-lg">Không tìm thấy thông tin công ty</Text>
        <TouchableOpacity 
          className="mt-6 bg-gray-500 py-2 px-6 rounded-full" 
          onPress={() => router.back()}
        >
          <Text className="text-white font-medium">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Stack.Screen 
        options={{ 
          title: company.name,
          headerTitleStyle: { fontSize: 18 }
        }} 
      />

      {/* Company Header */}
      <View className="bg-white p-6 mb-4 shadow-sm">
        <View className="flex-row items-center">
          <View className="w-20 h-20 bg-gray-200 rounded-xl justify-center items-center mr-4 overflow-hidden">
            {/* If you have company logo, use it here */}
            <MaterialIcons name="business" size={40} color="#4B5563" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-gray-800">{company.name}</Text>
            <View className="flex-row items-center mt-1">
              <Feather name="map-pin" size={14} color="#4B5563" />
              <Text className="text-gray-600 text-sm ml-1">
                {company.xa?.name}, {company.qh?.name}, {company.tp?.name}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View className="bg-white px-6 py-4 mb-4 shadow-sm">
  <TouchableOpacity 
    className={`bg-blue-500 rounded-full py-3 items-center flex-row justify-center ${isCreatingConversation ? 'opacity-50' : ''}`}
    onPress={handleCreateConversation}
    disabled={isCreatingConversation}
  >
    {isCreatingConversation ? (
      <ActivityIndicator size="small" color="#fff" />
    ) : (
      <Text className="text-white font-medium text-base">Nhắn tin</Text>
    )}
  </TouchableOpacity>
</View>

      {/* Contact Info */}
      <View className="bg-white p-6 mb-4 shadow-sm">
        <Text className="text-lg font-bold text-gray-800 mb-4">Thông tin liên hệ</Text>
        
        <TouchableOpacity 
          className="flex-row items-center py-3 border-b border-gray-100"
          onPress={handleCallPhone}
        >
          <View className="w-10 h-10 rounded-full bg-blue-100 justify-center items-center">
            <Feather name="phone" size={18} color="#3B82F6" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm text-gray-500">Số điện thoại</Text>
            <Text className="text-base text-blue-600">{company.phoneNumber || 'Chưa cập nhật'}</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          className="flex-row items-center py-3"
          onPress={handleSendEmail}
        >
          <View className="w-10 h-10 rounded-full bg-blue-100 justify-center items-center">
            <Feather name="mail" size={18} color="#3B82F6" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-sm text-gray-500">Email</Text>
            <Text className="text-base text-blue-600">{company.email || 'Chưa cập nhật'}</Text>
          </View>
          <Feather name="chevron-right" size={20} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      {/* Address */}
      <View className="bg-white p-6 mb-4 shadow-sm">
        <Text className="text-lg font-bold text-gray-800 mb-4">Địa chỉ</Text>
        
        <View className="flex-row items-start">
          <View className="w-10 h-10 rounded-full bg-blue-100 justify-center items-center mt-1">
            <Feather name="map" size={18} color="#3B82F6" />
          </View>
          <View className="ml-3 flex-1">
            <Text className="text-base text-gray-800">
              {company.xa?.name}, {company.qh?.name}, {company.tp?.name}
            </Text>
          </View>
        </View>
      </View>

      {/* Description */}
      <View className="bg-white p-6 mb-4 shadow-sm">
        <Text className="text-lg font-bold text-gray-800 mb-4">Giới thiệu</Text>
        
        {company.description ? (
          <Text className="text-base text-gray-700 leading-6">{company.description}</Text>
        ) : (
          <Text className="text-base text-gray-500 italic">Chưa có thông tin mô tả</Text>
        )}
      </View>

      {/* Jobs at this company - can be added if you have job data related to this company */}
      <View className="h-16" />
    </ScrollView>
  );
};

export default CompanyDetailScreen;