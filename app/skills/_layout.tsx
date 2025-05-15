import { Stack } from "expo-router";

export default function SKillLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#F9FAFB' },
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="addskill" />
    </Stack>
  );
}