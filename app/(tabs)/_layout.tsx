import { useState, useEffect, useContext, useCallback } from "react";
import { Platform, Appearance } from "react-native";
import { Tabs, useRouter, SplashScreen, Redirect } from "expo-router";
import { HapticTab } from "@/components/HapticTab";
import { useQuery } from "@tanstack/react-query";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import Colors from "@/constants/Colors";
import { Home, Inbox, ScanSearchIcon, User } from "lucide-react-native";
import supabase from "@/lib/supabase/supabase";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";
import {
  existingUserCheck,
  fetchProfile,
  fetchUserAndHouseholds,
  fetchUserTasks,
} from "@/lib/supabase/session";
import { showAuthOutcome } from "@/hooks/authOutcomes";
/**
 * /(Tabs) Tab Navigator for authenticated users.
 *
 * Manages the top-level navigation between sections like Home, Dashboard, Search, and Profile.
 */

const TabLayout = () => {
  // const { state, isAuthenticated } = useUserSession();
  const [colorTheme, setColorTheme] = useState<"light" | "dark">("light");
  const { state, dispatch } = useUserSession();
  const router = useRouter();

  //set color theme based on user preferences or device appearance
  useEffect(() => {
    //set color theme based on user preferences or device appearance
    setColorTheme(
      (prevColorTheme) =>
        /*state.preferences.theme ??*/ Appearance.getColorScheme() ?? "light"
    );
    //hide splash screen when authenticated and state is not null
    SplashScreen.preventAutoHideAsync();
    // if (isAuthenticated && state !== null) {
    // SplashScreen.hideAsync();
    // } else {
    //redirect user to login if not authenticated
    // router.replace("/(auth)/login");
  }, [state, colorTheme]); //isAuthenticated, state]);

  //handle auth events and update global session state accordingly
  supabase.auth.onAuthStateChange(
    async (event: AuthChangeEvent, session: Session | null) => {
      console.log("SupabaseAuthEvent:", event);
      console.log("SupabaseSession:", session);

      //handle successful auth event
      if (["SIGNED_IN", "INITIAL_SESSION", "USER_UPDATED"].includes(event)) {
        showAuthOutcome(true);
      }
      if (event === "INITIAL_SESSION") {
        router.replace({
          pathname: "/(tabs)/(dashboard)/(stacks)/[type].new",
          params: { type: "household" },
        });
      }
    }
  );
  //call the appropriate useQuery hook to fetch data once state is updated
  const profile = useQuery({
    queryKey: ["user_id", state.session?.id],
    queryFn: () =>
      fetchProfile({
        searchKey: "user_id",
        searchKeyValue: state?.user?.user_id ?? null,
      }),
    initialData: state?.user,
    enabled: !!state.user,
  });

  //fetch user households
  const households = useQuery({
    queryKey: ["user_households", state.households],
    queryFn: () => fetchUserAndHouseholds(state?.user?.user_id),
    initialData: state?.households,
    enabled: !!state.user,
  });

  //fetch user tasks
  const tasks = useQuery({
    queryKey: ["user_tasks", state.tasks],
    queryFn: () => fetchUserTasks({ user_id: state?.user?.user_id }),
    initialData: state?.tasks,
    enabled: !!state.user && !!state.households,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  //update global state with fetched data
  if (profile) {
    dispatch({
      type: "SET_USER",
      payload: { user: profile },
    });
  } else {
    return <Redirect href="/(auth)/(signin)" />;
  }
  if (households) {
    dispatch({
      type: "SET_HOUSEHOLDS",
      payload: { households: households },
    });
  }
  if (tasks) {
    dispatch({
      type: "SET_TASKS",
      payload: { tasks },
    });
  }

  return (
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
          default: { backgroundColor: Colors[colorTheme].navigation.default },
        }),
      }}
    >
      <Tabs.Screen
        name="(stacks)"
        options={{
          // presentation: "modal",
          presentation: "transparentModal",
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
  );
};
// export default () => (
//   <ProtectedNavigation>
//     <TabLayout />
//   </ProtectedNavigation>
// );

export default () => TabLayout;
