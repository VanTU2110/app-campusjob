import React, { useState, useEffect } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getStudentProfile, updateStudentProfile } from "@/service/studentService";
import { getListProvinsie, getListDistrict, getListWard } from "@/service/regionService";
import { Picker } from "@react-native-picker/picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
const EditStudentProfileScreen = ({ navigation }: { navigation: any }) => {
    const { control, handleSubmit, setValue, formState: { errors } } = useForm();
    const [selectedGender, setSelectedGender] = useState();
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);

    const [selectedProvince, setSelectedProvince] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [selectedWard, setSelectedWard] = useState("");
    const router = useRouter();

    useEffect(() => {
        fetchProfile();
        fetchProvinces();
    }, []);

    const fetchProfile = async () => {
        try {
            const userUuid = await AsyncStorage.getItem("uuid");
            if (!userUuid) {
                console.error("UUID không tồn tại!");
                return;
            }

            console.log("Fetching student profile for UUID:", userUuid);
            const response = await getStudentProfile(userUuid);
            console.log("Student Profile API Response:", response);

            if (response?.data) {
                const student = response.data;
                setValue("fullname", student.fullname || "");
                setValue("phoneNumber", student.phoneNumber || "");
                setValue("birthday", student.birthday || "");
                setValue("university", student.university || "");
                setValue("major", student.major || "");
                setSelectedGender(student.gender)
                // Kiểm tra giá trị được set
                console.log("Dữ liệu sau khi setValue:", {
                    fullname: student.fullname,
                    phoneNumber: student.phoneNumber,
                    birthday: student.birthday,
                    university: student.university,
                    major: student.major,
                });
            }
        } catch (error) {
            console.error("Lỗi khi lấy thông tin sinh viên:", error);
        }
    };

    const fetchProvinces = async () => {
        try {
            const response = await getListProvinsie("");
            if (response && response.data && Array.isArray(response.data)) {
                setProvinces(response.data);
            } else {
                setProvinces([]); // Đảm bảo không bị undefined
            }
        } catch (error) {
            console.error("Error fetching provinces:", error);
            setProvinces([]); // Đảm bảo dữ liệu không bị undefined
        }
    };


    const fetchDistricts = async (matp: string) => {
        if (!matp) return;
        try {
            console.log("Fetching districts for:", matp);
            const response = await getListDistrict(matp, "");
            console.log("Districts API Response:", response);

            if (response?.data && Array.isArray(response.data)) {
                setDistricts(response.data);
            } else {
                setDistricts([]); // Đảm bảo không bị undefined
            }
        } catch (error) {
            console.error("Error fetching districts:", error);
            setDistricts([]); // Xử lý lỗi để tránh crash app
        }
    };


    const fetchWards = async (maqh: string) => {
        if (!maqh) return;
        try {
            console.log("Fetching wards for:", maqh);
            const response = await getListWard(maqh, "");
            console.log("Wards API Response:", response);

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

    const onSubmit = async (data: any) => {
        try {
            const userUuid = await AsyncStorage.getItem("uuid");
            if (!userUuid) return;

            const payload = {
                ...data,
                UserUuid: userUuid,
                gender: selectedGender,
                Matp: selectedProvince,
                Maqh: selectedDistrict,
                Xaid: selectedWard,  // 🛠️ Thêm xaid vào payload  
            };

            console.log("🚀 Payload gửi đi:", payload);  // Kiểm tra dữ liệu trước khi gửi

            await updateStudentProfile(payload);
            router.back()
        } catch (error) {
            console.error("❌ Lỗi khi cập nhật hồ sơ:", error);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-gray-100">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <ScrollView className="flex-1 bg-gray-100 p-5 ">
                    <View className="flex-row items-center mb-5">
                        <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                            <Ionicons name="chevron-back" size={24} color="#2563eb" />
                        </TouchableOpacity>
                        <Text className="text-xl font-bold text-gray-800 ml-2">Chỉnh Sửa Hồ Sơ</Text>
                    </View>

                    <View className="bg-white p-6 rounded-lg shadow-lg">
                        {["fullname", "phoneNumber", "birthday", "university", "major"].map((field) => (
                            <View key={field} className="mb-4">
                                <Text className="text-gray-700 font-bold mb-1">{field}</Text>
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
                                    name={field}
                                />
                                {errors[field] && <Text className="text-red-500 text-sm">Trường này là bắt buộc.</Text>}
                            </View>
                        ))}
                        <Text className="text-gray-700 font-bold mb-1">Giới tính</Text>
                        <Picker
                            selectedValue={selectedGender}
                            onValueChange={(value) => setSelectedGender(value)}
                            className="bg-gray-100 p-3 rounded-lg border border-gray-300 mb-4"
                        >
                            <Picker.Item label="Nam" value={0} />
                            <Picker.Item label="Nữ" value={1} />
                        </Picker>


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
                            selectedValue={selectedWard}
                            onValueChange={(value) => setSelectedWard(value)}
                            className="bg-gray-100 p-3 rounded-lg border border-gray-300 mb-4"
                        >
                            {wards.map((item: any) => (
                                <Picker.Item key={item.code} label={item.name} value={item.code} />
                            ))}
                        </Picker>


                        <TouchableOpacity onPress={handleSubmit(onSubmit)} className="bg-blue-600 py-3 rounded-lg flex-row items-center justify-center pb-25 ">
                            <Ionicons name="checkmark-circle" size={20} color="#ffffff" className="mr-2" />
                            <Text className="text-white font-bold text-lg">Cập nhật thông tin</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

export default EditStudentProfileScreen;