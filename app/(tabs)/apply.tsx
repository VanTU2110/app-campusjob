import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, RefreshControl, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useStudent } from '../../contexts/StudentContext';
import { cancelApply, getListPageApplyJob } from '../../service/applyService';
import { ApplyItem } from '../../types/apply';

// Định nghĩa các tab trạng thái
const STATUS_TABS = [
  { key: 'all', label: 'Tất cả', icon: 'list-outline' },
  { key: 'pending', label: 'Chờ duyệt', icon: 'time-outline', color: '#F59E0B' },
  { key: 'interviewing', label: 'Phỏng vấn', icon: 'people-outline', color: '#3B82F6' },
  { key: 'accepted', label: 'Được chấp nhận', icon: 'checkmark-circle-outline', color: '#10B981' },
  { key: 'hired', label: 'Được tuyển', icon: 'trophy-outline', color: '#8B5CF6' },
  { key: 'rejected', label: 'Bị từ chối', icon: 'close-circle-outline', color: '#EF4444' },
  { key: 'cancelled', label: 'Đã hủy', icon: 'ban-outline', color: '#6B7280' },
];

// Component hiển thị cover letter
const CoverLetterModal = ({ visible, onClose, coverLetter, jobTitle }: {
  visible: boolean;
  onClose: () => void;
  coverLetter: string;
  jobTitle: string;
}) => (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-row justify-between items-center p-4 border-b border-gray-200">
        <Text className="text-lg font-bold text-gray-900">Thư xin việc</Text>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>
      <ScrollView className="flex-1 p-4">
        <Text className="text-sm text-gray-600 mb-4">Vị trí: {jobTitle}</Text>
        <Text className="text-base text-gray-800 leading-6">{coverLetter}</Text>
      </ScrollView>
    </SafeAreaView>
  </Modal>
);

// Component card đơn ứng tuyển cải tiến
const ImprovedApplicationCard = ({ 
  application, 
  onPress, 
  onCancel, 
  onViewCoverLetter 
}: {
  application: ApplyItem;
  onPress: (jobUuid: string) => void;
  onCancel: (uuid: string) => void;
  onViewCoverLetter: (coverLetter: string, jobTitle: string) => void;
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { color: '#F59E0B', bg: '#FEF3C7', text: 'Chờ duyệt' };
      case 'interviewing':
        return { color: '#3B82F6', bg: '#DBEAFE', text: 'Phỏng vấn' };
      case 'accepted':
        return { color: '#10B981', bg: '#D1FAE5', text: 'Được chấp nhận' };
      case 'hired':
        return { color: '#8B5CF6', bg: '#EDE9FE', text: 'Được tuyển' };
      case 'rejected':
        return { color: '#EF4444', bg: '#FEE2E2', text: 'Bị từ chối' };
      case 'cancelled':
        return { color: '#6B7280', bg: '#F3F4F6', text: 'Đã hủy' };
      default:
        return { color: '#6B7280', bg: '#F3F4F6', text: 'Không xác định' };
    }
  };

  const statusConfig = getStatusConfig(application.status);
  const canCancel = application.status === 'pending' || application.status === 'interviewing';

  const handleCancel = () => {
    Alert.alert(
      'Xác nhận hủy đơn',
      'Bạn có chắc chắn muốn hủy đơn ứng tuyển này không?',
      [
        { text: 'Không', style: 'cancel' },
        { text: 'Có', style: 'destructive', onPress: () => onCancel(application.uuid) }
      ]
    );
  };

  return (
    <TouchableOpacity 
      className="bg-white rounded-lg shadow-sm border border-gray-200 mb-3 p-4"
      onPress={() => onPress(application.jobUuid || '')}
    >
      <View className="flex-row justify-between items-start mb-3">
        
        <View 
          className="px-3 py-1 rounded-full"
          style={{ backgroundColor: statusConfig.bg }}
        >
          <Text className="text-xs font-medium" style={{ color: statusConfig.color }}>
            {statusConfig.text}
          </Text>
        </View>
      </View>

      <View className="flex-row items-center mb-3">
        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
        <Text className="text-sm text-gray-600 ml-2">
          Ngày nộp: {new Date(application.appliedAt).toLocaleDateString('vi-VN')}
        </Text>
      </View>

      <View className="flex-row justify-between items-center">
        <TouchableOpacity 
          className="flex-row items-center bg-blue-50 px-3 py-2 rounded-lg"
          onPress={() => onViewCoverLetter(application.coverLetter || '', application.job?.title || '')}
        >
          <Ionicons name="document-text-outline" size={16} color="#3B82F6" />
          <Text className="text-sm text-blue-600 ml-1 font-medium">Xem thư xin việc</Text>
        </TouchableOpacity>

        {canCancel && (
          <TouchableOpacity 
            className="flex-row items-center bg-red-50 px-3 py-2 rounded-lg"
            onPress={handleCancel}
          >
            <Ionicons name="close-circle-outline" size={16} color="#EF4444" />
            <Text className="text-sm text-red-600 ml-1 font-medium">Hủy đơn</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const ApplicationsScreen = () => {
  const router = useRouter();
  const { student, loading } = useStudent();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  const [applications, setApplications] = useState<ApplyItem[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [coverLetterModal, setCoverLetterModal] = useState({
    visible: false,
    content: '',
    jobTitle: ''
  });
  
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);
  
  const fetchApplications = async () => {
    if (!student?.data.uuid) return;
    
    setIsLoading(true);
    try {
      const response = await getListPageApplyJob({
        page,
        pageSize,
        studentUuid: student.data.uuid,
      });
      setData(response);
      setIsError(false);
      setError(null);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err : new Error('Không thể tải danh sách đơn ứng tuyển'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelApplication = async (applicationUuid: string) => {
    setCancelling(applicationUuid);
    try {
      await cancelApply(applicationUuid);
      // Refresh data after cancel
      await fetchApplications();
      Alert.alert('Thành công', 'Đã hủy đơn ứng tuyển thành công');
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể hủy đơn ứng tuyển. Vui lòng thử lại.');
    } finally {
      setCancelling(null);
    }
  };

  const handleViewCoverLetter = (coverLetter: string, jobTitle: string) => {
    setCoverLetterModal({
      visible: true,
      content: coverLetter,
      jobTitle
    });
  };
  
  // Fetch applications when component mounts or dependencies change
  useEffect(() => {
    fetchApplications();
  }, [page, student?.data.uuid]);
  
  // Update applications list when data changes
  useEffect(() => {
    if (data?.data?.items) {
      if (page === 1) {
        setApplications(data.data.items);
      } else {
        setApplications(prev => [...prev, ...data.data.items]);
      }
    }
  }, [data, page]);

  // Refresh data when screen is focused
  useFocusEffect(
    useCallback(() => {
      if (student?.data.uuid) {
        setPage(1);
        fetchApplications();
      }
    }, [student?.data.uuid])
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchApplications();
    setRefreshing(false);
  };

  const loadMoreApplications = () => {
    if (data?.data?.pagination?.hasNextPage && !isLoading) {
      setPage(prev => prev + 1);
    }
  };

  const navigateToJobDetails = (jobUuid: string) => {
    if (jobUuid) {
      router.push({
        pathname: '/jobs/[uuid]',
        params: { uuid: jobUuid }
      });
    }
  };

  // Filter applications by status
  const filteredApplications = applications.filter(app => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  // Get count for each status
  const getStatusCount = (status: string) => {
    if (status === 'all') return applications.length;
    return applications.filter(app => app.status === status).length;
  };

  if (!student?.data.uuid) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <StatusBar style="dark" />
        <Ionicons name="person-outline" size={64} color="#9CA3AF" />
        <Text className="text-gray-600 mt-4 text-center font-medium text-lg">
          Chưa đăng nhập
        </Text>
        <Text className="text-gray-500 mt-2 text-center px-6">
          Vui lòng đăng nhập để xem các đơn ứng tuyển của bạn
        </Text>
        <TouchableOpacity 
          className="mt-6 bg-indigo-600 px-6 py-3 rounded-lg"
          onPress={() => router.push('/auth/login')}
        >
          <Text className="text-white font-medium">Đăng nhập</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="light" />
      <View className="bg-indigo-600 pt-12 pb-4 px-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-xl font-bold">Đơn ứng tuyển của tôi</Text>
          <TouchableOpacity 
            className="bg-indigo-700 p-2 rounded-full"
            onPress={() => router.push('/jobs')}
          >
            <Ionicons name="briefcase-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
        <Text className="text-indigo-100 mt-1">
          Quản lý và theo dõi các đơn ứng tuyển
        </Text>
      </View>

      {/* Status Tabs */}
      <View className="bg-white border-b border-gray-200 h-12">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, alignItems: 'center', height: 48 }}
        >
          {STATUS_TABS.map((tab) => {
            const count = getStatusCount(tab.key);
            const isActive = activeTab === tab.key;
            
            return (
              <TouchableOpacity
                key={tab.key}
                className={`flex-row items-center px-3 py-1.5 rounded-full mr-2 h-8 ${
                  isActive ? 'bg-indigo-100 border border-indigo-200' : 'bg-gray-50'
                }`}
                onPress={() => setActiveTab(tab.key)}
              >
                <Ionicons 
                  name={tab.icon as any} 
                  size={12} 
                  color={isActive ? '#4F46E5' : tab.color || '#6B7280'} 
                />
                <Text className={`ml-1 text-xs font-medium ${
                  isActive ? 'text-indigo-700' : 'text-gray-600'
                }`} numberOfLines={1}>
                  {tab.label}
                </Text>
                <View className={`ml-1 w-5 h-4 rounded-full items-center justify-center ${
                  isActive ? 'bg-indigo-200' : 'bg-gray-200'
                }`}>
                  <Text className={`text-xs font-bold ${
                    isActive ? 'text-indigo-700' : 'text-gray-600'
                  }`} style={{ fontSize: 10 }}>
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {isLoading && page === 1 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text className="text-gray-600 mt-2">Đang tải...</Text>
        </View>
      ) : isError ? (
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="text-red-500 mt-2 text-center">
            {error instanceof Error ? error.message : 'Lỗi khi tải đơn ứng tuyển'}
          </Text>
          <TouchableOpacity 
            className="mt-4 bg-indigo-600 px-4 py-2 rounded-lg"
            onPress={() => fetchApplications()}
          >
            <Text className="text-white font-medium">Thử lại</Text>
          </TouchableOpacity>
        </View>
      ) : filteredApplications.length === 0 ? (
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="document-outline" size={64} color="#9CA3AF" />
          <Text className="text-gray-600 mt-4 text-center font-medium text-lg">
            {activeTab === 'all' ? 'Chưa có đơn ứng tuyển' : `Không có đơn ở trạng thái "${STATUS_TABS.find(t => t.key === activeTab)?.label}"`}
          </Text>
          <Text className="text-gray-500 mt-2 text-center">
            {activeTab === 'all' ? 'Bạn chưa ứng tuyển công việc nào.' : 'Thử chọn tab khác để xem các đơn ứng tuyển.'}
          </Text>
          {activeTab === 'all' && (
            <TouchableOpacity 
              className="mt-6 bg-indigo-600 px-6 py-3 rounded-lg"
              onPress={() => router.push('/jobs')}
            >
              <Text className="text-white font-medium">Tìm việc làm</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredApplications}
          renderItem={({ item }) => (
            <ImprovedApplicationCard 
              application={item} 
              onPress={navigateToJobDetails}
              onCancel={handleCancelApplication}
              onViewCoverLetter={handleViewCoverLetter}
            />
          )}
          keyExtractor={item => item.uuid}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#4F46E5']}
            />
          }
          onEndReached={loadMoreApplications}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-700 font-medium">
                {filteredApplications.length} đơn ứng tuyển
              </Text>
              <Text className="text-sm text-gray-500">
                Tổng cộng: {applications.length}
              </Text>
            </View>
          }
          ListFooterComponent={
            isLoading && page > 1 ? (
              <View className="py-4 flex items-center">
                <ActivityIndicator size="small" color="#4F46E5" />
              </View>
            ) : data?.data?.pagination?.hasNextPage ? (
              <TouchableOpacity 
                className="py-3 flex items-center"
                onPress={loadMoreApplications}
              >
                <Text className="text-indigo-600 font-medium">Tải thêm</Text>
              </TouchableOpacity>
            ) : filteredApplications.length > 0 ? (
              <Text className="text-center text-gray-500 py-4">
                Đã hiển thị tất cả đơn ứng tuyển
              </Text>
            ) : null
          }
        />
      )}

      {/* Cover Letter Modal */}
      <CoverLetterModal
        visible={coverLetterModal.visible}
        onClose={() => setCoverLetterModal({ visible: false, content: '', jobTitle: '' })}
        coverLetter={coverLetterModal.content}
        jobTitle={coverLetterModal.jobTitle}
      />
    </SafeAreaView>
  );
};

export default ApplicationsScreen;