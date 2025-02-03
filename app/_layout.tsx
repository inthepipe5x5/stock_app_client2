import "../global.css";
import "react-native-get-random-values"; //importing here so it doesn't break when imported later
// import {
//   DarkTheme,
//   DefaultTheme,
//   ThemeProvider,
// } from "@react-navigation/native";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { AppState, Appearance } from "react-native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";
import "expo-dev-client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { UserSessionProvider } from "@/components/contexts/UserSessionProvider";
import supabase from "@/lib/supabase/supabase";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  Appearance.addChangeListener(({ colorScheme }) => {
    console.log("Color scheme changed to", colorScheme);
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={new QueryClient()}>
      <UserSessionProvider>
        <GluestackUIProvider mode={Appearance.getColorScheme() ?? "light"}>
          <StatusBar translucent />
          <Stack>
            <Stack.Screen name="index" />
            <Stack.Screen name="countries" options={{ title: "TEST" }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </GluestackUIProvider>
      </UserSessionProvider>
    </QueryClientProvider>
  );
};

export default RootLayout;
