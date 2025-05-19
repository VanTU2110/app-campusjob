import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useStudent } from '@/contexts/StudentContext';
import { getConversations } from '../../service/conversationService';
import { Conversation } from '@/types/conversations';

// Định nghĩa màu chính cho ứng dụng
const PRIMARY_COLOR = '#3b82f6'; // Màu xanh dương (blue-500)

const  ConversationScreen = () =>{
  const router = useRouter();
  const { student, loading: studentLoading } = useStudent();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!student?.data?.uuid) return;
    
    try {
      setError(null);
      const response = await getConversations(student.data.uuid);
      
      if (response.error?.code ==="success") {
        setConversations(response.data || []);
      }
      
    } catch (err) {
      setError('Không thể tải cuộc trò chuyện. Vui lòng thử lại sau.');
      console.error('Error in fetchConversations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [student]);

  useEffect(() => {
    if (!studentLoading && student?.data?.uuid) {
      fetchConversations();
    }
  }, [fetchConversations, studentLoading, student]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchConversations();
  }, [fetchConversations]);

  const handleConversationPress = (conversation: Conversation) => {
    router.push(`/conversations/${conversation.uuid}`);
  };

  const renderItem = ({ item }: { item: Conversation }) => {
    const formattedDate = format(parseISO(item.createdAt), 'dd/MM/yyyy HH:mm', { locale: vi });
    
    return (
      <TouchableOpacity
        className="flex-row items-center p-4 bg-white rounded-xl mb-3 shadow-sm"
        onPress={() => handleConversationPress(item)}
        activeOpacity={0.7}
      >
        <View className="flex-1">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-base font-semibold flex-1 mr-2 text-gray-800" numberOfLines={1}>
              {item.company.name}
            </Text>
            <Text className="text-xs text-gray-500">{formattedDate}</Text>
          </View>
          <View className="flex-row items-center">
            <Ionicons name="chatbubble-outline" size={16} color={PRIMARY_COLOR} />
            <Text className="text-sm text-blue-500 ml-1">Xem chi tiết</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>
    );
  };

  const renderEmptyComponent = () => {
    if (loading) return null;
    
    return (
      <View className="flex-1 justify-center items-center py-16">
        <Ionicons name="chatbubbles-outline" size={60} color="#ccc" />
        <Text className="text-base text-gray-500 mt-4 mb-6">Bạn chưa có cuộc trò chuyện nào</Text>
        <TouchableOpacity 
          className="bg-blue-500 px-5 py-3 rounded-lg"
          onPress={() => router.push('/new-conversation')}
        >
          <Text className="text-white font-semibold">Bắt đầu cuộc trò chuyện mới</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderErrorComponent = () => {
    if (!error) return null;
    
    return (
      <View className="flex-1 justify-center items-center p-5">
        <Ionicons name="alert-circle-outline" size={40} color="#ff6b6b" />
        <Text className="text-base text-gray-500 text-center mt-3 mb-6">{error}</Text>
        <TouchableOpacity 
          className="bg-blue-500 px-5 py-3 rounded-lg"
          onPress={fetchConversations}
        >
          <Text className="text-white font-semibold">Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (studentLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={PRIMARY_COLOR} />
        <Text className="mt-3 text-sm text-gray-500">Đang tải thông tin...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen
        options={{
          title: 'Cuộc trò chuyện',
          headerTitleStyle: { fontWeight: '600' },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push('/new-conversation')}
              className="mr-2 p-1"
            >
              <Ionicons name="add-circle-outline" size={24} color={PRIMARY_COLOR} />
            </TouchableOpacity>
          ),
        }}
      />

      {error ? (
        renderErrorComponent()
      ) : (
        <FlatList
          data={conversations}
          renderItem={renderItem}
          keyExtractor={(item) => item.uuid}
          contentContainerStyle={{ flexGrow: 1, padding: 16 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[PRIMARY_COLOR]} />
          }
          ListEmptyComponent={renderEmptyComponent}
          ListHeaderComponent={
            loading && !refreshing ? (
              <View className="py-5 items-center">
                <ActivityIndicator size="small" color={PRIMARY_COLOR} />
                <Text className="mt-2 text-sm text-gray-500">Đang tải cuộc trò chuyện...</Text>
              </View>
            ) : null
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
export default ConversationScreen;