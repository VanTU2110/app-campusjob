import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, FlatList, Alert } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useStudent } from '@/contexts/StudentContext';
import { getSkillList, createStudentSkill } from '@/service/skillService';
import { Skill } from '@/types/skill';

type ProficiencyLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

const ProficiencySelector = ({
  selectedLevel,
  onSelect,
}: {
  selectedLevel: ProficiencyLevel;
  onSelect: (level: ProficiencyLevel) => void;
}) => {
  const levels: ProficiencyLevel[] = ['beginner', 'intermediate', 'advanced', 'expert'];

  return (
    <View className="flex-row flex-wrap justify-center gap-2 mt-2">
      {levels.map((level) => (
        <TouchableOpacity
          key={level}
          className={`px-4 py-2 rounded-full ${
            selectedLevel === level ? 'bg-blue-500' : 'bg-gray-200'
          }`}
          onPress={() => onSelect(level)}
        >
          <Text
            className={`text-sm font-medium ${
              selectedLevel === level ? 'text-white' : 'text-gray-800'
            } capitalize`}
          >
            {level}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const AddSkillScreen = () => {
  const router = useRouter();
  const { student } = useStudent();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [proficiency, setProficiency] = useState<ProficiencyLevel>('beginner');
  const [adding, setAdding] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const pageSize = 20;

  const fetchSkills = async (pageNum: number, keyword?: string) => {
    try {
      setLoading(true);
      const response = await getSkillList({
        page: pageNum,
        pageSize,
        keyword,
      });
      
      if (response.data && response.data.items) {
        if (pageNum === 1) {
          setSkills(response.data.items);
        } else {
          setSkills((prev) => [...prev, ...response.data.items]);
        }
        
        setHasMore(response.data.items.length === pageSize);
      }
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      Alert.alert('Error', 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills(1, searchText);
  }, [searchText]);

  const handleLoadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchSkills(nextPage, searchText);
    }
  };

  const handleSelectSkill = (skill: Skill) => {
    setSelectedSkill(skill);
  };

  const handleAddSkill = async () => {
    if (!selectedSkill || !student?.data.uuid) {
      Alert.alert('Error', 'Please select a skill first');
      return;
    }

    try {
      setAdding(true);
      const response = await createStudentSkill({
        studentUuid: student.data.uuid,
        skillUuid: selectedSkill.uuid,
        proficiency,
      });

      if (response.data) {
        Alert.alert(
          'Success',
          'Skill added successfully',
          [
            {
              text: 'OK',
              onPress: () => router.back(),
            },
          ]
        );
      } else if (response.error) {
        Alert.alert('Error', response.error.message || 'Failed to add skill');
      }
    } catch (error) {
      console.error('Failed to add skill:', error);
      Alert.alert('Error', 'Failed to add skill');
    } finally {
      setAdding(false);
    }
  };

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <Stack.Screen
        options={{
          title: 'Thêm kỹ năng mới',
          headerBackTitle: 'Quay lại',
        }}
      />

      {!student ? (
        <View className="flex-1 justify-center items-center p-4">
          <Text className="text-lg text-gray-700">Không tìm thấy thông tin sinh viên</Text>
        </View>
      ) : (
        <>
          <View className="p-4 bg-blue-50">
            <Text className="text-base text-gray-700">
              Sinh viên: <Text className="font-bold">{student.data.fullname}</Text>
            </Text>
          </View>

          <View className="p-4">
            <Text className="text-lg font-bold text-gray-800 mb-2">Chọn kỹ năng</Text>
            
            <TouchableOpacity
              className="flex-row items-center bg-gray-100 p-3 rounded-lg mb-4"
              onPress={() => {
                // Add search functionality if needed
              }}
            >
              <Ionicons name="search" size={20} color="#64748b" />
              <Text className="ml-2 text-gray-500">Tìm kiếm kỹ năng...</Text>
            </TouchableOpacity>

            {loading && skills.length === 0 ? (
              <View className="flex-1 justify-center items-center py-12">
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text className="mt-2 text-gray-600">Đang tải kỹ năng...</Text>
              </View>
            ) : (
              <FlatList
                data={skills}
                keyExtractor={(item) => item.uuid}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    className={`p-4 border-b border-gray-100 ${
                      selectedSkill?.uuid === item.uuid ? 'bg-blue-50' : ''
                    }`}
                    onPress={() => handleSelectSkill(item)}
                  >
                    <View className="flex-row items-center justify-between">
                      <Text className="text-base text-gray-800">{item.name}</Text>
                      {selectedSkill?.uuid === item.uuid && (
                        <Ionicons name="checkmark-circle" size={24} color="#3b82f6" />
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.1}
                ListFooterComponent={
                  loading && skills.length > 0 ? (
                    <View className="py-4">
                      <ActivityIndicator size="small" color="#3b82f6" />
                    </View>
                  ) : null
                }
                ListEmptyComponent={
                  !loading ? (
                    <View className="flex-1 justify-center items-center py-12">
                      <Ionicons name="school-outline" size={48} color="#cbd5e1" />
                      <Text className="mt-4 text-gray-400 text-center">
                        Không tìm thấy kỹ năng nào
                      </Text>
                    </View>
                  ) : null
                }
                className="max-h-80"
              />
            )}
          </View>

          {selectedSkill && (
            <View className="p-4 bg-gray-50">
              <Text className="text-lg font-bold text-gray-800 mb-2">
                Chọn mức độ thành thạo
              </Text>
              <ProficiencySelector
                selectedLevel={proficiency}
                onSelect={setProficiency}
              />
            </View>
          )}

          <View className="p-4 mt-auto">
            <TouchableOpacity
              className={`py-3 rounded-lg ${
                selectedSkill ? 'bg-blue-500' : 'bg-gray-300'
              }`}
              disabled={!selectedSkill || adding}
              onPress={handleAddSkill}
            >
              {adding ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text className="text-white font-bold text-center text-lg">
                  Thêm kỹ năng
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default AddSkillScreen;