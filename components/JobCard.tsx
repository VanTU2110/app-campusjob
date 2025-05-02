import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { useJobHistory } from '../contexts/JobHistoryContext'; // Import custom hook để quản lý lịch sử
import { JobItem } from '../types/job';

interface JobCardProps {
  job: JobItem;
  compact?: boolean;
  onSave?: (job: JobItem) => void;
  savedJobs?: string[]; // Danh sách uuid của các công việc đã lưu
}

const JobCard = ({ job, compact = false, onSave, savedJobs = [] }: JobCardProps) => {
  const isSaved = savedJobs.includes(job.uuid);
  const { addToHistory } = useJobHistory(); // Sử dụng custom hook để thêm vào lịch sử
  
  const handlePress = () => {
    // Thêm công việc vào lịch sử xem trước khi chuyển hướng
    addToHistory(job);
    
    // Sau đó chuyển hướng đến trang chi tiết
    router.push({
      pathname: '/jobs/[uuid]',
      params: { uuid: job.uuid }
    });
  };
  
  const toggleSave = (e: any) => {
    e.stopPropagation();
    if (onSave) {
      onSave(job);
    }
  };
  
  // Tính số ngày đã đăng
  const getDaysAgo = (dateString: string) => {
    const postedDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - postedDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hôm nay';
    if (diffDays === 1) return 'Hôm qua';
    return `${diffDays} ngày trước`;
  };

  // Format mức lương
  const formatSalary = () => {
    const formatNumber = (num: number) => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    };

    if (job.salaryType === 'fixed') {
      return `${formatNumber(job.salaryFixed)} ${job.currency}`;
    } else {
      return `${formatNumber(job.salaryMin)}-${formatNumber(job.salaryMax)} ${job.currency}`;
    }
  };
  
  // Định dạng kiểu công việc
  const formatJobType = (jobType: string) => {
    const typeMap: Record<string, string> = {
      'remote': 'Từ xa',
      'parttime': 'Bán thời gian',
      'internship': 'Thực tập',
      'fulltime': 'Toàn thời gian'
    };
    
    return typeMap[jobType] || jobType;
  };
  
  // Lấy lịch làm việc
  const getSchedule = () => {
    if (job.schedule && job.schedule.length > 0) {
      // Chỉ lấy giờ và phút từ startTime và endTime
      const startTime = job.schedule[0].startTime.substring(0, 5);
      const endTime = job.schedule[0].endTime.substring(0, 5);
      
      return `${startTime}-${endTime}`;
    }
    return 'Linh hoạt';
  };
  
  // Component phiên bản nhỏ gọn
  if (compact) {
    return (
      <TouchableOpacity 
        className="flex-row items-center bg-white rounded-xl p-3 mb-3 shadow-sm border border-gray-100"
        onPress={handlePress}
        activeOpacity={0.7}
      >
        {/* Logo công ty */}
        <View className="w-10 h-10 bg-gray-100 rounded-md items-center justify-center mr-3">
          <Text className="text-lg font-bold text-gray-500">
            {job.company.name.charAt(0)}
          </Text>
        </View>
        
        {/* Thông tin chính */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800" numberOfLines={1}>{job.title}</Text>
          <Text className="text-sm text-gray-600" numberOfLines={1}>{job.company.name}</Text>
          
          <View className="flex-row items-center mt-1">
            {/* Loại công việc */}
            <View className="flex-row items-center mr-3">
              <Feather name="map-pin" size={12} color="#9CA3AF" />
              <Text className="text-xs text-gray-500 ml-1">{formatJobType(job.jobType)}</Text>
            </View>
            
            {/* Giờ làm việc */}
            <View className="flex-row items-center">
              <Feather name="clock" size={12} color="#9CA3AF" />
              <Text className="text-xs text-gray-500 ml-1">{getSchedule()}</Text>
            </View>
          </View>
        </View>
        
        {/* Nút lưu */}
        <TouchableOpacity className="p-2" onPress={toggleSave}>
          {isSaved ? (
            <MaterialCommunityIcons name="bookmark-check-outline" size={20} color="#3B82F6" />
          ) : (
            <Feather name="bookmark" size={20} color="#9CA3AF" />
          )}
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }
  
  // Component phiên bản đầy đủ
  return (
    <TouchableOpacity 
      className="bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-100"
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Header với logo và tên */}
      <View className="flex-row items-center mb-3">
        {/* Logo công ty */}
        <View className="w-12 h-12 bg-gray-100 rounded-lg items-center justify-center mr-3">
          <Text className="text-xl font-bold text-gray-500">
            {job.company.name.charAt(0)}
          </Text>
        </View>
        
        {/* Tiêu đề và tên công ty */}
        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-800" numberOfLines={2}>{job.title}</Text>
          <Text className="text-sm text-gray-600">{job.company.name}</Text>
        </View>
        
        {/* Nút lưu */}
        <TouchableOpacity className="p-2" onPress={toggleSave}>
          {isSaved ? (
            <MaterialCommunityIcons name="bookmark-check-outline" size={22} color="#3B82F6" />
          ) : (
            <Feather name="bookmark" size={22} color="#9CA3AF" />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Thông tin chi tiết */}
      <View className="flex-row mb-3">
        {/* Loại công việc */}
        <View className="flex-row items-center mr-4">
          <Feather name="map-pin" size={14} color="#9CA3AF" />
          <Text className="text-sm text-gray-600 ml-1">{formatJobType(job.jobType)}</Text>
        </View>
        
        {/* Giờ làm việc */}
        <View className="flex-row items-center">
          <Feather name="clock" size={14} color="#9CA3AF" />
          <Text className="text-sm text-gray-600 ml-1">{getSchedule()}</Text>
        </View>
      </View>
      
      {/* Kỹ năng và mức lương */}
      <View className="flex-row justify-between items-center">
        {/* Kỹ năng */}
        <View className="flex-row items-center flex-wrap flex-1 mr-2">
          {job.listSkill.slice(0, 2).map((skill) => (
            <View key={skill.uuid} className="bg-gray-100 px-2 py-1 rounded mr-2 mb-1">
              <Text className="text-xs text-gray-600">{skill.skill.name}</Text>
            </View>
          ))}
          {job.listSkill.length > 2 && (
            <Text className="text-xs text-gray-500">+{job.listSkill.length - 2}</Text>
          )}
        </View>
        
        {/* Mức lương */}
        <View className="bg-blue-50 px-3 py-1 rounded">
          <Text className="text-sm font-medium text-blue-600">{formatSalary()}</Text>
        </View>
      </View>
      
      {/* Ngày đăng */}
      <View className="mt-3 pt-3 border-t border-gray-100">
        <Text className="text-xs text-gray-500">Đăng {getDaysAgo(job.created)}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default JobCard;
