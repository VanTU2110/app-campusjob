import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { getListPageApplyJob } from '../../service/applyService';
import { ApplyItem } from '../../types/apply';
import { useStudent } from '../../contexts/StudentContext';
import ApplicationCard from '../../components/ApplicationCard';

const ApplicationsScreen = () => {
  const router = useRouter();
  const { student,loading } = useStudent();
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [refreshing, setRefreshing] = useState(false);
  const [applications, setApplications] = useState<ApplyItem[]>([]);
  
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
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
      setError(err instanceof Error ? err : new Error('Failed to fetch applications'));
    } finally {
      setIsLoading(false);
    }
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
    router.push({
      pathname: '/jobs/[uuid]',
      params: { uuid: jobUuid }
    });
  };

  if (!student?.data.uuid) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-gray-50">
        <StatusBar style="dark" />
        <Ionicons name="person-outline" size={64} color="#9CA3AF" />
        <Text className="text-gray-600 mt-4 text-center font-medium text-lg">
          Not Signed In
        </Text>
        <Text className="text-gray-500 mt-2 text-center px-6">
          Please sign in to view your job applications
        </Text>
        <TouchableOpacity 
          className="mt-6 bg-indigo-600 px-6 py-3 rounded-lg"
          onPress={() => router.push('/auth/login')}
        >
          <Text className="text-white font-medium">Sign In</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar style="light" />
      <View className="bg-indigo-600 pt-12 pb-4 px-4">
        <View className="flex-row justify-between items-center">
          <Text className="text-white text-xl font-bold">My Applications</Text>
          <TouchableOpacity 
            className="bg-indigo-700 p-2 rounded-full"
            onPress={() => router.push('/jobs')}
          >
            <Ionicons name="briefcase-outline" size={22} color="white" />
          </TouchableOpacity>
        </View>
        <Text className="text-indigo-100 mt-1">
          Manage and track your job applications
        </Text>
      </View>

      {isLoading && page === 1 ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#4F46E5" />
        </View>
      ) : isError ? (
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="alert-circle-outline" size={48} color="#EF4444" />
          <Text className="text-red-500 mt-2 text-center">
            {error instanceof Error ? error.message : 'Error loading applications'}
          </Text>
          <TouchableOpacity 
            className="mt-4 bg-indigo-600 px-4 py-2 rounded-lg"
            onPress={() => fetchApplications()}
          >
            <Text className="text-white font-medium">Try Again</Text>
          </TouchableOpacity>
        </View>
      ) : applications.length === 0 ? (
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="document-outline" size={64} color="#9CA3AF" />
          <Text className="text-gray-600 mt-4 text-center font-medium text-lg">
            No Applications Yet
          </Text>
          <Text className="text-gray-500 mt-2 text-center">
            You haven't applied to any jobs yet.
          </Text>
          <TouchableOpacity 
            className="mt-6 bg-indigo-600 px-6 py-3 rounded-lg"
            onPress={() => router.push('/jobs')}
          >
            <Text className="text-white font-medium">Browse Jobs</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={applications}
          renderItem={({ item }) => (
            <ApplicationCard 
              application={item} 
              onPress={navigateToJobDetails} 
            />
          )}
          keyExtractor={item => item.uuid}
          contentContainerClassName="p-4"
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
                {data?.data?.pagination?.totalItems || 0} Applications
              </Text>
              {/* Add filter or sort buttons here if needed */}
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
                <Text className="text-indigo-600 font-medium">Load More</Text>
              </TouchableOpacity>
            ) : applications.length > 0 ? (
              <Text className="text-center text-gray-500 py-4">
                No more applications to load
              </Text>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
};

export default ApplicationsScreen;