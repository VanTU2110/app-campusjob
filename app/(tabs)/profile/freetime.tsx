import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useStudent } from '../../../contexts/StudentContext';
import { CreateStudentAvailability, GetListAvaibility } from '../../../service/studenAvailabilityService';
import { StudentAvailability } from '../../../types/studentAvailability';

const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'ssunday',
];

// Helper function to format time for display
const formatTime = (timeString: string) => {
  const [hours, minutes] = timeString.split(':');
  return `${hours}:${minutes}:00`;
};

// Helper function to convert Date to time string (HH:MM format)
const dateToTimeString = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
};

export default function StudentAvailabilityScreen() {
  const { student, loading: studentLoading } = useStudent();
  
  const [availabilities, setAvailabilities] = useState<StudentAvailability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form state
  const [selectedDay, setSelectedDay] = useState(DAYS_OF_WEEK[0]);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(new Date().setHours(startTime.getHours() + 1)));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch student availabilities
  const fetchAvailabilities = async () => {
    if (!student || !student.data || !student.data.uuid) {
      setError('Student data not available');
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await GetListAvaibility(student.data.uuid);
      if (response.error && response.error.code !== "success") {
        setError(response.error.message);
      } else {
        setAvailabilities(response.data || []);
      }
    } catch (err) {
      setError('Failed to load availabilities');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if student data is available
    if (student?.data?.uuid) {
      fetchAvailabilities();
    }
  }, [student]);

  // Handle time picker changes
  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(false);
    if (selectedDate) {
      setStartTime(selectedDate);
      
      // If end time is now before start time, adjust it
      if (selectedDate > endTime) {
        const newEndTime = new Date(selectedDate);
        newEndTime.setHours(selectedDate.getHours() + 1);
        setEndTime(newEndTime);
      }
    }
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(false);
    if (selectedDate) {
      setEndTime(selectedDate);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!student?.data?.uuid) {
      Alert.alert('Error', 'Student information not available');
      return;
    }

    // Validate times
    if (startTime >= endTime) {
      Alert.alert('Invalid Time', 'End time must be after start time');
      return;
    }

    setSubmitting(true);
    try {
      const params = {
        studentUuid: student.data.uuid,
        dayOfWeek: selectedDay,
        startTime: dateToTimeString(startTime),
        endTime: dateToTimeString(endTime),
      };

      const response = await CreateStudentAvailability(params);
      
      if (response.error && response.error.code !== "success") {
        Alert.alert('Error', response.error.message);
      } else {
        // Success
        setShowAddForm(false);
        fetchAvailabilities(); // Refresh the list
        Alert.alert('Success', 'Availability added successfully');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to add availability');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  // Group availabilities by day for better display
  const availabilitiesByDay = DAYS_OF_WEEK.map(day => {
    return {
      day,
      slots: availabilities.filter(slot => slot.dayOfWeek === day)
    };
  });

  // Show loading when student data is still loading
  if (studentLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-gray-600">Loading student data...</Text>
      </View>
    );
  }

  // Check if student data is available
  if (!student || !student.data) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-red-500 text-lg">Student data not available</Text>
        <Text className="text-gray-500 mt-2">Please log in or refresh the page</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <Stack.Screen options={{ 
        title: "Student Availability",
        headerShadowVisible: false,
      }} />

      {/* Add button */}
      <View className="px-4 py-2 border-b border-gray-200">
        <TouchableOpacity 
          className="bg-blue-500 py-2 px-4 rounded-md" 
          onPress={() => setShowAddForm(!showAddForm)}
        >
          <Text className="text-white text-center font-medium">
            {showAddForm ? 'Cancel' : 'Add New Availability'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Add form */}
      {showAddForm && (
        <View className="p-4 bg-gray-50">
          <Text className="text-lg font-bold mb-4">Add New Availability</Text>
          
          {/* Day selection */}
          <Text className="font-medium mb-1">Day of Week</Text>
          <View className="bg-white border border-gray-300 rounded-md mb-4">
            <Picker
              selectedValue={selectedDay}
              onValueChange={(itemValue) => setSelectedDay(itemValue)}
            >
              {DAYS_OF_WEEK.map((day) => (
                <Picker.Item key={day} label={day} value={day} />
              ))}
            </Picker>
          </View>

          {/* Time selection */}
          <View className="flex-row justify-between mb-4">
            <View className="flex-1 mr-2">
              <Text className="font-medium mb-1">Start Time</Text>
              <TouchableOpacity 
                className="bg-white border border-gray-300 rounded-md p-3"
                onPress={() => setShowStartPicker(true)}
              >
                <Text>{startTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
              </TouchableOpacity>
              {showStartPicker && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={onStartTimeChange}
                />
              )}
            </View>
            
            <View className="flex-1 ml-2">
              <Text className="font-medium mb-1">End Time</Text>
              <TouchableOpacity 
                className="bg-white border border-gray-300 rounded-md p-3"
                onPress={() => setShowEndPicker(true)}
              >
                <Text>{endTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
              </TouchableOpacity>
              {showEndPicker && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={onEndTimeChange}
                />
              )}
            </View>
          </View>

          {/* Submit button */}
          <TouchableOpacity 
            className={`${submitting ? 'bg-blue-300' : 'bg-blue-500'} py-3 rounded-md`}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-center font-medium">Save Availability</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Loading state */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#0000ff" />
          <Text className="mt-2 text-gray-600">Loading availabilities...</Text>
        </View>
      ) : error ? (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-red-500">{error}</Text>
          <TouchableOpacity 
            className="mt-4 bg-blue-500 py-2 px-4 rounded-md"
            onPress={fetchAvailabilities}
          >
            <Text className="text-white">Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView className="flex-1">
          {availabilities.length === 0 ? (
            <View className="p-4 flex-1 justify-center items-center">
              <Text className="text-gray-500 text-lg">No availabilities found</Text>
              <Text className="text-gray-400 mt-1">Add your first availability using the button above</Text>
            </View>
          ) : (
            <View className="p-4">
              {availabilitiesByDay.map((dayGroup) => (
                dayGroup.slots.length > 0 && (
                  <View key={dayGroup.day} className="mb-4">
                    <Text className="text-lg font-bold mb-2">{dayGroup.day}</Text>
                    {dayGroup.slots.map((slot) => (
                      <View key={slot.uuid} className="bg-gray-50 p-3 mb-2 rounded-md border border-gray-200">
                        <Text className="text-blue-600 font-medium">
                          {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                        </Text>
                      </View>
                    ))}
                  </View>
                )
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
}