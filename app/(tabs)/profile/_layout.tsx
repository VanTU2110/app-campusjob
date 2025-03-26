import { Stack } from "expo-router";

export default function ProfileLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Tài khoản", headerShown: false }} />
      <Stack.Screen name="edit" options={{ title: "Chỉnh sửa hồ sơ" }} />
      <Stack.Screen name="add" options={{ title: "Thêm hồ sơ" }} />
    </Stack>
  );
}
