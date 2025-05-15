import { useStudent } from '@/contexts/StudentContext';
import { deleteStudentSkill, getListStudentSkill } from '@/service/skillService';
import { Skill } from '@/types/skill';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TouchableOpacity, View } from 'react-native';

type StudentSkill = {
  uuid: string;
  skill: Skill;
  proficiency: 'beginner' | 'intermediate' | 'advanced' | 'expert';
};

const ProficiencyBadge = ({ level }: { level: 'beginner' | 'intermediate' | 'advanced' | 'expert' }) => {
  const colors: Record<string, { bg: string; text: string }> = {
    beginner: { bg: 'bg-blue-100', text: 'text-blue-800' },
    intermediate: { bg: 'bg-green-100', text: 'text-green-800' },
    advanced: { bg: 'bg-purple-100', text: 'text-purple-800' },
    expert: { bg: 'bg-orange-100', text: 'text-orange-800' },
  };

  return (
    <View className={`px-2 py-1 rounded-full ${colors[level].bg}`}>
      <Text className={`text-xs font-medium ${colors[level].text} capitalize`}>{level}</Text>
    </View>
  );
};

const SkillsScreen = () => {
  const router = useRouter();
  const { student, loading: studentLoading } = useStudent();
  const [skills, setSkills] = useState<StudentSkill[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchSkills = async () => {
    if (!student?.data.uuid) return;
  
    try {
      setLoading(true);
      const response = await getListStudentSkill(student.data.uuid);
      
      if (Array.isArray(response.data)) {
        const studentSkills = response.data.map((item: any) => ({
          uuid: item.uuid,
          skill: item.skill,
          proficiency: item.proficiency,
        }));
        setSkills(studentSkills);
      } else {
        setSkills([]);
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      Alert.alert('Error', 'Failed to load skills');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  

  useEffect(() => {
    if (student?.data.uuid) {
      fetchSkills();
    }
  }, [student]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchSkills();
  };

  const handleDeleteSkill = async (skillUuid: string) => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc chắn muốn xóa kỹ năng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteStudentSkill(skillUuid);
              // Refresh the skills list after deletion
              fetchSkills();
            } catch (error) {
              console.error('Failed to delete skill:', error);
              Alert.alert('Error', 'Failed to delete skill');
            }
          },
        },
      ]
    );
  };

  if (studentLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#0000ff" />
        <Text className="mt-2 text-gray-600">Loading student information...</Text>
      </View>
    );
  }

  if (!student) {
    return (
      <View className="flex-1 justify-center items-center bg-white p-4">
        <Text className="text-lg text-center text-gray-800">
          Student information not available. Please try again.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Stack.Screen
        options={{
          title: 'Kỹ năng của sinh viên',
          headerRight: () => (
            <TouchableOpacity
              className="mr-4"
              onPress={() => router.push('/skills/addskill')
              }
            >
              <Ionicons name="add-circle-outline" size={24} color="#3b82f6" />
            </TouchableOpacity>
          ),
        }}
      />

      <View className="p-4 bg-blue-50 mb-2">
        <Text className="text-base text-gray-700">
          Sinh viên: <Text className="font-bold">{student.data.fullname}</Text>
        </Text>
        <Text className="text-sm text-gray-600 mt-1">
          MSSV: {student.data.uuid}
        </Text>
      </View>

      {loading && !refreshing ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text className="mt-2 text-gray-600">Đang tải kỹ năng...</Text>
        </View>
      ) : skills.length === 0 ? (
        <View className="flex-1 justify-center items-center p-4">
          <Ionicons name="school-outline" size={64} color="#cbd5e1" />
          <Text className="text-xl text-gray-400 mt-4 text-center">
            Chưa có kỹ năng nào được thêm
          </Text>
          <TouchableOpacity
            className="mt-4 bg-blue-500 py-3 px-6 rounded-full"
            onPress={() => router.push('/skills/addskill')
            }
          >
            <Text className="text-white font-medium">Thêm kỹ năng</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={skills}
          keyExtractor={(item) => item.uuid}
          renderItem={({ item }) => (
            <View className="flex-row items-center justify-between p-4 border-b border-gray-100">
              <View className="flex-1">
                <Text className="text-lg font-medium text-gray-800">{item.skill.name}</Text>
                <View className="flex-row items-center mt-1">
                  <ProficiencyBadge level={item.proficiency} />
                </View>
              </View>
              <TouchableOpacity
                className="p-2"
                onPress={() => handleDeleteSkill(item.uuid)}
              >
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>
          )}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          contentContainerStyle={{ flexGrow: 1 }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center p-4">
              <Text className="text-lg text-gray-400 text-center">
                Không tìm thấy kỹ năng nào
              </Text>
            </View>
          }
        />
      )}

      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-blue-500 w-14 h-14 rounded-full justify-center items-center shadow-md"
        onPress={() => router.push('/skills/addskill')
        }
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>
    </View>
  );
};

export default SkillsScreen;