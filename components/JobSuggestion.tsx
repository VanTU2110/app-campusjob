import { useStudent } from '@/contexts/StudentContext';
import { getListPageJobBySchedule, getListPageJobBySkill } from '@/service/jobService';
import { JobItem } from '@/types/job';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const CARD_WIDTH = Dimensions.get('window').width * 0.8;
const CARD_SPACING = 12;

export const JobSuggestions = () => {
  const { student } = useStudent();
  const [jobs, setJobs] = useState<JobItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!student) return;

    const fetchJobs = async () => {
      try {
        setLoading(true);
        const pageSize = 20;
        const page = 1;

        const skillPromises = student.data.listSkill?.map(skill =>
          getListPageJobBySkill({
            pageSize,
            page,
            skillUuid: skill.skill.uuid,
          })
        ) || [];

        const schedulePromises = student.data.availabilities?.map(a =>
          getListPageJobBySchedule({
            pageSize,
            page,
            dayofWeek: a.dayOfWeek,
            startTime: a.startTime,
            endTime: a.endTime,
          })
        ) || [];

        const skillResponses = await Promise.all(skillPromises);
        const scheduleResponses = await Promise.all(schedulePromises);

        const skillJobs = skillResponses.flatMap(res => res.data.items);
        const scheduleJobs = scheduleResponses.flatMap(res => res.data.items);

        const skillJobMap = new Map(skillJobs.map(job => [job.uuid, job]));
        const matchedJobs = scheduleJobs.filter(job => skillJobMap.has(job.uuid));

        const uniqueJobs = Array.from(
          new Map(matchedJobs.map(job => [job.uuid, job])).values()
        );

        setJobs(uniqueJobs);
      } catch (error) {
        console.error('Lỗi khi gợi ý việc làm:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [student]);

  const handleSeeAllJobs = () => {
    setExpanded(!expanded);
  };

  const navigateToJobDetail = (job: JobItem) => {
    router.push(`/jobs/${job.uuid}`);
  };

  // Component hiển thị công việc dạng card ngang (horizontal card)
  const JobCardHorizontal = ({ job }: { job: JobItem }) => {
    const matchRate = Math.floor(Math.random() * 21) + 80; // 80-100% match rate for demo

    return (
      <TouchableOpacity 
        className="bg-white mr-3 rounded-xl overflow-hidden shadow-sm border border-gray-100"
        style={{ width: CARD_WIDTH }}
        onPress={() => navigateToJobDetail(job)}
      >
        <View className="p-4">
          {/* Company logo and match rate */}
          <View className="flex-row justify-between items-center mb-3">
            <View className="w-12 h-12 bg-gray-100 rounded-lg justify-center items-center">
             
            </View>
            <View className="bg-blue-50 px-3 py-1 rounded-full">
              <Text className="text-blue-700 font-medium text-sm">{matchRate}% phù hợp</Text>
            </View>
          </View>

          {/* Job title */}
          <Text className="text-lg font-bold text-gray-800 mb-1" numberOfLines={2}>
            {job.title}
          </Text>


          {/* Job info */}
          <View className="flex-row flex-wrap mb-2">
            {job.jobType && (
              <View className="flex-row items-center mr-3 mb-1">
                <Feather name="briefcase" size={14} color="#6B7280" />
                <Text className="text-gray-600 text-xs ml-1">
                  {job.jobType === 'remote' ? 'Từ xa' : 
                   job.jobType === 'parttime' ? 'Bán thời gian' : 
                   job.jobType === 'internship' ? 'Thực tập' : 'Toàn thời gian'}
                </Text>
              </View>
            )}
            
          </View>

          {/* Salary info */}
          {job.salaryMin && job.salaryMax && (
            <View className="flex-row items-center">
              <Feather name="dollar-sign" size={14} color="#10B981" />
              <Text className="text-green-600 font-medium text-sm ml-1">
                {job.salaryMin.toLocaleString('vi-VN')} - {job.salaryMax.toLocaleString('vi-VN')} {job.currency || 'VNĐ'}
                {job.salaryType === 'hourly' ? '/giờ' : 
                 job.salaryType === 'daily' ? '/ngày' : 
                 job.salaryType === 'monthly' ? '/tháng' : ''}
              </Text>
            </View>
          )}

          {/* Skills matched */}
          {student?.data.listSkill && (
            <View className="mt-3 pt-3 border-t border-gray-100">
              <Text className="text-xs text-gray-500 mb-2">Kỹ năng phù hợp:</Text>
              <View className="flex-row flex-wrap">
                {student.data.listSkill.slice(0, 2).map((skillItem, index) => (
                  <View key={index} className="bg-blue-50 rounded-full px-2 py-1 mr-1 mb-1">
                    <Text className="text-xs text-blue-700">
                      {skillItem.skill.name}
                    </Text>
                  </View>
                ))}
                {student.data.listSkill.length > 2 && (
                  <View className="bg-gray-100 rounded-full px-2 py-1 mr-1 mb-1">
                    <Text className="text-xs text-gray-700">
                      +{student.data.listSkill.length - 2}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Component hiển thị khi không có gợi ý
  const EmptyState = () => (
    <View className="py-6 px-4 bg-blue-50 rounded-xl items-center justify-center">
      <MaterialIcons name="work-outline" size={48} color="#3B82F6" />
      <Text className="text-lg font-semibold text-gray-800 mt-3 mb-1 text-center">
        Chưa có gợi ý công việc phù hợp
      </Text>
      <Text className="text-sm text-gray-600 text-center mb-3">
        Cập nhật kỹ năng và lịch trình của bạn để nhận được gợi ý tốt hơn
      </Text>
      <TouchableOpacity 
        className="bg-blue-600 px-5 py-2 rounded-full"
        onPress={() => router.push('/profile')}
      >
        <Text className="text-white font-medium">Cập nhật hồ sơ</Text>
      </TouchableOpacity>
    </View>
  );

  // Nếu không có jobs, không hiển thị component này
  if (jobs.length === 0 && !loading) {
    return (
      <View className="mb-6">
        <EmptyState />
      </View>
    );
  }

  return (
    <View className="mb-6">
      {/* Header với title và nút xem tất cả */}
      <View className="flex-row justify-between items-center mb-3 px-4">
        <View className="flex-row items-center">
          <MaterialIcons name="bolt" size={20} color="#3B82F6" />
          <Text className="text-lg font-bold text-gray-800 ml-1">
            Gợi ý việc làm phù hợp
          </Text>
        </View>
        <TouchableOpacity onPress={handleSeeAllJobs}>
          <Text className="text-blue-600 font-medium">
            {expanded ? 'Thu gọn' : 'Xem tất cả'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading indicator */}
      {loading ? (
        <View className="h-40 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-gray-500 mt-2">Đang tìm việc phù hợp...</Text>
        </View>
      ) : expanded ? (
        // Expanded view - vertical list
        <Animated.View 
          entering={FadeIn} 
          exiting={FadeOut}
          className="px-4"
        >
          {jobs.map((job) => (
            <TouchableOpacity 
              key={job.uuid} 
              className="mb-3"
              onPress={() => navigateToJobDetail(job)}
            >
              <View className="bg-white rounded-xl overflow-hidden border border-gray-100 p-4">
                {/* Company logo and job title */}
                <View className="flex-row mb-2">
                  <View className="w-12 h-12 bg-gray-100 rounded-lg justify-center items-center mr-3">
                
                  </View>
                  <View className="flex-1">
                    <Text className="text-lg font-bold text-gray-800" numberOfLines={2}>
                      {job.title}
                    </Text>
                    
                  </View>
                </View>

                {/* Job details */}
                <View className="flex-row flex-wrap mb-1">
                  {job.jobType && (
                    <View className="flex-row items-center mr-4 mb-1">
                      <Feather name="briefcase" size={14} color="#6B7280" />
                      <Text className="text-gray-600 text-sm ml-1">
                        {job.jobType === 'remote' ? 'Từ xa' : 
                         job.jobType === 'parttime' ? 'Bán thời gian' : 
                         job.jobType === 'internship' ? 'Thực tập' : 'Toàn thời gian'}
                      </Text>
                    </View>
                  )}
                 
                  {job.salaryMin && job.salaryMax && (
                    <View className="flex-row items-center mb-1">
                      <Feather name="dollar-sign" size={14} color="#10B981" />
                      <Text className="text-green-600 font-medium text-sm ml-1">
                        {job.salaryMin.toLocaleString('vi-VN')} - {job.salaryMax.toLocaleString('vi-VN')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>
      ) : (
        // Collapsed view - horizontal scroll
        <FlatList
          data={jobs}
          keyExtractor={(item) => item.uuid}
          renderItem={({ item }) => <JobCardHorizontal job={item} />}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingRight: 4 }}
          snapToInterval={CARD_WIDTH + CARD_SPACING}
          decelerationRate="fast"
        />
      )}
    </View>
  );
};