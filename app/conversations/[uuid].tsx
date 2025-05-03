import { View, TextInput, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator, Text, Pressable } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState, useRef, useCallback } from 'react';
import * as SignalR from '@microsoft/signalr';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { Message } from '@/types/message';
import { sendMessage, getMessages } from '@/service/chatService';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useStudent } from '@/contexts/StudentContext';

export default function ConversationScreen() {
  const { uuid } = useLocalSearchParams();
  const conversationUuid = Array.isArray(uuid) ? uuid[0] : uuid || '';
  const { student, loading: studentLoading } = useStudent();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  
  const connectionRef = useRef<SignalR.HubConnection | null>(null);
  const flatListRef = useRef<FlatList>(null);

  // Lấy lịch sử tin nhắn
  const fetchMessages = useCallback(async () => {
    // Chỉ fetch messages khi có student
    if (!student) return;
    
    try {
      setLoading(true);
      const response = await getMessages(conversationUuid);
      
      if (response && response.data) {
        // Đảm bảo mỗi tin nhắn có id duy nhất
        const messagesWithKeys = response.data.map((msg: Message) => ({
          ...msg,
          key: msg.uuid || `${msg.sendAt}-${msg.senderUuid}-${Math.random()}`
        }));
        
        setMessages(messagesWithKeys);
        
        // Cuộn xuống tin nhắn mới nhất sau khi load tin nhắn
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: false });
        }, 100);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationUuid, student]);

  // Kết nối SignalR
  useEffect(() => {
    // Chỉ kết nối khi có student
    if (!student) return;
    
    const connectSignalR = async () => {
      try {
        setConnectionStatus('connecting');
        console.log('Connecting to SignalR hub at: http://192.168.0.106:5109/chatHub');
        
        // Tạo kết nối SignalR - thay thế URL bằng URL thực tế của server SignalR
        const connection = new HubConnectionBuilder()
          .withUrl('http://192.168.0.106:5109/chatHub', {
            skipNegotiation: true,
            transport: SignalR.HttpTransportType.WebSockets
          })
          .configureLogging(LogLevel.Debug) // Tăng level log để dễ debug
          .withAutomaticReconnect([0, 2000, 10000, 30000]) // Cấu hình retry tốt hơn
          .build();
        
        // Xử lý sự kiện kết nối bị đóng
        connection.onclose(error => {
          console.log('Connection closed with error:', error);
          setConnectionStatus('disconnected');
        });
        
        // Xử lý sự kiện nhận tin nhắn mới
        connection.on('ReceiveMessage', (message: Message) => {
          console.log('Received new message:', message);
          // Thêm key duy nhất cho message mới
          const messageWithKey = {
            ...message,
            key: message.uuid || `${message.sendAt}-${message.senderUuid}-${Math.random()}`
          };
          
          setMessages(prevMessages => [...prevMessages, messageWithKey]);
          
          // Cuộn xuống tin nhắn mới nhất
          setTimeout(() => {
            flatListRef.current?.scrollToEnd({ animated: true });
          }, 100);
        });
        
        // Xử lý sự kiện join vào cuộc trò chuyện
        connection.on('JoinedConversation', (conversationId: string) => {
          console.log(`Joined conversation: ${conversationId}`);
        });
        
        // Bắt đầu kết nối
        console.log('Starting connection...');
        await connection.start();
        console.log('Connection started successfully');
        
        // Join vào conversation bằng cách gọi phương thức tương ứng trên server
        await connection.invoke('JoinConversation', conversationUuid);
        console.log(`Joined conversation: ${conversationUuid}`);
        
        connectionRef.current = connection;
        setConnectionStatus('connected');
      } catch (error) {
        console.error('Error connecting to SignalR:', error);
        setConnectionStatus('error');
        
        // Kiểm tra kết nối với server bằng một simple fetch 
        try {
          const response = await fetch('http://192.168.0.106:5109/healthcheck');
          console.log('Server health check response:', response.status);
        } catch (fetchError) {
          console.error('Cannot reach server with fetch either:', fetchError);
        }
      }
    };
    
    // Kết nối SignalR
    connectSignalR();
    
    // Cleanup function
    return () => {
      const closeConnection = async () => {
        if (connectionRef.current) {
          try {
            // Leave conversation trước khi đóng kết nối
            await connectionRef.current.invoke('LeaveConversation', conversationUuid);
            await connectionRef.current.stop();
            setConnectionStatus('disconnected');
            console.log('SignalR connection closed successfully');
          } catch (error) {
            console.error('Error closing SignalR connection:', error);
          }
        }
      };
      
      closeConnection();
    };
  }, [conversationUuid, student]);
  
  // Lấy lịch sử tin nhắn khi component mount
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);
  
  // Hàm gửi tin nhắn
  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !student) return;
    
    try {
      setSending(true);
      
      const messageToSend = {
        conversationUuid,
        content: newMessage.trim(),
        senderUuid: student.data.uuid,
      };
      
      const response = await sendMessage(messageToSend);
      
      if (response && response.data) {
        // Thêm tin nhắn vào danh sách tin nhắn với key duy nhất
        const sentMessageWithKey = {
          ...response.data,
          key: response.data.uuid || `${response.data.sendAt}-${response.data.senderUuid}-${Math.random()}`
        };
        
        setMessages(prevMessages => [...prevMessages, sentMessageWithKey]);
        
        // Cuộn xuống tin nhắn mới nhất
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
        
        // Xóa nội dung tin nhắn đã gửi
        setNewMessage('');
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };
  
  // Hiển thị tin nhắn
  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderUuid === student?.data.uuid;
    
    return (
      <View className={`max-w-3/4 my-1 px-3 py-2 rounded-2xl ${isCurrentUser ? 'self-end bg-blue-500' : 'self-start bg-gray-200'}`}>
        <Text className={`${isCurrentUser ? 'text-white' : 'text-gray-800'}`}>{item.content}</Text>
        <Text className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
          {new Date(item.sendAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };
  
  // Kiểm tra nếu đang loading student context
  if (studentLoading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2">Đang tải thông tin người dùng...</Text>
      </SafeAreaView>
    );
  }
  
  // Kiểm tra nếu không có student
  if (!student) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center">
        <Text className="text-red-500">Không tìm thấy thông tin học sinh</Text>
        <Pressable 
          onPress={() => router.back()} 
          className="mt-4 px-4 py-2 bg-blue-500 rounded-lg"
        >
          <Text className="text-white">Quay lại</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  // Component để hiển thị trạng thái kết nối
  const ConnectionStatus = () => {
    switch (connectionStatus) {
      case 'connecting':
        return <ActivityIndicator size="small" color="#0000ff" />;
      case 'connected':
        return <Ionicons name="checkmark-circle" size={16} color="green" />;
      case 'error':
        return (
          <Pressable onPress={fetchMessages} className="flex-row items-center">
            <Ionicons name="alert-circle" size={16} color="red" />
            <Text className="text-red-500 text-xs ml-1">Thử lại</Text>
          </Pressable>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header */}
      <View className="h-14 flex-row items-center px-4 border-b border-gray-200">
        <Pressable onPress={() => router.back()} className="mr-4">
          <Ionicons name="chevron-back" size={24} color="#000" />
        </Pressable>
        <Text className="text-lg font-semibold">Tin nhắn</Text>
        <View className="ml-auto">
          <ConnectionStatus />
        </View>
      </View>
      
      {/* Messages */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) =>  item.uuid || `${item.sendAt}-${item.senderUuid}`}
            contentContainerStyle={{ padding: 10, flexGrow: 1 }}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
          />
        )}
        
        {/* Input box */}
        <View className="flex-row items-center p-2 border-t border-gray-200">
          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
            placeholder="Nhập tin nhắn..."
            value={newMessage}
            onChangeText={setNewMessage}
            multiline
            maxLength={1000}
          />
          <Pressable 
            onPress={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            className={`w-10 h-10 rounded-full justify-center items-center ${!newMessage.trim() || sending ? 'bg-gray-300' : 'bg-blue-500'}`}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="arrow-up" size={20} color="#fff" />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}