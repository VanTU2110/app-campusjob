import { useStudent } from '@/contexts/StudentContext';
import { getMessages, sendMessage } from '@/service/chatService';
import { Message } from '@/types/message';
import { Ionicons } from '@expo/vector-icons';
import * as SignalR from '@microsoft/signalr';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
type JobInvite = {
  uuid: string;
  title: string;
  salary: string;
};
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
// Hàm phân tích tin nhắn job invite
const parseJobInvite = (content: string): { isJobInvite: boolean; job?: JobInvite; message?: string } => {
  const jobInviteRegex = /\[JOB_INVITE (.+?)\]\[\/JOB_INVITE\]/;
  const match = content.match(jobInviteRegex);
  
  if (!match) return { isJobInvite: false };
  
  try {
    const paramsString = match[1];
    const params = paramsString.split(' ');
    
    const job: Partial<JobInvite> = {};
    params.forEach(param => {
      const [key, value] = param.split('=');
      if (key && value) {
        job[key as keyof JobInvite] = value.replace(/^"|"$/g, '');
      }
    });
    
    if (job.uuid && job.title && job.salary) {
      return {
        isJobInvite: true,
        job: job as JobInvite,
        message: content.replace(jobInviteRegex, '').trim()
      };
    }
  } catch (error) {
    console.error('Error parsing job invite:', error);
  }
  
  return { isJobInvite: false };
};

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
        
        // Tạo kết nối SignalR - thay thế URL bằng URL thực tế của server SignalR
        const connection = new HubConnectionBuilder()
          .withUrl('http://192.168.1.14:5109/chatHub', {
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
          
          setMessages(prevMessages => {
            // Kiểm tra xem đã có tin nhắn tạm thời của chính người dùng này chưa
            // Nếu đã có, thay thế nó thay vì thêm mới
            const hasTempMessage = prevMessages.some(
              msg => msg.uuid?.startsWith('temp-') && 
                    msg.senderUuid === message.senderUuid && 
                    msg.content === message.content
            );
            
            if (hasTempMessage) {
              return prevMessages.map(msg => 
                (msg.uuid?.startsWith('temp-') && 
                 msg.senderUuid === message.senderUuid && 
                 msg.content === message.content) 
                  ? messageWithKey 
                  : msg
              );
            } else {
              // Nếu không có tin nhắn tạm thời, thêm mới bình thường
              return [...prevMessages, messageWithKey];
            }
          });
          
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
      const content = newMessage.trim();
      const senderUuid = student.data.uuid;
      
      // Xóa nội dung tin nhắn đã gửi ngay lập tức để cải thiện UX
      setNewMessage('');
      
      // Tạo một message tạm thời để hiển thị ngay lập tức với trạng thái đang gửi
      const tempId = `temp-${Date.now()}`;
      const tempMessage = {
        uuid: tempId,
        conversationUuid,
        content,
        senderUuid,
        sendAt: new Date().toISOString(),
        key: tempId,
        // Thêm flag để đánh dấu tin nhắn đang được gửi
        _sending: true
      };
      
      // Biến để theo dõi xem đã hiển thị xong tin nhắn chưa
      let messageDisplayed = false;
      
      // Thêm tin nhắn tạm thời vào danh sách tin nhắn
      setMessages(prevMessages => [...prevMessages, tempMessage]);
      
      // Cuộn xuống tin nhắn mới nhất
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
      // Kiểm tra kết nối SignalR và gửi tin nhắn
      if (connectionRef.current && connectionRef.current.state === SignalR.HubConnectionState.Connected) {
        try {
          // Gọi phương thức Hub trực tiếp để gửi tin nhắn real-time
          await connectionRef.current.invoke(
            "SendMessageToConversation", 
            conversationUuid, 
            senderUuid, 
            content
          );
          console.log("✅ Message sent via SignalR");
          
          // Không cần cập nhật UI vì tin nhắn sẽ được nhận lại qua ReceiveMessage event
          messageDisplayed = true;
          
          // Vẫn gọi API để đảm bảo tin nhắn được lưu vào DB (trừ khi server đã tự xử lý)
          try {
            const messageToSend = {
              conversationUuid,
              content,
              senderUuid,
            };
            
            await sendMessage(messageToSend);
            console.log("✅ Message saved to database via API");
          } catch (apiError) {
            console.error('Error ensuring message is saved to database:', apiError);
            // Không cần xử lý UI vì tin nhắn đã được gửi thành công qua SignalR
          }
        } catch (signalRError) {
          console.error('Error sending message via SignalR:', signalRError);
          
          // Nếu gửi qua SignalR thất bại, gửi qua API như trước đây
          if (!messageDisplayed) {
            try {
              const messageToSend = {
                conversationUuid,
                content,
                senderUuid,
              };
              
              const response = await sendMessage(messageToSend);
              console.log("✅ Message sent via API fallback");
              
              if (response && response.data) {
                // Cập nhật tin nhắn tạm thời với dữ liệu thực từ API
                setMessages(prevMessages => 
                  prevMessages.map(msg => 
                    msg.uuid === tempId ? {
                      ...response.data,
                      key: response.data.uuid || `${response.data.sendAt}-${response.data.senderUuid}-${Math.random()}`
                    } : msg
                  )
                );
                messageDisplayed = true;
              }
            } catch (apiError) {
              console.error('Error sending message via API:', apiError);
              // Đánh dấu tin nhắn gửi thất bại
              setMessages(prevMessages => 
                prevMessages.map(msg => 
                  msg.uuid === tempId ? { ...msg, _failed: true, _sending: false } : msg
                )
              );
            }
          }
        }
      } else {
        // Nếu không có kết nối SignalR, gửi qua API như trước đây
        try {
          const messageToSend = {
            conversationUuid,
            content,
            senderUuid,
          };
          
          const response = await sendMessage(messageToSend);
          console.log("✅ Message sent via API (no SignalR connection)");
          
          if (response && response.data) {
            // Cập nhật tin nhắn tạm thời với dữ liệu thực từ API
            setMessages(prevMessages => 
              prevMessages.map(msg => 
                msg.uuid === tempId ? {
                  ...response.data,
                  key: response.data.uuid || `${response.data.sendAt}-${response.data.senderUuid}-${Math.random()}`
                } : msg
              )
            );
            messageDisplayed = true;
          }
        } catch (error) {
          console.error('Error sending message via API:', error);
          // Đánh dấu tin nhắn gửi thất bại
          setMessages(prevMessages => 
            prevMessages.map(msg => 
              msg.uuid === tempId ? { ...msg, _failed: true, _sending: false } : msg
            )
          );
        }
      }
    } catch (error) {
      console.error('Error in send message flow:', error);
    } finally {
      setSending(false);
    }
  };
  
  // Render tin nhắn
  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderUuid === student?.data.uuid;
    const { isJobInvite, job, message } = parseJobInvite(item.content);
    
    const handleJobPress = () => {
      if (job) {
        router.push({ pathname: '/jobs/[uuid]', params: { uuid: job.uuid } });
      }
    };

    return (
      <View className={`max-w-3/4 my-1 ${isCurrentUser ? 'items-end' : 'items-start'}`}>
        {isJobInvite && job && (
          <Pressable 
            onPress={handleJobPress}
            className={`w-full mb-1 border rounded-xl overflow-hidden ${isCurrentUser ? 'border-blue-300' : 'border-gray-300'}`}
          >
            <View className={`p-3 ${isCurrentUser ? 'bg-blue-50' : 'bg-gray-50'}`}>
              <Text className="font-bold text-lg">{job.title}</Text>
              <Text className="text-gray-600 mt-1">Mức lương: {job.salary}</Text>
              <View className="flex-row items-center mt-2">
                <Text className="text-blue-500 text-sm">Xem chi tiết công việc</Text>
                <Ionicons name="chevron-forward" size={16} color="#3b82f6" />
              </View>
            </View>
          </Pressable>
        )}
        
        {(message || !isJobInvite) && (
          <View className={`px-3 py-2 rounded-2xl ${isCurrentUser ? 'bg-blue-500' : 'bg-gray-200'}`}>
            <Text className={`${isCurrentUser ? 'text-white' : 'text-gray-800'}`}>
              {message || item.content}
            </Text>
          </View>
        )}
        
        <View className={`flex-row items-center justify-end mt-1 ${isCurrentUser ? 'self-end' : 'self-start'}`}>
          <Text className={`text-xs ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
            {new Date(item.sendAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
          {item._sending && (
            <ActivityIndicator size="small" color={isCurrentUser ? "#fff" : "#999"} style={{ marginLeft: 5 }} />
          )}
          {item._failed && (
            <Ionicons name="alert-circle" size={12} color={isCurrentUser ? "#ff9999" : "#ff6666"} style={{ marginLeft: 5 }} />
          )}
        </View>
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
            keyExtractor={(item) => item.key || item.uuid || `${item.sendAt}-${item.senderUuid}`}
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
            disabled={sending}
            className={`w-10 h-10 rounded-full justify-center items-center ${!newMessage.trim() ? 'bg-gray-300' : 'bg-blue-500'}`}
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