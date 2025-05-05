import React, { useState, useContext } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Alert, Platform } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import {  insertCV } from '../../../service/cvService';
import { insertCVParams } from '../../../types/cv'; // Adjust the import path as needed
import { uploadFile } from '../../../service/fileService'; // Adjust the import path as needed
import * as FileSystem from 'expo-file-system';
import { useStudent } from '../../../contexts/StudentContext'; // Adjust the import path as needed
import { AntDesign } from '@expo/vector-icons';

export default function UploadCVScreen() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const router = useRouter();
  const { student, loading: studentLoading } = useStudent();// Get student data from context

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Could not pick the document');
      console.error(err);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      Alert.alert('Error', 'Please select a CV file first');
      return;
    }
    
    if (!student || !student.data.uuid) {
      Alert.alert('Error', 'Student information not available');
      return;
    }

    setLoading(true);
    try {
      console.log("Selected file:", file);
      
      // For iOS, check file info and get file size
      let fileInfo = null;
      if (Platform.OS === 'ios') {
        fileInfo = await FileSystem.getInfoAsync(file.uri);
        console.log("File info:", fileInfo);
      }
      
      // First upload the file
      const uploadResponse = await uploadFile({
        ...file,
        // If fileInfo is available, use its size property
        size: fileInfo?.size || file.size
      });
      
      console.log("Upload successful:", uploadResponse);
      
      // Extract the fileUrl object from the response
      const fileUrlData = uploadResponse.fileUrl || uploadResponse;
      
      // Get publicId and url from the response structure
      const publicId = fileUrlData.publicId;
      const url = fileUrlData.url;
      
      if (!publicId || !url) {
        throw new Error("Missing publicId or url in upload response");
      }
      
      console.log("Extracted publicId:", publicId);
      console.log("Extracted url:", url);
      
      // Prepare CV data according to the interface
      const cvParams = {
        studentUuid: student.data.uuid,
        cloudinaryPublicId: publicId,
        url: url,
        request: "CV upload request"
      };
      
      console.log("Creating CV record with data:", cvParams);
      const insertResponse = await insertCV(cvParams);
      console.log("CV record created:", insertResponse);
      
      // Success
      Alert.alert('Success', 'CV uploaded successfully', [
        { 
          text: 'OK', 
          onPress: () => router.push('/cv') // Navigate to CV list screen
        }
      ]);
    } catch (error) {
      console.error("Upload error:", error);
      Alert.alert(
        'Upload Failed', 
        error instanceof Error ? error.message : 'An unknown error occurred while uploading the CV'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-4">
      <Stack.Screen 
        options={{
          title: 'Upload CV',
          headerTitleAlign: 'center',
          headerShadowVisible: false,
        }}
      />

      <View className="flex-1 items-center justify-center space-y-8">
        <View className="w-full bg-gray-50 border border-gray-200 rounded-lg p-8 items-center">
          {file ? (
            <View className="items-center space-y-4">
              <AntDesign name="file1" size={48} color="#4F46E5" />
              <Text className="text-sm font-medium text-gray-700 text-center">{file.name}</Text>
              <TouchableOpacity 
                onPress={() => setFile(null)}
                className="mt-2"
              >
                <Text className="text-red-500 font-medium">Change File</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              onPress={pickDocument}
              className="items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg"
            >
              <AntDesign name="upload" size={32} color="#6B7280" />
              <Text className="mt-4 text-sm font-medium text-gray-500">
                Tap to select CV file (PDF, DOC, DOCX)
              </Text>
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          onPress={handleUpload}
          disabled={loading || !file}
          className={`w-full py-4 rounded-lg items-center ${
            loading || !file ? 'bg-indigo-300' : 'bg-indigo-600'
          }`}
        >
          {loading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text className="text-white font-medium text-base">Upload CV</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}