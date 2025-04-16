import "../global.css";
import "react-native-get-random-values"; //importing here so it doesn't break when imported later
// import {
//   DarkTheme,
//   DefaultTheme,
//   ThemeProvider,
// } from "@react-navigation/native";
import { GluestackUIProvider } from "@/components/ui/gluestack-ui-provider";
import { AppState, Appearance, Platform } from "react-native";
import { useFonts } from "expo-font";
import { RelativePathString, Stack, usePathname, useRouter } from "expo-router";
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
import { initializeSession, restoreLocalSession } from "@/lib/supabase/session";
import * as Linking from "expo-linking";
import Banner from "@/components/Banner";
import defaultSession from "@/constants/defaultSession";
import { CaptchaProvider } from "@/components/contexts/CaptchaContext";
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();
// Set the animation options. Accepts /duration/ and /fade/ keys.
SplashScreen.setOptions({
  duration: 1000,
  fade: true,
});

const RootLayout = () => {
  const { dispatch, isAuthenticated, colorScheme, ...sessionContext } = useUserSession();
  const state = sessionContext?.state ?? defaultSession
  const router = useRouter();
  const pathname = usePathname();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const currentColorScheme = colorScheme ??
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
    //hide splash screen when assets are loaded
    if (loaded) {
      SplashScreen.hideAsync();
    }
    console.log({ pathname })
    // initialize session
    // initializeSession(dispatch).then(() => {
    //   console.log("Session initialized: ", state);
    // });
  }, [loaded, /*state*/]);

  if (!loaded) {
    return null;
  }

  //create deep linking handler
  const handleDeepLink = async ({ url }: { url: string }) => {
    console.log("Deep Link URL detected", url);
    const parsedLink = await Linking.canOpenURL(url) ? Linking.parse(url) : null;
    if (parsedLink === null) {
      console.log("Failed to parse link", url);
      return;
    }
    console.log("Parsed Link", parsedLink);
    const { queryParams, scheme, path } = parsedLink
    let params = queryParams ?? {};

    //redirect to auth if not authenticated and pass params along to auth screen
    if (!isAuthenticated) {
      router.replace({
        pathname: (params.path as RelativePathString) ?? "/(auth)", params: {
          dismissToURL: (path?.[0] ?? "/(auth)") as RelativePathString,
          ...queryParams
        }
      });
    } else if (path && path.includes("(stacks)/[type].[id]")) {
      params = {
        ...(queryParams ?? params ?? {}),
        type: queryParams?.resourceType,
        id: queryParams?.resourceId,
      };
    }

    console.log("Parsed Params", params);
    //navigate to resource and pass params along
    router.push({
      pathname: (path as any) ?? "/(tabs)",
      params,
    })
  }

  Linking.addEventListener("url", handleDeepLink);

  return (
    <QueryClientProvider client={new QueryClient()}>
      {/* <UserSessionProvider> */}
      <GluestackUIProvider mode={currentColorScheme}>
        {Platform.OS === "android" ? (
          <StatusBar
            hideTransitionAnimation={"fade"}
            style="light"
          />
        ) : (
          <StatusBar style="auto" />
        )}
        <CaptchaProvider>
          <Stack
            initialRouteName="index"
            screenOptions={{
              headerShown: false,
              animation: "slide_from_left",
              animationDuration: 300,
            }}
          >
            <Stack.Screen
              name="index"
              options={{
                headerShown: false,
                presentation: Platform.OS === 'web' ? 'card' : 'containedTransparentModal',
                animation: "slide_from_left",
                animationDuration: 1000,
                animationMatchesGesture: Platform.OS === 'ios',
                animationTypeForReplace: Platform.OS === 'web' ? "pop" : "push",
                freezeOnBlur: ['ios', 'android'].includes(Platform.OS.toLowerCase())

              }}
            />
            <Stack.Screen name='loading' options={{
              headerShown: false,
              animation: "fade_from_bottom",
              animationDuration: 1000,
              animationMatchesGesture: Platform.OS === 'ios',
              animationTypeForReplace: ['ios', 'android'].includes(Platform.OS) ? "push" : "pop",
              contentStyle: {
                backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                margin: 'auto',
                flexDirection: 'column',

              },

            }}
            />
            <Stack.Screen name='captcha'
              options={{
                headerShown: false,
                animation: "fade_from_bottom",
                animationDuration: 1000,
                animationMatchesGesture: Platform.OS === 'ios',
                animationTypeForReplace: ['ios', 'android'].includes(Platform.OS) ? "push" : "pop",
                contentStyle: {
                  backgroundColor: 'rgba(0, 0, 0, 0.7)', // Semi-transparent background
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: 'auto',
                  flexDirection: 'column',

                }
              }}
            />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />

            <Stack.Screen //view to request permissions
              name="[permissions]"
              options={{ headerShown: false }}
            />

            <Stack.Screen name="+not-found"
              options={{
                presentation: Platform.OS === 'web' ? 'card' : 'modal',
                headerShadowVisible: true,
                animation: "slide_from_left",
                animationDuration: 1000,
                animationMatchesGesture: Platform.OS === 'ios',
                animationTypeForReplace: Platform.OS === 'web' ? "pop" : "push",
                freezeOnBlur: ['ios', 'android'].includes(Platform.OS.toLowerCase()),
                contentStyle: {
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingHorizontal: 'auto',
                  paddingVertical: 'auto',
                  margin: 'auto'
                },
              }}
            />
            <Stack.Screen name="errors"
              options={{
                headerShown: false,
                presentation: "transparentModal",
                contentStyle: {
                  backgroundColor: "rgba(0, 0, 0, 0.7)", // Semi-transparent background
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  paddingHorizontal: "auto",
                  paddingVertical: "auto",
                  margin: "auto",
                },
              }}
            />
          </Stack>
        </CaptchaProvider>
      </GluestackUIProvider>
      {/* </UserSessionProvider> */}
    </QueryClientProvider>
  );
};

export default RootLayout;
