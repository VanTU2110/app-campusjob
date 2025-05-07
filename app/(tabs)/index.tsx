import { Feather, Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

// APIs và Types
import { getListPageJob } from '../../service/jobService';
import { GetJobListParams, JobItem } from '../../types/job';

// Components
import JobCard from '../../components/JobCard';
import { useStudent } from '../../contexts/StudentContext';

const JobPage = () => {
  // Navigation
  const router = useRouter();
  
  // States
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalJobs, setTotalJobs] = useState(0);
  const [savedJobs, setSavedJobs] = useState<string[]>([]); // Lưu danh sách uuid của công việc đã lưu
  const [filters, setFilters] = useState<GetJobListParams>({
    pageSize: 10,
    page: 1,
  });
  const [hasMoreData, setHasMoreData] = useState(true);
  
  // Get student data from context
  const { student, loading: studentLoading } = useStudent();
  
  // Refs for search timeout
  const searchTimeout = useRef<NodeJS.Timeout | null>(null);
  
  // Lấy danh sách công việc
  const fetchJobs = async (params: GetJobListParams, isRefresh = false) => {
    try {
      if (isRefresh) {
        setLoading(true);
      }
      
      const response = await getListPageJob(params);
      
      if (response.data) {
        setTotalJobs(response.data.pagination.totalCount);
        
        if (isRefresh || params.page === 1) {
          setJobs(response.data.items);
        } else {
          setJobs(prev => [...prev, ...response.data.items]);
        }
        
        setHasMoreData(params.page < response.data.pagination.totalPage);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách công việc:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Gọi API lần đầu
  useEffect(() => {
    fetchJobs(filters);
  }, []);

  // Xử lý tìm kiếm với debounce
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    
    // Clear previous timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    // Set new timeout
    searchTimeout.current = setTimeout(() => {
      const newFilters = { ...filters, keyword: text, page: 1 };
      setFilters(newFilters);
      fetchJobs(newFilters, true);
    }, 500);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  // Làm mới danh sách
  const onRefresh = () => {
    setRefreshing(true);
    const newFilters = { ...filters, page: 1 };
    setFilters(newFilters);
    fetchJobs(newFilters, true);
  };

  // Tải thêm khi cuộn đến cuối
  const handleLoadMore = () => {
    if (!loading && hasMoreData) {
      const newFilters = { ...filters, page: filters.page + 1 };
      setFilters(newFilters);
      fetchJobs(newFilters);
    }
  };

  // Xử lý lưu công việc
  const handleSaveJob = (job: JobItem) => {
    setSavedJobs(prev => {
      if (prev.includes(job.uuid)) {
        return prev.filter(id => id !== job.uuid);
      } else {
        return [...prev, job.uuid];
      }
    });
    
    // Thực tế sẽ lưu vào AsyncStorage hoặc database local
  };

  // Chuyển đến trang Conversation
  const navigateToConversation = () => {
    router.push('/conversations');
  };

  // Xử lý bộ lọc JobType
  const handleJobTypeFilter = (type: string) => {
    const newFilters = {
      ...filters,
      page: 1,
      jobType: filters.jobType === type ? undefined : type
    };
    setFilters(newFilters);
    fetchJobs(newFilters, true);
  };

  // Xử lý bộ lọc SalaryType
  const handleSalaryTypeFilter = (type: string) => {
    const newFilters = {
      ...filters,
      page: 1,
      salaryType: filters.salaryType === type ? undefined : type
    };
    setFilters(newFilters);
    fetchJobs(newFilters, true);
  };

  // Reset tất cả bộ lọc
  const resetFilters = () => {
    const newFilters = {
      pageSize: 10,
      page: 1,
    };
    setFilters(newFilters);
    setSearchQuery('');
    fetchJobs(newFilters, true);
  };

  // Component hiển thị khi không có dữ liệu
  const EmptyComponent = () => (
    <View className="flex-1 justify-center items-center py-10">
      <Ionicons name="search-outline" size={60} color="#CCCCCC" />
      <Text className="text-center text-gray-500 mt-4">Không tìm thấy công việc</Text>
      <Text className="text-center text-gray-400 mt-1">Hãy thử điều chỉnh tiêu chí tìm kiếm</Text>
      <TouchableOpacity 
        className="mt-6 bg-blue-600 px-6 py-3 rounded-full"
        onPress={resetFilters}
      >
        <Text className="text-white font-medium">Đặt lại bộ lọc</Text>
      </TouchableOpacity>
    </View>
  );

  // Component hiển thị ở footer
  const FooterComponent = () => {
    if (!loading || jobs.length === 0) return null;
    
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#0000ff" />
      </View>
    );
  };

  // Component bộ lọc
  const FilterSection = () => {
    const jobTypes = ["remote", "parttime", "internship", "fulltime"];
    const salaryTypes = ["fixed", "monthly", "daily", "hourly"];
    
    const jobTypeLabels: Record<string, string> = {
      'remote': 'Từ xa',
      'parttime': 'Bán thời gian', 
      'internship': 'Thực tập',
      'fulltime': 'Toàn thời gian'
    };
    
    const salaryTypeLabels: Record<string, string> = {
      'fixed': 'Cố định',
      'monthly': 'Theo tháng',
      'daily': 'Theo ngày',
      'hourly': 'Theo giờ'
    };
    
    return (
      <View className="mb-4">
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="py-2"
        >
          {/* Lọc theo loại công việc */}
          {jobTypes.map((type) => (
            <TouchableOpacity
              key={type}
              className={`mr-2 px-3 py-2 rounded-full ${filters.jobType === type ? 'bg-blue-500' : 'bg-gray-100'}`}
              onPress={() => handleJobTypeFilter(type)}
            >
              <Text 
                className={`text-sm ${filters.jobType === type ? 'text-white' : 'text-gray-700'}`}
              >
                {jobTypeLabels[type] || type}
              </Text>
            </TouchableOpacity>
          ))}
          
          {/* Lọc theo loại lương */}
          {salaryTypes.map((type) => (
            <TouchableOpacity
              key={type}
              className={`mr-2 px-3 py-2 rounded-full ${filters.salaryType === type ? 'bg-green-500' : 'bg-gray-100'}`}
              onPress={() => handleSalaryTypeFilter(type)}
            >
              <Text 
                className={`text-sm ${filters.salaryType === type ? 'text-white' : 'text-gray-700'}`}
              >
                {salaryTypeLabels[type] || type}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-4 pt-2">
        {/* Header với phần chào và nút tin nhắn */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-lg text-gray-700">
              Hello, {studentLoading ? "..." : (student?.data?.fullname || "Friend")}
            </Text>
            <Text className="text-2xl font-bold text-blue-600">Tìm kiếm công việc mơ ước</Text>
          </View>
          <TouchableOpacity 
            className="w-10 h-10 bg-blue-100 rounded-full justify-center items-center"
            onPress={navigateToConversation}
          >
            <Feather name="message-circle" size={22} color="#2563EB" />
          </TouchableOpacity>
        </View>
        
        {/* Thanh tìm kiếm */}
        <View className="flex-row items-center bg-white rounded-xl px-3 py-2 mb-4 shadow-sm border border-gray-100">
          <Feather name="search" size={20} color="#9E9E9E" />
          <TextInput
            className="flex-1 ml-2 text-base text-gray-800"
            placeholder="Tìm kiếm công việc, kỹ năng, công ty..."
            value={searchQuery}
            onChangeText={handleSearch}
            placeholderTextColor="#9E9E9E"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery('');
                handleSearch('');
              }}
            >
              <Feather name="x-circle" size={18} color="#9E9E9E" />
            </TouchableOpacity>
          )}
        </View>
        
        {/* Bộ lọc */}
        <FilterSection />
        
        {/* Hiển thị tổng số */}
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-sm text-gray-600">Tìm thấy {totalJobs} công việc</Text>
          <TouchableOpacity 
            className="flex-row items-center" 
            onPress={() => {
              // Mở modal bộ lọc nâng cao
            }}
          >
            <Text className="text-sm text-blue-600 mr-1">Lọc thêm</Text>
            <Feather name="filter" size={14} color="#2563EB" />
          </TouchableOpacity>
        </View>
        
        {/* Các bộ lọc đang hoạt động */}
        {(filters.jobType || filters.salaryType || searchQuery) && (
          <View className="flex-row flex-wrap mb-2">
            {filters.jobType && (
              <View className="bg-blue-100 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
                <Text className="text-blue-800 text-xs mr-1">
                  {filters.jobType === 'remote' ? 'Từ xa' : 
                   filters.jobType === 'parttime' ? 'Bán thời gian' : 
                   filters.jobType === 'internship' ? 'Thực tập' : 'Toàn thời gian'}
                </Text>
                <TouchableOpacity onPress={() => handleJobTypeFilter(filters.jobType as string)}>
                  <Feather name="x" size={14} color="#2563EB" />
                </TouchableOpacity>
              </View>
            )}
            
            {filters.salaryType && (
              <View className="bg-green-100 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
                <Text className="text-green-800 text-xs mr-1">
                  {filters.salaryType === 'fixed' ? 'Lương cố định' : 
                   filters.salaryType === 'monthly' ? 'Lương theo tháng' : 
                   filters.salaryType === 'daily' ? 'Lương theo ngày' : 'Lương theo giờ'}
                </Text>
                <TouchableOpacity onPress={() => handleSalaryTypeFilter(filters.salaryType as string)}>
                  <Feather name="x" size={14} color="#22C55E" />
                </TouchableOpacity>
              </View>
            )}
            
            {searchQuery && (
              <View className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2 flex-row items-center">
                <Text className="text-gray-800 text-xs mr-1">Tìm: {searchQuery}</Text>
                <TouchableOpacity onPress={() => {
                  setSearchQuery('');
                  handleSearch('');
                }}>
                  <Feather name="x" size={14} color="#4B5563" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        
        {/* Danh sách công việc */}
        {loading && jobs.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <FlatList
            data={jobs}
            keyExtractor={(item) => item.uuid}
            renderItem={({ item }) => (
              <JobCard 
                job={item} 
                savedJobs={savedJobs}
                onSave={handleSaveJob}
              />
            )}
            ListEmptyComponent={EmptyComponent}
            ListFooterComponent={FooterComponent}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

export default JobPage;