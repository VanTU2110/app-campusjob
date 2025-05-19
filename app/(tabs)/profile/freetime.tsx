import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { RefreshControl } from 'react-native-gesture-handler';
import { useStudent } from '../../../contexts/StudentContext';
import { CreateStudentAvailability, GetListAvaibility, deleteAvailability } from '../../../service/studenAvailabilityService';
import { StudentAvailability } from '../../../types/studentAvailability';

const daysOfWeek = [
  { label: 'Thứ Hai', value: 'monday' },
  { label: 'Thứ Ba', value: 'tuesday' },
  { label: 'Thứ Tư', value: 'wednesday' },
  { label: 'Thứ Năm', value: 'thursday' },
  { label: 'Thứ Sáu', value: 'friday' },
  { label: 'Thứ Bảy', value: 'saturday' },
  { label: 'Chủ Nhật', value: 'sunday' },
];

const AvailabilityScreen = () => {
  const { student } = useStudent();
  const [availabilities, setAvailabilities] = useState<StudentAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState<'start' | 'end' | null>(null);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [dayOfWeek, setDayOfWeek] = useState('Monday');
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());

  useEffect(() => {
    if (student?.data.uuid) {
      fetchAvailabilities();
    }
  }, [student?.data.uuid]);

  const fetchAvailabilities = async () => {
    try {
      setLoading(true);
      const response = await GetListAvaibility(student?.data.uuid ?? '');
      if (response.data) {
        setAvailabilities(response.data);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể tải lịch rảnh');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAvailabilities();
  };

  const handleAddAvailability = async () => {
    if (!student?.data.uuid) return;

    try {
      const params = {
        studentUuid: student.data.uuid,
        dayOfWeek,
        startTime: startTime.toTimeString().substring(0, 5),
        endTime: endTime.toTimeString().substring(0, 5),
      };

      await CreateStudentAvailability(params);
      Alert.alert('Thành công', 'Thêm lịch rảnh thành công');
      setShowForm(false);
      fetchAvailabilities();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm lịch rảnh');
      console.error(error);
    }
  };

  const handleDelete = async (uuid: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa lịch rảnh này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAvailability(uuid);
              fetchAvailabilities();
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể xóa lịch rảnh');
              console.error(error);
            }
          },
        },
      ]
    );
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderAvailabilityItem = (item: StudentAvailability) => (
    <View key={item.uuid} className="bg-white p-4 rounded-lg shadow-sm mb-3 flex-row justify-between items-center">
      <View>
        <Text className="font-semibold text-gray-800">
          {daysOfWeek.find(day => day.value === item.dayOfWeek)?.label}
        </Text>
        <Text className="text-gray-600">
          {formatTime(item.startTime)} - {formatTime(item.endTime)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => handleDelete(item.uuid)}
        className="p-2 bg-red-50 rounded-full"
      >
        <Ionicons name="trash-outline" size={20} color="#ef4444" />
      </TouchableOpacity>
    </View>
  );

  const renderForm = () => (
    <View className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <Text className="text-lg font-bold mb-4 text-gray-800">Thêm lịch rảnh</Text>
      
      <View className="mb-4">
        <Text className="text-sm font-medium text-gray-700 mb-1">Ngày trong tuần</Text>
        <View className="border border-gray-300 rounded-lg">
          <Picker
            selectedValue={dayOfWeek}
            onValueChange={(itemValue) => setDayOfWeek(itemValue)}
          >
            {daysOfWeek.map(day => (
              <Picker.Item key={day.value} label={day.label} value={day.value} />
            ))}
          </Picker>
        </View>
      </View>

      <View className="flex-row justify-between mb-4">
        <View className="w-[48%]">
          <Text className="text-sm font-medium text-gray-700 mb-1">Bắt đầu</Text>
          <TouchableOpacity
            onPress={() => setShowTimePicker('start')}
            className="border border-gray-300 rounded-lg p-3"
          >
            <Text>{startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </TouchableOpacity>
        </View>

        <View className="w-[48%]">
          <Text className="text-sm font-medium text-gray-700 mb-1">Kết thúc</Text>
          <TouchableOpacity
            onPress={() => setShowTimePicker('end')}
            className="border border-gray-300 rounded-lg p-3"
          >
            <Text>{endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showTimePicker && (
        <DateTimePicker
          value={showTimePicker === 'start' ? startTime : endTime}
          mode="time"
          is24Hour={true}
          display="default"
          onChange={(event, selectedTime) => {
            setShowTimePicker(null);
            if (selectedTime) {
              if (showTimePicker === 'start') {
                setStartTime(selectedTime);
              } else {
                setEndTime(selectedTime);
              }
            }
          }}
        />
      )}

      <View className="flex-row justify-end space-x-3 mt-2">
        <TouchableOpacity
          onPress={() => setShowForm(false)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <Text className="text-gray-700">Hủy</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleAddAvailability}
          className="px-4 py-2 bg-blue-600 rounded-lg"
        >
          <Text className="text-white">Lưu</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Stack.Screen options={{ title: 'Lịch rảnh của tôi' }} />
      
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
        </View>
      ) : (
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#3b82f6']}
            />
          }
        >
          {showForm ? (
            renderForm()
          ) : (
            <TouchableOpacity
              onPress={() => setShowForm(true)}
              className="mb-4 flex-row items-center justify-center bg-blue-600 p-3 rounded-lg"
            >
              <Ionicons name="add" size={20} color="white" />
              <Text className="text-white ml-2 font-medium">Thêm lịch rảnh</Text>
            </TouchableOpacity>
          )}

          {availabilities.length === 0 ? (
            <View className="bg-white p-6 rounded-lg items-center justify-center">
              <Ionicons name="calendar-outline" size={48} color="#9ca3af" />
              <Text className="text-gray-500 mt-2 text-center">Bạn chưa có lịch rảnh nào</Text>
              <Text className="text-gray-400 text-center mt-1">Nhấn nút "Thêm lịch rảnh" để bắt đầu</Text>
            </View>
          ) : (
            <View>
              <Text className="text-lg font-semibold mb-3 text-gray-800">Lịch rảnh hiện tại</Text>
              {availabilities.map(renderAvailabilityItem)}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

export default AvailabilityScreen;