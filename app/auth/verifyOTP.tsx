import { verifyUser } from '@/service/auth';
import { OPTResponse } from '@/types/otp';
import { UserResponse, verifyUserParams } from '@/types/user';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { sendOTP } from '../../service/otpService';

const VerifyOTPScreen = () => {
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();

  const [otp, setOtp] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resendDisabled, setResendDisabled] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(60);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Gửi OTP ngay khi màn hình được load
    handleSendOTP();

    // Thiết lập countdown để chặn gửi lại OTP trong 60s
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setResendDisabled(false);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSendOTP = async () => {
    if (!email) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    try {
      setIsLoading(true);
      setResendDisabled(true);
      setCountdown(60);

      const response: OPTResponse = await sendOTP(email);
      if (response.message === 'OTP đã được gửi') {
        Alert.alert('Thành công', 'Mã OTP đã được gửi đến email của bạn');
      } else {
        throw new Error('Gửi OTP thất bại');
      }
    } catch (err) {
      console.error('Error sending OTP:', err);
      Alert.alert('Lỗi', 'Không thể gửi mã OTP. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length < 6) {
      setError('Mã OTP phải có 6 ký tự');
      return;
    }

    if (!email) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
      return;
    }

    Keyboard.dismiss();
    setIsLoading(true);
    setError('');

    try {
      const params: verifyUserParams = {
        email: email,
        otp: otp
      };

      const response: UserResponse = await verifyUser(params);
      
      if (response.data?.isVerify) {
        Alert.alert('Thành công', 'Xác thực tài khoản thành công!', [
          { text: 'OK', onPress: () => router.push('/(tabs)/profile') }
        ]);
      } else {
        throw new Error(response.error?.message || 'Xác thực thất bại');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      setError('Mã OTP không đúng hoặc đã hết hạn. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white p-6">
      <View className="flex-1 justify-center">
        <Text className="text-2xl font-bold text-gray-800 mb-2">Xác thực OTP</Text>
        <Text className="text-gray-600 mb-8">
          Chúng tôi đã gửi mã xác thực 6 chữ số đến email{' '}
          <Text className="font-semibold">{email}</Text>
        </Text>

        {/* OTP Input */}
        <View className="mb-6">
          <Text className="text-gray-700 mb-2">Nhập mã OTP</Text>
          <TextInput
            className="border border-gray-300 rounded-lg p-4 text-lg"
            placeholder="Nhập mã OTP"
            keyboardType="number-pad"
            maxLength={6}
            value={otp}
            onChangeText={(text) => {
              setOtp(text);
              setError('');
            }}
            editable={!isLoading}
          />
          {error ? <Text className="text-red-500 mt-2">{error}</Text> : null}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          className={`bg-blue-500 rounded-lg p-4 items-center ${isLoading ? 'opacity-70' : ''}`}
          onPress={handleVerifyOTP}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-lg">Xác thực</Text>
          )}
        </TouchableOpacity>

        {/* Resend OTP */}
        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-600">Không nhận được mã? </Text>
          <TouchableOpacity
            onPress={handleSendOTP}
            disabled={resendDisabled || isLoading}
          >
            <Text
              className={`font-semibold ${resendDisabled ? 'text-gray-400' : 'text-blue-500'}`}
            >
              Gửi lại {resendDisabled ? `(${countdown}s)` : ''}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default VerifyOTPScreen;