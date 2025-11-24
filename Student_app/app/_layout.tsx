import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

export const unstable_settings = {
  initialRouteName: "login",
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen
          name="login"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="home"
          options={{
            headerShown: false,
            gestureEnabled: false,
          }}
        />
        <Stack.Screen
          name="modal"
          options={{
            presentation: "modal",
            title: "Modal",
          }}
        />
        <Stack.Screen
          name="screens/Chatbot"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="screens/Resources"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="screens/MyActivity"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="screens/PrivacySettings"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="screens/AttendanceScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="screens/ScreeningModal"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="screens/ResourceHubScreen"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="screens/OnboardingConsent"
          options={{
            headerShown: false,
          }}
        />
        <Stack.Screen
          name="screens/AnonymousUserAnalytics"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
