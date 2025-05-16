import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Modal, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useStudent } from '../../contexts/StudentContext';
import { getPageListWarning } from '../../service/warningService';
import { Warning } from '../../types/warning';

const StudentWarningScreen = () => {
  const [warnings, setWarnings] = useState<Warning[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedWarning, setSelectedWarning] = useState<Warning | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const PAGE_SIZE = 10;
  
  const { student,loading:studentLoading } = useStudent();
  
  const fetchWarnings = async (currentPage = 1, shouldRefresh = false) => {
    if (!student?.data.uuid) {
      setError('Không thể tìm thấy thông tin học sinh');
      setLoading(false);
      return;
    }
    
    try {
      setError('');
      
      const response = await getPageListWarning({
        page: currentPage,
        pageSize: PAGE_SIZE,
        targetUuid: student.data.uuid,
      });
      
      if (response.error && response.error.code !== 'success') {
        setError(response.error.message || 'Có lỗi xảy ra khi tải cảnh báo');
        return;
      }
      
      const newWarnings = response.data.items || [];
      
      if (shouldRefresh) {
        setWarnings(newWarnings);
      } else {
        setWarnings(prev => [...prev, ...newWarnings]);
      }
      
      setHasMore(newWarnings.length === PAGE_SIZE);
    } catch (err) {
      setError('Không thể kết nối đến máy chủ');
      console.error('Error fetching warnings:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useEffect(() => {
    fetchWarnings();
  }, [student?.data.uuid]);
  
  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchWarnings(1, true);
  };
  
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchWarnings(nextPage);
    }
  };
  
  const navigateToWarningDetails = (warning: Warning) => {
    setSelectedWarning(warning);
    setModalVisible(true);
  };
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm');
    } catch (e) {
      return dateString;
    }
  };
  
  const renderWarningItem = ({ item }: { item: Warning }) => {
    return (
      <TouchableOpacity
        onPress={() => navigateToWarningDetails(item)}
        className="bg-white p-4 mb-3 rounded-lg shadow-sm border border-gray-100"
      >
        <View className="flex-row justify-between items-start">
          <View className="flex-1 mr-2">
            <Text numberOfLines={2} className="text-base font-medium text-gray-800">
              {item.messages}
            </Text>
            <Text className="text-xs text-gray-500 mt-2">
              {formatDate(item.createdAt)}
            </Text>
          </View>
          <View className="bg-red-100 p-2 rounded-full">
            <Ionicons name="warning" size={20} color="#EF4444" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderEmptyComponent = () => (
    <View className="flex-1 items-center justify-center p-8">
      <Ionicons name="checkmark-circle" size={60} color="#10B981" />
      <Text className="text-center text-gray-500 mt-4 text-lg font-medium">
        Không có cảnh báo nào
      </Text>
      <Text className="text-center text-gray-400 mt-2">
        Bạn không có cảnh báo nào cần xem xét
      </Text>
    </View>
  );
  
  const renderFooter = () => {
    if (!loading || refreshing) return null;
    
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  };

  if (loading && !refreshing && warnings.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-4">Đang tải cảnh báo...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 py-3 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-800">Cảnh báo</Text>
        <Text className="text-sm text-gray-500">
          Xem những cảnh báo liên quan đến hoạt động học tập
        </Text>
      </View>
      
      {error ? (
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="alert-circle" size={60} color="#EF4444" />
          <Text className="text-red-600 text-lg font-medium mt-4">
            Đã xảy ra lỗi
          </Text>
          <Text className="text-gray-500 text-center mt-2">
            {error}
          </Text>
          <TouchableOpacity
            onPress={handleRefresh}
            className="mt-6 bg-blue-500 py-3 px-6 rounded-full"
          >
            <Text className="text-white font-medium">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={warnings}
          renderItem={renderWarningItem}
          keyExtractor={(item) => item.uuid}
          contentContainerClassName="px-4 py-4"
          ListEmptyComponent={renderEmptyComponent}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#3B82F6']}
              tintColor="#3B82F6"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
        />
      )}
      
      {/* Modal Chi tiết cảnh báo */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white rounded-t-3xl max-h-4/5 pb-8">
            {selectedWarning && (
              <>
                {/* Header Modal */}
                <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
                  <Text className="text-xl font-bold text-gray-800">Chi tiết cảnh báo</Text>
                  <TouchableOpacity 
                    onPress={() => setModalVisible(false)}
                    className="p-2"
                  >
                    <Ionicons name="close" size={24} color="#374151" />
                  </TouchableOpacity>
                </View>
                
                {/* Content Modal */}
                <ScrollView className="p-4">
                  <View className="bg-white rounded-xl p-4 mb-4">
                    <View className="flex-row items-center mb-4">
                      <View className="bg-red-100 p-3 rounded-full mr-3">
                        <Ionicons name="warning" size={24} color="#EF4444" />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm text-gray-500">Cảnh báo</Text>
                        <Text className="text-gray-400 text-xs">
                          {formatDate(selectedWarning.createdAt)}
                        </Text>
                      </View>
                    </View>

                    <View className="py-4 border-t border-b border-gray-100">
                      <Text className="text-lg font-medium text-gray-800 mb-2">
                        Nội dung cảnh báo
                      </Text>
                      <Text className="text-gray-600 leading-6">
                        {selectedWarning.messages}
                      </Text>
                    </View>

                    <View className="pt-4">
                      <View className="flex-row mb-2">
                        <Text className="w-1/3 text-gray-500">Mã cảnh báo:</Text>
                        <Text className="text-gray-700 flex-1">{selectedWarning.uuid}</Text>
                      </View>
                      <View className="flex-row mb-2">
                        <Text className="w-1/3 text-gray-500">Loại đối tượng:</Text>
                        <Text className="text-gray-700 flex-1">{selectedWarning.targetType}</Text>
                      </View>
                      <View className="flex-row">
                        <Text className="w-1/3 text-gray-500">Mã đối tượng:</Text>
                        <Text className="text-gray-700 flex-1">{selectedWarning.targetUuid}</Text>
                      </View>
                    </View>
                  </View>

                  {/* Action button */}
                  <TouchableOpacity 
                    className="bg-blue-500 py-4 px-6 rounded-lg items-center mb-6"
                    onPress={() => setModalVisible(false)}
                  >
                    <Text className="text-white font-medium">Đánh dấu đã đọc</Text>
                  </TouchableOpacity>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default StudentWarningScreen;