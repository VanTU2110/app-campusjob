import { useColorScheme } from "@/hooks/useColorScheme";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import "react-native-reanimated";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { JobHistoryProvider } from '../contexts/JobHistoryContext';
import { JobSaveProvider } from "../contexts/SavedJobsContext";
import { StudentProvider } from "../contexts/StudentContext";
import "../global.css";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { uuid, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  // If no UUID, redirect to login screen
  if (!uuid) {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <JobHistoryProvider>
          <JobSaveProvider>
            <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
              <Stack initialRouteName="auth">
                <Stack.Screen name="auth" options={{ headerShown: false }} />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </JobSaveProvider>
        </JobHistoryProvider>
      </GestureHandlerRootView>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {/* Always use the UUID from AuthContext - don't pass additional UUID */}
      <StudentProvider uuid={uuid}>
        <JobSaveProvider>
          <JobHistoryProvider>
            <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
              <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="jobs/[uuid]" options={{ title: 'Job Detail' }} />
                <Stack.Screen name="company/[uuid]" options={{ title: 'Company Detail' }} />
                <Stack.Screen name="auth" options={{ headerShown: false }} />
                <Stack.Screen name="conversations/[uuid]" options={{ title: 'Tin nhắn' }} />
                <Stack.Screen name="+not-found" />
              </Stack>
              <StatusBar style="auto" />
            </ThemeProvider>
          </JobHistoryProvider>
        </JobSaveProvider>
      </StudentProvider>
    </GestureHandlerRootView>
  );
}

export default function RootLayout() {
  const [loadedFonts] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loadedFonts) {
      SplashScreen.hideAsync().catch(error => {
        console.warn("Error hiding splash screen:", error);
      });
    }
  }, [loadedFonts]);

  if (!loadedFonts) {
    return null;
  }

  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}