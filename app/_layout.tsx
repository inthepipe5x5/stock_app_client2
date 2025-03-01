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
import {
  useUserSession,
  UserSessionProvider,
} from "@/components/contexts/UserSessionProvider";
import supabase from "@/lib/supabase/supabase";
import { actionTypes } from "@/components/contexts/sessionReducer";
import defaultUserPreferences from "@/constants/userPreferences";
import { restoreLocalSession } from "@/lib/supabase/session";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {
  const { state, dispatch } = useUserSession();

  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const currentColorScheme =
    state?.user?.preferences?.theme ??
    Appearance.getColorScheme() ??
    defaultUserPreferences.theme;

  Appearance.addChangeListener(({ colorScheme }) => {
    console.log("Color scheme changed to", colorScheme);
    const updatedThemePreferences = state?.user?.preferences ?? {
      ...defaultUserPreferences,
      theme: colorScheme,
    };
    //update state
    dispatch({
      type: actionTypes.UPDATE_USER,
      payload: { ...(state?.user ?? {}), preferences: updatedThemePreferences },
    });
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
    console.log("The currentColorScheme is:", currentColorScheme);
  }, [loaded, state]);

  if (!loaded) {
    return null;
  }

  return (
    <QueryClientProvider client={new QueryClient()}>
      <UserSessionProvider>
        <GluestackUIProvider mode={currentColorScheme}>
          <StatusBar translucent />
          <Stack>
            <Stack.Screen
              name="index"
              options={{ animation: "slide_from_left", animationDuration: 300 }}
            />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
        </GluestackUIProvider>
      </UserSessionProvider>
    </QueryClientProvider>
  );
};

export default RootLayout;
