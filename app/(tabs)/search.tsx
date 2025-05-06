import { Picker } from '@react-native-picker/picker';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Feather from 'react-native-vector-icons/Feather';
import DateTimePicker from '@react-native-community/datetimepicker';
import JobCard from '../../components/JobCard';
import { getListPageJob, getListPageJobBySkill, getListPageJobBySchedule } from '../../service/jobService';
import { getSkillList } from '../../service/skillService';
import { GetJobListParams, JobItem, GetJobBySkillParams, GetJobByScheduleParams, Skill } from '../../types/job';

const JobSearchScreen = () => {
  // States for job listing and pagination
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // States for regular filters
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<number | undefined>(undefined);
  const [jobType, setJobType] = useState<string | undefined>(undefined);
  const [salaryType, setSalaryType] = useState<string | undefined>(undefined);
  const [salaryMin, setSalaryMin] = useState<number | undefined>(undefined);
  const [salaryMax, setSalaryMax] = useState<number | undefined>(undefined);
  const [salaryFixed, setSalaryFixed] = useState<number | undefined>(undefined);
  
  // States for filter modals visibility
  const [showFilters, setShowFilters] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  
  // State to track active filters
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  // State for search type
  const [searchType, setSearchType] = useState<'regular' | 'skill' | 'schedule'>('regular');
  
  // States for skill search
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [skillSearchKeyword, setSkillSearchKeyword] = useState('');
  const [loadingSkills, setLoadingSkills] = useState(false);
  
  // States for schedule search
  const [dayOfWeek, setDayOfWeek] = useState<string>('monday');
  const [startTime, setStartTime] = useState<Date>(new Date());
  const [endTime, setEndTime] = useState<Date>(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

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
  
  // Day of week options
  const daysOfWeek = [
    { label: 'Thứ 2', value: 'monday' },
    { label: 'Thứ 3', value: 'tuesday' },
    { label: 'Thứ 4', value: 'wednesday' },
    { label: 'Thứ 5', value: 'thursday' },
    { label: 'Thứ 6', value: 'friday' },
    { label: 'Thứ 7', value: 'saturday' },
    { label: 'Chủ nhật', value: 'sunday' }
  ];

  // Function to fetch skills
  const fetchSkills = async () => {
    setLoadingSkills(true);
    try {
      const params = {
        pageSize: 100,
        page: 1,
        keyword: skillSearchKeyword
      };
      
      const response = await getSkillList(params);
      
      if (response && response.data && response.data.items) {
        setSkills(response.data.items);
      } else {
        setSkills([]);
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      Alert.alert(
        'Lỗi',
        'Không thể tải danh sách kỹ năng. Vui lòng thử lại sau.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoadingSkills(false);
    }
  };

  // Format time for display and API
  const formatTimeForDisplay = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatTimeForAPI = (date: Date): string => {
    return date.toTimeString().split(' ')[0];
  };

  // Function to fetch jobs based on search type
  const fetchJobs = async (page = 1, append = false) => {
    if (page === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      let response;
      
      if (searchType === 'skill' && selectedSkill) {
        const params: GetJobBySkillParams = {
          pageSize: 10,
          page,
          skillUuid: selectedSkill.uuid
        };
        
        response = await getListPageJobBySkill(params);
      } else if (searchType === 'schedule') {
        const params: GetJobByScheduleParams = {
          pageSize: 10,
          page,
          dayofWeek: dayOfWeek,
          startTime: formatTimeForAPI(startTime),
          endTime: formatTimeForAPI(endTime)
        };
        
        response = await getListPageJobBySchedule(params);
      } else {
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
        
        response = await getListPageJob(params);
      }
      
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
    
    if (searchType === 'skill' && selectedSkill) {
      filters.push(`Kỹ năng: ${selectedSkill.name}`);
    } else if (searchType === 'schedule') {
      const dayLabel = daysOfWeek.find(day => day.value === dayOfWeek)?.label;
      filters.push(`Lịch: ${dayLabel} (${formatTimeForDisplay(startTime)} - ${formatTimeForDisplay(endTime)})`);
    } else {
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
    }
    
    setActiveFilters(filters);
  };

  // Initial fetch
  useEffect(() => {
    fetchJobs();
  }, []);

  // Fetch skills when skill modal is opened
  useEffect(() => {
    if (showSkillModal) {
      fetchSkills();
    }
  }, [showSkillModal, skillSearchKeyword]);

  // Apply filters
  const applyFilters = () => {
    setCurrentPage(1);
    fetchJobs(1, false);
    setShowFilters(false);
  };

  // Apply skill filter
  const applySkillFilter = () => {
    if (selectedSkill) {
      setSearchType('skill');
      setCurrentPage(1);
      fetchJobs(1, false);
      setShowSkillModal(false);
    } else {
      Alert.alert('Thông báo', 'Vui lòng chọn một kỹ năng');
    }
  };

  // Apply schedule filter
  const applyScheduleFilter = () => {
    setSearchType('schedule');
    setCurrentPage(1);
    fetchJobs(1, false);
    setShowScheduleModal(false);
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
    setSelectedSkill(null);
    setDayOfWeek('monday');
    setStartTime(new Date());
    setEndTime(new Date());
    setSearchType('regular');
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

  // Render skill item
  const renderSkillItem = ({ item }: { item: Skill }) => (
    <TouchableOpacity 
      className={`p-3 border-b border-gray-200 ${selectedSkill?.uuid === item.uuid ? 'bg-blue-50' : ''}`}
      onPress={() => setSelectedSkill(item)}
    >
      <Text className={`${selectedSkill?.uuid === item.uuid ? 'text-blue-600 font-medium' : 'text-gray-800'}`}>
        {item.name}
      </Text>
    </TouchableOpacity>
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
            onSubmitEditing={() => {
              setSearchType('regular');
              fetchJobs(1);
            }}
          />
          {keyword.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setKeyword('');
                if (searchType === 'regular') {
                  fetchJobs(1);
                }
              }}
            >
              <Feather name="x" size={18} color="#6B7280" />
            </TouchableOpacity>
          )}
        </View>
        
        <View className="flex-row justify-between mt-3">
          <View className="flex-row space-x-2">
            <TouchableOpacity 
              className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg"
              onPress={() => setShowFilters(!showFilters)}
            >
              <Feather name="filter" size={16} color="#4B5563" />
              <Text className="text-gray-700 font-medium ml-1">Lọc</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg"
              onPress={() => setShowSkillModal(true)}
            >
              <Feather name="briefcase" size={16} color="#4B5563" />
              <Text className="text-gray-700 font-medium ml-1">Kỹ năng</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="flex-row items-center bg-gray-100 px-3 py-2 rounded-lg"
              onPress={() => setShowScheduleModal(true)}
            >
              <Feather name="calendar" size={16} color="#4B5563" />
              <Text className="text-gray-700 font-medium ml-1">Lịch</Text>
            </TouchableOpacity>
          </View>
          
          {activeFilters.length > 0 && (
            <TouchableOpacity 
              className="bg-gray-100 px-3 py-2 rounded-lg flex-row items-center"
              onPress={() => {
                resetFilters();
                setSearchType('regular');
                fetchJobs(1);
              }}
            >
              <Feather name="x" size={16} color="#6B7280" />
              <Text className="text-gray-700 font-medium ml-1">Xóa</Text>
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

      {/* Regular Filters Modal */}
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
                onPress={() => {
                  setSearchType('regular');
                  applyFilters();
                }}
              >
                <Text className="text-white font-medium">Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Skill Filter Modal */}
      <Modal
        visible={showSkillModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSkillModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-xl h-3/4">
            <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
              <Text className="text-lg font-bold text-gray-800">Tìm kiếm theo kỹ năng</Text>
              <TouchableOpacity onPress={() => setShowSkillModal(false)}>
                <Feather name="x" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>
            
            <View className="p-4">
              <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2 mb-4">
                <Feather name="search" size={18} color="#6B7280" />
                <TextInput
                  className="flex-1 ml-2 text-gray-800"
                  placeholder="Tìm kiếm kỹ năng..."
                  placeholderTextColor="#9CA3AF"
                  value={skillSearchKeyword}
                  onChangeText={setSkillSearchKeyword}
                  onSubmitEditing={fetchSkills}
                />
                {skillSearchKeyword.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => {
                      setSkillSearchKeyword('');
                      fetchSkills();
                    }}
                  >
                    <Feather name="x" size={18} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
              
              {loadingSkills ? (
                <ActivityIndicator size="large" color="#3b82f6" />
              ) : (
                <FlatList
                  data={skills}
                  renderItem={renderSkillItem}
                  keyExtractor={(item) => item.uuid}
                  className="max-h-96"
                  ListEmptyComponent={() => (
                    <Text className="text-center text-gray-500 py-4">Không tìm thấy kỹ năng nào</Text>
                  )}
                />
              )}
            </View>
            
            <View className="p-4 border-t border-gray-200 flex-row justify-end space-x-3">
              <TouchableOpacity 
                className="bg-gray-200 px-4 py-2 rounded-lg"
                onPress={() => {
                  setSelectedSkill(null);
                  setShowSkillModal(false);
                }}
              >
                <Text className="text-gray-700 font-medium">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-blue-500 px-4 py-2 rounded-lg"
                onPress={applySkillFilter}
              >
                <Text className="text-white font-medium">Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Schedule Filter Modal */}
      <Modal
        visible={showScheduleModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowScheduleModal(false)}
      >
        <View className="flex-1 bg-black bg-opacity-50 justify-end">
          <View className="bg-white rounded-t-xl">
            <View className="p-4 border-b border-gray-200 flex-row justify-between items-center">
              <Text className="text-lg font-bold text-gray-800">Tìm kiếm theo lịch làm việc</Text>
              <TouchableOpacity onPress={() => setShowScheduleModal(false)}>
                <Feather name="x" size={24} color="#4B5563" />
              </TouchableOpacity>
            </View>
            
            <View className="p-4">
              {/* Day of Week Selection */}
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-1">Ngày trong tuần</Text>
                <View className="border border-gray-300 rounded-lg overflow-hidden">
                  <Picker
                    selectedValue={dayOfWeek}
                    onValueChange={(itemValue) => setDayOfWeek(itemValue)}
                  >
                    {daysOfWeek.map((day, index) => (
                      <Picker.Item key={index} label={day.label} value={day.value} />
                    ))}
                  </Picker>
                </View>
              </View>
              
              {/* Time Range Selection */}
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-1">Giờ bắt đầu</Text>
                <TouchableOpacity 
                  className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
                  onPress={() => setShowStartTimePicker(true)}
                >
                  <Text className="text-gray-800">{formatTimeForDisplay(startTime)}</Text>
                  <Feather name="clock" size={18} color="#6B7280" />
                </TouchableOpacity>
                
                {showStartTimePicker && (
                  <DateTimePicker
                    value={startTime}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowStartTimePicker(false);
                      if (selectedDate) {
                        setStartTime(selectedDate);
                      }
                    }}
                  />
                )}
              </View>
              
              <View className="mb-4">
                <Text className="text-gray-700 font-medium mb-1">Giờ kết thúc</Text>
                <TouchableOpacity 
                  className="border border-gray-300 rounded-lg p-3 flex-row justify-between items-center"
                  onPress={() => setShowEndTimePicker(true)}
                >
                  <Text className="text-gray-800">{formatTimeForDisplay(endTime)}</Text>
                  <Feather name="clock" size={18} color="#6B7280" />
                </TouchableOpacity>
                
                {showEndTimePicker && (
                  <DateTimePicker
                    value={endTime}
                    mode="time"
                    is24Hour={true}
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowEndTimePicker(false);
                      if (selectedDate) {
                        setEndTime(selectedDate);
                      }
                    }}
                  />
                )}
              </View>
            </View>
            
            <View className="p-4 border-t border-gray-200 flex-row justify-end space-x-3">
              <TouchableOpacity 
                className="bg-gray-200 px-4 py-2 rounded-lg"
                onPress={() => setShowScheduleModal(false)}
              >
                <Text className="text-gray-700 font-medium">Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                className="bg-blue-500 px-4 py-2 rounded-lg"
                onPress={applyScheduleFilter}
              >
                <Text className="text-white font-medium">Áp dụng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
              setSearchType('regular');
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