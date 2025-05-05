import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ApplyItem } from '../types/apply';

interface ApplicationCardProps {
  application: ApplyItem;
  onPress: (jobUuid: string) => void;
}

const ApplicationCard = ({ application, onPress }: ApplicationCardProps) => {
  const getStatusColor = (status: ApplyItem['status']) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (e) {
      return dateString;
    }
  };

  const getStatusIcon = (status: ApplyItem['status']) => {
    switch (status) {
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'pending':
        return 'time';
      case 'cancelled':
        return 'ban';
      default:
        return 'help-circle';
    }
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-lg shadow-sm p-4 mb-3"
      onPress={() => onPress(application.jobUuid)}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-base font-semibold text-gray-800" numberOfLines={1}>
          Application #{application.uuid.substring(0, 8)}
        </Text>
        <View className={`flex-row items-center px-2 py-1 rounded-full ${getStatusColor(application.status)}`}>
          <Ionicons 
            name={getStatusIcon(application.status)} 
            size={14} 
            color={application.status === 'approved' ? '#065F46' : 
                  application.status === 'rejected' ? '#991B1B' : 
                  application.status === 'pending' ? '#92400E' : '#1F2937'} 
            style={{ marginRight: 4 }}
          />
          <Text className="text-xs font-medium capitalize">
            {application.status}
          </Text>
        </View>
      </View>
      
      <View className="flex-row items-center mb-2">
        <Ionicons name="calendar-outline" size={16} color="#6B7280" />
        <Text className="text-sm text-gray-600 ml-1">
          Applied: {formatDate(application.appliedAt)}
        </Text>
      </View>
      
      {application.updatedAt !== application.appliedAt && (
        <View className="flex-row items-center mb-2">
          <Ionicons name="time-outline" size={16} color="#6B7280" />
          <Text className="text-sm text-gray-600 ml-1">
            Updated: {formatDate(application.updatedAt)}
          </Text>
        </View>
      )}

      {application.coverLetter && (
        <View className="mt-2 bg-gray-50 p-3 rounded-md">
          <Text className="text-sm text-gray-700 italic" numberOfLines={2}>
            "{application.coverLetter.substring(0, 100)}
            {application.coverLetter.length > 100 ? '...' : ''}"
          </Text>
        </View>
      )}
      
      {application.note && (
        <View className="mt-2 bg-gray-50 p-2 rounded">
          <Text className="text-sm text-gray-700" numberOfLines={2}>
            <Text className="font-medium">Note:</Text> {application.note}
          </Text>
        </View>
      )}
      
      <View className="flex-row mt-3 items-center justify-end">
        <Text className="text-indigo-600 text-sm font-medium mr-1">
          View Job Details
        </Text>
        <Ionicons name="arrow-forward" size={16} color="#4F46E5" />
      </View>
    </TouchableOpacity>
  );
};

export default ApplicationCard;