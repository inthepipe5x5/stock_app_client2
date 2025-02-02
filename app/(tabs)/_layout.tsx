import { Tabs, useRouter } from "expo-router";
import { Platform, Appearance } from "react-native";
import { useState, useEffect } from "react";
import { SplashScreen } from "expo-router";
import { HapticTab } from "@/components/HapticTab";
import { useUserSession } from "@/components/contexts/UserSessionProvider";
import Colors from "@/constants/Colors";
import { Home, Inbox, ScanSearchIcon, User } from "lucide-react-native";

/**
 * /(Tabs) Tab Navigator for authenticated users.
 *
 * Manages the top-level navigation between sections like Home, Dashboard, Search, and Profile.
 */

const TabLayout = () => {
  const { state, isAuthenticated } = useUserSession();
  const [colorTheme, setColorTheme] = useState<"light" | "dark">("light");
  const router = useRouter();
  //set color theme based on user preferences or device appearance
  useEffect(() => {
    //set color theme based on user preferences or device appearance
    setColorTheme(
      (prevColorTheme) =>
        state.preferences.theme ?? Appearance.getColorScheme() ?? "light"
    );
    //hide splash screen when authenticated and state is not null
    SplashScreen.preventAutoHideAsync();
    if (isAuthenticated && state !== null) {
      SplashScreen.hideAsync();
    } else {
      //redirect user to login if not authenticated
      router.replace("/(auth)/login");
    }
  }, [colorTheme, isAuthenticated, state]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,
        //set active tab label styles
        tabBarActiveTintColor: Colors[colorTheme].input.primary,
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
