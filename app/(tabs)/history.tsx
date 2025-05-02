import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useJobHistory } from '../../contexts/JobHistoryContext'; // Import custom hook để quản lý lịch sử
import JobCard from '../../components/JobCard';
import { SafeAreaView } from 'react-native-safe-area-context';

 // Giả sử bạn đã có context này
import { MaterialIcons } from '@expo/vector-icons'; // Hoặc icon library khác bạn đang dùng

const ViewedJobsScreen = () => {
  const { viewedJobs, clearHistory } = useJobHistory();
  

  // Xử lý lưu/bỏ lưu công việc
 

  // Xử lý xóa toàn bộ lịch sử
  const handleClearHistory = () => {
    clearHistory();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 pt-2">
      {/* Header với tiêu đề và nút xóa */}
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-800">Công việc đã xem</Text>
        
        {viewedJobs.length > 0 && (
          <TouchableOpacity 
            onPress={handleClearHistory}
            className="flex-row items-center py-1 px-2 bg-gray-200 rounded-md"
          >
            <MaterialIcons name="delete-outline" size={18} color="#6B7280" />
            <Text className="text-sm text-gray-600 ml-1">Xóa lịch sử</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Danh sách công việc đã xem */}
      {viewedJobs.length > 0 ? (
        <FlatList
          data={viewedJobs}
          keyExtractor={(item) => item.uuid}
          renderItem={({ item }) => (
            <JobCard
              job={item}
              compact={true}
            />
          )}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      ) : (
        <View className="flex-1 justify-center items-center">
          <MaterialIcons name="history" size={60} color="#D1D5DB" />
          <Text className="text-gray-500 mt-4 text-center">
            Bạn chưa xem công việc nào.{'\n'}
            Các công việc bạn xem sẽ hiển thị ở đây.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default ViewedJobsScreen;