import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { insertStudentProfile } from "@/service/studentService";
import { getListProvinsie, getListDistrict, getListWard } from "@/service/regionService";
import { Picker } from "@react-native-picker/picker";

const CreateStudentProfileScreen = ({ navigation }: { navigation: any }) => {
  const { control, handleSubmit, formState: { errors } } = useForm();
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  useEffect(() => {
    fetchProvinces();
  }, []);

  const fetchProvinces = async () => {
    try {
      const response = await getListProvinsie("");
      setProvinces(response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchDistricts = async (matp: string) => {
    try {
      const response = await getListDistrict(matp, "");
      setDistricts(response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchWards = async (maqh: string) => {
    try {
      const response = await getListWard(maqh, "");
      setWards(response.data || []);
    } catch (error) {
      console.error(error);
    }
  };

  const onSubmit = async (data: any) => {
    const userUuid = await AsyncStorage.getItem("uuid");
    if (!userUuid) return;
    
    const payload = { ...data, userUuid, matp: selectedProvince, maqh: selectedDistrict };
    try {
      await insertStudentProfile(payload);
      navigation.goBack();
    } catch (error) {
      console.error("Error creating profile", error);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-100 p-5">
      <View className="flex-row items-center mb-5">
        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
          <Ionicons name="chevron-back" size={24} color="#2563eb" />
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-800 ml-2">Tạo Hồ Sơ Sinh Viên</Text>
      </View>

      <View className="bg-white p-6 rounded-lg shadow-lg">
        {[
          { name: "fullname", label: "Họ và tên" },
          { name: "phoneNumber", label: "Số điện thoại" },
          { name: "birthday", label: "Ngày sinh (YYYY-MM-DD)" },
          { name: "university", label: "Trường đại học" },
          { name: "major", label: "Chuyên ngành" }
        ].map(({ name, label }) => (
          <View key={name} className="mb-4">
            <Text className="text-gray-700 font-bold mb-1">{label}</Text>
            <Controller
              control={control}
              rules={{ required: true }}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className="bg-gray-100 p-3 rounded-lg border border-gray-300"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                />
              )}
              name={name}
            />
            {errors[name] && <Text className="text-red-500 text-sm">Trường này là bắt buộc.</Text>}
          </View>
        ))}

        <Text className="text-gray-700 font-bold mb-1">Tỉnh/Thành phố</Text>
        <Picker
          selectedValue={selectedProvince}
          onValueChange={(value) => {
            setSelectedProvince(value);
            fetchDistricts(value);
          }}
          className="bg-gray-100 p-3 rounded-lg border border-gray-300 mb-4"
        >
          {provinces.map((item: any) => (
            <Picker.Item key={item.code} label={item.name} value={item.code} />
          ))}
        </Picker>

        <Text className="text-gray-700 font-bold mb-1">Quận/Huyện</Text>
        <Picker
          selectedValue={selectedDistrict}
          onValueChange={(value) => {
            setSelectedDistrict(value);
            fetchWards(value);
          }}
          className="bg-gray-100 p-3 rounded-lg border border-gray-300 mb-4"
        >
          {districts.map((item: any) => (
            <Picker.Item key={item.code} label={item.name} value={item.code} />
          ))}
        </Picker>

        <Text className="text-gray-700 font-bold mb-1">Xã/Phường</Text>
        <Picker
          selectedValue={""}
          onValueChange={() => {}}
          className="bg-gray-100 p-3 rounded-lg border border-gray-300 mb-4"
        >
          {wards.map((item: any) => (
            <Picker.Item key={item.code} label={item.name} value={item.code} />
          ))}
        </Picker>

        <TouchableOpacity onPress={handleSubmit(onSubmit)} className="bg-blue-600 py-3 rounded-lg flex-row items-center justify-center">
          <Ionicons name="checkmark-circle" size={20} color="#ffffff" className="mr-2" />
          <Text className="text-white font-bold text-lg">Lưu thông tin</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CreateStudentProfileScreen;
