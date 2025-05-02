import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import JobCard from '../../components/JobCard';
import { getListPageJob } from '../../service/jobService';
import { GetJobListParams, JobItem } from '../../types/job';


const JobSearchScreen = () => {
  // States for job listing and pagination
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // States for filters
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<number | undefined>(undefined);
  const [jobType, setJobType] = useState<string | undefined>(undefined);
  const [salaryType, setSalaryType] = useState<string | undefined>(undefined);
  const [salaryMin, setSalaryMin] = useState<number | undefined>(undefined);
  const [salaryMax, setSalaryMax] = useState<number | undefined>(undefined);
  const [salaryFixed, setSalaryFixed] = useState<number | undefined>(undefined);
  
  // State for filter modal visibility
  const [showFilters, setShowFilters] = useState(false);
  
  // State to track active filters
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  // Sử dụng context để quản lý công việc đã lưu (nếu có)

  // Job type options
  const jobTypes = [
    { label: 'Tất cả', value: undefined },
    { label: 'Remote', value: 'remote' },
    { label: 'Part-time', value: 'parttime' },
    { label: 'Thực tập', value: 'internship' },
    { label: 'Toàn thời gian', value: 'fulltime' }
  ];

  // Salary type options
  const salaryTypes = [
    { label: 'Tất cả', value: undefined },
    { label: 'Cố định', value: 'fixed' },
    { label: 'Hàng tháng', value: 'monthly' },
    { label: 'Hàng ngày', value: 'daily' },
    { label: 'Theo giờ', value: 'hourly' }
  ];

  // Status options
  const statusOptions = [
    { label: 'Tất cả', value: undefined },
    { label: 'Đang tuyển', value: 1 },
    { label: 'Đã đóng', value: 0 }
  ];

  // Function to fetch jobs
  const fetchJobs = async (page = 1, append = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const params: GetJobListParams = {
        pageSize: 10,
        page,
        keyword,
        status,
        jobType,
        salaryType,
        salaryMin,
        salaryMax,
        salaryFixed
      };

      console.log('Fetching jobs with params:', params);

      const response = await getListPageJob(params);
      
      if (response && response.data) {
        if (append && page > 1) {
          setJobs(prev => [...prev, ...response.data.items]);
        } else {
          setJobs(response.data.items);
        }
        setTotalPages(response.data.pagination.totalPage);
        
        // Update UI with active filters
        updateActiveFiltersLabels();
      } else {
        console.log('No data returned from API');
        setJobs([]);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      Alert.alert(
        'Lỗi',
        'Không thể tải danh sách công việc. Vui lòng thử lại sau.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Update active filters labels for UI display
  const updateActiveFiltersLabels = () => {
    const filters: string[] = [];
    
    if (status !== undefined) {
      const statusLabel = statusOptions.find(option => option.value === status)?.label;
      if (statusLabel && statusLabel !== 'Tất cả') filters.push(`Trạng thái: ${statusLabel}`);
    }
    
    if (jobType) {
      const jobTypeLabel = jobTypes.find(option => option.value === jobType)?.label;
      if (jobTypeLabel && jobTypeLabel !== 'Tất cả') filters.push(`Loại: ${jobTypeLabel}`);
    }
    
    if (salaryType) {
      const salaryTypeLabel = salaryTypes.find(option => option.value === salaryType)?.label;
      if (salaryTypeLabel && salaryTypeLabel !== 'Tất cả') filters.push(`Lương: ${salaryTypeLabel}`);
    }
    
    if (salaryMin !== undefined) filters.push(`Min: ${salaryMin}`);
    if (salaryMax !== undefined) filters.push(`Max: ${salaryMax}`);
    if (salaryFixed !== undefined) filters.push(`Cố định: ${salaryFixed}`);
    
    setActiveFilters(filters);
  };

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, []);

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    fetchJobs(1, false);
    setShowFilters(false);
  };

  // Reset filters
  const resetFilters = () => {
    setKeyword('');
    setStatus(undefined);
    setJobType(undefined);
    setSalaryType(undefined);
    setSalaryMin(undefined);
    setSalaryMax(undefined);
    setSalaryFixed(undefined);
    setActiveFilters([]);
  };

 

  // Load more on end reached
  const handleLoadMore = () => {
    if (!loadingMore && currentPage < totalPages) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchJobs(nextPage, true);
    }
  };

  // Render individual job item
  const renderJobItem = ({ item }: { item: JobItem }) => (
    <JobCard 
      job={item} 
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50 pt-2">
      {/* Search Bar */}
      <View className="px-4 py-3 bg-white shadow-sm">
        <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
        <Feather name="search" size={18} color="#6B7280" />
          <TextInput
            className="flex-1 ml-2 text-gray-800"
            placeholder="Tìm kiếm công việc..."
            placeholderTextColor="#9CA3AF"
            value={keyword}
            onChangeText={setKeyword}
            onSubmitEditing={() => fetchJobs(1)}
          />
          {keyword.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setKeyword('');
                fetchJobs(1);
              }}
            >
              <TouchableOpacity>
          <Feather name="x" size={18} color="#6B7280" />
        </TouchableOpacity>
            </TouchableOpacity>
          )}
        </View>
        
        <View className="flex-row justify-between mt-3">
          <TouchableOpacity 
            className="flex-row items-center bg-gray-100 px-4 py-2 rounded-lg"
            onPress={() => setShowFilters(!showFilters)}
          >
            <Feather name="filter" size={16} color="#4B5563" />
            <Text className="text-gray-700 font-medium ml-1">Bộ lọc</Text>
            {activeFilters.length > 0 && (
              <View className="bg-blue-500 rounded-full w-5 h-5 ml-1 items-center justify-center">
                <Text className="text-white text-xs font-bold">{activeFilters.length}</Text>
              </View>
            )}
          </TouchableOpacity>
          
          {activeFilters.length > 0 && (
            <TouchableOpacity 
              className="bg-gray-100 px-4 py-2 rounded-lg flex-row items-center"
              onPress={() => {
                resetFilters();
                fetchJobs(1);
              }}
            >
              <TouchableOpacity>
          <Feather name="x" size={18} color="#6B7280" />
        </TouchableOpacity>
              <Text className="text-gray-700 font-medium ml-1">Xóa bộ lọc</Text>
            </TouchableOpacity>
          )}
        </View>
        
        {/* Active Filters Display */}
        {activeFilters.length > 0 && (
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="flex-row mt-3"
          >
            {activeFilters.map((filter, index) => (
              <View key={index} className="bg-blue-100 rounded-full px-3 py-1 mr-2">
                <Text className="text-blue-700 text-xs">{filter}</Text>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Filters Modal */}
      {showFilters && (
        <View className="px-4 py-3 bg-white border-t border-gray-200">
          <ScrollView className="max-h-80">
            {/* Job Type Filter */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-1">Loại công việc</Text>
              <View className="border border-gray-300 rounded-lg overflow-hidden">
                <Picker
                  selectedValue={jobType}
                  onValueChange={(itemValue) => setJobType(itemValue)}
                >
                  {jobTypes.map((type, index) => (
                    <Picker.Item key={index} label={type.label} value={type.value} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Status Filter */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-1">Trạng thái</Text>
              <View className="border border-gray-300 rounded-lg overflow-hidden">
                <Picker
                  selectedValue={status}
                  onValueChange={(itemValue) => setStatus(itemValue)}
                >
                  {statusOptions.map((option, index) => (
                    <Picker.Item key={index} label={option.label} value={option.value} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Salary Type Filter */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-1">Loại lương</Text>
              <View className="border border-gray-300 rounded-lg overflow-hidden">
                <Picker
                  selectedValue={salaryType}
                  onValueChange={(itemValue) => setSalaryType(itemValue)}
                >
                  {salaryTypes.map((type, index) => (
                    <Picker.Item key={index} label={type.label} value={type.value} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Salary Range Filters */}
            <View className="mb-4">
              <Text className="text-gray-700 font-medium mb-1">Khoảng lương</Text>
              <View className="flex-row space-x-2">
                <TextInput
                  className="flex-1 h-10 px-3 border border-gray-300 rounded-lg"
                  placeholder="Tối thiểu"
                  keyboardType="numeric"
                  value={salaryMin?.toString() || ''}
                  onChangeText={(text) => setSalaryMin(text ? parseInt(text) : undefined)}
                />
                <TextInput
                  className="flex-1 h-10 px-3 border border-gray-300 rounded-lg"
                  placeholder="Tối đa"
                  keyboardType="numeric"
                  value={salaryMax?.toString() || ''}
                  onChangeText={(text) => setSalaryMax(text ? parseInt(text) : undefined)}
                />
              </View>
            </View>

            {/* Fixed Salary Filter */}
            {salaryType === 'fixed' && (
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-1">Lương cố định</Text>
                <TextInput
                  className="h-10 px-3 border border-gray-300 rounded-lg"
                  placeholder="Nhập lương cố định"
                  keyboardType="numeric"
                  value={salaryFixed?.toString() || ''}
                  onChangeText={(text) => setSalaryFixed(text ? parseInt(text) : undefined)}
                />
              </View>
            )}

            {/* Apply and Cancel Buttons */}
            <View className="flex-row justify-end space-x-2 mt-4">
              <TouchableOpacity 
                className="bg-gray-200 px-4 py-2 rounded-lg"
                onPress={() => setShowFilters(false)}
              >
                <Text className="text-gray-700 font-medium">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-blue-500 px-4 py-2 rounded-lg"
                onPress={applyFilters}
              >
                <Text className="text-white font-medium">Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Job List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : jobs.length > 0 ? (
        <FlatList
          data={jobs}
          renderItem={renderJobItem}
          keyExtractor={(item) => item.uuid}
          className="flex-1"
          contentContainerClassName="p-4"
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() => 
            loadingMore ? (
              <ActivityIndicator size="small" color="#3b82f6" style={{ marginVertical: 20 }} />
            ) : currentPage >= totalPages ? (
              <Text className="text-center text-gray-500 py-4">Đã hiển thị tất cả công việc</Text>
            ) : null
          }
        />
      ) : (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-gray-500 text-lg text-center">Không tìm thấy công việc nào phù hợp với tiêu chí tìm kiếm</Text>
          <TouchableOpacity 
            className="mt-4 bg-blue-500 px-4 py-2 rounded-lg"
            onPress={() => {
              resetFilters();
              fetchJobs(1);
            }}
          >
            <Text className="text-white font-medium">Xóa bộ lọc và tìm lại</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

export default JobSearchScreen;