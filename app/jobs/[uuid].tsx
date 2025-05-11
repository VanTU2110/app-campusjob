import { useStudent } from '@/contexts/StudentContext';
import { applyJob } from '@/service/applyService';
import { FontAwesome5, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  RefreshControl,
  Share,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import JobSuggestion from '../../components/JobSuggestion';
import { detailJob, getListPageJob } from '../../service/jobService';
import { ApplyJob } from '../../types/apply';
import { JobDetailResponse, JobItem, JobListResponse } from '../../types/job';

const JobDetail = () => {
  const { uuid } = useLocalSearchParams();
  const router = useRouter();
  const [job, setJob] = useState<JobItem | null>(null);
  const [similarJobs, setSimilarJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const scrollY = new Animated.Value(0);
  
  // Apply Job Modal States
  const [modalVisible, setModalVisible] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applyLoading, setApplyLoading] = useState(false);
  const [isAlreadyApplied, setIsAlreadyApplied] = useState(false);
  
  // Get student data from context
  const { student, loading: studentLoading } = useStudent();

  // Check if student has already applied for this job
  useEffect(() => {
    const checkIfAlreadyApplied = async (jobUuid: string) => {
      try {
        // You would implement a service function to check application status
        // For now using AsyncStorage as an example
        const appliedJobs = await AsyncStorage.getItem('appliedJobs');
        if (appliedJobs) {
          const jobList = JSON.parse(appliedJobs);
          if (jobList.includes(jobUuid)) {
            setIsAlreadyApplied(true);
          }
        }
      } catch (error) {
        console.error('Error checking application status:', error);
      }
    };
    
    if (uuid && typeof uuid === 'string') {
      checkIfAlreadyApplied(uuid as string);
    }
  }, [uuid]);

  const fetchJobDetails = useCallback(async () => {
    try {
      if (!uuid || typeof uuid !== 'string') {
        throw new Error('Invalid job UUID');
      }
      
      setLoading(true);
      // Fetch job details
      const response: JobDetailResponse = await detailJob(uuid);
      if (response.data) {
        setJob(response.data);
        
        // Check if already applied for this job
        checkIfAlreadyApplied(response.data.uuid);
        
        // Fetch similar jobs based on skills or job type
        if (response.data.listSkill && response.data.listSkill.length > 0) {
          const skillNames = response.data.listSkill.map(js => js.skill.name).join(' ');
          
          const similarJobsResponse: JobListResponse = await getListPageJob({
            page: 1,
            pageSize: 5,
            keyword: skillNames,
            jobType: response.data.jobType
          });
          
          if (similarJobsResponse.data && similarJobsResponse.data.items) {
            setSimilarJobs(similarJobsResponse.data.items.filter(item => item.uuid !== uuid));
          }
        }
      } else {
        throw new Error('Không tìm thấy thông tin công việc');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải thông tin công việc');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [uuid]);
  
  const checkIfAlreadyApplied = async (jobUuid: string) => {
    try {
      const appliedJobs = await AsyncStorage.getItem('appliedJobs');
      if (appliedJobs) {
        const jobList = JSON.parse(appliedJobs);
        if (jobList.includes(jobUuid)) {
          setIsAlreadyApplied(true);
        }
      }
    } catch (error) {
      console.error('Error checking application status:', error);
    }
  };
  
  useEffect(() => {
    fetchJobDetails();
  }, [fetchJobDetails]);
  
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchJobDetails();
  }, [fetchJobDetails]);

  // Handle Apply Job functionality
  const handleApplyPress = () => {
    if (!student) {
      // If not logged in, redirect to login
      Alert.alert(
        "Đăng nhập để ứng tuyển",
        "Bạn cần đăng nhập trước khi ứng tuyển công việc này.",
        [
          { text: "Hủy", style: "cancel" },
          { text: "Đăng nhập", onPress: () => router.push('/auth/login') }
        ]
      );
      return;
    }
    
    if (isAlreadyApplied) {
      Alert.alert(
        "Đã ứng tuyển",
        "Bạn đã ứng tuyển vào vị trí này. Vui lòng chờ phản hồi từ nhà tuyển dụng.",
        [{ text: "Đóng", style: "cancel" }]
      );
      return;
    }
    
    // Show application modal
    setModalVisible(true);
  };
  
  // Submit job application
  const handleSubmitApplication = async () => {
    if (!job || !student || !student.data) return;
    
    // Validate input
    if (!coverLetter.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập thư xin việc");
      return;
    }
    
    try {
      setApplyLoading(true);
      
      const applyData: ApplyJob = {
        studentUuid: student.data.uuid, // Use studentUuid from context
        jobUuid: job.uuid,
        coverLetter: coverLetter
      };
      
      const response = await applyJob(applyData);
      
      // Mark job as applied in local storage
      try {
        const appliedJobs = await AsyncStorage.getItem('appliedJobs');
        const jobList = appliedJobs ? JSON.parse(appliedJobs) : [];
        jobList.push(job.uuid);
        await AsyncStorage.setItem('appliedJobs', JSON.stringify(jobList));
      } catch (error) {
        console.error('Error saving applied job status:', error);
      }
      
      setIsAlreadyApplied(true);
      setModalVisible(false);
      setCoverLetter('');
      
      // Show success message
      Alert.alert(
        "Ứng tuyển thành công",
        "Đơn ứng tuyển của bạn đã được gửi đi. Nhà tuyển dụng sẽ sớm liên hệ với bạn.",
        [{ text: "Đóng", style: "default" }]
      );
      
    } catch (error) {
      console.error('Error applying for job:', error);
      Alert.alert(
        "Lỗi ứng tuyển",
        "Có lỗi xảy ra khi gửi đơn ứng tuyển. Vui lòng thử lại sau.",
        [{ text: "Đóng", style: "cancel" }]
      );
    } finally {
      setApplyLoading(false);
    }
  };
  
  const handleSaveJob = () => {
    setIsSaved(!isSaved);
    // Hiệu ứng phản hồi khi người dùng lưu công việc
    // Implement actual save logic here
  };
  
  const handleShareJob = async () => {
    if (job) {
      try {
        await Share.share({
          message: `Xem công việc "${job.title}" tại ${job.company.name}: https://yourapp.com/jobs/${job.uuid}`,
          title: `Công việc ${job.title} tại ${job.company.name}`,
        });
      } catch (error) {
        console.error('Error sharing job:', error);
      }
    }
  };

  const handleContactCompany = () => {
    if (job && job.company.email) {
      Linking.openURL(`mailto:${job.company.email}?subject=Ứng tuyển: ${job.title}`);
    }
  };

  // Format salary based on type
  const formatSalary = (job: JobItem) => {
    const { salaryType, salaryMin, salaryMax, salaryFixed, currency } = job;
    
    if (salaryType === 'fixed' && salaryFixed) {
      return `${salaryFixed.toLocaleString()} ${currency}`;
    } else if (salaryType === 'monthly' || salaryType === 'daily' || salaryType === 'hourly') {
      if (salaryMin && salaryMax) {
        return `${salaryMin.toLocaleString()} - ${salaryMax.toLocaleString()} ${currency}/${salaryType === 'monthly' ? 'tháng' : salaryType === 'daily' ? 'ngày' : 'giờ'}`;
      } else if (salaryMin) {
        return `Từ ${salaryMin.toLocaleString()} ${currency}/${salaryType === 'monthly' ? 'tháng' : salaryType === 'daily' ? 'ngày' : 'giờ'}`;
      } else if (salaryMax) {
        return `Đến ${salaryMax.toLocaleString()} ${currency}/${salaryType === 'monthly' ? 'tháng' : salaryType === 'daily' ? 'ngày' : 'giờ'}`;
      }
    }
    return 'Thỏa thuận';
  };

  // Format job type with nicer icons and labels
  const formatJobType = (type: string) => {
    switch (type) {
      case 'remote':
        return { label: 'Từ xa', icon: 'laptop-house' };
      case 'onsite':
        return { label: 'Tại văn phòng', icon: 'building' };
      case 'hybrid':
        return { label: 'Kết hợp', icon: 'building-user' };
      case 'parttime':
        return { label: 'Bán thời gian', icon: 'user-clock' };
      case 'fulltime':
        return { label: 'Toàn thời gian', icon: 'business-time' };
      case 'internship':
        return { label: 'Thực tập', icon: 'user-graduate' };
      case 'contract':
        return { label: 'Hợp đồng', icon: 'file-contract' };
      default:
        return { label: type, icon: 'briefcase' };
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) {
      return `${diffDays} ngày trước`;
    }
    return date.toLocaleDateString('vi-VN');
  };

  // Calculate experience level
  const getExperienceLevel = (job: JobItem) => {
    if (!job.experienceYears) return 'Không yêu cầu kinh nghiệm';
    if (job.experienceYears < 1) return 'Mới đi làm';
    if (job.experienceYears < 3) return 'Kinh nghiệm ít';
    if (job.experienceYears < 5) return 'Kinh nghiệm trung bình';
    return 'Nhiều kinh nghiệm';
  };

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp'
  });
  
  if (loading && !refreshing) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="mt-3 text-base text-gray-600">Đang tải thông tin công việc...</Text>
      </View>
    );
  }
  
  // Check if job data is not available or error is present
  if (!job || error) {
    return (
      <View className="flex-1 justify-center items-center p-5 bg-gray-50">
        <Ionicons name="alert-circle-outline" size={60} color="#ef4444" />
        <Text className="text-lg text-red-600 my-5 text-center">{error || 'Không tìm thấy công việc'}</Text>
        <TouchableOpacity 
          className="py-3 px-6 bg-blue-500 rounded-lg"
          onPress={() => router.back()}
        >
          <Text className="text-white text-base font-semibold">Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  const formattedJobType = formatJobType(job.jobType);
  
  return (
    <>
      <StatusBar style="light" />
      <Stack.Screen 
        options={{
          headerStyle: {
            backgroundColor: '#3b82f6',
          },
          headerTintColor: '#fff',
          headerTitle: props => (
            <Animated.View style={{ opacity: headerOpacity }}>
              <Text className="text-white font-semibold text-lg">{job.title}</Text>
            </Animated.View>
          ),
          headerRight: () => (
            <View className="flex-row">
              <TouchableOpacity 
                className="p-2 ml-1 rounded-full" 
                onPress={handleSaveJob}
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                <Ionicons 
                  name={isSaved ? "bookmark" : "bookmark-outline"} 
                  size={22} 
                  color="#ffffff"
                />
              </TouchableOpacity>
              <TouchableOpacity 
                className="p-2 ml-1 rounded-full" 
                onPress={handleShareJob}
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)' }}
              >
                <Ionicons name="share-outline" size={22} color="#ffffff" />
              </TouchableOpacity>
            </View>
          ),
        }}
      />
      
      <Animated.ScrollView 
        className="flex-1 bg-gray-100"
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#3b82f6']}
            tintColor="#3b82f6"
          />
        }
      >
        {/* Hero section with gradient background */}
        <View className="bg-blue-600 pt-4 pb-10 shadow-lg">
          <View className="px-5">
            {/* Company logo circle with border */}
            <View className="w-20 h-20 rounded-full bg-white shadow justify-center items-center mb-4 self-center border-2 border-blue-100">
              {job.company.logo ? (
                <Image 
                  source={{ uri: job.company.logo }} 
                  className="w-full h-full rounded-full"
                  resizeMode="cover"
                />
              ) : (
                <Text className="text-3xl font-bold text-blue-600">{job.company.name.charAt(0)}</Text>
              )}
            </View>
            
            <Text className="text-2xl font-bold text-center text-white mb-2">{job.title}</Text>
            <Text className="text-base text-blue-100 text-center mb-6">{job.company.name}</Text>
            
            {/* Chips section with key info */}
            <View className="flex-row flex-wrap justify-center mb-4">
              <View className="bg-blue-100 rounded-full py-1.5 px-4 m-1 flex-row items-center">
                <FontAwesome5 name={formattedJobType.icon} size={14} color="#3b82f6" />
                <Text className="ml-2 text-sm text-blue-700 font-medium">{formattedJobType.label}</Text>
              </View>
              
              <View className="bg-blue-100 rounded-full py-1.5 px-4 m-1 flex-row items-center">
                <Ionicons name="location-outline" size={16} color="#3b82f6" />
                <Text className="ml-1 text-sm text-blue-700 font-medium">{job.location || 'Flexible'}</Text>
              </View>
              
              {job.experienceYears !== undefined && (
                <View className="bg-blue-100 rounded-full py-1.5 px-4 m-1 flex-row items-center">
                  <MaterialCommunityIcons name="account-clock-outline" size={16} color="#3b82f6" />
                  <Text className="ml-1 text-sm text-blue-700 font-medium">
                    {job.experienceYears} năm
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>
        
        {/* SALARY BANNER - Rõ ràng và nổi bật hơn */}
        <View className="mx-4 -mt-6 mb-4">
          <View className="bg-yellow-500 rounded-xl shadow-lg overflow-hidden border-2 border-yellow-400">
            <View className="bg-gradient-to-r from-green-500 to-green-700 py-4 px-5">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center">
                  <Ionicons name="cash-outline" size={28} color="#ffffff" />
                  <Text className="text-lg text-white font-bold ml-2">MỨC LƯƠNG</Text>
                </View>
                
                <TouchableOpacity 
                  className="bg-white bg-opacity-20 rounded-full p-1"
                  onPress={() => {
                    // Thêm hành động khi click vào biểu tượng info
                    // Ví dụ: hiển thị modal giải thích về lương
                  }}
                >
                  <Ionicons name="information-circle-outline" size={20} color="#ffffff" />
                </TouchableOpacity>
              </View>
              
              <Text className="text-2xl font-extrabold text-white mt-2 text-center">
                {formatSalary(job)}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Job meta info card */}
        <View className="mx-4 mb-4 bg-white rounded-xl shadow-sm overflow-hidden">
          <View className="p-4">
            <View className="flex-row justify-between items-center mb-3">
              <View className="flex-row items-center">
                <Ionicons name="time-outline" size={20} color="#3b82f6" />
                <Text className="ml-2 text-base text-gray-700">Đăng ngày: {formatDate(job.created)}</Text>
              </View>
              
              <TouchableOpacity 
                onPress={handleContactCompany}
                className="flex-row items-center bg-blue-50 py-1 px-3 rounded-full"
              >
                <Ionicons name="mail-outline" size={16} color="#3b82f6" />
                <Text className="ml-1 text-sm text-blue-600">Liên hệ</Text>
              </TouchableOpacity>
            </View>
            
            {job.deadline && (
              <View className="flex-row items-center">
                <Ionicons name="calendar-outline" size={20} color={new Date(job.deadline) < new Date() ? "#ef4444" : "#3b82f6"} />
                <Text className={`ml-2 text-base ${new Date(job.deadline) < new Date() ? "text-red-600" : "text-gray-700"}`}>
                  Hạn nộp: {formatDate(job.deadline)}
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Job skills */}
        {job.listSkill && job.listSkill.length > 0 && (
          <View className="mx-4 mb-4 bg-white rounded-xl shadow-sm">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-lg font-bold mb-3 text-gray-800">Kỹ năng yêu cầu</Text>
            </View>
            <View className="p-4">
              <View className="flex-row flex-wrap">
                {job.listSkill.map((jobSkill) => (
                  <View key={jobSkill.uuid} className="bg-blue-50 px-3 py-1.5 rounded-full mr-2 mb-2 border border-blue-100">
                    <Text className="text-blue-700 font-medium">{jobSkill.skill.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
        
        {/* Job description with styled content */}
        <View className="mx-4 mb-4 bg-white rounded-xl shadow-sm overflow-hidden">
          <View className="p-4 border-b border-gray-200">
            <Text className="text-lg font-bold text-gray-800">Mô tả công việc</Text>
          </View>
          <View className="p-4">
            <Text className="text-base leading-6 text-gray-700">{job.description}</Text>
          </View>
        </View>
        
        {/* Job requirements with styled content */}
        {job.requirements && (
          <View className="mx-4 mb-4 bg-white rounded-xl shadow-sm overflow-hidden">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-800">Yêu cầu ứng viên</Text>
            </View>
            <View className="p-4">
              <Text className="text-base leading-6 text-gray-700">{job.requirements}</Text>
            </View>
          </View>
        )}
        
        {/* Job schedule with styled content */}
        {job.schedule && job.schedule.length > 0 && (
          <View className="mx-4 mb-4 bg-white rounded-xl shadow-sm overflow-hidden">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-800">Lịch làm việc</Text>
            </View>
            <View className="p-4">
              {job.schedule.map((schedule, index) => {
                // Translate day of week to Vietnamese
                const dayTranslation: {[key: string]: string} = {
                  'Monday': 'Thứ Hai',
                  'Tuesday': 'Thứ Ba',
                  'Wednesday': 'Thứ Tư',
                  'Thursday': 'Thứ Năm',
                  'Friday': 'Thứ Sáu',
                  'Saturday': 'Thứ Bảy',
                  'Sunday': 'Chủ Nhật'
                };
                const day = dayTranslation[schedule.dayOfWeek] || schedule.dayOfWeek;
                
                return (
                  <View key={schedule.uuid || index} className="flex-row mb-3 items-center">
                    <View className="w-9 h-9 rounded-full bg-blue-100 justify-center items-center mr-3">
                      <Ionicons name="calendar-outline" size={20} color="#3b82f6" />
                    </View>
                    <View>
                      <Text className="text-base font-semibold text-gray-800">{day}</Text>
                      <Text className="text-sm text-gray-600">
                        {schedule.startTime.substring(0, 5)} - {schedule.endTime.substring(0, 5)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}
        
        {/* Additional benefits if available */}
        {job.benefits && (
          <View className="mx-4 mb-4 bg-white rounded-xl shadow-sm overflow-hidden">
            <View className="p-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-800">Phúc lợi</Text>
            </View>
            <View className="p-4">
              <Text className="text-base leading-6 text-gray-700">{job.benefits}</Text>
            </View>
          </View>
        )}
        
        {/* Company info card */}
        {/* Company info card */}
        <TouchableOpacity 
          className="mx-4 mb-4 bg-white rounded-xl shadow-sm overflow-hidden"
          onPress={() => router.push({
            pathname:'/company/[uuid]',
            params: { uuid: job.company.uuid }
          })}
        >
          <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
            <Text className="text-lg font-bold text-gray-800">Thông tin công ty</Text>
            <Ionicons name="chevron-forward" size={20} color="#64748b" />
          </View>
          <View className="p-4">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 rounded-full bg-gray-200 justify-center items-center mr-3">
                {job.company.logo ? (
                  <Image 
                    source={{ uri: job.company.logo }} 
                    className="w-full h-full rounded-full"
                    resizeMode="cover"
                  />
                ) : (
                  <Text className="text-xl font-bold text-gray-500">{job.company.name.charAt(0)}</Text>
                )}
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-800">{job.company.name}</Text>
                {job.company.industry && (
                  <Text className="text-sm text-gray-600">{job.company.industry}</Text>
                )}
              </View>
            </View>
            
            {job.company.description && (
              <Text className="text-base text-gray-700 mb-4" numberOfLines={2} ellipsizeMode="tail">
                {job.company.description}
              </Text>
            )}
            
            <View className="flex-row items-center mt-2">
              <View className="h-10 w-10 rounded-full bg-blue-50 items-center justify-center mr-2">
                <Ionicons name="business-outline" size={20} color="#3b82f6" />
              </View>
              <Text className="text-blue-600 font-medium">Xem chi tiết về công ty</Text>
            </View>
          </View>
        </TouchableOpacity>
        
        {/* Similar jobs */}
        {similarJobs.length > 0 && (
          <View className="mb-24">
            <JobSuggestion 
              jobs={similarJobs} 
              currentJobId={job.uuid} 
              title="Công việc tương tự"
            />
          </View>
        )}
        
        {/* Spacer for floating action button */}
        <View className="h-20" />
      </Animated.ScrollView>
      
      {/* Application Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end"
        >
          <View className="bg-black bg-opacity-50 flex-1 justify-end">
            <View className="bg-white rounded-t-3xl p-5 max-h-4/5">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-gray-800">Ứng tuyển vị trí</Text>
                <TouchableOpacity onPress={() => setModalVisible(false)}>
                  <Ionicons name="close-outline" size={28} color="#64748b" />
                </TouchableOpacity>
              </View>
              
              <View className="py-2">
                <Text className="text-lg font-bold text-gray-800 mb-1">{job.title}</Text>
                <Text className="text-base text-gray-600">{job.company.name}</Text>
              </View>
              
              <View className="mt-4 mb-3">
                <Text className="text-base font-semibold text-gray-700 mb-2">Thư xin việc</Text>
                <TextInput
                  className="bg-gray-50 border border-gray-300 text-gray-700 rounded-lg p-4 min-h-24"
                  multiline
                  placeholder="Giới thiệu về bản thân và nêu lý do bạn phù hợp với vị trí này..."
                  value={coverLetter}
                  onChangeText={setCoverLetter}
                  style={{ textAlignVertical: 'top' }}
                />
              </View>
              
              <View className="mt-2 mb-5">
                <Text className="text-sm text-gray-500 italic mb-3">
                  Thư xin việc là cơ hội để bạn thể hiện bản thân và giải thích lý do bạn là ứng viên phù hợp.
                </Text>
                <Text className="text-sm text-gray-500 italic">
                  • Mô tả kinh nghiệm liên quan đến vị trí công việc{'\n'}
                  • Nêu rõ kỹ năng phù hợp với yêu cầu công việc{'\n'}
                  • Thể hiện sự hiểu biết về công ty và nhiệm vụ
                </Text>
              </View>
              
              <View className="flex-row gap-3">
                <TouchableOpacity 
                  className="flex-1 py-3 rounded-xl bg-gray-200"
                  onPress={() => setModalVisible(false)}
                >
                  <Text className="text-gray-700 text-center font-semibold">Hủy</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  className="flex-1 py-3 rounded-xl bg-blue-600 flex-row justify-center items-center"
                  onPress={handleSubmitApplication}
                  disabled={applyLoading}
                >
                  {applyLoading ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <>
                      <Ionicons name="paper-plane" size={18} color="#fff" />
                      <Text className="text-white text-center font-semibold ml-2">Gửi đơn</Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
      
      {/* Floating apply button */}
      <View className="absolute bottom-0 left-0 right-0 bg-white py-3 px-4 shadow-lg border-t border-gray-200">
        <TouchableOpacity 
          className={`py-3 rounded-xl flex-row justify-center items-center ${isAlreadyApplied ? 'bg-green-600' : 'bg-blue-600'}`}
          onPress={handleApplyPress}
        >
          {isAlreadyApplied ? (
            <>
              <Ionicons name="checkmark-circle" size={18} color="#fff" />
              <Text className="text-white text-center text-lg font-semibold ml-2">Đã ứng tuyển</Text>
            </>
          ) : (
            <>
              <Ionicons name="paper-plane" size={18} color="#fff" />
              <Text className="text-white text-center text-lg font-semibold ml-2">Ứng tuyển ngay</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </>
  );
};
export default JobDetail;