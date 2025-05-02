import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getListProvinsie, getListDistrict, getListWard } from '../../../service/regionService';
import { insertStudentProfile } from '../../../service/studentService';
import { Location } from '../../../types/location';
import { InsertStudent } from '../../../types/student';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialIcons';

const CreateStudentProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  
  // Form data
  const [fullname, setFullname] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState<number>(0);
  const [birthdate, setBirthdate] = useState<Date>(new Date());
  const [university, setUniversity] = useState('');
  const [major, setMajor] = useState('');
  
  // Location data
  const [provinces, setProvinces] = useState<Location[]>([]);
  const [districts, setDistricts] = useState<Location[]>([]);
  const [wards, setWards] = useState<Location[]>([]);
  
  const [selectedProvince, setSelectedProvince] = useState<string>('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedWard, setSelectedWard] = useState<string>('');

  // UI states
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (selectedProvince) {
      fetchDistricts(selectedProvince);
      setSelectedDistrict('');
      setSelectedWard('');
      setWards([]);
    }
  }, [selectedProvince]);

  useEffect(() => {
    if (selectedDistrict) {
      fetchWards(selectedDistrict);
      setSelectedWard('');
    }
  }, [selectedDistrict]);

  const fetchProvinces = async () => {
    try {
      const response = await getListProvinsie("");
      if (response && response.data && Array.isArray(response.data)) {
        setProvinces(response.data);
      } else {
        setProvinces([]);
      }
    } catch (error) {
      console.error("Error fetching provinces:", error);
      setProvinces([]);
    }
  };

  const fetchDistricts = async (matp: string) => {
    if (!matp) return;
    try {
      const response = await getListDistrict(matp, "");
      if (response?.data && Array.isArray(response.data)) {
        setDistricts(response.data);
      } else {
        setDistricts([]);
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
      setDistricts([]);
    }
  };

  const fetchWards = async (maqh: string) => {
    if (!maqh) return;
    try {
      const response = await getListWard(maqh, "");
      if (response?.data && Array.isArray(response.data)) {
        setWards(response.data);
      } else {
        setWards([]);
      }
    } catch (error) {
      console.error("Error fetching wards:", error);
      setWards([]);
    }
  };

  const onChangeBirthdate = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || birthdate;
    setShowDatePicker(false);
    setBirthdate(currentDate);
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    if (!fullname.trim()) newErrors.fullname = 'Vui lòng nhập họ tên';
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Vui lòng nhập số điện thoại';
    } else if (!/^[0-9]{10}$/.test(phoneNumber)) {
      newErrors.phoneNumber = 'Số điện thoại không hợp lệ';
    }
    
    if (!university.trim()) newErrors.university = 'Vui lòng nhập trường đại học';
    if (!major.trim()) newErrors.major = 'Vui lòng nhập chuyên ngành';
    if (!selectedProvince) newErrors.province = 'Vui lòng chọn tỉnh/thành phố';
    if (!selectedDistrict) newErrors.district = 'Vui lòng chọn quận/huyện';
    if (!selectedWard) newErrors.ward = 'Vui lòng chọn phường/xã';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const userUuid = await AsyncStorage.getItem("uuid");
      
      if (!userUuid) {
        throw new Error('User UUID not found');
      }
      
      const studentData: InsertStudent = {
        userUuid,
        fullname,
        phoneNumber,
        gender,
        birthday: format(birthdate, 'yyyy-MM-dd'),
        university,
        major,
        matp: selectedProvince,
        maqh: selectedDistrict,
        xaid: selectedWard
      };
      
      const response = await insertStudentProfile(studentData);
      
      Alert.alert(
        'Thành công',
        'Hồ sơ sinh viên đã được tạo thành công!',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      console.error('Error creating profile:', error);
      Alert.alert(
        'Lỗi',
        error.message || 'Đã xảy ra lỗi khi tạo hồ sơ sinh viên'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderError = (field: string) => {
    return errors[field] ? (
      <Text className="text-red-600 text-sm mt-1">{errors[field]}</Text>
    ) : null;
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-bold mb-2 text-blue-800 text-center">Tạo Hồ Sơ Sinh Viên</Text>
        <Text className="text-base text-gray-600 mb-6 text-center">Vui lòng cung cấp thông tin cá nhân của bạn</Text>

        {/* Họ và tên */}
        <View className="mb-4">
          <Text className="text-base font-semibold text-gray-800 mb-2">Họ và tên</Text>
          <TextInput
            className={`bg-white rounded-lg px-4 py-3 text-base border ${
              errors.fullname ? "border-red-500" : "border-gray-300"
            }`}
            value={fullname}
            onChangeText={setFullname}
            placeholder="Nhập họ và tên"
            placeholderTextColor="#9E9E9E"
          />
          {renderError('fullname')}
        </View>

        {/* Số điện thoại */}
        <View className="mb-4">
          <Text className="text-base font-semibold text-gray-800 mb-2">Số điện thoại</Text>
          <TextInput
            className={`bg-white rounded-lg px-4 py-3 text-base border ${
              errors.phoneNumber ? "border-red-500" : "border-gray-300"
            }`}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Nhập số điện thoại"
            placeholderTextColor="#9E9E9E"
            keyboardType="phone-pad"
            maxLength={10}
          />
          {renderError('phoneNumber')}
        </View>

        {/* Giới tính */}
        <View className="mb-4">
          <Text className="text-base font-semibold text-gray-800 mb-2">Giới tính</Text>
          <View className="flex-row mt-2">
            <TouchableOpacity
              className="flex-row items-center mr-6"
              onPress={() => setGender(0)}
            >
              <View               className={`h-6 w-6 rounded-full border-2 items-center justify-center ${
                gender === 0 ? "border-blue-600" : "border-gray-400"
              }`}>
                {gender === 0 && <View className="h-3 w-3 rounded-full bg-blue-600" />}
              </View>
              <Text className="text-base text-gray-800 ml-2">Nam</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center"
              onPress={() => setGender(1)}
            >
              <View               className={`h-6 w-6 rounded-full border-2 items-center justify-center ${
                gender === 1 ? "border-blue-600" : "border-gray-400"
              }`}>
                {gender === 1 && <View className="h-3 w-3 rounded-full bg-blue-600" />}
              </View>
              <Text className="text-base text-gray-800 ml-2">Nữ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Ngày sinh */}
        <View className="mb-4">
          <Text className="text-base font-semibold text-gray-800 mb-2">Ngày sinh</Text>
          <TouchableOpacity
            className="flex-row items-center justify-between bg-white rounded-lg px-4 py-3 border border-gray-300"
            onPress={() => setShowDatePicker(true)}
          >
            <Text className="text-base text-gray-800">
              {format(birthdate, 'dd/MM/yyyy')}
            </Text>
            <Icon name="calendar-today" size={24} color="#555" />
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={birthdate}
              mode="date"
              display="default"
              onChange={onChangeBirthdate}
              maximumDate={new Date()}
            />
          )}
        </View>

        {/* Trường đại học */}
        <View className="mb-4">
          <Text className="text-base font-semibold text-gray-800 mb-2">Trường đại học</Text>
          <TextInput
            className={`bg-white rounded-lg px-4 py-3 text-base border ${
              errors.university ? "border-red-500" : "border-gray-300"
            }`}
            value={university}
            onChangeText={setUniversity}
            placeholder="Nhập tên trường đại học"
            placeholderTextColor="#9E9E9E"
          />
          {renderError('university')}
        </View>

        {/* Chuyên ngành */}
        <View className="mb-4">
          <Text className="text-base font-semibold text-gray-800 mb-2">Chuyên ngành</Text>
          <TextInput
            className={`bg-white rounded-lg px-4 py-3 text-base border ${
              errors.major ? "border-red-500" : "border-gray-300"
            }`}
            value={major}
            onChangeText={setMajor}
            placeholder="Nhập chuyên ngành"
            placeholderTextColor="#9E9E9E"
          />
          {renderError('major')}
        </View>

        {/* Tỉnh/Thành phố */}
        <View className="mb-4">
          <Text className="text-base font-semibold text-gray-800 mb-2">Tỉnh/Thành phố</Text>
          <View className={`bg-white rounded-lg border overflow-hidden ${
            errors.province ? "border-red-500" : "border-gray-300"
          }`}>
            <Picker
              selectedValue={selectedProvince}
              onValueChange={(itemValue) => setSelectedProvince(itemValue)}
              className="h-12 w-full"
            >
              <Picker.Item label="Chọn Tỉnh/Thành phố" value="" color="#9E9E9E" />
              {provinces.map((province) => (
                <Picker.Item
                  key={province.code}
                  label={province.name}
                  value={province.code}
                />
              ))}
            </Picker>
          </View>
          {renderError('province')}
        </View>

        {/* Quận/Huyện */}
        <View className="mb-4">
          <Text className="text-base font-semibold text-gray-800 mb-2">Quận/Huyện</Text>
          <View className={`bg-white rounded-lg border overflow-hidden ${
            errors.district ? "border-red-500" : "border-gray-300"
          }`}>
            <Picker
              selectedValue={selectedDistrict}
              onValueChange={(itemValue) => setSelectedDistrict(itemValue)}
              className="h-12 w-full"
              enabled={districts.length > 0}
            >
              <Picker.Item label="Chọn Quận/Huyện" value="" color="#9E9E9E" />
              {districts.map((district) => (
                <Picker.Item
                  key={district.code}
                  label={district.name}
                  value={district.code}
                />
              ))}
            </Picker>
          </View>
          {renderError('district')}
        </View>

        {/* Phường/Xã */}
        <View className="mb-4">
          <Text className="text-base font-semibold text-gray-800 mb-2">Phường/Xã</Text>
          <View className={`bg-white rounded-lg border overflow-hidden ${
            errors.ward ? "border-red-500" : "border-gray-300"
          }`}>
            <Picker
              selectedValue={selectedWard}
              onValueChange={(itemValue) => setSelectedWard(itemValue)}
              className="h-12 w-full"
              enabled={wards.length > 0}
            >
              <Picker.Item label="Chọn Phường/Xã" value="" color="#9E9E9E" />
              {wards.map((ward) => (
                <Picker.Item
                  key={ward.code}
                  label={ward.name}
                  value={ward.code}
                />
              ))}
            </Picker>
          </View>
          {renderError('ward')}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          className={`bg-blue-600 rounded-lg py-4 items-center mt-6 shadow ${
            isSubmitting ? "opacity-70" : ""
          }`}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-lg font-semibold">Tạo Hồ Sơ</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default CreateStudentProfileScreen;