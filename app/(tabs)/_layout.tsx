import { useState, useEffect, useContext, useCallback } from "react";
import { Platform, Appearance, AppState } from "react-native";
import { Tabs, useRouter, SplashScreen, Redirect, ScreenProps } from "expo-router";
import { HapticTab } from "@/components/HapticTab";
import { useQuery } from "@tanstack/react-query";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import Colors from "@/constants/Colors";
import { Home, Inbox, ScanSearchIcon, User } from "lucide-react-native";
import supabase from "@/lib/supabase/supabase";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import {
  getUserProfileByEmail,
  fetchProfile,
  fetchUserAndHouseholds,
  fetchUserTasks,
  restoreLocalSession,
  storeUserSession,
} from "@/lib/supabase/session";
// import { showAuthOutcome } from "@/hooks/authOutcomes";
import { actionTypes } from "@/components/contexts/sessionReducer";
import isTruthy from "@/utils/isTruthy";
import { saveUserDrafts } from "@/lib/supabase/drafts";
import { OpenFoodFactsAPIProvider } from "@/components/contexts/OpenFoodFactsAPI";

/**
 * /(Tabs) Tab Navigator for authenticated users.
 *
 * Manages the top-level navigation between sections like Home, Dashboard, Search, and Profile.
 */

const TabLayout = () => {
  const [dataFetched, setDataFetched] = useState<boolean>(false);
  const { state, dispatch, colorScheme, isAuthenticated, showMessage } = useUserSession();
  const router = useRouter();
  const [colorTheme, setColorTheme] = useState<"light" | "dark">(
    colorScheme === "system" ? (Appearance.getColorScheme() ?? "light") : (colorScheme ?? "light")
  );

  //set color theme based on user preferences or device appearance
  useEffect(() => {
    //hide splash screen when authenticated and state is not null
    SplashScreen.preventAutoHideAsync();

    //redirect to auth screen if user is not authenticated
    if (!isTruthy(isAuthenticated)) {
      router.replace("/(auth)" as any);
      dispatch({ type: actionTypes.CLEAR_SESSION });
    }

    if (state?.user?.draft_status === "draft") {
      router.replace("/(auth)/(signup)" as any);
    }
  }, [state, isAuthenticated]); //isAuthenticated, state]);

  return (
    <OpenFoodFactsAPIProvider
      user_id={state?.user?.user_id ?? ""}
    >
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          //set active tab label styles
          tabBarActiveTintColor: Colors[colorTheme]?.input.primary,
          tabBarActiveBackgroundColor: Colors[colorTheme].primary.main,
          tabBarStyle: Platform.select({
            ios: {
              // Use a transparent background on iOS to show the blur effect
              position: "absolute",
            },
            default: {
              backgroundColor: Colors[colorTheme].navigation.default,
            },
          }),
        }}
      // screenListeners={{
      //   tabPress: (event) => {
      //     //if navigating to /(auth)/(signin) route, show confirm close modal
      //     if (event.target === "/(auth)/(signin)") {
      //       console.log("Event", event);
      //     }
      //   }
      // }}
      >
        <Tabs.Screen
          name="(stacks)"
          options={{
            // presentation: "modal",
            // presentation: "transparentModal",
            animation: "fade",
            headerShown: false,
          }}
        />
        <Tabs.Screen name="(dashboard)" options={{ tabBarLabel: "Home" }} />
        <Tabs.Screen
          name="(dashboard)/index"
          options={{
            tabBarLabel: "Dashboard",
            tabBarIcon: ({ color, focused }) => <Home color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="(search)/index"
          options={{
            tabBarLabel: "Search",
            tabBarIcon: ({ color, focused }) => (
              <ScanSearchIcon color={color} size={24} />
            ),
          }}
        />
        <Tabs.Screen
          name="/(inbox)"
          options={{
            tabBarLabel: "Inbox",
            tabBarIcon: ({ color, focused }) => <Inbox color={color} size={24} />,
          }}
        />
        <Tabs.Screen
          name="(profile)/index"
          options={{
            tabBarLabel: "Profile",
            tabBarIcon: ({ color, focused }) => <User color={color} size={24} />,
          }}
        />
      </Tabs>
    </OpenFoodFactsAPIProvider>
  );
};
// export default () => (
//   <ProtectedNavigation>
//     <TabLayout />p
//   </ProtectedNavigation>
// );

export default () => <TabLayout />;
