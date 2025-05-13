import { REPORT_REASONS } from '@/constants/reportReason'; // adjust path if needed
import { useStudent } from '@/contexts/StudentContext';
import { createReport } from '@/service/reportService'; // adjust path if needed
import type { CreateReportParams } from '@/types/report';
import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, Text, TextInput, View } from 'react-native';
interface Props {
  targetType: 'job' | 'company';
  targetUuid: string;
}
export default function ReportForm({ targetType, targetUuid }: Props) {
    const router = useRouter();
  
    const [reason, setReason] = useState<CreateReportParams['reason'] | ''>('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const { student,loading: studentLoading } = useStudent();
    const handleSubmit = async () => {
        if (!reason) {
          setErrorMsg('Vui lòng chọn lý do.');
          return;
        }
      
        if (reason === 'other' && !description.trim()) {
          setErrorMsg('Vui lòng nhập mô tả chi tiết.');
          return;
        }
      
        if (!student?.data?.uuid) {
          setErrorMsg('Không thể xác định người gửi báo cáo. Vui lòng thử lại sau.');
          return;
        }
      
        setErrorMsg('');
        setLoading(true);
      
        const payload: CreateReportParams = {
          reporterUuid: student.data.uuid, // ✅ guaranteed to be string
          targetType,
          targetUuid,
          reason,
          description: description.trim(),
          createdAt: new Date().toISOString(),
        };
      
        try {
          const res = await createReport(payload);
      
          if (res.error?.code !== 'success') {
            throw new Error(res.error.message);
          }
      
          Alert.alert('Thành công', 'Báo cáo của bạn đã được gửi.');
          router.back();
        } catch (error: any) {
          Alert.alert('Thất bại', error.message || 'Đã xảy ra lỗi.');
        } finally {
          setLoading(false);
        }
      };
      
    return (
      <View className="p-4">
        <Text className="text-xl font-semibold mb-3">Báo cáo nội dung</Text>

        <Text className="mb-1 font-medium">Lý do</Text>
        <View className="border border-gray-300 rounded mb-4">
          <Picker
            selectedValue={reason}
            onValueChange={(value) => setReason(value as CreateReportParams['reason'])}
          >
            <Picker.Item label="-- Chọn lý do --" value="" />
            {REPORT_REASONS.map((item) => (
              <Picker.Item key={item.value} label={item.label} value={item.value} />
            ))}
          </Picker>
        </View>
  
        <Text className="mb-1 font-medium">
          {reason === 'other' ? 'Mô tả chi tiết (bắt buộc)' : 'Mô tả thêm (tùy chọn)'}
        </Text>
        <TextInput
          className="border border-gray-300 rounded p-2 mb-4 min-h-[80px] text-base"
          multiline
          placeholder="Nhập mô tả..."
          value={description}
          onChangeText={setDescription}
        />
  
        {errorMsg ? <Text className="text-red-500 mb-2">{errorMsg}</Text> : null}
  
        <Button title={loading ? 'Đang gửi...' : 'Gửi báo cáo'} onPress={handleSubmit} disabled={loading} />
      </View>
    );
  }