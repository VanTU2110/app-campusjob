import React from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { JobItem } from '../types/job';

interface JobSuggestionProps {
  jobs: JobItem[];
  currentJobId?: string;
  title?: string;
}

const JobSuggestion: React.FC<JobSuggestionProps> = ({ 
  jobs, 
  currentJobId,
  title = "Công việc tương tự" 
}) => {
  const router = useRouter();
  
  // Filter out current job if we're showing suggestions on a detail page
  const filteredJobs = currentJobId 
    ? jobs.filter(job => job.uuid !== currentJobId)
    : jobs;
  
  // Limit to 5 suggestions
  const suggestedJobs = filteredJobs.slice(0, 5);
  
  const handleJobPress = (uuid: string) => {
    router.push(`/jobs/${uuid}`);
  };
  
  if (suggestedJobs.length === 0) {
    return null;
  }

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
  
  return (
    <View className="my-4">
      <Text className="text-lg font-bold mb-3 px-4">{title}</Text>
      <FlatList
        data={suggestedJobs}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.uuid}
        renderItem={({ item }) => (
          <TouchableOpacity 
            className="w-60 bg-white rounded-xl p-3 ml-4 mr-1 shadow-sm"
            onPress={() => handleJobPress(item.uuid)}
          >
            <View className="flex-row items-center mb-2">
              {/* Placeholder for company logo - you might want to add a property for logo in your Company type */}
              <View className="w-10 h-10 rounded-lg bg-gray-200 justify-center items-center mr-2.5">
                <Text className="text-lg font-bold text-gray-500">{item.company.name.charAt(0)}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-base font-bold mb-1" numberOfLines={1}>{item.title}</Text>
                <Text className="text-sm text-gray-600" numberOfLines={1}>{item.company.name}</Text>
              </View>
            </View>
            <View className="mt-2">
              <Text className="text-sm text-gray-600 mb-1" numberOfLines={1}>
                {item.jobType === 'remote' ? 'Từ xa' : 
                 item.jobType === 'parttime' ? 'Bán thời gian' : 
                 item.jobType === 'internship' ? 'Thực tập' : item.jobType}
              </Text>
              <Text className="text-sm text-green-600 font-semibold" numberOfLines={1}>
                {formatSalary(item)}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default JobSuggestion;