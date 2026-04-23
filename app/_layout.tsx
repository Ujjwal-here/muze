import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import "react-native-reanimated";
import { useFonts } from "expo-font";
import {
  Cabin_400Regular,
  Cabin_500Medium,
  Cabin_600SemiBold,
  Cabin_700Bold,
} from "@expo-google-fonts/cabin";
import {
  DMSans_300Light,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_600SemiBold,
  DMSans_700Bold,
} from "@expo-google-fonts/dm-sans";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { AuthProvider } from "@/context/auth";
import { ThemeProvider, useTheme } from "@/context/theme";
import { Toaster } from "sonner-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Typography } from "@/constants/typography";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { theme, colors, hydrated: themeHydrated } = useTheme();
  const [fontsLoaded, fontError] = useFonts({
    Cabin_400Regular,
    Cabin_500Medium,
    Cabin_600SemiBold,
    Cabin_700Bold,
    DMSans_300Light,
    DMSans_400Regular,
    DMSans_500Medium,
    DMSans_600SemiBold,
    DMSans_700Bold,
  });

  const ready = (fontsLoaded || !!fontError) && themeHydrated;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="splash" />
        <Stack.Screen name="login" />
        <Stack.Screen name="verification" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="create_post" />
        <Stack.Screen name="quote_post" />
        <Stack.Screen name="chat/[conversationId]" />
      </Stack>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Toaster
        theme={theme}
        visibleToasts={2}
        toastOptions={{
          titleStyle: {
            fontFamily: Typography.fonts.cabin.semibold,
            fontSize: Typography.sizes.xs,
          },
          descriptionStyle: {
            fontFamily: Typography.fonts.dm.regular,
            fontSize: Typography.sizes.xs,
          },
        }}
      />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
