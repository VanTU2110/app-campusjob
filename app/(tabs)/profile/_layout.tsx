import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Tài khoản", headerShown: false }} />
      <Stack.Screen name="edit" options={{ title: "Chỉnh sửa hồ sơ" }} />
      <Stack.Screen name="add" options={{ title: "Thêm hồ sơ" }} />
      <Stack.Screen name="cv" options={{ title: "CV" }} />
      <Stack.Screen name="freetime" options={{ title: "Lịch rảnh" }} />
      <Stack.Screen name="uploadCV" options={{ title: "Tải lên CV" }} />
      <Stack.Screen name="detail/[uuid]" options={{ title: "Chi tiết hồ sơ" }} />
    </Stack>
  );
}
